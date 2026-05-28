import { ChevronDown, ChevronRight, Plus, RefreshCw, Trash2 } from "lucide-react";
import { REASONING_EFFORTS, REASONING_EFFORT_RUNTIMES, type ReasoningEffort, type RuntimeModelInfo } from "@slock-ai/shared";
import Select from "../Select";
import Checkbox from "../ui/Checkbox";
import FormField from "../ui/FormField";
import {
  CUSTOM_MODEL_SELECT_VALUE,
  supportsRuntimeApiUrl,
  supportsRuntimeCustomModelName,
  supportsRuntimeFastMode,
  type RuntimeProviderMode,
} from "../../utils/runtimeConfigForm";

const DEFAULT_REASONING_EFFORT_SELECT_VALUE = "__default_reasoning_effort__";

export interface RuntimeOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface EnvVarEntry {
  key: string;
  value: string;
}

interface RuntimeConfigFieldsProps {
  runtime: string;
  onRuntimeChange: (runtime: string) => void;
  runtimeOptions: RuntimeOption[];
  model: string;
  onModelChange: (model: string) => void;
  customModelMode: boolean;
  onCustomModelModeChange: (enabled: boolean) => void;
  modelOptions: RuntimeOption[];
  runtimeModels: {
    models: RuntimeModelInfo[];
    loading: boolean;
    rescan: () => void;
  };
  rescanDisabled?: boolean;
  providerMode: RuntimeProviderMode;
  onProviderModeChange: (mode: RuntimeProviderMode) => void;
  providerApiUrl: string;
  onProviderApiUrlChange: (value: string) => void;
  providerApiKey: string;
  onProviderApiKeyChange: (value: string) => void;
  fastMode: boolean;
  onFastModeChange: (enabled: boolean) => void;
  reasoningEffort: ReasoningEffort | null;
  onReasoningEffortChange: (effort: ReasoningEffort | null) => void;
  envVarEntries: EnvVarEntry[];
  onEnvVarEntriesChange: (entries: EnvVarEntry[]) => void;
  envVarsMode?: "inline" | "advanced";
  advancedOpen?: boolean;
  onAdvancedOpenChange?: (open: boolean) => void;
  envVarsHint?: string;
  selectedModelSuggestionOnly?: boolean;
}

function RuntimeEnvVarsField({
  entries,
  onChange,
  optional,
  hint,
}: {
  entries: EnvVarEntry[];
  onChange: (entries: EnvVarEntry[]) => void;
  optional?: boolean;
  hint?: string;
}) {
  return (
    <FormField label="Environment Variables" optional={optional}>
      {hint && <p className="mb-2 -mt-1 text-xs text-black/50">{hint}</p>}
      <div className="space-y-2">
        {entries.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={entry.key}
              onChange={(event) => {
                const updated = [...entries];
                updated[index] = { ...updated[index], key: event.target.value };
                onChange(updated);
              }}
              className="input-brutal w-1/3 text-sm"
              placeholder="KEY"
            />
            <span className="text-black/40">=</span>
            <input
              type="text"
              value={entry.value}
              onChange={(event) => {
                const updated = [...entries];
                updated[index] = { ...updated[index], value: event.target.value };
                onChange(updated);
              }}
              className="input-brutal flex-1 text-sm"
              placeholder="value"
            />
            <button
              type="button"
              onClick={() => onChange(entries.filter((_, i) => i !== index))}
              className="btn-brutal-sm bg-white p-1"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...entries, { key: "", value: "" }])}
          className="flex items-center gap-1 text-sm font-bold text-black/60 hover:text-black"
        >
          <Plus size={14} />
          Add Variable
        </button>
      </div>
    </FormField>
  );
}

