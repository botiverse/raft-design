#!/usr/bin/env npx tsx
/**
 * One-time migration script: SQLite → PostgreSQL
 *
 * Usage:
 *   DATABASE_URL=postgresql://... npx tsx scripts/migrate-sqlite-to-pg.ts [options]
 *
 * Options:
 *   --sqlite-path <path>   Path to SQLite DB (default: ~/.slock/data.db)
 *   --email <email>        Email for the default user account
 *   --name <name>          Name for the default user
 *   --workspace <name>     Name for the default workspace
 */
import "dotenv/config";
import Database from "better-sqlite3";
import pg from "pg";
import { randomUUID, createHash } from "node:crypto";
import path from "node:path";
import os from "node:os";
import argon2 from "argon2";

const args = process.argv.slice(2);
let sqlitePath = path.join(os.homedir(), ".slock", "data.db");
let email = "admin@slock.local";
let name = "Admin";
let workspaceName = "Default Workspace";

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--sqlite-path" && args[i + 1]) sqlitePath = args[++i];
  if (args[i] === "--email" && args[i + 1]) email = args[++i];
  if (args[i] === "--name" && args[i + 1]) name = args[++i];
  if (args[i] === "--workspace" && args[i + 1]) workspaceName = args[++i];
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

async function migrate() {
  console.log(`[Migration] Opening SQLite: ${sqlitePath}`);
  const sqlite = new Database(sqlitePath, { readonly: true });

  console.log(`[Migration] Connecting to PostgreSQL...`);
  const pool = new pg.Pool({ connectionString: DATABASE_URL });

  try {
    // Create default user
    const userId = randomUUID();
    const passwordHash = await argon2.hash("changeme123"); // Temporary password
    await pool.query(
      `INSERT INTO users (id, email, name, display_name, password_hash) VALUES ($1, $2, $3, $3, $4) ON CONFLICT (email) DO NOTHING`,
      [userId, email, name, passwordHash]
    );
    console.log(`[Migration] Created user: ${email} (password: changeme123 — change this!)`);

    // Create default workspace
    const workspaceId = randomUUID();
    const slug = workspaceName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await pool.query(
      `INSERT INTO workspaces (id, name, slug, owner_id) VALUES ($1, $2, $3, $4) ON CONFLICT (slug) DO NOTHING`,
      [workspaceId, workspaceName, slug, userId]
    );
    await pool.query(
      `INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ($1, $2, 'owner') ON CONFLICT DO NOTHING`,
      [workspaceId, userId]
    );
    console.log(`[Migration] Created workspace: ${workspaceName} (/${slug})`);

    // Migrate agents
    const agents = sqlite.prepare("SELECT * FROM agents").all() as any[];
    let agentCount = 0;
    for (const a of agents) {
      await pool.query(
        `INSERT INTO agents (id, workspace_id, name, display_name, avatar_url, description, status, session_id, model, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, to_timestamp($10), to_timestamp($11))
         ON CONFLICT (id) DO NOTHING`,
        [a.id, workspaceId, a.name, a.display_name, a.avatar_url, a.description, a.status || "inactive", a.session_id, a.model || "sonnet", a.created_at / 1000, a.updated_at / 1000]
      );
      agentCount++;
    }
    console.log(`[Migration] Migrated ${agentCount} agents`);

    // Migrate topics
    const topics = sqlite.prepare("SELECT * FROM topics").all() as any[];
    let topicCount = 0;
    for (const t of topics) {
      await pool.query(
        `INSERT INTO topics (id, workspace_id, name, description, type, created_at, deleted_at)
         VALUES ($1, $2, $3, $4, $5, to_timestamp($6), $7)
         ON CONFLICT (id) DO NOTHING`,
        [t.id, workspaceId, t.name, t.description, t.type || "topic", t.created_at / 1000, t.deleted_at ? new Date(t.deleted_at * 1000) : null]
      );
      topicCount++;
    }
    console.log(`[Migration] Migrated ${topicCount} topics`);

    // Migrate topic_agents
    const topicAgents = sqlite.prepare("SELECT * FROM topic_agents").all() as any[];
    let taCount = 0;
    for (const ta of topicAgents) {
      await pool.query(
        `INSERT INTO topic_agents (topic_id, agent_id, added_at) VALUES ($1, $2, to_timestamp($3)) ON CONFLICT DO NOTHING`,
        [ta.topic_id, ta.agent_id, ta.added_at / 1000]
      );
      taCount++;
    }
    console.log(`[Migration] Migrated ${taCount} topic-agent assignments`);

    // Add user as topic_member for all DM topics
    for (const t of topics) {
      if (t.type === "dm") {
        await pool.query(
          `INSERT INTO topic_members (topic_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [t.id, userId]
        );
      }
    }

    // Migrate messages
    const messages = sqlite.prepare("SELECT * FROM messages ORDER BY created_at ASC").all() as any[];
    let msgCount = 0;
    for (const m of messages) {
      // Map "user" senderId to the real user UUID
      const senderId = m.sender_id === "user" ? userId : m.sender_id;
      await pool.query(
        `INSERT INTO messages (id, topic_id, sender_type, sender_id, content, thread_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, to_timestamp($7), to_timestamp($8))
         ON CONFLICT (id) DO NOTHING`,
        [m.id, m.topic_id, m.sender_type, senderId, m.content, m.thread_id, m.created_at / 1000, m.updated_at / 1000]
      );
      msgCount++;
    }
    console.log(`[Migration] Migrated ${msgCount} messages`);

    console.log(`\n[Migration] Complete!`);
    console.log(`  - ${agentCount} agents`);
    console.log(`  - ${topicCount} topics`);
    console.log(`  - ${taCount} topic-agent assignments`);
    console.log(`  - ${msgCount} messages`);
    console.log(`\n  Default user: ${email} / changeme123`);
    console.log(`  Default workspace: ${workspaceName} (/${slug})`);

  } finally {
    sqlite.close();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error("[Migration] Error:", err);
  process.exit(1);
});
