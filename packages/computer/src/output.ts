// Output helpers (RFC v0.8 contract v3 §6). Progress → stdout (human
// readable); errors → stderr as a stable {ok:false,code,message} shape.
// Errors are ACTIONABLE — never a raw server-response dump (binding
// constraint: user must know what to do, not see internal payloads).
export class CliExit extends Error {
  /**
   * v8.3.3 PR-2c — carry the closed-set / stderr token through the thrown
   * error so callers can pattern-match without parsing stderr. Optional
   * because some callsites throw `new CliExit(code)` directly without a
   * named token (e.g. the harness EX_CONFIG paths).
   */
  constructor(public readonly exitCode: number, public readonly code?: string) {
    super(`CliExit(${exitCode}${code ? ` ${code}` : ""})`);
    this.name = "CliExit";
  }
}

export function info(line: string): void {
  process.stdout.write(`${line}\n`);
}

export function fail(code: string, message: string, exitCode = 1): never {
  process.stderr.write(`${JSON.stringify({ ok: false, code, message })}\n`);
  throw new CliExit(exitCode, code);
}
