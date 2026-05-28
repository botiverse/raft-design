import type { ProviderKind } from "./model";

export interface ProviderSetupState {
  canAddProviders: boolean;
  description: string;
  emphasis: string;
  helperText: string;
}

export type ProviderSetupOptionState = "available" | "pending" | "configured" | "unavailable";

export function buildProviderSetupState(
  localEncryptionAvailable: boolean,
  hasAvailableProviderKinds: boolean,
): ProviderSetupState {
  if (!localEncryptionAvailable) {
    return {
      canAddProviders: false,
      description:
        "This environment cannot store provider secrets locally. Enable local secret encryption before adding a provider from the daemon app.",
      emphasis: "Provider setup requires local secret encryption.",
      helperText:
        "Provider API keys are only stored through OS-level secret encryption. Because that boundary is unavailable here, the daemon app will not let you add a provider and pretend it worked.",
    };
  }

  if (!hasAvailableProviderKinds) {
    return {
      canAddProviders: false,
      description:
        "Every built-in provider type is already added on this machine. Finish setup for an existing provider or remove one before trying to add another one here.",
      emphasis: "All available provider types are already added.",
      helperText:
        "This daemon app currently exposes one local config slot per provider type. Use the Providers screen to finish setup, verify, update, or remove what is already on this machine.",
    };
  }

  return {
    canAddProviders: true,
    description: "Your agents need an AI model to run. Add at least one provider to get started.",
    emphasis: "Your keys never leave your machine.",
    helperText:
      "API keys are encrypted and stored in your OS keychain (macOS Keychain / Windows Credential Manager / Linux Secret Service). They are never sent to the Slock server.",
  };
}

export function getProviderSetupOptionState(
  kind: ProviderKind,
  existingProviderKinds: ProviderKind[],
  configuredProviderKinds: ProviderKind[],
  canAddProviders: boolean,
): ProviderSetupOptionState {
  if (configuredProviderKinds.includes(kind)) {
    return "configured";
  }
  if (existingProviderKinds.includes(kind)) {
    return "pending";
  }
  return canAddProviders ? "available" : "unavailable";
}
