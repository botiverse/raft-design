import { execFile } from "node:child_process";
import type { ProviderConfig } from "./model";
import { SYSTEM_PROVIDER_KEY_HINT } from "./providerKeyHint";

export interface CommandProbeResult {
  exitCode: number | null;
  found: boolean;
  stderr: string;
  stdout: string;
}

export type CommandProbe = (
  command: string,
  args: string[],
) => Promise<CommandProbeResult>;

export async function detectSystemProviders(
  runCommand: CommandProbe = probeCommand,
): Promise<ProviderConfig[]> {
  const claude = await detectClaudeSystemProvider(runCommand);
  return claude ? [claude] : [];
}

export async function detectClaudeSystemProvider(
  runCommand: CommandProbe,
): Promise<ProviderConfig | null> {
  const versionResult = await runCommand("claude", ["--version"]);
  if (!versionResult.found || versionResult.exitCode !== 0) {
    return null;
  }

  const authStatusResult = await runCommand("claude", ["auth", "status"]);
  const loggedIn = parseLoggedInStatus(authStatusResult.stdout);

  if (authStatusResult.exitCode === 0 && loggedIn === true) {
    return buildSystemProvider({
      status: "connected",
      usage: "Ready via existing Claude Code login on this machine.",
    });
  }

  if (authStatusResult.exitCode === 0 && loggedIn === false) {
    return buildSystemProvider({
      status: "pending",
      usage: "Not logged in — run `claude login` in terminal.",
    });
  }

  return buildSystemProvider({
    status: "error",
    usage: "Detected but unable to verify — run `claude auth status` in terminal.",
  });
}

export function parseLoggedInStatus(output: string): boolean | null {
  const trimmed = output.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed) as { loggedIn?: unknown };
    if (typeof parsed?.loggedIn === "boolean") {
      return parsed.loggedIn;
    }
  } catch {
    // Fall through to the regex path.
  }

  const match = trimmed.match(/"?loggedIn"?\s*:\s*(true|false)/i);
  if (!match) {
    return null;
  }

  return match[1]?.toLowerCase() === "true";
}

async function probeCommand(command: string, args: string[]): Promise<CommandProbeResult> {
  return new Promise((resolve) => {
    execFile(
      command,
      args,
      {
        timeout: 5000,
        maxBuffer: 1024 * 1024,
      },
      (error, stdout, stderr) => {
        if (!error) {
          resolve({
            found: true,
            exitCode: 0,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
          });
          return;
        }

        const errno = error as NodeJS.ErrnoException & { code?: string | number | null };
        if (errno.code === "ENOENT") {
          resolve({
            found: false,
            exitCode: null,
            stdout: "",
            stderr: "",
          });
          return;
        }

        resolve({
          found: true,
          exitCode: typeof errno.code === "number" ? errno.code : null,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
        });
      },
    );
  });
}

function buildSystemProvider(input: Pick<ProviderConfig, "status" | "usage">): ProviderConfig {
  return {
    id: "system:claude",
    kind: "anthropic",
    credentialSource: "system",
    name: "Claude Code (system)",
    model: "Claude Sonnet 4",
    status: input.status,
    hasLocalKey: false,
    keyHint: SYSTEM_PROVIDER_KEY_HINT,
    usage: input.usage,
    endpoint: null,
  };
}