export default function RuntimeConfigFields({
  runtime,
  onRuntimeChange,
  runtimeOptions,
  model,
  onModelChange,
  customModelMode,
  onCustomModelModeChange,
  modelOptions,
  runtimeModels,
  rescanDisabled,
  providerMode,
  onProviderModeChange,
  providerApiUrl,
  onProviderApiUrlChange,
  providerApiKey,
  onProviderApiKeyChange,
  fastMode,
  onFastModeChange,
  reasoningEffort,
  onReasoningEffortChange,
  envVarEntries,
  onEnvVarEntriesChange,
  envVarsMode = "inline",
  advancedOpen = false,
  onAdvancedOpenChange,
  envVarsHint = "Runtime-owned keys are generated from Provider/Model above; add only extra launch env here.",
  selectedModelSuggestionOnly,
}: RuntimeConfigFieldsProps) {
  const apiUrlSupported = supportsRuntimeApiUrl(runtime);
  const customModelSupported = supportsRuntimeCustomModelName(runtime);
  const fastModeSupported = supportsRuntimeFastMode(runtime);
  const reasoningSupported = REASONING_EFFORT_RUNTIMES.has(runtime);
  const providerApiUrlRequired = apiUrlSupported && providerMode === "custom";
  const providerApiUrlInvalid = providerApiUrlRequired
    ? !/^https?:\/\//i.test(providerApiUrl.trim())
    : providerApiUrl.trim().length > 0 && !/^https?:\/\//i.test(providerApiUrl.trim());
  const customModelInvalid = customModelMode && !model.trim();
  const envVarsField = (
    <RuntimeEnvVarsField
      entries={envVarEntries}
      onChange={onEnvVarEntriesChange}
      optional={envVarsMode === "inline"}
      hint={envVarsHint}
    />
  );

  return (
    <>
      <FormField label="Runtime">
        <Select
          value={runtime}
          onChange={onRuntimeChange}
          options={runtimeOptions}
          className="w-full"
        />
      </FormField>

      {apiUrlSupported && (
        <FormField
          label="Provider"
          hint="Default leaves Claude Code provider settings untouched. Custom sets ANTHROPIC_BASE_URL and ANTHROPIC_API_KEY for this agent."
        >
          <Select
            value={providerMode}
            onChange={(value) => {
              const next = value as RuntimeProviderMode;
              onProviderModeChange(next);
              if (next !== "custom") {
                onProviderApiUrlChange("");
                onProviderApiKeyChange("");
              }
            }}
            options={[
              { value: "default", label: "Default" },
              { value: "custom", label: "Custom" },
            ]}
            className="w-full"
          />
        </FormField>
      )}

      {providerApiUrlRequired && (
        <>
          <FormField label="API URL" required>
            <input
              type="url"
              value={providerApiUrl}
              onChange={(event) => onProviderApiUrlChange(event.target.value)}
              className="input-brutal w-full text-sm"
              placeholder="https://gateway.example.com"
            />
            {providerApiUrlInvalid && (
              <p className="mt-1 text-xs font-bold text-brutal-red">
                API URL must start with http:// or https://.
              </p>
            )}
          </FormField>
          <FormField label="API Key" required>
            <input
              type="password"
              value={providerApiKey}
              onChange={(event) => onProviderApiKeyChange(event.target.value)}
              className="input-brutal w-full text-sm"
              placeholder="sk-ant-..."
              autoComplete="off"
            />
            {!providerApiKey.trim() && (
              <p className="mt-1 text-xs font-bold text-brutal-red">
                API Key is required for a custom provider.
              </p>
            )}
          </FormField>
        </>
      )}

      <div>
        <div className="mb-1 flex items-center gap-2">
          <label className="block text-sm font-bold text-black uppercase tracking-wide">
            Model
          </label>
          <button
            type="button"
            onClick={runtimeModels.rescan}
            disabled={rescanDisabled || runtimeModels.loading}
            className="ml-auto text-black/40 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Rescan models from this computer"
          >
            <RefreshCw size={12} className={runtimeModels.loading ? "animate-spin" : ""} />
          </button>
        </div>
        <Select
          value={customModelMode ? CUSTOM_MODEL_SELECT_VALUE : model}
          onChange={(value) => {
            if (value === CUSTOM_MODEL_SELECT_VALUE) {
              onCustomModelModeChange(true);
              onModelChange("");
              return;
            }
            onCustomModelModeChange(false);
            onModelChange(value);
          }}
          options={[
            ...modelOptions,
            ...(customModelSupported ? [{ value: CUSTOM_MODEL_SELECT_VALUE, label: "Custom" }] : []),
          ]}
          className="w-full"
        />
        {customModelSupported && customModelMode && (
          <div className="mt-2">
            <input
              type="text"
              value={model}
              onChange={(event) => onModelChange(event.target.value)}
              className="input-brutal w-full py-1.5 text-sm"
              placeholder={runtime === "claude" ? "Custom model name" : "Custom model ID"}
            />
          </div>
        )}
        {customModelInvalid && (
          <p className="mt-1.5 text-xs font-bold text-brutal-red">
            Custom model name is required.
          </p>
        )}
        {selectedModelSuggestionOnly && (
          <p className="mt-1.5 text-xs text-black/50">
            This model is a catalog suggestion and has not been verified to launch with this computer's current runtime config.
          </p>
        )}
      </div>

      {reasoningSupported && (
        <FormField label="Reasoning">
          <Select
            value={reasoningEffort || DEFAULT_REASONING_EFFORT_SELECT_VALUE}
            onChange={(value) => {
              onReasoningEffortChange(
                value === DEFAULT_REASONING_EFFORT_SELECT_VALUE
                  ? null
                  : value as ReasoningEffort,
              );
            }}
            options={[
              { value: DEFAULT_REASONING_EFFORT_SELECT_VALUE, label: "Default" },
              ...REASONING_EFFORTS.map((option) => ({ value: option.id, label: option.label })),
            ]}
            className="w-full"
          />
        </FormField>
      )}

      {fastModeSupported && (
        <FormField label="Mode">
          <label className="flex items-start gap-2 border-2 border-black bg-white px-3 py-2 text-sm font-bold">
            <Checkbox
              size="md"
              checked={fastMode}
              onChange={(event) => onFastModeChange(event.target.checked)}
              className="mt-0.5"
            />
            <span>
              Fast mode
              <span className="block text-xs font-normal text-black/50">
                Launch this runtime with its faster service/minimal mode.
              </span>
            </span>
          </label>
        </FormField>
      )}

      {envVarsMode === "advanced" ? (
        <div>
          <button
            type="button"
            onClick={() => onAdvancedOpenChange?.(!advancedOpen)}
            className="flex items-center gap-1 text-sm font-bold text-black/60 hover:text-black uppercase tracking-wide"
          >
            {advancedOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            Advanced
          </button>
          {advancedOpen && <div className="mt-3 space-y-3">{envVarsField}</div>}
        </div>
      ) : (
        envVarsField
      )}
    </>
  );
}
