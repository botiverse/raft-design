import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAgentStore } from "../../store/agentStore";
import { useChannelStore } from "../../store/channelStore";
import { useMachineStore } from "../../store/machineStore";
import { useServerStore } from "../../store/serverStore";
import { validateAgentName, RUNTIMES, getDefaultModel, REASONING_EFFORT_RUNTIMES, PLAN_CONFIG, getEffectiveLimits, type ReasoningEffort, type ServerPlan } from "@slock-ai/shared";
import { useRuntimeModels } from "../../hooks/useRuntimeModels";
import { useAppNavigate } from "../../hooks/useAppNavigate";
import Modal from "../Modal";
import Select from "../Select";
import Banner from "../ui/Banner";
import FormField from "../ui/FormField";
import { AVATAR_KEYS } from "./PixelAvatar";
import RuntimeConfigFields from "./RuntimeConfigFields";
import {
  buildRuntimeConfig,
  type RuntimeProviderMode,
  supportsRuntimeApiUrl,
} from "../../utils/runtimeConfigForm";

const MAX_AGENT_DESCRIPTION_LENGTH = 3000;

function isQuotaError(error: string): boolean {
  return error.includes("limit reached");
}

export default function CreateAgentDialog({
  onClose,
  defaultMachineId,
  onboarding = false,
  prefilledName,
  prefilledDescription,
  prefilledMachineId,
  prefilledMachineMode,
  onCreated,
  onSubmitStart,
  onSubmitError,
  fromActionCard = false,
}: {
  onClose: () => void;
  defaultMachineId?: string;
  onboarding?: boolean;
  /**
   * Prefilled name from an action card. When set, the field is locked
   * (treated like the onboarding flow's locked fields). Pass via the
   * action-card → dialog shortcut path. Per stdrc 2026-05-10
   * #proj-approval msg=cf3ba1b7.
   */
  prefilledName?: string;
  /** Same as prefilledName but for the description field. */
  prefilledDescription?: string;
  /**
   * Structured computer constraint from an action card. `preferred` preselects
   * the computer when it is online; `required` prevents silent fallback to any
   * other computer.
   */
  prefilledMachineId?: string;
  prefilledMachineMode?: "preferred" | "required";
  /**
   * Fired after the dialog successfully creates the agent. Used by the
   * action-card flow to call /api/actions/:msgId/mark-executed with the
   * new agent's id + name.
   */
  onCreated?: (agent: { id: string; name: string }) => void;
  /**
   * Set by the action-card launcher so post-create navigation stays on the
   * action card itself (cindyz 2026-05-26 dm:@cindyz:b966e666 msg=f342577e:
   * "如果是通过 action card create, 应该停留在原本的 action card 里").
   * Overrides the "first agent → #all" rescue rule below — the action card
   * lives on a chat surface, so staying put is always the right move.
   */
  fromActionCard?: boolean;
  /**
   * Action-card funnel hook: fired right before the create API call (after
   * client-side validation passes). Used to record `execute_attempt` in
   * the product funnel for the dialog-driven path. No-op for non-card
   * launches.
   */
  onSubmitStart?: () => void;
  /**
   * Action-card funnel hook: fired when the create API call throws. Used
   * to record `execute_fail`. Receives the raw error so the caller can
   * classify (status / code / network); the caller is responsible for
   * mapping to a low-cardinality `error_class`.
   */
  onSubmitError?: (err: unknown) => void;
}) {
  const machines = useMachineStore((s) => s.machines);

  const [name, setName] = useState(
    prefilledName ?? (onboarding ? "Cindy" : ""),
  );
  const [description, setDescription] = useState(
    prefilledDescription ?? (onboarding ? "Onboarding Assistant" : ""),
  );
  const defaultOnline = defaultMachineId && machines.find((m) => m.id === defaultMachineId)?.status === "online"
    ? defaultMachineId
    : undefined;
  const prefilledMachine = prefilledMachineId
    ? machines.find((m) => m.id === prefilledMachineId)
    : undefined;
  const prefilledMachineOnline = prefilledMachine?.status === "online";
  const [selectedMachineId, setSelectedMachineId] = useState(
    prefilledMachineOnline
      ? prefilledMachineId!
      : prefilledMachineId
        ? ""
        : defaultOnline || machines.find((m) => m.status === "online")?.id || ""
  );
  const selectedMachine = machines.find((m) => m.id === selectedMachineId);
  const availableRuntimes = selectedMachine?.runtimes ?? [];
  const supportedSet = new Set(RUNTIMES.filter((r) => r.supported).map((r) => r.id));
  const defaultRuntime = availableRuntimes.find((id) => supportedSet.has(id)) || availableRuntimes[0] || "";
  const [runtime, setRuntime] = useState(defaultRuntime);
  const [model, setModel] = useState(getDefaultModel(defaultRuntime || "claude"));
  const [customModelMode, setCustomModelMode] = useState(false);
  const [providerMode, setProviderMode] = useState<RuntimeProviderMode>("default");
  const [providerApiUrl, setProviderApiUrl] = useState("");
  const [providerApiKey, setProviderApiKey] = useState("");
  const [fastMode, setFastMode] = useState(false);
  const [reasoningEffort, setReasoningEffort] = useState<ReasoningEffort | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [envVarEntries, setEnvVarEntries] = useState<{ key: string; value: string }[]>([]);
  const [error, setError] = useState("");
  const createAgent = useAgentStore((s) => s.createAgent);
  const channels = useChannelStore((s) => s.channels);
  const allAgents = useAgentStore((s) => s.agents);
  const agents = allAgents.filter((a) => !a.deletedAt);
  const nav = useAppNavigate();

  const runtimeModels = useRuntimeModels(selectedMachineId, runtime);
  const selectedModelInfo = customModelMode ? null : runtimeModels.models.find((m) => m.id === model);
  const selectedModelSuggestionOnly = selectedModelInfo?.verified === "suggestion_only";
  const apiUrlSupported = supportsRuntimeApiUrl(runtime);
  const providerApiUrlRequired = apiUrlSupported && providerMode === "custom";
  const providerApiUrlInvalid = providerApiUrlRequired
    ? !/^https?:\/\//i.test(providerApiUrl.trim())
    : providerApiUrl.trim().length > 0 && !/^https?:\/\//i.test(providerApiUrl.trim());
  const providerApiKeyInvalid = providerApiUrlRequired && !providerApiKey.trim();
  const runtimeOptions = RUNTIMES.map((r) => {
    const available = availableRuntimes.includes(r.id);
    const selectable = available && r.supported;
    return {
      value: r.id,
      label: r.displayName + (!r.supported ? " (coming soon)" : !available ? " (not installed)" : ""),
      disabled: !selectable,
    };
  });
  const modelOptions = runtimeModels.models.map((m) => ({ value: m.id, label: m.label }));

  useEffect(() => {
    if (!prefilledMachineId || selectedMachineId) return;
    const machine = machines.find((m) => m.id === prefilledMachineId);
    if (!machine || machine.status !== "online") return;
    const rts = machine.runtimes ?? [];
    const newRuntime = rts.find((id) => supportedSet.has(id)) || rts[0] || "";
    setSelectedMachineId(machine.id);
    setRuntime(newRuntime);
    setModel(getDefaultModel(newRuntime || "claude"));
    setCustomModelMode(false);
    setProviderMode("default");
    setProviderApiUrl("");
    setProviderApiKey("");
    setFastMode(false);
    setReasoningEffort(null);
  }, [machines, prefilledMachineId, selectedMachineId, supportedSet]);

  useEffect(() => {
    if (customModelMode) return;
    const ids = runtimeModels.models.map((m) => m.id);
    if (ids.length === 0) return;
    if (ids.includes(model)) return;
    setModel(runtimeModels.default && ids.includes(runtimeModels.default) ? runtimeModels.default : ids[0]);
  }, [runtimeModels.models, runtimeModels.default, model, customModelMode]);

  const plan = (useServerStore((s) => s.current?.plan) || "free") as ServerPlan;
  const maxAgents = getEffectiveLimits(plan).maxAgents;
  const atLimit = maxAgents !== -1 && agents.length >= maxAgents;
  // Lock name/description ONLY for the onboarding flow. Action-card-driven
  // prefill leaves the fields editable so the human can adjust whatever
  // the agent suggested (per stdrc 2026-05-10 #proj-approval msg=2f20e3a2:
  // "Create Agent 那个也可以编辑了").
  const nameLocked = onboarding;
  const descriptionLocked = onboarding;
  const onboardingLockedFieldClass = onboarding
    ? "bg-gray-100 text-black/50 cursor-not-allowed"
    : "";
  const lockedFieldClass = "bg-gray-100 text-black/50 cursor-not-allowed";
  const inlineNameError = name.trim().length > 0 ? validateAgentName(name, "Agent name") : null;
  const createDisabled =
    atLimit ||
    Boolean(inlineNameError) ||
    !selectedMachineId ||
    (prefilledMachineMode === "required" && selectedMachineId !== prefilledMachineId) ||
    machines.length === 0 ||
    !runtime ||
    !supportedSet.has(runtime) ||
    selectedMachine?.status !== "online" ||
    (customModelMode && !model.trim()) ||
    providerApiUrlInvalid ||
    providerApiKeyInvalid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const nameError = validateAgentName(name, "Agent name");
    if (nameError) {
      setError(nameError);
      return;
    }
    if (!selectedMachineId) {
      setError("Please select a computer");
      return;
    }
    if (prefilledMachineMode === "required" && selectedMachineId !== prefilledMachineId) {
      setError("This action card requires the specified computer");
      return;
    }
    // Funnel hook: fired AFTER client validation passes so we don't count
    // local form errors as `execute_attempt`. Best-effort; no-op outside
    // the action-card flow.
    onSubmitStart?.();
    // Capture "was this user's first agent?" BEFORE the create call mutates
    // agentStore — `agents` from the store will include the new agent after
    // success, so we have to snapshot the pre-create count here. Onboarding
    // flow is by construction first-agent territory too.
    const wasFirstAgent = onboarding || agents.length === 0;
    try {
      // Build envVars object from entries (skip empty keys)
      const envVars: Record<string, string> = {};
      for (const entry of envVarEntries) {
        const k = entry.key.trim();
        if (k) envVars[k] = entry.value;
      }
      const randomAvatarKey = AVATAR_KEYS[Math.floor(Math.random() * AVATAR_KEYS.length)];
      const runtimeConfig = buildRuntimeConfig({
        runtime,
        model,
        customModelMode,
        customModelName: customModelMode ? model : undefined,
        providerMode,
        providerApiUrl,
        providerApiKey,
        fastMode,
        reasoningEffort: REASONING_EFFORT_RUNTIMES.has(runtime) ? reasoningEffort : null,
        envVars: Object.keys(envVars).length > 0 ? envVars : null,
      });
      const agent = await createAgent(name.trim(), {
        description: description.trim() || undefined,
        model,
        runtime,
        runtimeConfig,
        reasoningEffort: REASONING_EFFORT_RUNTIMES.has(runtime) ? reasoningEffort ?? undefined : undefined,
        machineId: selectedMachineId,
        envVars: Object.keys(envVars).length > 0 ? envVars : undefined,
        avatarUrl: `pixel:${randomAvatarKey}`,
        onboarding,
      });
      // Notify the action-card flow (if launched from one) so the card can
      // call /api/actions/:msgId/mark-executed with the new agent's ref.
      onCreated?.({ id: agent.id, name: agent.name });
      // Post-create landing (cindyz 2026-05-26 dm msg=f342577e refined spec,
      // superseding the earlier "always jump to new agent DM" behavior):
      //   - via action card → stay on the action card (the surface is
      //     already a chat surface; jumping away breaks the guided flow)
      //   - via other surfaces (Sidebar +Add / MachineDetail / etc.) → stay
      //     IF the user already has other agents
      //   - first agent (server has no agents yet, OR onboarding flow) →
      //     route to #all so the user lands somewhere productive instead
      //     of looking at an empty Sidebar+Add surface
      //   - fallback (no #all channel resolvable) → stay
      if (!fromActionCard && wasFirstAgent) {
        const allChannel = channels.find((c) => c.name === "all");
        if (allChannel) {
          try {
            nav.toChannel(allChannel.id);
          } catch {
            // ignore — surface remains on whatever the user was looking at
          }
        }
      }
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || "Failed to create agent");
      // Funnel hook: dialog-driven `execute_fail`. The dialog stays open
      // so the user can retry; we record the funnel event regardless.
      onSubmitError?.(err);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-md card-brutal p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase">{onboarding ? "Create Onboarding Agent" : "Create Agent"}</h2>
          <button onClick={onClose} className="btn-brutal-sm bg-white p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {atLimit && (
            <div className="border-2 border-black bg-brutal-orange p-3 text-sm text-black font-bold">
              Agent limit reached ({agents.length}/{maxAgents} on {PLAN_CONFIG[plan].displayName} plan).{" "}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  nav.toSettings("server");
                }}
                className="font-bold text-black underline"
              >
                Upgrade for more
              </button>
            </div>
          )}
          {error && !atLimit && (
            <Banner intent="warning" className="font-bold">
              {error}
              {isQuotaError(error) && (
                <>
                  {" "}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      nav.toSettings("server");
                    }}
                    className="font-bold text-black underline"
                  >
                    View Plans
                  </button>
                </>
              )}
            </Banner>
          )}
          {/* Computer selector — dropdown */}
          <FormField label="Computer" required>
            {machines.length === 0 ? (
              <div className="border-2 border-black/30 bg-gray-100 px-3 py-2.5 text-sm text-black/50">
                No computers. Connect a computer first.
              </div>
            ) : (
              <Select
                value={selectedMachineId}
                onChange={(val) => {
                  setSelectedMachineId(val);
                  const m = machines.find((m) => m.id === val);
                  const rts = m?.runtimes ?? [];
                  const newRuntime = rts.find((id) => supportedSet.has(id)) || rts[0] || "";
                  setRuntime(newRuntime);
                  setModel(getDefaultModel(newRuntime));
                  setCustomModelMode(false);
                  setProviderMode("default");
                  setProviderApiUrl("");
                  setProviderApiKey("");
                  setFastMode(false);
                  setReasoningEffort(null);
                }}
                options={machines.map((machine) => {
                  const isOffline = machine.status !== "online";
                  const blockedByRequired = prefilledMachineMode === "required" && machine.id !== prefilledMachineId;
                  return {
                    value: machine.id,
                    label: machine.name + (machine.hostname ? ` (${machine.hostname})` : "") + (isOffline ? " (offline)" : ""),
                    disabled: isOffline || blockedByRequired,
                  };
                })}
                className="w-full"
              />
            )}
            {prefilledMachineMode === "required" ? (
              <p className="mt-1 text-xs text-black/50">
                Required by the action card{prefilledMachine?.name ? `: ${prefilledMachine.name}` : ""}.
              </p>
            ) : prefilledMachineId ? (
              <p className="mt-1 text-xs text-black/50">
                {prefilledMachineOnline
                  ? "Suggested by the action card."
                  : "The suggested computer is unavailable. Pick a computer to continue."}
              </p>
            ) : null}
          </FormField>

          <FormField
            label="Name"
            required
            hint={
              nameLocked
                ? onboarding
                  ? "Fixed for onboarding flow."
                  : "Prefilled by the action card."
                : undefined
            }
            error={inlineNameError}
            htmlFor="create-agent-name"
          >
            <input
              id="create-agent-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              className={`input-brutal w-full ${inlineNameError ? "!border-brutal-red ring-2 ring-brutal-red/60 bg-brutal-red/5" : ""} ${nameLocked ? lockedFieldClass : ""}`}
              placeholder="e.g. Alice"
              required
              readOnly={nameLocked}
              aria-invalid={inlineNameError ? "true" : undefined}
            />
          </FormField>
          <FormField label="Description" optional>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`input-brutal w-full ${descriptionLocked ? lockedFieldClass : ""}`}
              placeholder="Leave blank for a general-purpose agent, or describe a role…"
              rows={3}
              maxLength={MAX_AGENT_DESCRIPTION_LENGTH}
              readOnly={descriptionLocked}
            />
            {descriptionLocked ? (
              <div className="mt-1 text-xs text-black/60">
                {onboarding ? "Fixed for onboarding flow." : "Prefilled by the action card."}
              </div>
            ) : (
              <div className="mt-1 text-right text-xs font-mono text-black/50">
                {description.length}/{MAX_AGENT_DESCRIPTION_LENGTH}
              </div>
            )}
          </FormField>
          <RuntimeConfigFields
            runtime={runtime}
            onRuntimeChange={(val) => {
              setRuntime(val);
              setModel(getDefaultModel(val));
              setCustomModelMode(false);
              setProviderMode("default");
              setProviderApiUrl("");
              setProviderApiKey("");
              setFastMode(false);
            }}
            runtimeOptions={runtimeOptions}
            model={model}
            onModelChange={setModel}
            customModelMode={customModelMode}
            onCustomModelModeChange={setCustomModelMode}
            modelOptions={modelOptions}
            runtimeModels={runtimeModels}
            rescanDisabled={!selectedMachineId}
            providerMode={providerMode}
            onProviderModeChange={setProviderMode}
            providerApiUrl={providerApiUrl}
            onProviderApiUrlChange={setProviderApiUrl}
            providerApiKey={providerApiKey}
            onProviderApiKeyChange={setProviderApiKey}
            fastMode={fastMode}
            onFastModeChange={setFastMode}
            reasoningEffort={reasoningEffort}
            onReasoningEffortChange={setReasoningEffort}
            envVarEntries={envVarEntries}
            onEnvVarEntriesChange={setEnvVarEntries}
            envVarsMode="advanced"
            advancedOpen={advancedOpen}
            onAdvancedOpenChange={setAdvancedOpen}
            envVarsHint="These will be injected into the runtime command environment."
            selectedModelSuggestionOnly={selectedModelSuggestionOnly}
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-brutal bg-white px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createDisabled}
              className="btn-brutal bg-brutal-pink px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Agent
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
