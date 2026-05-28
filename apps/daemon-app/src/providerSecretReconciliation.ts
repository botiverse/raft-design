import type { ProviderConfig } from "./model";
import { formatProviderKeyHint } from "./providerClient";
import { DEFAULT_PROVIDER_KEY_HINT } from "./providerKeyHint";

export type ProviderSecretLookup = (providerId: string) => Promise<string | null>;

const MISSING_PROVIDER_USAGE = "Local credentials required";

export async function reconcileProviderSecrets(
  providers: ProviderConfig[],
  getProviderApiKey: ProviderSecretLookup,
): Promise<{ providers: ProviderConfig[]; changed: boolean }> {
  let changed = false;

  const reconciledProviders = await Promise.all(
    providers.map(async (provider) => {
      const nextProvider = reconcileProviderSecret(
        provider,
        (await getProviderApiKey(provider.id))?.trim() ?? "",
      );

      if (nextProvider !== provider) {
        changed = true;
      }

      return nextProvider;
    }),
  );

  return {
    providers: reconciledProviders,
    changed,
  };
}

function reconcileProviderSecret(provider: ProviderConfig, apiKey: string): ProviderConfig {
  if (!apiKey) {
    if (
      provider.hasLocalKey ||
      provider.status !== "pending" ||
      provider.keyHint !== DEFAULT_PROVIDER_KEY_HINT ||
      provider.usage !== MISSING_PROVIDER_USAGE
    ) {
      return {
        ...provider,
        hasLocalKey: false,
        status: "pending",
        keyHint: DEFAULT_PROVIDER_KEY_HINT,
        usage: MISSING_PROVIDER_USAGE,
      };
    }

    return provider;
  }

  const nextKeyHint = formatProviderKeyHint(apiKey);
  if (provider.hasLocalKey && provider.keyHint === nextKeyHint) {
    return provider;
  }

  return {
    ...provider,
    hasLocalKey: true,
    keyHint: nextKeyHint,
  };
}
