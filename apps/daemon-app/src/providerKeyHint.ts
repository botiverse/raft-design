export const DEFAULT_PROVIDER_KEY_HINT = "not configured";
export const SYSTEM_PROVIDER_KEY_HINT = "system login";

const LEGACY_UNCONFIGURED_PROVIDER_KEY_HINTS = new Set([
  DEFAULT_PROVIDER_KEY_HINT,
  "not configured yet",
]);

export function isUnconfiguredProviderKeyHint(value: string | null | undefined): boolean {
  if (!value) {
    return true;
  }

  return LEGACY_UNCONFIGURED_PROVIDER_KEY_HINTS.has(value.trim().toLowerCase());
}
