export const DEFAULT_SLOCK_SERVER_URL = "https://api.slock.ai";

export function resolveServerUrl(...candidates: Array<string | undefined | null>): string {
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (value) return value;
  }
  return DEFAULT_SLOCK_SERVER_URL;
}
