import type { ProviderConfig, ProviderKind } from "./model";
import { providerHasUsableCredentials } from "./providerCapabilities";

export function countConfiguredProviders(providers: ProviderConfig[]): number {
  return providers.filter(providerHasUsableCredentials).length;
}

export function countPendingProviders(providers: ProviderConfig[]): number {
  return providers.filter((provider) => !providerHasUsableCredentials(provider)).length;
}

export function getConfiguredProviderKinds(providers: ProviderConfig[]): ProviderKind[] {
  return providers.filter(providerHasUsableCredentials).map((provider) => provider.kind);
}

export function getExistingProviderKinds(providers: ProviderConfig[]): ProviderKind[] {
  return [...new Set(providers.map((provider) => provider.kind))];
}
