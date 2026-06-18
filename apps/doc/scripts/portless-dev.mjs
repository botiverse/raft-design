import { spawnSync } from "node:child_process";
import { spawn } from "node:child_process";

const BASE_NAME = "raft-ui";
const DEFAULT_BRANCHES = new Set(["main", "master"]);

function sanitizeForHostname(value) {
  const sanitized = value
    .trim()
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/\.+/g, ".")
    .replace(/^\.+|\.+$/g, "");

  return sanitized || null;
}

function commandOutput(command, args) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });

  if (result.status !== 0) {
    return null;
  }

  return result.stdout.trim() || null;
}

function hasPortlessWorktreePrefix() {
  const branch = commandOutput("git", ["rev-parse", "--abbrev-ref", "HEAD"]);

  return Boolean(branch && branch !== "HEAD" && !DEFAULT_BRANCHES.has(branch));
}

function codexWorktreePrefix() {
  const root = commandOutput("git", ["rev-parse", "--show-toplevel"]) ?? process.cwd();
  const parts = root.split(/[\\/]+/);
  const codexIndex = parts.lastIndexOf(".codex");

  if (codexIndex === -1 || parts[codexIndex + 1] !== "worktrees") {
    return null;
  }

  return sanitizeForHostname(parts[codexIndex + 2] ?? "");
}

const prefix = hasPortlessWorktreePrefix() ? null : codexWorktreePrefix();
const name = prefix ? `${prefix}.${BASE_NAME}` : BASE_NAME;
const child = spawn("portless", ["run", "--name", name, "vp", "dev"], {
  cwd: process.cwd(),
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
