import type { ProviderConfig } from "./model";
import {
  isOpenAiCompatibleProviderKind,
  providerHasUsableCredentials,
  providerUsesSystemCredentials,
} from "./providerCapabilities";
import { normalizeProviderEndpoint } from "./providerClient";

export function buildProviderRuntimeSummary(
  provider: ProviderConfig,
  providers: ProviderConfig[],
): string {
  if (provider.kind === "anthropic") {
    if (providerUsesSystemCredentials(provider)) {
      return provider.status === "connected" ? "Claude Code default" : "Claude Code detected";
    }

    return providerHasUsableCredentials(provider) ? "Claude default" : "Claude target";
  }

  if (!isOpenAiCompatibleProviderKind(provider.kind)) {
    return "Machine-level only";
  }

  if (provider.kind === "custom" && !normalizeProviderEndpoint(provider.kind, provider.endpoint)) {
    return "Codex target · endpoint required";
  }

  if (!providerHasUsableCredentials(provider)) {
    return "Codex target";
  }

  const codexCandidates = providers.filter(isCodexDefaultCandidate);
  if (codexCandidates.length === 1 && codexCandidates[0]?.id === provider.id) {
    return "Codex default";
  }

  if (codexCandidates.length > 1 && codexCandidates.some((entry) => entry.id === provider.id)) {
    return "Codex target · ambiguous";
  }

  return "Codex target";
}

function isCodexDefaultCandidate(provider: ProviderConfig): boolean {
  if (!isOpenAiCompatibleProviderKind(provider.kind)) {
    return false;
  }
  if (!providerHasUsableCredentials(provider)) {
    return false;
  }
  if (provider.kind === "custom" && !normalizeProviderEndpoint(provider.kind, provider.endpoint)) {
    return false;
  }
  return true;
}
