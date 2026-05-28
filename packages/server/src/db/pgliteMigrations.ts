import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { PGlite } from "@electric-sql/pglite";

type MigrationJournal = {
  entries: Array<{
    idx: number;
    when: number;
    tag: string;
  }>;
};

const DRIZZLE_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../drizzle",
);

async function ensureMigrationTable(client: PGlite) {
  await client.exec(`
    CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `);
}

async function getLastAppliedMigrationMillis(client: PGlite): Promise<number> {
  const result = await client.query<{ created_at: string | number }>(
    `SELECT created_at FROM "__drizzle_migrations" ORDER BY created_at DESC LIMIT 1`,
  );
  const latest = result.rows[0]?.created_at;
  return latest == null ? 0 : Number(latest);
}

async function readMigrationJournal(): Promise<MigrationJournal> {
  const journalPath = path.join(DRIZZLE_DIR, "meta", "_journal.json");
  const raw = await readFile(journalPath, "utf8");
  return JSON.parse(raw) as MigrationJournal;
}

function splitStatements(sqlText: string): string[] {
  return sqlText
    .split("--> statement-breakpoint")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

export async function migratePglite(client: PGlite) {
  await ensureMigrationTable(client);

  const journal = await readMigrationJournal();
  const lastAppliedMillis = await getLastAppliedMigrationMillis(client);
  const pending = journal.entries
    .slice()
    .sort((a, b) => a.idx - b.idx)
    .filter((entry) => entry.when > lastAppliedMillis);

  for (const entry of pending) {
    const sqlPath = path.join(DRIZZLE_DIR, `${entry.tag}.sql`);
    const sqlText = await readFile(sqlPath, "utf8");
    const statements = splitStatements(sqlText);
    for (const statement of statements) {
      await client.exec(statement);
    }
    const hash = createHash("sha256").update(sqlText).digest("hex");
    await client.query(
      `INSERT INTO "__drizzle_migrations" ("hash", "created_at") VALUES ($1, $2)`,
      [hash, entry.when],
    );
  }
}
