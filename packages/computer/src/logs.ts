// `slock-computer logs` — tail one server's local daemon log (RFC v0.8
// contract v4 §6/§7). Per-server scope: a Computer manages N daemons,
// each with its own log; `logs` picks one server's log per invocation.
//
// Server selection follows the v4 locked rule (no implicit current):
//   - exactly 1 attached → omit `--server` allowed
//   - ≥2 attached → `--server <id>` required, fail-loud list candidates
//   - `--supervisor` reads the global supervisor.log instead
//
// SECRET REDLINE: every emitted line is passed through redactSecrets()
// — a daemon that accidentally logs a credential must still not surface
// it via this command (client half of the double layer; §12 server
// projection is the other).
import { readFile } from "node:fs/promises";
import { redactSecrets } from "./doctor.js";
import { resolveSlockHome, serverDaemonLogPath, supervisorLogPath } from "./paths.js";
import { resolveTargetServerId } from "./targetServer.js";
import { fail, info } from "./output.js";

const DEFAULT_LINES = 200;

export async function runLogs(opts: {
  lines?: number;
  server?: string | null;
  supervisor?: boolean;
}): Promise<void> {
  const home = resolveSlockHome();
  const file = opts.supervisor
    ? supervisorLogPath(home)
    : serverDaemonLogPath(home, await resolveTargetServerId({ server: opts.server }));

  let content: string;
  try {
    content = await readFile(file, "utf8");
  } catch {
    fail(
      "NO_DAEMON_LOG",
      opts.supervisor
        ? `No supervisor log at ${file}. Start the supervisor first (\`slock-computer start\`).`
        : `No daemon log at ${file}. Start its daemon first (\`slock-computer start\`).`,
    );
  }

  const n =
    Number.isInteger(opts.lines) && (opts.lines as number) > 0
      ? (opts.lines as number)
      : DEFAULT_LINES;

  const lines = content.split("\n");
  if (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
  const tail = lines.slice(-n);

  for (const line of tail) info(redactSecrets(line));
}
