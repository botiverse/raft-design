import pg from "pg";

export const RISINGWAVE_UNREAD_INBOX_CONTRACT_VERSION = 1;

let _risingWavePool: pg.Pool | null = null;
let _risingWaveUrl: string | null = null;

export function getRisingWaveDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string | null {
  const value = env.RISINGWAVE_DATABASE_URL?.trim();
  return value ? value : null;
}

export function isRisingWaveConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(getRisingWaveDatabaseUrl(env));
}

export function getRisingWavePool(): pg.Pool | null {
  const databaseUrl = getRisingWaveDatabaseUrl();
  if (!databaseUrl) return null;

  if (_risingWavePool && _risingWaveUrl === databaseUrl) {
    return _risingWavePool;
  }

  if (_risingWavePool) {
    void _risingWavePool.end().catch((err) => {
      console.error("[risingwave] failed to close replaced pool:", err.message);
    });
  }

  _risingWaveUrl = databaseUrl;
  _risingWavePool = new pg.Pool({
    connectionString: databaseUrl,
    max: Number(process.env.RISINGWAVE_POOL_MAX || "10"),
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 60_000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10_000,
    ssl: databaseUrl.includes("risingwave.cloud") ? { rejectUnauthorized: false } : undefined,
  });
  _risingWavePool.on("error", (err) => {
    console.error("[risingwave] unexpected pool error:", err.message);
  });
  return _risingWavePool;
}

export async function closeRisingWavePool() {
  if (_risingWavePool) {
    await _risingWavePool.end();
  }
  _risingWavePool = null;
  _risingWaveUrl = null;
}
