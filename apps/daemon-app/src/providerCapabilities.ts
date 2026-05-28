import type { ProviderConfig, ProviderKind } from "./model";

export const SUPPORTED_PROVIDER_KINDS: ProviderKind[] = ["anthropic", "openai", "alibaba", "custom"];
export const OPENAI_COMPATIBLE_PROVIDER_KINDS = new Set<ProviderKind>(["openai", "alibaba", "custom"]);

export function isOpenAiCompatibleProviderKind(kind: ProviderKind): boolean {
  return OPENAI_COMPATIBLE_PROVIDER_KINDS.has(kind);
}

export function providerUsesSystemCredentials(
  provider: Pick<ProviderConfig, "credentialSource">,
): boolean {
  return provider.credentialSource === "system";
}

export function providerHasUsableCredentials(
  provider: Pick<ProviderConfig, "credentialSource" | "hasLocalKey" | "status">,
): boolean {
  if (providerUsesSystemCredentials(provider)) {
    return provider.status === "connected";
  }

  return provider.hasLocalKey;
}
