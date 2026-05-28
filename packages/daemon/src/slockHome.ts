import os from "node:os";
import path from "node:path";
import { existsSync } from "node:fs";

export const SLOCK_HOME_ENV = "SLOCK_HOME";

export function resolveDefaultSlockHome(homeDir: string = os.homedir()): string {
  return path.resolve(path.join(homeDir, ".slock"));
}

export function resolveSlockHome(
  env: Partial<Pick<NodeJS.ProcessEnv, typeof SLOCK_HOME_ENV>> = process.env,
  homeDir: string = os.homedir(),
): string {
  const raw = env[SLOCK_HOME_ENV]?.trim();
  const root = raw && raw.length > 0 ? raw : resolveDefaultSlockHome(homeDir);
  return path.resolve(root);
}

export function resolveSlockHomePath(
  childPath: string,
  slockHome: string = resolveSlockHome(),
): string {
  return path.join(slockHome, childPath);
}

export interface LegacySlockStatePath {
  path: string;
  destination: string;
  description: string;
}

export function listLegacySlockStatePaths(
  slockHome: string = resolveSlockHome(),
  homeDir: string = os.homedir(),
): LegacySlockStatePath[] {
  const defaultHome = resolveDefaultSlockHome(homeDir);
  if (path.resolve(slockHome) === defaultHome) return [];

  const candidates: LegacySlockStatePath[] = [
    {
      path: path.join(defaultHome, "agents"),
      destination: path.join(slockHome, "agents"),
      description: "agent workspaces and per-agent runtime wrapper state",
    },
    {
      path: path.join(defaultHome, "machines"),
      destination: path.join(slockHome, "machines"),
      description: "daemon machine locks, local traces, and machine-scoped state",
    },
    {
      path: path.join(defaultHome, "attachments"),
      destination: path.join(slockHome, "attachments"),
      description: "chat bridge attachment download cache",
    },
  ];

  return candidates.filter((candidate) => existsSync(candidate.path));
}
