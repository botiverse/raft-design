import { sql } from "drizzle-orm";
import { drizzle as drizzleNodePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";
import * as schema from "./schema.js";
import { migratePglite } from "./pgliteMigrations.js";
import { closeRisingWavePool } from "./risingwave.js";

export type Database = NodePgDatabase<typeof schema>;
export type DatabaseTransaction = Parameters<Parameters<Database["transaction"]>[0]>[0];
export type DatabaseExecutor = Database | DatabaseTransaction;

let _db: Database;
let _pool: pg.Pool | null = null;
let _pglite: PGlite | null = null;
let _searchDb: Database;
let _searchPool: pg.Pool | null = null;

function isPgliteUrl(connectionString: string) {
  return connectionString.startsWith("pglite://");
}

function getPgliteDataDir(connectionString: string): string | undefined {
  const raw = connectionString.slice("pglite://".length).trim();
  if (!raw || raw === ":memory:" || raw === "memory") return undefined;
  return raw;
}

function createPool(connectionString: string) {
  const isNeon = connectionString.includes("neon.tech");
  const pool = new pg.Pool({
    connectionString,
    max: 20,
    // Timeout waiting for a free connection from the pool (fail fast instead of queuing forever)
    connectionTimeoutMillis: 10_000,
    // Close idle connections after 60s — must be shorter than Fly.io NAT timeout (~5min)
    // so we never hand out a connection that Fly's network has silently dropped.
    idleTimeoutMillis: 60_000,
    ssl: isNeon ? { rejectUnauthorized: false } : undefined,
    // TCP keepalive: probe after 10s of silence on a checked-out connection.
    // This detects dead connections (e.g., Fly NAT drop) within ~30s instead of TCP's default ~20min.
    keepAlive: true,
    keepAliveInitialDelayMillis: 10_000,
  });
  pool.on("error", (err) => {
    console.error("Unexpected pg pool error (likely a disconnected idle client):", err.message);
  });
  return pool;
}

export async function initDatabase(databaseUrl: string, searchDatabaseUrl?: string) {
  if (isPgliteUrl(databaseUrl)) {
    _pglite = new PGlite(getPgliteDataDir(databaseUrl));
    await migratePglite(_pglite);
    _db = drizzlePglite(_pglite, { schema }) as unknown as Database;
    _pool = null;
    _searchPool = null;
    _searchDb = _db;
    console.log("[db] search: using primary pglite database");
    return _db;
  }

  _pool = createPool(databaseUrl);
  _db = drizzleNodePg(_pool, { schema });
  _pglite = null;

  const hasSearchReplica = !!searchDatabaseUrl && searchDatabaseUrl !== databaseUrl;
  if (hasSearchReplica) {
    _searchPool = createPool(searchDatabaseUrl);
    _searchDb = drizzleNodePg(_searchPool, { schema });
    console.log("[db] search: using read replica");
  } else {
    _searchPool = _pool;
    _searchDb = _db;
    console.log("[db] search: using primary (no replica configured)");
  }
  return _db;
}

export function getDb() {
  if (!_db) throw new Error("Database not initialized. Call initDatabase() first.");
  return _db;
}

export function isDatabaseInitialized() {
  return Boolean(_db);
}

export function getPool() {
  if (!_pool) throw new Error("Database not initialized. Call initDatabase() first.");
  return _pool;
}

export function getSearchDb() {
  if (!_searchDb) throw new Error("Database not initialized. Call initDatabase() first.");
  return _searchDb;
}

export async function pingDatabase() {
  const db = getDb();
  await db.execute(sql`SELECT 1`);
}

export async function closeDatabase() {
  await closeRisingWavePool();
  if (_pool) {
    await _pool.end();
  }
  if (_searchPool && _searchPool !== _pool) {
    await _searchPool.end();
  }
  if (_pglite) {
    await _pglite.close();
  }
  _pool = null;
  _pglite = null;
  _searchPool = null;
}
