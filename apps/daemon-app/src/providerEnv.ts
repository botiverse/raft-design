import type { ProviderConfig } from "./model";
import { isOpenAiCompatibleProviderKind } from "./providerCapabilities";
import { normalizeProviderEndpoint } from "./providerClient";

type ProviderKeyLookup = (providerId: string) => Promise<string | null>;

interface ResolvedProviderCredential {
  provider: ProviderConfig;
  apiKey: string;
}

export async function resolveDefaultAgentEnvVars(
  runtimeId: string,
  providers: ProviderConfig[],
  getProviderApiKey: ProviderKeyLookup,
): Promise<Record<string, string> | null> {
  switch (runtimeId) {
    case "claude":
      return resolveAnthropicEnvVars(providers, getProviderApiKey);
    case "codex":
      return resolveOpenAiCompatibleEnvVars(providers, getProviderApiKey);
    default:
      return null;
  }
}

async function resolveAnthropicEnvVars(
  providers: ProviderConfig[],
  getProviderApiKey: ProviderKeyLookup,
): Promise<Record<string, string> | null> {
  const provider = providers.find((entry) => entry.kind === "anthropic");
  if (!provider) {
    return null;
  }

  const apiKey = (await getProviderApiKey(provider.id))?.trim();
  if (!apiKey) {
    return null;
  }

  return {
    ANTHROPIC_API_KEY: apiKey,
  };
}

async function resolveOpenAiCompatibleEnvVars(
  providers: ProviderConfig[],
  getProviderApiKey: ProviderKeyLookup,
): Promise<Record<string, string> | null> {
  const configuredProviders = await collectConfiguredProviders(providers, getProviderApiKey, (provider) =>
    isOpenAiCompatibleProviderKind(provider.kind),
  );

  if (configuredProviders.length !== 1) {
    return null;
  }

  const [{ provider, apiKey }] = configuredProviders;
  if (provider.kind === "openai") {
    return {
      OPENAI_API_KEY: apiKey,
    };
  }

  const endpoint = normalizeProviderEndpoint(provider.kind, provider.endpoint);
  if (!endpoint) {
    return null;
  }

  return {
    OPENAI_API_KEY: apiKey,
    OPENAI_BASE_URL: endpoint,
  };
}

async function collectConfiguredProviders(
  providers: ProviderConfig[],
  getProviderApiKey: ProviderKeyLookup,
  predicate: (provider: ProviderConfig) => boolean,
): Promise<ResolvedProviderCredential[]> {
  const matches = providers.filter(predicate);
  const resolved = await Promise.all(
    matches.map(async (provider) => ({
      provider,
      apiKey: (await getProviderApiKey(provider.id))?.trim() ?? "",
    })),
  );
  return resolved.filter((entry) => Boolean(entry.apiKey));
}
