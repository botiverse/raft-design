// Output helpers. Agent-facing commands output MCP-matching canonical text
// on stdout. JSON only for non-MCP-parity commands (auth whoami).
// Errors go to stderr as JSON.

export class CliExit extends Error {
  constructor(public readonly exitCode: number) {
    super(`CliExit(${exitCode})`);
    this.name = "CliExit";
  }
}

export function emit(payload: unknown): void {
  process.stdout.write(JSON.stringify(payload) + "\n");
}

export interface FailOptions {
  /** Process exit code. Defaults to 1. */
  exitCode?: number;
  /**
   * Agent-readable next step. When set, written as `suggested_next_action`
   * in the error payload. Use this to guide an agent that hit this error
   * to the right recovery command (e.g. "Run `slock agent list` then
   * rerun with --agent <id>").
   */
  suggestedNextAction?: string;
}

export function fail(code: string, message: string, options?: FailOptions): never {
  const body: Record<string, unknown> = { ok: false, code, message };
  if (options?.suggestedNextAction) {
    body.suggested_next_action = options.suggestedNextAction;
  }
  process.stderr.write(JSON.stringify(body) + "\n");
  throw new CliExit(options?.exitCode ?? 1);
}
