import { createHash, randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { resolveSlockHomePath } from "./slockHome.js";

const INCOMPLETE_LOCK_STALE_MS = 30_000;

interface MachineLockOwner {
  pid: number;
  token: string;
  hostname: string;
  startedAt: string;
  serverUrl: string;
  apiKeyFingerprint: string;
}

export interface DaemonMachineLockHandle {
  lockId: string;
  machineDir: string;
  lockDir: string;
  release: () => void;
}

export class DaemonMachineLockConflictError extends Error {
  readonly code = "DAEMON_MACHINE_LOCK_HELD";

  constructor(lockDir: string, owner: MachineLockOwner | null) {
    const ownerText = owner ? `pid=${owner.pid}, startedAt=${owner.startedAt}, host=${owner.hostname}` : "unknown owner";
    super(
      `Another Slock daemon is already running for this machine key (${ownerText}). ` +
        `Lock: ${lockDir}. Stop the existing daemon first, or use a different machine key/state directory.`,
    );
    this.name = "DaemonMachineLockConflictError";
  }
}

function apiKeyFingerprint(apiKey: string): string {
  return createHash("sha256").update(apiKey).digest("hex");
}

export function getDaemonMachineLockId(apiKey: string): string {
  return `machine-${apiKeyFingerprint(apiKey).slice(0, 16)}`;
}

export function resolveDefaultMachineStateRoot(): string {
  return resolveSlockHomePath("machines");
}

function ownerPath(lockDir: string): string {
  return path.join(lockDir, "owner.json");
}

function readOwner(lockDir: string): MachineLockOwner | null {
  try {
    return JSON.parse(readFileSync(ownerPath(lockDir), "utf8")) as MachineLockOwner;
  } catch {
    return null;
  }
}

function lockAgeMs(lockDir: string): number | null {
  try {
    return Date.now() - statSync(lockDir).mtimeMs;
  } catch {
    return null;
  }
}

function isProcessAlive(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    const code = typeof err === "object" && err && "code" in err ? (err as { code?: string }).code : undefined;
    return code !== "ESRCH";
  }
}

export function acquireDaemonMachineLock(options: {
  apiKey: string;
  serverUrl: string;
  rootDir?: string;
}): DaemonMachineLockHandle {
  const rootDir = options.rootDir ?? resolveDefaultMachineStateRoot();
  const fingerprint = apiKeyFingerprint(options.apiKey);
  const lockId = getDaemonMachineLockId(options.apiKey);
  const machineDir = path.join(rootDir, lockId);
  const lockDir = path.join(machineDir, "daemon.lock");
  const token = randomUUID();

  mkdirSync(machineDir, { recursive: true });

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      mkdirSync(lockDir);
      const owner: MachineLockOwner = {
        pid: process.pid,
        token,
        hostname: os.hostname(),
        startedAt: new Date().toISOString(),
        serverUrl: options.serverUrl,
        apiKeyFingerprint: fingerprint.slice(0, 16),
      };
      try {
        writeFileSync(ownerPath(lockDir), `${JSON.stringify(owner, null, 2)}\n`, { mode: 0o600 });
      } catch (err) {
        rmSync(lockDir, { recursive: true, force: true });
        throw err;
      }
      return {
        lockId,
        machineDir,
        lockDir,
        release: () => {
          const currentOwner = readOwner(lockDir);
          if (currentOwner?.pid === process.pid && currentOwner.token === token) {
            rmSync(lockDir, { recursive: true, force: true });
          }
        },
      };
    } catch (err) {
      const code = typeof err === "object" && err && "code" in err ? (err as { code?: string }).code : undefined;
      if (code !== "EEXIST") throw err;

      const owner = readOwner(lockDir);
      if (owner?.pid && isProcessAlive(owner.pid)) {
        throw new DaemonMachineLockConflictError(lockDir, owner);
      }
      if (!owner) {
        const ageMs = lockAgeMs(lockDir);
        if (ageMs === null || ageMs < INCOMPLETE_LOCK_STALE_MS) {
          throw new DaemonMachineLockConflictError(lockDir, null);
        }
      }

      rmSync(lockDir, { recursive: true, force: true });
    }
  }

  throw new DaemonMachineLockConflictError(lockDir, readOwner(lockDir));
}
