/**
 * Repro for the BIGSERIAL + gap-sync message-loss hole.
 *
 * Hypothesis: Postgres assigns `seq` at INSERT (nextval is non-transactional),
 * but the row is only visible after COMMIT. If T1 INSERTs (seq=N, uncommitted)
 * and T2 INSERTs+COMMITs (seq=N+1) before T1 commits, then `GET /api/messages/sync`
 * in the window between those events returns only N+1. A client that advances
 * its cursor to N+1 and later reconnects with `since=N+1` filters with
 * `seq > N+1` — seq=N is permanently skipped even after it commits.
 *
 * This script drives two pg connections manually to produce that window,
 * then asserts the observable outcome via the public sync endpoint.
 *
 * Usage:
 *   tsx scripts/stress-gap-sync.ts
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import pg from "../packages/server/node_modules/pg/lib/index.js";

type Env = {
  user: { id: string };
  server: { id: string };
  channel: { id: string };
};

const env = JSON.parse(
  readFileSync(resolve(".dev-env-message-stress.json"), "utf8"),
) as Env;

const PORT_OFFSET = 42;
const BASE = `http://localhost:${13001 + PORT_OFFSET}`;
const PG_PORT = 15432 + PORT_OFFSET;
const PG_URL = `postgresql://postgres:slock-dev-message-stress@localhost:${PG_PORT}/slock`;

async function login(): Promise<string> {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "dev@slock.ai", password: "password123" }),
  });
  if (!res.ok) throw new Error(`login failed: ${res.status}`);
  return ((await res.json()) as { accessToken: string }).accessToken;
}

async function syncSince(token: string, since: number) {
  const res = await fetch(
    `${BASE}/api/messages/sync?since_seq=${since}&channel_id=${env.channel.id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Server-Id": env.server.id,
      },
    },
  );
  return (await res.json()) as { seq: number; id: string; content: string }[];
}

async function main() {
  console.log("=== gap-sync repro ===");
  const token = await login();

  // Baseline: what's the latest seq visible now?
  const baseline = await syncSince(token, 0);
  const baselineMaxSeq = baseline.length > 0 ? Math.max(...baseline.map((m) => m.seq)) : 0;
  console.log(`  baselineMaxSeq: ${baselineMaxSeq}`);

  const connA = new pg.Client({ connectionString: PG_URL });
  const connB = new pg.Client({ connectionString: PG_URL });
  await connA.connect();
  await connB.connect();

  try {
    // Step 1: connA BEGIN + INSERT (assigns seq=N, not yet visible)
    await connA.query("BEGIN");
    const insertA = await connA.query(
      `INSERT INTO messages (id, channel_id, sender_type, sender_id, content, message_type, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, 'user', $2, 'A-uncommitted', 'chat', NOW(), NOW())
       RETURNING id, seq`,
      [env.channel.id, env.user.id],
    );
    const rowA = insertA.rows[0] as { id: string; seq: string | number };
    rowA.seq = Number(rowA.seq);
    console.log(`  [A] INSERT seq=${rowA.seq} (uncommitted, holding txn)`);

    // Step 2: connB INSERT + COMMIT (assigns seq=N+1, visible immediately)
    const insertB = await connB.query(
      `INSERT INTO messages (id, channel_id, sender_type, sender_id, content, message_type, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, 'user', $2, 'B-committed', 'chat', NOW(), NOW())
       RETURNING id, seq`,
      [env.channel.id, env.user.id],
    );
    const rowB = insertB.rows[0] as { id: string; seq: string | number };
    rowB.seq = Number(rowB.seq);
    console.log(`  [B] INSERT seq=${rowB.seq} (autocommitted, visible)`);

    // Step 3: client-visible sync — scope window to the A/B range only
    // (use rowA.seq - 1 as the cursor to mimic a client that had seen everything through seq N-1)
    const windowSince = rowA.seq - 1;
    const midSync = await syncSince(token, windowSince);
    const midSeqs = midSync.map((m) => m.seq).sort((a, b) => a - b);
    console.log(`  sync(since=${windowSince}) during window: ${JSON.stringify(midSeqs.slice(0, 20))}${midSeqs.length > 20 ? "..." : ""}`);
    const sawAMid = midSeqs.includes(rowA.seq);
    const sawBMid = midSeqs.includes(rowB.seq);
    console.log(`    A (seq=${rowA.seq}) visible: ${sawAMid}`);
    console.log(`    B (seq=${rowB.seq}) visible: ${sawBMid}`);

    // Step 4: client advances cursor to max it saw (what messageStore does on reconnect)
    const cursor = midSeqs.length > 0 ? Math.max(...midSeqs) : windowSince;
    console.log(`  client cursor after window: ${cursor}`);

    // Step 5: commit A
    await connA.query("COMMIT");
    console.log(`  [A] COMMIT`);

    // Step 6: simulate reconnect-and-resume with cursor
    const postSync = await syncSince(token, cursor);
    const postSeqs = postSync.map((m) => m.seq).sort((a, b) => a - b);
    console.log(`  sync(since=${cursor}) after A commit: ${JSON.stringify(postSeqs)}`);
    const sawAPost = postSeqs.includes(rowA.seq);
    console.log(`    A (seq=${rowA.seq}) visible: ${sawAPost}`);

    // Verdict — exit 1 if bug present, 0 if sync protocol safe (anchor for RFC unification)
    console.log("");
    let bugPresent = false;
    if (!sawAMid && sawBMid && !sawAPost) {
      console.log(`  ❌ BUG CONFIRMED: message seq=${rowA.seq} permanently skipped by sync protocol`);
      console.log(`     window: A=invisible B=visible; post-commit A=still-invisible (cursor=${cursor} > ${rowA.seq})`);
      bugPresent = true;
    } else if (sawAMid && sawBMid) {
      console.log(`  ✅ No hole — both rows visible during the window`);
    } else if (!sawAPost) {
      console.log(`  ⚠️ Unexpected state: A not visible even after commit with cursor=${cursor}`);
      bugPresent = true;
    } else {
      console.log(`  ✅ A recovered after commit (cursor was below ${rowA.seq})`);
    }

    // Cleanup: delete the two test rows so re-runs are clean
    await connB.query(`DELETE FROM messages WHERE id IN ($1, $2)`, [rowA.id, rowB.id]);

    await connA.end();
    await connB.end();
    process.exit(bugPresent ? 1 : 0);
  } catch (err) {
    await connA.end();
    await connB.end();
    throw err;
  }
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(2);
});
