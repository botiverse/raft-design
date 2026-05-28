export function isAuthErrorStatus(status: number | undefined): boolean {
  return status === 401 || status === 403;
}

export class MissingRefreshTokenError extends Error {
  constructor() {
    super("Missing refresh token");
    this.name = "MissingRefreshTokenError";
  }
}

export function isMissingRefreshTokenError(err: unknown): boolean {
  return err instanceof MissingRefreshTokenError || (err as any)?.name === "MissingRefreshTokenError";
}
