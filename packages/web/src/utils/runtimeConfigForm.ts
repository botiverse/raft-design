import {
  getDefaultModel,
  hydrateRuntimeConfig,
  RUNTIME_CONFIG_VERSION,
  RUNTIME_FAST_MODE_RUNTIMES,
  type ReasoningEffort,
  type RuntimeConfig,
  type RuntimeConfigHydrationInput,
  type RuntimeModeConfig,
} from "@slock-ai/shared";

export const CUSTOM_MODEL_SELECT_VALUE = "__custom__";
export type RuntimeProviderMode = "default" | "custom";

export function supportsRuntimeApiUrl(runtime: string): boolean {
  return runtime === "claude";
}

export function runtimeApiUrlUnsupportedCopy(runtime: string): string | null {
  if (runtime === "cursor") {
    return "Cursor CLI does not expose a per-agent API URL flag or env var. Configure provider routing in Cursor itself.";
  }
  return null;
}

export function supportsRuntimeCustomModelName(runtime: string): boolean {
  return runtime === "claude" || runtime === "codex" || runtime === "cursor" || runtime === "copilot";
}

export function supportsRuntimeFastMode(runtime: string): boolean {
  return RUNTIME_FAST_MODE_RUNTIMES.has(runtime);
}

export function runtimeConfigCustomModelName(config: RuntimeConfig): string {
  return config.model.kind === "custom" ? config.model.name : "";
}

export function runtimeConfigApiUrl(config: RuntimeConfig): string {
  return config.provider?.kind === "custom" ? config.provider.apiUrl : "";
}

export function runtimeConfigApiKey(config: RuntimeConfig): string {
  return config.provider?.kind === "custom" ? config.provider.apiKey : "";
}

export function runtimeConfigProviderMode(config: RuntimeConfig): RuntimeProviderMode {
  return config.provider?.kind === "custom" ? "custom" : "default";
}

export function runtimeConfigFastMode(config: RuntimeConfig): boolean {
  return config.mode.kind === "fast";
}

export function buildRuntimeConfig(input: {
  runtime: string;
  model: string;
  customModelMode: boolean;
  customModelName?: string;
  providerMode?: RuntimeProviderMode;
  providerApiUrl?: string;
  providerApiKey?: string;
  fastMode?: boolean;
  reasoningEffort?: ReasoningEffort | null;
  envVars?: Record<string, string> | null;
}): RuntimeConfig {
  const runtime = input.runtime || "claude";
  const customModelName = input.customModelName?.trim() || input.model.trim();
  const providerMode: RuntimeProviderMode = input.providerMode
    ?? (input.providerApiUrl?.trim() ? "custom" : "default");
  const mode: RuntimeModeConfig = input.fastMode && supportsRuntimeFastMode(runtime)
    ? { kind: "fast" }
    : { kind: "default" };
  return {
    version: RUNTIME_CONFIG_VERSION,
    runtime,
    ...(supportsRuntimeApiUrl(runtime)
      ? {
          provider: providerMode === "custom"
            ? {
                kind: "custom" as const,
                apiUrl: input.providerApiUrl?.trim() ?? "",
                apiKey: input.providerApiKey?.trim() ?? "",
              }
            : { kind: "default" as const },
        }
      : {}),
    model: input.customModelMode
      ? { kind: "custom", name: customModelName || getDefaultModel(runtime) }
      : { kind: "preset", id: input.model || getDefaultModel(runtime) },
    mode,
    reasoningEffort: input.reasoningEffort ?? null,
    envVars: input.envVars ?? null,
  };
}

export function hydrateRuntimeConfigForm(input: RuntimeConfigHydrationInput): RuntimeConfig {
  return hydrateRuntimeConfig(input);
}
