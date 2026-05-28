import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  MessageSquare,
  Play,
  Square,
  Trash2,
  Bug,
  Pencil,
  Check,
  X,
  FolderOpen,
  Activity,
  BellRing,
  Link2,
  RotateCcw,
  Menu,
  Bot,
  Plus,
  Zap,
  Upload,
  Clipboard,
  ShieldCheck,
} from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { SIDEBAR_TAB_QUERY_PARAM, useAppNavigate, useMobileBack } from "../../hooks/useAppNavigate";
import {
  getRuntimeDisplayName,
  getDefaultModel,
  getModelLabel,
  RUNTIMES,
  REASONING_EFFORT_RUNTIMES,
  parseSlockPermalink,
  type ReasoningEffort,
  type ReminderSummary,
  type RuntimeConfig,
} from "@slock-ai/shared";
import { useRuntimeModels } from "../../hooks/useRuntimeModels";
import { useTimeFormatter } from "../../hooks/useTimeFormatter";
import { getSocket } from "../../api/socket";
import {
  useAgentStore,
  useAgentDisplayState,
  type Agent,
  type AgentActivityState,
  type ActivityLogEntry,
} from "../../store/agentStore";
import { useChannelStore } from "../../store/channelStore";
import { useMachineStore } from "../../store/machineStore";
import { useServerStore } from "../../store/serverStore";
import { useAuthStore } from "../../store/authStore";
import { useProfileStore } from "../../store/profileStore";
import { useThreadStore } from "../../store/threadStore";
import { useServerPermissions } from "../../hooks/useServerPermissions";
import { canViewAgentPrivateSurfaces } from "../../utils/agentVisibility";
import {
  buildRuntimeConfig,
  hydrateRuntimeConfigForm,
  runtimeConfigApiKey,
  runtimeConfigApiUrl,
  runtimeConfigFastMode,
  runtimeConfigProviderMode,
  supportsRuntimeApiUrl,
  supportsRuntimeFastMode,
  type RuntimeProviderMode,
} from "../../utils/runtimeConfigForm";

import { getActivityText } from "../../utils/activity";
import StatusDot from "../ui/StatusDot";
import { buildAgentDiagnosticInfo } from "../../utils/agentDiagnosticInfo";
import { copyTextToClipboard } from "../../utils/selectMarkdown";
import PixelAvatar, { AVATAR_KEYS, parsePixelAvatar, DEFAULT_AVATAR_KEY, isCustomAvatar } from "./PixelAvatar";
import PanelHeader from "../ui/PanelHeader";
import SectionEyebrow from "../ui/SectionEyebrow";
import SectionHeader from "../ui/SectionHeader";
import KeyValueRow from "../ui/KeyValueRow";
import AvatarSlot from "../ui/AvatarSlot";
import SurfaceListItem from "../ui/SurfaceListItem";
import api from "../../api/client";
import AgentWorkspace from "./AgentWorkspace";
import AgentActivityLog from "./AgentActivityLog";
import AgentSkills from "./AgentSkills";
import AgentScopesPanel from "./AgentScopesPanel";
import AgentRemindersSection from "./AgentRemindersSection";
import ReportIssueDialog from "./ReportIssueDialog";
import AvatarListRow from "../ui/AvatarListRow";
import { AgentDMConversationList, type AgentDMConversation } from "./AgentDMConversationList";

import ResetAgentDialog from "./ResetAgentDialog";
import ConfirmDialog from "../ConfirmDialog";
import Banner from "../ui/Banner";
import EmptyState from "../ui/EmptyState";
import ReorderablePanelTabs, { useOrderedPanelTabs, type PanelTabItem } from "../ui/ReorderablePanelTabs";
import Modal from "../Modal";
import RuntimeConfigFields from "./RuntimeConfigFields";

const MAX_AGENT_DESCRIPTION_LENGTH = 3000;
const FEEDBACK_EXPORT_ENABLED = Boolean(import.meta.env.VITE_FEEDBACK_EXPORT_URL?.replace(/\/+$/, ""));
const AGENT_TABS = ["profile", "permissions", "dms", "reminders", "workspace", "integrations", "activity"] as const;
type AgentTab = typeof AGENT_TABS[number];
const AGENT_PANEL_TABS: PanelTabItem<AgentTab>[] = [
  { id: "profile", icon: Bot, label: "Profile" },
  { id: "permissions", icon: ShieldCheck, label: "Permissions" },
  { id: "dms", icon: MessageSquare, label: "Agent DMs" },
  { id: "reminders", icon: BellRing, label: "Reminders" },
  { id: "workspace", icon: FolderOpen, label: "Workspace" },
  { id: "integrations", icon: Link2, label: "Apps" },
  { id: "activity", icon: Activity, label: "Activity" },
];
const EMPTY_ACTIVITY_LOG: ActivityLogEntry[] = [];
// Default-deny: Profile is the only public tab. Any new tab added to
// AGENT_TABS is private by default until explicitly added to PUBLIC_AGENT_TABS.
// Spec: #proj-server:175df9ee — agent-internal info must not silently widen
// visibility for non-creator members.
const PUBLIC_AGENT_TABS = new Set<AgentTab>(["profile"]);
// Permissions tab visibility: creator OR admin (same gate as the rest of
// the private surfaces — workspace, activity, DMs, reminders). Spec:
// #proj-permission:1414ca65 — permission configuration belongs in its own
// tab, not embedded in Profile (stdrc 2026-05-12 msg=3bf450eb); creator
// can also see/edit since they own the agent (stdrc 2026-05-13 msg=afe74ee3).

interface AgentIntegrationItem {
  id: string;
  type: "pending" | "active";
  serverId: string;
  agentId: string;
  agentName: string;
  agentDisplayName: string | null;
  clientId: string;
  clientKey: string;
  clientName: string;
  clientDescription: string | null;
  clientHomepageUrl: string | null;
  scopes: string[];
  remember: boolean;
  createdAt: string;
  resolvedAt: string | null;
  resolvedByUserId: string | null;
  revokedAt: string | null;
}

function AgentDMsTab({ agentId }: { agentId: string }) {
  const [items, setItems] = useState<AgentDMConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/agents/${agentId}/agent-dms`);
        if (!cancelled) setItems(data);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.error || "Failed to load agent DMs");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [agentId]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-white">
        <div className="text-black/40 font-mono text-sm">Loading agent DMs…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center bg-white p-4">
        <Banner intent="warning" className="font-bold">{error}</Banner>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        className="flex flex-1 flex-col items-center justify-center bg-white"
        icon={<MessageSquare size={36} />}
        title="No agent-to-agent DMs yet"
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="border-b-2 border-black bg-white px-5 py-3">
        <SectionEyebrow as="div">Agent private chats</SectionEyebrow>
        <div className="mt-1 text-sm text-black/60">
          Visible here as an activity/audit trail. These rows are intentionally not direct conversation links.
        </div>
      </div>

      <AgentDMConversationList items={items} />
    </div>
  );
}

function AgentIntegrationsTab({ agentId, canManageServer }: { agentId: string; canManageServer: boolean }) {
  const { formatShortDateTime } = useTimeFormatter();
  const [items, setItems] = useState<AgentIntegrationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/integrations/agents/${agentId}`);
      setItems(data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load integrations");
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRevoke = async (grantId: string) => {
    setError("");
    try {
      await api.post(`/integrations/grants/${grantId}/revoke`);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to revoke integration");
    }
  };

  const active = items.filter((item) => item.type === "active");

  return (
    <div className="flex-1 overflow-y-auto bg-white px-5 py-4 space-y-4">
      {error && (
        <Banner intent="warning" density="sm" className="font-bold">{error}</Banner>
      )}

      <div className="space-y-3">
        <div>
          <SectionHeader
            label="Connected Apps"
            action={loading ? <span className="text-xs font-bold text-black/50">Loading…</span> : null}
          />
          <div className="mt-1 text-xs text-black/60">Apps this agent has logged into with Slock Agent Login</div>
        </div>
        {active.length === 0 ? (
          <div className="text-sm text-black/50">No connected apps yet.</div>
        ) : (
          <div className="space-y-3">
            {active.map((item) => (
              <SurfaceListItem key={item.id} className="space-y-2" interactive={false}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-black">{item.clientName}</div>
                    <div className="text-xs text-black/60">{formatShortDateTime(item.createdAt)}</div>
                  </div>
                  <span className="inline-flex border border-black bg-brutal-lime px-1.5 py-0.5 text-[10px] font-bold uppercase">
                    Active
                  </span>
                </div>
                {item.clientDescription && <div className="text-sm text-black/70">{item.clientDescription}</div>}
                <div className="flex flex-wrap gap-1">
                  {item.scopes.map((scope) => (
                    <span key={scope} className="inline-flex border border-black bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase">
                      {scope}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {canManageServer && (
                    <button onClick={() => handleRevoke(item.id)} className="btn-brutal bg-white px-3 py-1.5 text-xs">
                      Revoke
                    </button>
                  )}
                  {item.clientHomepageUrl && (
                    <a href={item.clientHomepageUrl} target="_blank" rel="noreferrer" className="text-xs font-bold underline text-black/70 self-center">
                      View service
                    </a>
                  )}
                </div>
              </SurfaceListItem>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Editable environment variables section
function EnvVarsSection({ agent, canManageAgent }: { agent: Agent; canManageAgent: boolean }) {
  const updateAgent = useAgentStore((s) => s.updateAgent);
  const [editing, setEditing] = useState(false);
  const [entries, setEntries] = useState<{ key: string; value: string }[]>([]);

  const envVars = agent.envVars;
  const hasVars = envVars && Object.keys(envVars).length > 0;

  const startEditing = () => {
    setEntries(
      envVars
        ? Object.entries(envVars).map(([key, value]) => ({ key, value }))
        : []
    );
    setEditing(true);
  };

  const handleSave = async () => {
    const newVars: Record<string, string> = {};
    for (const entry of entries) {
      const k = entry.key.trim();
      if (k) newVars[k] = entry.value;
    }
    await updateAgent(agent.id, {
      envVars: Object.keys(newVars).length > 0 ? newVars : null,
    });
    setEditing(false);
  };

  if (!hasVars && !canManageAgent) return null;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-1">
        <SectionEyebrow as="div">
          Environment Variables
        </SectionEyebrow>
        {canManageAgent && !editing && (
          <button
            type="button"
            onClick={startEditing}
            className="text-black/40 hover:text-black transition-colors"
            title="Edit environment variables"
          >
            <Pencil size={12} />
          </button>
        )}
      </div>
      {editing ? (
        <div className="space-y-2">
          {entries.map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={entry.key}
                onChange={(e) => {
                  const updated = [...entries];
                  updated[i] = { ...updated[i], key: e.target.value };
                  setEntries(updated);
                }}
                className="border-2 border-black px-2 py-1 text-xs font-mono shadow-brutal-sm focus:outline-none w-1/3"
                placeholder="KEY"
              />
              <span className="text-black/40">=</span>
              <input
                type="text"
                value={entry.value}
                onChange={(e) => {
                  const updated = [...entries];
                  updated[i] = { ...updated[i], value: e.target.value };
                  setEntries(updated);
                }}
                className="border-2 border-black px-2 py-1 text-xs font-mono shadow-brutal-sm focus:outline-none flex-1"
                placeholder="value"
              />
              <button
                type="button"
                onClick={() => setEntries(entries.filter((_, j) => j !== i))}
                className="btn-brutal-sm bg-white p-1"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEntries([...entries, { key: "", value: "" }])}
              className="flex items-center gap-1 text-xs font-bold text-black/60 hover:text-black"
            >
              <Plus size={12} />
              Add Variable
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSave}
              className="btn-brutal-sm bg-brutal-pink px-2 py-1 text-xs"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="btn-brutal-sm bg-white px-2 py-1 text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : hasVars ? (
        <div className="flex flex-wrap gap-2">
          {Object.entries(envVars!).map(([key, value]) => (
            <span
              key={key}
              className="inline-block border-2 border-black bg-white px-2 py-0.5 text-xs font-mono text-black"
              title={`${key}=${value}`}
            >
              {key}=<span className="text-black/40">{"•".repeat(Math.min(value.length, 8))}</span>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs italic text-black/40">No environment variables configured</p>
      )}
    </div>
  );
}

// Isolated info bar — role/model/reasoning editing state lives here,
// so keystroke re-renders don't cascade to ChatPanel / tabs below.
/** Profile tab: description, machine, model config, env vars, created date */
function AgentProfileInfo({ agent, canManageAgent, showOperationalInfo = true }: { agent: Agent; canManageAgent: boolean; showOperationalInfo?: boolean }) {
  const updateAgent = useAgentStore((s) => s.updateAgent);
  const displayState = useAgentDisplayState(agent.id, agent);
  const machines = useMachineStore((s) => s.machines);
  const nav = useAppNavigate();

  const agentMachine = agent.machineId ? machines.find((m) => m.id === agent.machineId) : null;
  const machineStatus = agentMachine ? agentMachine.status : agent.machineId ? "offline" : null;
  const displayNameRef = useRef<HTMLInputElement>(null);
  const roleRef = useRef<HTMLTextAreaElement>(null);
  const configRef = useRef<HTMLDivElement>(null);
  const currentRuntimeConfig = useMemo(() => hydrateRuntimeConfigForm(agent), [
    agent.envVars,
    agent.model,
    agent.reasoningEffort,
    agent.runtime,
    agent.runtimeConfig,
  ]);
  const [editingRuntimeConfig, setEditingRuntimeConfig] = useState(false);
  const [draftRuntime, setDraftRuntime] = useState(agent.runtime || "claude");
  // draftModel is a draft buffer used inside the runtime-config edit form
  // (rendered only when editingRuntimeConfig=true). The useEffect below
  // syncs it from agent.model whenever !editingRuntimeConfig, and
  // startRuntimeConfigEditing seeds it before flipping the flag. A bare
  // useState(agent.model) initializer would mirror the prop on first
  // mount only — react-doctor's no-derived-useState rule flags it for that
  // reason. The other drafts in this block avoid the lint by reading
  // through currentRuntimeConfig or using `||`/`??` fallbacks.
  const [draftModel, setDraftModel] = useState("");
  const [draftCustomModelMode, setDraftCustomModelMode] = useState(currentRuntimeConfig.model.kind === "custom");
  const [draftProviderMode, setDraftProviderMode] = useState<RuntimeProviderMode>(runtimeConfigProviderMode(currentRuntimeConfig));
  const [draftProviderApiUrl, setDraftProviderApiUrl] = useState(runtimeConfigApiUrl(currentRuntimeConfig));
  const [draftProviderApiKey, setDraftProviderApiKey] = useState(runtimeConfigApiKey(currentRuntimeConfig));
  const [draftFastMode, setDraftFastMode] = useState(runtimeConfigFastMode(currentRuntimeConfig));
  const [draftEnvVarEntries, setDraftEnvVarEntries] = useState<{ key: string; value: string }[]>([]);
  const [runtimeConfigAdvancedOpen, setRuntimeConfigAdvancedOpen] = useState(false);
  const [draftReasoningEffort, setDraftReasoningEffort] = useState<ReasoningEffort | null>(agent.reasoningEffort ?? null);
  const [savingRuntimeConfig, setSavingRuntimeConfig] = useState(false);
  const openProfile = useProfileStore((s) => s.openProfile);
  const [pendingConfirm, setPendingConfirm] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    loadingLabel: string;
    confirmColor: string;
    onConfirm: () => Promise<void>;
  } | null>(null);
  const isActive = displayState.isOnline || agent.status === "active";
  const activeRuntime = editingRuntimeConfig ? draftRuntime : (agent.runtime || "claude");
  const runtimeModels = useRuntimeModels(agent.machineId, activeRuntime);
  const availableRuntimes = agentMachine?.runtimes || [];
  const runtimeOptions = RUNTIMES.map((r) => {
    const available = availableRuntimes.includes(r.id);
    const selectable = available && r.supported;
    return {
      value: r.id,
      label: r.displayName + (!r.supported ? " (coming soon)" : !available ? " (not installed)" : ""),
      disabled: !selectable,
    };
  });

  const [editingDisplayName, setEditingDisplayName] = useState(false);
  const [displayNameValue, setDisplayNameValue] = useState(agent.displayName || "");
  const [displayNameError, setDisplayNameError] = useState("");
  const [savingDisplayName, setSavingDisplayName] = useState(false);
  const [editingRole, setEditingRole] = useState(false);
  const [roleValue, setRoleValue] = useState(agent.description || "");
  const [roleError, setRoleError] = useState("");
  const [savingRole, setSavingRole] = useState(false);

  const autoResizeTextarea = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    const minH = parseFloat(getComputedStyle(el).minHeight) || 0;
    el.style.height = `${Math.max(Math.min(el.scrollHeight, 160), minH)}px`;
  }, []);

  useEffect(() => {
    if (editingRole) autoResizeTextarea(roleRef.current);
  }, [editingRole, roleValue, autoResizeTextarea]);

  useEffect(() => {
    if (editingRuntimeConfig) return;
    setDraftRuntime(currentRuntimeConfig.runtime);
    setDraftModel(agent.model);
    setDraftCustomModelMode(currentRuntimeConfig.model.kind === "custom");
    setDraftProviderMode(runtimeConfigProviderMode(currentRuntimeConfig));
    setDraftProviderApiUrl(runtimeConfigApiUrl(currentRuntimeConfig));
    setDraftProviderApiKey(runtimeConfigApiKey(currentRuntimeConfig));
    setDraftFastMode(runtimeConfigFastMode(currentRuntimeConfig));
    setDraftReasoningEffort(currentRuntimeConfig.reasoningEffort ?? null);
  }, [agent.model, currentRuntimeConfig, editingRuntimeConfig]);

  const handleSaveDisplayName = async () => {
    const nextDisplayName = displayNameValue.trim();
    setDisplayNameError("");
    setSavingDisplayName(true);
    try {
      await updateAgent(agent.id, {
        displayName: nextDisplayName || null,
      });
      setEditingDisplayName(false);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setDisplayNameError(axiosErr.response?.data?.error || "Failed to update display name");
    } finally {
      setSavingDisplayName(false);
    }
  };

  const handleSaveRole = async () => {
    const nextDescription = roleValue.trim();
    if (nextDescription.length > MAX_AGENT_DESCRIPTION_LENGTH) {
      setRoleError(`Description must be at most ${MAX_AGENT_DESCRIPTION_LENGTH} characters`);
      return;
    }
    setRoleError("");
    setSavingRole(true);
    try {
      await updateAgent(agent.id, {
        description: nextDescription || null,
      });
      setEditingRole(false);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setRoleError(axiosErr.response?.data?.error || "Failed to update description");
    } finally {
      setSavingRole(false);
    }
  };

  const createdDate = new Date(agent.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const closeRuntimeConfigEditor = () => {
    setEditingRuntimeConfig(false);
    setDraftRuntime(currentRuntimeConfig.runtime);
    setDraftModel(agent.model);
    setDraftCustomModelMode(currentRuntimeConfig.model.kind === "custom");
    setDraftProviderMode(runtimeConfigProviderMode(currentRuntimeConfig));
    setDraftProviderApiUrl(runtimeConfigApiUrl(currentRuntimeConfig));
    setDraftProviderApiKey(runtimeConfigApiKey(currentRuntimeConfig));
    setDraftFastMode(runtimeConfigFastMode(currentRuntimeConfig));
    setDraftEnvVarEntries(
      currentRuntimeConfig.envVars
        ? Object.entries(currentRuntimeConfig.envVars).map(([key, value]) => ({ key, value }))
        : [],
    );
    setRuntimeConfigAdvancedOpen(false);
    setDraftReasoningEffort(currentRuntimeConfig.reasoningEffort ?? null);
  };

  const requestConfirm = (config: {
    title: string;
    message: string;
    confirmLabel: string;
    loadingLabel: string;
    confirmColor: string;
    onConfirm: () => Promise<void>;
  }) => {
    closeRuntimeConfigEditor();
    setPendingConfirm(config);
  };

  const draftSupportsReasoning = REASONING_EFFORT_RUNTIMES.has(draftRuntime);
  const reasoningDisplayValue = draftReasoningEffort || "default";
  const draftSupportsApiUrl = supportsRuntimeApiUrl(draftRuntime);
  const draftSupportsFastMode = supportsRuntimeFastMode(draftRuntime);
  const currentProviderApiUrl = runtimeConfigApiUrl(currentRuntimeConfig);
  const currentProviderApiKey = runtimeConfigApiKey(currentRuntimeConfig);
  const currentCustomModelMode = currentRuntimeConfig.model.kind === "custom";
  const currentProviderMode = runtimeConfigProviderMode(currentRuntimeConfig);
  const currentFastMode = runtimeConfigFastMode(currentRuntimeConfig);
  const draftProviderApiUrlRequired = draftSupportsApiUrl && draftProviderMode === "custom";
  const draftProviderApiUrlInvalid = draftProviderApiUrlRequired
    ? !/^https?:\/\//i.test(draftProviderApiUrl.trim())
    : draftProviderApiUrl.trim().length > 0 && !/^https?:\/\//i.test(draftProviderApiUrl.trim());
  const draftProviderApiKeyInvalid = draftProviderApiUrlRequired && !draftProviderApiKey.trim();
  const draftCustomModelInvalid = draftCustomModelMode && !draftModel.trim();
  const draftEnvVars = useMemo(() => {
    const next: Record<string, string> = {};
    for (const entry of draftEnvVarEntries) {
      const key = entry.key.trim();
      if (key) next[key] = entry.value;
    }
    return Object.keys(next).length > 0 ? next : null;
  }, [draftEnvVarEntries]);
  const currentEnvVarsJson = JSON.stringify(currentRuntimeConfig.envVars ?? null);
  const draftEnvVarsJson = JSON.stringify(draftEnvVars);
  const runtimeConfigChanged =
    draftRuntime !== currentRuntimeConfig.runtime
    || draftModel !== agent.model
    || draftCustomModelMode !== currentCustomModelMode
    || draftProviderMode !== currentProviderMode
    || draftProviderApiUrl.trim() !== currentProviderApiUrl
    || draftProviderApiKey.trim() !== currentProviderApiKey
    || draftFastMode !== currentFastMode
    || (draftReasoningEffort ?? null) !== (agent.reasoningEffort ?? null)
    || draftEnvVarsJson !== currentEnvVarsJson;
  const modelOptions = (() => {
    const options = runtimeModels.models.map((m) => ({ value: m.id, label: m.label }));
    if (!draftCustomModelMode && draftModel && !options.some((option) => option.value === draftModel)) {
      options.push({
        value: draftModel,
        label: `${getModelLabel(draftRuntime, draftModel)} (not in this computer's config)`,
      });
    }
    return options;
  })();
  const draftModelInfo = runtimeModels.models.find((m) => m.id === draftModel);
  const draftModelSuggestionOnly = draftModelInfo?.verified === "suggestion_only";

  const startRuntimeConfigEditing = () => {
    setDraftRuntime(currentRuntimeConfig.runtime);
    setDraftModel(agent.model);
    setDraftCustomModelMode(currentRuntimeConfig.model.kind === "custom");
    setDraftProviderMode(runtimeConfigProviderMode(currentRuntimeConfig));
    setDraftProviderApiUrl(runtimeConfigApiUrl(currentRuntimeConfig));
    setDraftProviderApiKey(runtimeConfigApiKey(currentRuntimeConfig));
    setDraftFastMode(runtimeConfigFastMode(currentRuntimeConfig));
    setDraftEnvVarEntries(
      currentRuntimeConfig.envVars
        ? Object.entries(currentRuntimeConfig.envVars).map(([key, value]) => ({ key, value }))
        : [],
    );
    setRuntimeConfigAdvancedOpen(false);
    setDraftReasoningEffort(currentRuntimeConfig.reasoningEffort ?? null);
    setEditingRuntimeConfig(true);
  };

  const saveRuntimeConfiguration = async (
    nextConfig: {
      runtime: string;
      model: string;
      runtimeConfig: RuntimeConfig;
      reasoningEffort: ReasoningEffort | null;
    },
    restartMode?: "restart" | "session",
  ) => {
    await updateAgent(
      agent.id,
      {
        runtime: nextConfig.runtime,
        model: nextConfig.model,
        runtimeConfig: nextConfig.runtimeConfig,
        reasoningEffort: nextConfig.reasoningEffort,
      },
      restartMode ? { restartMode } : undefined,
    );
  };

  const handleSaveRuntimeConfiguration = async () => {
    if (!runtimeConfigChanged) {
      closeRuntimeConfigEditor();
      return;
    }

    if (draftProviderApiUrlInvalid || draftProviderApiKeyInvalid || draftCustomModelInvalid) return;

    const currentRuntime = currentRuntimeConfig.runtime;
    const runtimeChanged = draftRuntime !== currentRuntime;
    const modelChanged = draftModel !== agent.model;
    const customModelModeChanged = draftCustomModelMode !== currentCustomModelMode;
    const providerChanged = draftProviderMode !== currentProviderMode
      || draftProviderApiUrl.trim() !== currentProviderApiUrl
      || draftProviderApiKey.trim() !== currentProviderApiKey;
    const fastModeChanged = draftFastMode !== currentFastMode;
    const reasoningChanged = (draftReasoningEffort ?? null) !== (agent.reasoningEffort ?? null);
    const envVarsChanged = draftEnvVarsJson !== currentEnvVarsJson;
    const nextReasoningLabel = draftSupportsReasoning ? reasoningDisplayValue : "not available";
    const nextModeLabel = draftSupportsFastMode && draftFastMode ? " in fast mode" : "";
    const nextRuntimeConfig = buildRuntimeConfig({
      runtime: draftRuntime,
      model: draftModel,
      customModelMode: draftCustomModelMode,
      customModelName: draftCustomModelMode ? draftModel : undefined,
      providerMode: draftProviderMode,
      providerApiUrl: draftProviderApiUrl,
      providerApiKey: draftProviderApiKey,
      fastMode: draftSupportsFastMode ? draftFastMode : false,
      reasoningEffort: draftSupportsReasoning ? draftReasoningEffort : null,
      envVars: draftEnvVars,
    });
    const nextConfig = {
      runtime: draftRuntime,
      model: draftModel,
      runtimeConfig: nextRuntimeConfig,
      reasoningEffort: draftSupportsReasoning ? draftReasoningEffort : null,
    };

    if (runtimeChanged) {
      const fromRuntimeLabel = getRuntimeDisplayName(currentRuntime);
      const nextRuntimeLabel = getRuntimeDisplayName(draftRuntime);
      const nextModelLabel = getModelLabel(draftRuntime, draftModel);
      requestConfirm({
        title: "Switch Runtime Config",
        message: isActive
          ? `Changing runtime configuration from ${fromRuntimeLabel} to ${nextRuntimeLabel} will reset the current runtime session. The next launch will use model ${nextModelLabel}${draftSupportsReasoning ? ` with ${nextReasoningLabel} reasoning` : ""}${nextModeLabel}; MEMORY.md and workspace files are preserved.`
          : `Changing runtime configuration from ${fromRuntimeLabel} to ${nextRuntimeLabel} will apply on the next start with a fresh runtime session. The agent will launch with model ${nextModelLabel}${draftSupportsReasoning ? ` and ${nextReasoningLabel} reasoning` : ""}${nextModeLabel}; MEMORY.md and workspace files are preserved.`,
        confirmLabel: isActive ? "Reset Runtime Session" : "Save Runtime Change",
        loadingLabel: isActive ? "Resetting…" : "Applying…",
        confirmColor: "bg-brutal-orange",
        onConfirm: async () => {
          await saveRuntimeConfiguration(nextConfig, "session");
        },
      });
      return;
    }

    if (!isActive) {
      setSavingRuntimeConfig(true);
      try {
        await saveRuntimeConfiguration(nextConfig);
        closeRuntimeConfigEditor();
      } finally {
        setSavingRuntimeConfig(false);
      }
      return;
    }

    const changeLabels: string[] = [];
    if (modelChanged || customModelModeChanged) changeLabels.push("model");
    if (providerChanged) changeLabels.push("provider");
    if (fastModeChanged) changeLabels.push("mode");
    if (reasoningChanged) changeLabels.push("reasoning");
    if (envVarsChanged) changeLabels.push("environment variables");
    const changeSummary = changeLabels.join(" and ");
    requestConfirm({
      title: "Restart To Apply Runtime Config",
      message: `Changing ${changeSummary} restarts the agent so the new Runtime Config takes effect. The next launch will use ${getModelLabel(draftRuntime, draftModel)}${draftSupportsReasoning ? ` with ${nextReasoningLabel} reasoning` : ""}${nextModeLabel}; the current workspace files are preserved.`,
      confirmLabel: "Restart Agent",
      loadingLabel: "Restarting…",
      confirmColor: "bg-brutal-cyan",
      onConfirm: async () => {
        await saveRuntimeConfiguration(nextConfig, "restart");
      },
    });
  };

  return (
    <>
      {/* Display Name */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <SectionEyebrow as="div">
            Display Name
          </SectionEyebrow>
          {canManageAgent && !editingDisplayName && (
            <button
              type="button"
              onClick={() => {
                setDisplayNameValue(agent.displayName || "");
                setDisplayNameError("");
                setEditingDisplayName(true);
              }}
              className="text-black/40 hover:text-black transition-colors"
              title="Edit display name"
            >
              <Pencil size={12} />
            </button>
          )}
        </div>
        {canManageAgent && editingDisplayName ? (
          <div className="space-y-[5px]">
            <input
              ref={displayNameRef}
              value={displayNameValue}
              onChange={(e) => {
                setDisplayNameValue(e.target.value.replace(/[\r\n]+/g, " "));
                if (displayNameError) setDisplayNameError("");
              }}
              placeholder="Display name"
              className="h-8 w-full border-2 border-black px-2 py-1 text-sm shadow-brutal-sm focus:outline-none focus:shadow-brutal-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleSaveDisplayName();
                }
                if (e.key === "Escape") {
                  setDisplayNameError("");
                  setEditingDisplayName(false);
                }
              }}
            />
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => void handleSaveDisplayName()}
                disabled={savingDisplayName}
                className="btn-brutal-sm bg-brutal-pink px-2 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setDisplayNameError("");
                  setEditingDisplayName(false);
                }}
                disabled={savingDisplayName}
                className="btn-brutal-sm bg-white px-2 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
            {displayNameError && (
              <div className="text-xs font-bold text-brutal-orange">
                {displayNameError}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-black">
            {agent.displayName || agent.name}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="px-5 py-3">
        <div className="flex items-center gap-2 mb-1">
          <SectionEyebrow as="div">
            Description
          </SectionEyebrow>
          {canManageAgent && !editingRole && (
            <button
              type="button"
              onClick={() => {
                setRoleValue(agent.description || "");
                setRoleError("");
                setEditingRole(true);
              }}
              className="text-black/40 hover:text-black transition-colors"
              title="Edit description"
            >
              <Pencil size={12} />
            </button>
          )}
        </div>
        {canManageAgent && editingRole ? (
          <div className="space-y-[5px]">
            <textarea
              ref={roleRef}
              value={roleValue}
              onChange={(e) => {
                setRoleValue(e.target.value);
                if (roleError) setRoleError("");
              }}
              placeholder="Describe this agent…"
              className="m-0 min-h-10 w-full border-2 border-black px-2 py-1 text-sm leading-4 shadow-brutal-sm focus:outline-none focus:shadow-brutal-sm resize-none overflow-hidden"
              rows={2}
              autoFocus
              maxLength={MAX_AGENT_DESCRIPTION_LENGTH}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setRoleError("");
                  setEditingRole(false);
                }
              }}
            />
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => void handleSaveRole()}
                disabled={savingRole}
                className="btn-brutal-sm bg-brutal-pink px-2 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setRoleError("");
                  setEditingRole(false);
                }}
                disabled={savingRole}
                className="btn-brutal-sm bg-white px-2 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
            <div className="flex items-center justify-between gap-3 text-xs">
              {roleError ? (
                <span className="font-bold text-brutal-orange">
                  {roleError}
                </span>
              ) : (
                <span />
              )}
              <span className="font-mono text-black/50">
                {roleValue.trim().length}/{MAX_AGENT_DESCRIPTION_LENGTH}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-black">
            {agent.description || (
              <span className="italic text-black/40">No description</span>
            )}
          </p>
        )}
      </div>

      {showOperationalInfo && (
        <>
          {/* Info */}
          <div className="px-5 py-4 border-t border-black/10">
            <SectionEyebrow as="div" className="mb-3">
              Info
            </SectionEyebrow>
            <div className="space-y-3">
              {/* Computer */}
              <div>
                <div className="text-xs text-black/50 mb-1">Computer</div>
                <div className="flex items-center gap-1.5 text-sm">
                  {agentMachine ? (
                    <>
                      <button onClick={() => { useProfileStore.getState().closeProfile(); useThreadStore.getState().closeThread(); nav.toMachine(agentMachine.id); }} className="font-mono text-black hover:underline">{agentMachine.name}</button>
                      <StatusDot
                        tone={machineStatus === "online" ? "bg-brutal-lime" : "bg-gray-400"}
                        className="shrink-0"
                      />
                      <span className="text-xs text-black/50">{machineStatus === "online" ? "Connected" : "Offline"}</span>
                      {agentMachine.daemonVersion && (
                        <span className="text-xs text-black/50 font-mono">· daemon v{agentMachine.daemonVersion}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-black/40 italic">No computer assigned</span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-x-8 gap-y-3">
                {/* Created */}
                <KeyValueRow label="Created" value={createdDate} mono />
                {/* Creator */}
                <KeyValueRow
                  label="Creator"
                  valueClassName="flex items-center gap-2"
                  value={
                    agent.creator ? (
                      <button
                        type="button"
                        onClick={() => openProfile(agent.creator!.type === "human" ? "human" : "agent", agent.creator!.id)}
                        className="flex items-center gap-2 text-sm text-black hover:underline"
                      >
                        {agent.creator.type === "human" ? (
                          <AvatarSlot
                            context="creator-link"
                            type="human"
                            humanAvatarUrl={agent.creator.avatarUrl}
                            gravatarHash={agent.creator.gravatarHash}
                          />
                        ) : (
                          <AvatarSlot
                            context="creator-link"
                            type="agent"
                            agentAvatarUrl={agent.creator.avatarUrl}
                          />
                        )}
                        <span className="font-bold">{agent.creator.displayName || agent.creator.name}</span>
                        <span className="font-mono text-xs text-black/50">@{agent.creator.name}</span>
                      </button>
                    ) : (
                      <span className="text-sm italic text-black/40">No creator assigned</span>
                    )
                  }
                />
              </div>
            </div>
          </div>

          <div ref={configRef} className="px-5 py-4 border-t border-black/10">
            <div className="w-full">
              <div className="flex items-center gap-2 mb-1">
                <SectionEyebrow as="div">
                  Runtime Config
                </SectionEyebrow>
                {canManageAgent && !editingRuntimeConfig && (
                  <button
                    type="button"
                    onClick={startRuntimeConfigEditing}
                    className="text-black/40 hover:text-black transition-colors"
                    title="Edit Runtime Config"
                  >
                    <Pencil size={12} />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-4">
                <KeyValueRow
                  label="Runtime"
                  value={
                    <span className="inline-block border-2 border-black bg-brutal-cyan px-2 py-0.5 text-xs font-bold text-black">
                      {getRuntimeDisplayName(agent.runtime || "claude")}
                    </span>
                  }
                />
                <KeyValueRow
                  label="Model"
                  value={
                    <span className="inline-block border-2 border-black bg-brutal-lavender px-2 py-0.5 text-xs font-bold text-black">
                      {getModelLabel(agent.runtime || "claude", agent.model)}
                    </span>
                  }
                />
                {REASONING_EFFORT_RUNTIMES.has(agent.runtime) && (
                  <KeyValueRow
                    label="Reasoning"
                    value={
                      <span className="inline-block border-2 border-black bg-brutal-yellow px-2 py-0.5 text-xs font-bold capitalize text-black">
                        {agent.reasoningEffort || "Default"}
                      </span>
                    }
                  />
                )}
                {supportsRuntimeFastMode(agent.runtime) && (
                  <KeyValueRow
                    label="Mode"
                    value={
                      <span className="inline-block border-2 border-black bg-brutal-orange px-2 py-0.5 text-xs font-bold capitalize text-black">
                        {runtimeConfigFastMode(currentRuntimeConfig) ? "fast" : "default"}
                      </span>
                    }
                  />
                )}
                {agent.runtime === "claude" && (
                  <KeyValueRow
                    label="Provider"
                    value={
                      currentProviderApiUrl
                        ? <span className="font-mono text-xs text-black">{currentProviderApiUrl}</span>
                        : <span className="text-xs italic text-black/40">Default</span>
                    }
                  />
                )}
              </div>
              <div className="mt-3">
                <EnvVarsSection agent={agent} canManageAgent={false} />
              </div>
            </div>
          </div>

          <AgentCreatedAgentsSection createdAgents={agent.createdAgents || []} />
        </>
      )}

      {pendingConfirm && (
        <ConfirmDialog
          title={pendingConfirm.title}
          message={pendingConfirm.message}
          confirmLabel={pendingConfirm.confirmLabel}
          loadingLabel={pendingConfirm.loadingLabel}
          confirmColor={pendingConfirm.confirmColor}
          onConfirm={pendingConfirm.onConfirm}
          onClose={() => setPendingConfirm(null)}
          layer={1}
        />
      )}

      {editingRuntimeConfig && (
        <Modal onClose={closeRuntimeConfigEditor} layer={1}>
          <div className="w-full max-w-md card-brutal p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold uppercase">Edit Runtime Config</h2>
              <button onClick={closeRuntimeConfigEditor} className="btn-brutal-sm bg-white p-1">
                <X size={20} />
              </button>
            </div>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void handleSaveRuntimeConfiguration();
              }}
            >
              <RuntimeConfigFields
                runtime={draftRuntime}
                onRuntimeChange={(id) => {
                  setDraftRuntime(id);
                  setDraftModel(getDefaultModel(id));
                  setDraftCustomModelMode(false);
                  setDraftProviderMode("default");
                  setDraftProviderApiUrl("");
                  setDraftProviderApiKey("");
                  setDraftFastMode(false);
                  if (!REASONING_EFFORT_RUNTIMES.has(id)) {
                    setDraftReasoningEffort(null);
                  }
                }}
                runtimeOptions={runtimeOptions}
                model={draftModel}
                onModelChange={setDraftModel}
                customModelMode={draftCustomModelMode}
                onCustomModelModeChange={setDraftCustomModelMode}
                modelOptions={modelOptions}
                runtimeModels={runtimeModels}
                rescanDisabled={!agent.machineId}
                providerMode={draftProviderMode}
                onProviderModeChange={setDraftProviderMode}
                providerApiUrl={draftProviderApiUrl}
                onProviderApiUrlChange={setDraftProviderApiUrl}
                providerApiKey={draftProviderApiKey}
                onProviderApiKeyChange={setDraftProviderApiKey}
                fastMode={draftFastMode}
                onFastModeChange={setDraftFastMode}
                reasoningEffort={draftReasoningEffort}
                onReasoningEffortChange={setDraftReasoningEffort}
                envVarEntries={draftEnvVarEntries}
                onEnvVarEntriesChange={setDraftEnvVarEntries}
                envVarsMode="advanced"
                advancedOpen={runtimeConfigAdvancedOpen}
                onAdvancedOpenChange={setRuntimeConfigAdvancedOpen}
                envVarsHint="These will be injected into the runtime command environment."
                selectedModelSuggestionOnly={draftModelSuggestionOnly}
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeRuntimeConfigEditor}
                  disabled={savingRuntimeConfig}
                  className="btn-brutal bg-white px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRuntimeConfig || !runtimeConfigChanged || draftProviderApiUrlInvalid || draftProviderApiKeyInvalid || draftCustomModelInvalid}
                  className="btn-brutal bg-brutal-pink px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save Runtime Config
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </>
  );
}

function AgentCreatedAgentsSection({ createdAgents }: { createdAgents: Agent["createdAgents"] }) {
  const openProfile = useProfileStore((s) => s.openProfile);
  return (
    <div className="px-5 py-4 border-t border-black/10">
      <SectionHeader
        className="mb-3"
        label="Created Agents"
        count={createdAgents.length}
      />
      {createdAgents.length > 0 ? (
        <div className="space-y-2">
          {createdAgents.map((createdAgent) => (
            <AvatarListRow
              key={createdAgent.id}
              avatar={<AvatarSlot context="surface-list" type="agent" agentAvatarUrl={createdAgent.avatarUrl} />}
              name={createdAgent.displayName || createdAgent.name}
              subtitle={getRuntimeDisplayName(createdAgent.runtime)}
              rightContent={<CreatedAgentStatusDot agentId={createdAgent.id} />}
              onClick={() => openProfile("agent", createdAgent.id)}
            />
          ))}
        </div>
      ) : (
        <span className="text-sm italic text-black/40">No created agents</span>
      )}
    </div>
  );
}

function CreatedAgentStatusDot({ agentId }: { agentId: string }) {
  const displayState = useAgentDisplayState(agentId);
  return <StatusDot activity={displayState.activity} title={displayState.activityText} />;
}

// Isolated start/stop button — subscribes to activity for this agent only.
function AgentStartStopButton({ agentId, onShowStopConfirm }: { agentId: string; onShowStopConfirm: () => void }) {
  const displayState = useAgentDisplayState(agentId);
  const startAgent = useAgentStore((s) => s.startAgent);
  const isOnline = displayState.isOnline;
  return (
    <button
      onClick={isOnline ? onShowStopConfirm : () => startAgent(agentId)}
      className="btn-brutal flex w-full items-center justify-center gap-2 bg-white px-4 py-2 text-sm font-bold"
    >
      {isOnline ? <Square size={14} /> : <Play size={14} />}
      {isOnline ? "Stop Agent" : "Start Agent"}
    </button>
  );
}

// Isolated status badge — subscribes to activity for this agent only.
function AgentStatusBadge({ agentId, showDetail, fallbackStatus }: { agentId: string; showDetail: boolean; fallbackStatus?: Agent["status"] }) {
  const displayState = useAgentDisplayState(agentId, fallbackStatus ? { status: fallbackStatus } : undefined);
  const activityText = showDetail
    ? displayState.activityText
    : getActivityText(displayState.activity, "");
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <StatusDot activity={displayState.activity} className="shrink-0" />
      <span className="min-w-0 truncate text-sm text-black/60 font-mono" title={activityText}>
        {activityText}
      </span>
    </div>
  );
}

// Isolated header component — only re-renders on activity changes for this agent,
// without triggering re-render of ChatPanel / tabs below.
function AgentDetailHeader({ agent, canManageAgent, canMessageAgent, onMessage, onClose, onShowResetDialog, onShowStopConfirm }: {
  agent: Agent;
  canManageAgent: boolean;
  canMessageAgent: boolean;
  onMessage: () => void;
  onClose?: () => void;
  onShowResetDialog: () => void;
  onShowStopConfirm: () => void;
}) {
  const slug = useServerStore((s) => s.current?.slug);
  const [searchParams] = useSearchParams();
  // Two render modes for AgentDetailPanel:
  //   - Standalone route `/agent/<id>` — back falls back to /members rail.
  //   - Overlay (`?profile=agent:<id>` driven by ProfilePanel + useProfileStore)
  //     — `onClose` is closeProfile; back should close the overlay so the
  //     user lands on the underlying channel/DM, NOT skip to /members.
  // See useMobileBack JSDoc for the cold-start permalink scenario fixed
  // by this branch (#proj-mobile:b1c622e5 stdrc 2026-05-08).
  const onMobileBack = useMobileBack(onClose ?? (slug ? `/s/${slug}/members` : "/"));
  const displayState = useAgentDisplayState(agent.id, agent);
  const currentServerId = useServerStore((s) => s.current?.id);
  const startAgent = useAgentStore((s) => s.startAgent);
  const isOnline = displayState.isOnline;
  const isDeleted = !!agent.deletedAt;
  const sourceServerLabel =
    currentServerId && agent.serverId && agent.serverId !== currentServerId
      ? agent.serverName || agent.serverSlug || null
      : null;
  const [showMobileActions, setShowMobileActions] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!showMobileActions) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileActions(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowMobileActions(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showMobileActions]);

  return (
    <PanelHeader
      onMobileBack={onMobileBack}
      mobileBackProps={{ "data-testid": "agent-mobile-back", title: "Back" }}
      iconSlot={
        <AvatarSlot
          context="panel-header"
          type="agent"
          agentAvatarUrl={agent.avatarUrl}
          className={isDeleted ? "grayscale opacity-60" : ""}
        />
      }
      iconAlwaysVisible
      title={agent.displayName || agent.name}
      subtitle={agent.description && !isDeleted ? agent.description : undefined}
      titleClickProps={{ title: agent.displayName || agent.name }}
      titleSuffix={
        isDeleted ? (
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="inline-flex shrink-0 items-center px-1.5 py-0.5 text-[10px] font-bold uppercase border border-black bg-gray-300 text-black/60">
              Deleted
            </span>
          </div>
        ) : undefined
      }
      actions={
        <>
        {!isDeleted && (
          <>
            {canMessageAgent && (
              <button
                onClick={onMessage}
                className="btn-brutal-sm flex h-7 items-center justify-center gap-1.5 bg-white px-2 text-xs font-bold sm:px-2.5"
                title="Message"
              >
                <MessageSquare size={14} />
                <span>Message</span>
              </button>
            )}
            {canManageAgent && (
              <>
                <div className="relative md:hidden" ref={mobileMenuRef}>
                  <button
                    type="button"
                    onClick={() => setShowMobileActions((value) => !value)}
                    className="btn-brutal-sm flex size-7 items-center justify-center bg-white"
                    title="More actions"
                  >
                    <Menu size={14} />
                  </button>
                  {showMobileActions && (
                    <div className="absolute right-0 top-full z-20 mt-2 min-w-[180px] border-2 border-black bg-white shadow-brutal">
                      <button
                        type="button"
                        onClick={() => {
                          setShowMobileActions(false);
                          if (isOnline) onShowStopConfirm();
                          else void startAgent(agent.id);
                        }}
                        className="flex w-full items-center gap-2 border-b border-black/10 px-3 py-2 text-left text-sm font-bold hover:bg-black/5"
                      >
                        {isOnline ? <Square size={14} /> : <Play size={14} />}
                        <span>{isOnline ? "Stop Agent" : "Start Agent"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMobileActions(false);
                          onShowResetDialog();
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-bold hover:bg-black/5"
                      >
                        <RotateCcw size={14} />
                        <span>Restart / Reset</span>
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={isOnline ? onShowStopConfirm : () => startAgent(agent.id)}
                  className="btn-brutal-sm hidden size-7 items-center justify-center bg-white md:flex"
                  title={isOnline ? "Stop Agent" : "Start Agent"}
                >
                  {isOnline ? <Square size={14} /> : <Play size={14} />}
                </button>
                <button
                  onClick={onShowResetDialog}
                  className="btn-brutal-sm hidden size-7 items-center justify-center bg-white md:flex"
                  title="Restart / Reset"
                >
                  <RotateCcw size={14} />
                </button>
              </>
            )}
          </>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="btn-brutal-sm hidden size-7 items-center justify-center bg-white md:flex"
            title="Close"
          >
            <X size={14} />
          </button>
        )}
        </>
      }
    />
  );
}

export default function AgentDetailPanel({ agent, onClose }: { agent: Agent; onClose?: () => void }) {
  const stopAgent = useAgentStore((s) => s.stopAgent);
  const deleteAgent = useAgentStore((s) => s.deleteAgent);
  const updateAgent = useAgentStore((s) => s.updateAgent);
  const openDM = useChannelStore((s) => s.openDM);
  const { capabilities } = useServerPermissions();
  const navigate = useNavigate();
  const nav = useAppNavigate();
  const activityState = useAgentStore((s) => s.agentActivities[agent.id]) as AgentActivityState | undefined;
  const activityLog = useAgentStore((s) => s.activityLogs[agent.id] ?? EMPTY_ACTIVITY_LOG);
  const machines = useMachineStore((s) => s.machines);
  const currentServer = useServerStore((s) => s.current);
  const currentUser = useAuthStore((s) => s.user);
  const agentMachine = agent.machineId ? machines.find((m) => m.id === agent.machineId) : null;
  const isRemoteJointAgent = Boolean(currentServer?.id && agent.serverId && agent.serverId !== currentServer.id);

  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [startError, setStartError] = useState("");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [diagnosticCopied, setDiagnosticCopied] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const canManageAgent = !isRemoteJointAgent && capabilities.manageAgents;
  const canManageServer = !isRemoteJointAgent && capabilities.manageServer;
  const canViewPrivateAgentSurfaces = canViewAgentPrivateSurfaces(
    agent,
    currentUser?.id,
    canManageAgent,
  );
  const visibleAgentTabs = useMemo(
    () => AGENT_TABS.filter((tab) => {
      if (PUBLIC_AGENT_TABS.has(tab)) return true;
      // Permissions hides for deleted agents (the panel is a no-op there);
      // otherwise it falls through to the same creator-OR-admin gate as the
      // other private surfaces.
      if (tab === "permissions" && agent.deletedAt) return false;
      return canViewPrivateAgentSurfaces;
    }),
    [canViewPrivateAgentSurfaces, agent.deletedAt],
  );
  const visibleAgentTabItems = useMemo(
    () => AGENT_PANEL_TABS.filter((tab) => visibleAgentTabs.includes(tab.id)),
    [visibleAgentTabs],
  );
  const agentPanelTabOrder = useServerStore((s) => s.sidebarOrder.agentPanelTabOrder);
  const updateSidebarOrder = useServerStore((s) => s.updateSidebarOrder);
  const orderedAgentTabs = useOrderedPanelTabs(visibleAgentTabItems, agentPanelTabOrder);
  const reorderAgentTabs = useCallback((nextOrder: AgentTab[]) => {
    void updateSidebarOrder({ agentPanelTabOrder: nextOrder });
  }, [updateSidebarOrder]);
  const defaultAgentTab = orderedAgentTabs[0]?.id ?? "profile";
  const rawTab = searchParams.get("agentTab");
  const isFullPageAgentRoute = /^\/s\/[^/]+\/agent\/[^/]+$/.test(location.pathname);
  const legacyFullPageTab = isFullPageAgentRoute ? searchParams.get("tab") : null;
  const resolvedTab = rawTab ?? legacyFullPageTab;
  const activeTab: AgentTab = orderedAgentTabs.some((tab) => tab.id === resolvedTab) ? (resolvedTab as AgentTab) : defaultAgentTab;
  const activeTabButtonRef = useRef<HTMLButtonElement | null>(null);
  const setActiveTab = useCallback((tab: AgentTab) => {
    // Agent detail tabs keep their own scoped query key. We still strip the
    // legacy generic `tab` when it holds an old agent- or sidebar-tab value so
    // old shared URLs normalize onto `agentTab` + `sidebarTab`.
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tab === defaultAgentTab) next.delete("agentTab");
      else next.set("agentTab", tab);
      if (isFullPageAgentRoute) {
        const legacyTab = next.get("tab");
        if (legacyTab === "machines") {
          next.set(SIDEBAR_TAB_QUERY_PARAM, "members");
          next.delete("tab");
        } else if (legacyTab && AGENT_TABS.includes(legacyTab as AgentTab)) {
          next.delete("tab");
        }
      }
      return next;
    }, { replace: true });
  }, [defaultAgentTab, isFullPageAgentRoute, setSearchParams]);

  useEffect(() => {
    activeTabButtonRef.current?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "instant" as ScrollBehavior,
    });
  }, [activeTab]);

  // Find existing DM channel for this agent (for Message button)
  const dmChannels = useChannelStore((s) => s.dmChannels);
  const dmChannel = useMemo(
    () => dmChannels.find((c) => c.peerId === agent.id),
    [dmChannels, agent.id]
  );

  const handleCopyDiagnosticInfo = useCallback(async () => {
    try {
      const diagnosticInfo = buildAgentDiagnosticInfo({
        agent,
        serverId: currentServer?.id,
        machine: agentMachine,
        activityState,
        activityLog,
      });
      await copyTextToClipboard(diagnosticInfo);
      setDiagnosticCopied(true);
      window.setTimeout(() => setDiagnosticCopied(false), 2000);
    } catch {
      setStartError("Failed to copy diagnostic info");
    }
  }, [activityLog, activityState, agent, agentMachine, currentServer?.id]);

  const currentPixelKey = parsePixelAvatar(agent.avatarUrl);
  const [reminderItems, setReminderItems] = useState<ReminderSummary[]>([]);
  const [remindersLoading, setRemindersLoading] = useState(true);
  const [remindersError, setRemindersError] = useState<string | null>(null);

  const loadReminders = useCallback(async () => {
    setRemindersLoading(true);
    setRemindersError(null);
    try {
      const { data } = await api.get("/reminders", {
        params: {
          ownerAgentId: agent.id,
          status: "scheduled",
        },
      });
      setReminderItems((data?.reminders ?? []) as ReminderSummary[]);
    } catch (err: any) {
      setRemindersError(err.response?.data?.error || "Failed to load reminders");
    } finally {
      setRemindersLoading(false);
    }
  }, [agent.id]);

  useEffect(() => {
    void loadReminders();
  }, [loadReminders]);

  useEffect(() => {
    const socket = getSocket();
    // Fire: one-shot reminders disappear; recurring reminders stay in the list
    // but advance to the next scheduled fire time (server sends nextFireAt).
    const handleReminderFired = (data: {
      reminderId: string;
      ownerAgentId: string;
      nextFireAt?: string | null;
    }) => {
      if (data.ownerAgentId !== agent.id) return;
      setReminderItems((current) => {
        if (!data.nextFireAt) {
          return current.filter((item) => item.reminderId !== data.reminderId);
        }
        return current.map((item) =>
          item.reminderId === data.reminderId ? { ...item, fireAt: data.nextFireAt! } : item,
        );
      });
    };
    const handleReminderScheduled = (data: { reminder: ReminderSummary }) => {
      if (data.reminder?.ownerAgentId !== agent.id) return;
      setReminderItems((current) => {
        // Ignore non-scheduled payloads defensively; only scheduled reminders
        // belong in the pending list (the API query filters status=scheduled).
        if (data.reminder.status !== "scheduled") return current;
        // Upsert: replace if we already have this id, else append + sort asc
        // by fireAt so the next-firing reminder stays on top.
        const without = current.filter((item) => item.reminderId !== data.reminder.reminderId);
        const next = [...without, data.reminder];
        next.sort((a, b) => a.fireAt.localeCompare(b.fireAt));
        return next;
      });
    };
    const handleReminderCanceled = (data: { reminderId: string; ownerAgentId: string }) => {
      if (data.ownerAgentId !== agent.id) return;
      setReminderItems((current) => current.filter((item) => item.reminderId !== data.reminderId));
    };
    const handleReconnect = () => {
      void loadReminders();
    };

    socket.on("reminder:fired", handleReminderFired);
    socket.on("reminder:scheduled", handleReminderScheduled);
    socket.on("reminder:canceled", handleReminderCanceled);
    socket.on("connect", handleReconnect);
    return () => {
      socket.off("reminder:fired", handleReminderFired);
      socket.off("reminder:scheduled", handleReminderScheduled);
      socket.off("reminder:canceled", handleReminderCanceled);
      socket.off("connect", handleReconnect);
    };
  }, [agent.id, loadReminders]);

  const handleOpenReminderMsgRef = useCallback(
    (permalink: string) => {
      const parsed = parseSlockPermalink(permalink, window.location.hostname);
      if (!parsed) {
        // Anchor outside the app (shouldn't happen — msgPermalink is
        // server-built against APP_URL) — fall back to a full navigation.
        window.location.href = permalink;
        return;
      }
      if (parsed.threadParentMessageId) {
        nav.toThreadMessage(
          parsed.channelId,
          parsed.threadParentMessageId,
          parsed.messageId,
          parsed.routeKind,
        );
      } else if (parsed.routeKind === "dm") {
        nav.toDmMessage(parsed.channelId, parsed.messageId);
      } else {
        nav.toMessage(parsed.channelId, parsed.messageId);
      }
    },
    [nav],
  );

  const handleRetryReminders = useCallback(async () => {
    await loadReminders();
  }, [loadReminders]);

  const handleStop = async () => {
    setStartError("");
    try {
      await stopAgent(agent.id);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setStartError(axiosErr.response?.data?.error || "Failed to stop agent");
    }
  };

  const handleDelete = async () => {
    await deleteAgent(agent.id);
    navigate("/", { replace: true });
  };

  const handleSelectAvatar = async (key: string) => {
    await updateAgent(agent.id, { avatarUrl: `pixel:${key}` });
    setShowAvatarPicker(false);
  };

  const handleUploadAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const res = await api.post(`/agents/${agent.id}/avatar`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Server already saved avatarUrl — just update local store
      const updated = res.data;
      useAgentStore.setState((state) => ({
        agents: state.agents.map((a) => a.id === agent.id ? { ...a, ...updated } : a),
      }));
      setShowAvatarPicker(false);
    } catch {
      // TODO: show error toast
    }
  };

  const handleClearAvatar = async () => {
    await updateAgent(agent.id, { avatarUrl: null });
    setShowAvatarPicker(false);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header — isolated component to prevent activity changes from re-rendering ChatPanel */}
      <AgentDetailHeader
        agent={agent}
        canManageAgent={canManageAgent}
        canMessageAgent={!isRemoteJointAgent}
        onClose={onClose}
        onMessage={async () => {
          useProfileStore.getState().closeProfile();
          useThreadStore.getState().closeThread();
          if (dmChannel) {
            nav.toDm(dmChannel.id);
          } else if (!agent.deletedAt) {
            const ch = await openDM(agent.id);
            if (ch) nav.toDm(ch.id);
          }
        }}
        onShowResetDialog={() => setShowResetDialog(true)}
        onShowStopConfirm={() => setShowStopConfirm(true)}
      />

      {/* Start error */}
      {startError && (
        <div className="border-b-2 border-black bg-brutal-orange/20 px-5 py-2 flex items-center gap-2">
          <span className="min-w-0 flex-1 truncate text-sm font-bold text-black" title={startError}>{startError}</span>
          <button
            onClick={() => setStartError("")}
            className="shrink-0 text-black/40 hover:text-black transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Agent runtime error banner — error detail leaks via Socket.io
          `agent:activity` to all server members, so for non-creators we
          fall back to a generic message and hide the "View logs" link. */}
      {activityState?.activity === "error" && (
        <div className="flex items-start gap-2 border-b-2 border-black bg-brutal-orange/20 px-5 py-2">
          <StatusDot tone="bg-brutal-orange" className="mt-[0.1875rem] shrink-0" />
          <span className="min-w-0 flex-1 line-clamp-2 break-words text-sm font-bold leading-snug text-black" title={canViewPrivateAgentSurfaces ? (activityState.activityDetail || "Agent encountered an error") : "Agent encountered an error"}>
            {canViewPrivateAgentSurfaces
              ? (activityState.activityDetail || "Agent encountered an error")
              : "Agent encountered an error"}
          </span>
          {canViewPrivateAgentSurfaces && (
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-x-3 gap-y-1">
              <button
                type="button"
                onClick={handleCopyDiagnosticInfo}
                className="inline-flex items-center gap-1 text-xs font-bold text-black/60 hover:text-black underline whitespace-nowrap"
              >
                {diagnosticCopied ? <Check size={12} /> : <Clipboard size={12} />}
                {diagnosticCopied ? "Copied" : "Copy info"}
              </button>
              {activeTab !== "activity" && (
                <button
                  type="button"
                  onClick={() => setActiveTab("activity")}
                  className="text-xs font-bold text-black/60 hover:text-black underline whitespace-nowrap"
                >
                  View logs
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab bar — horizontally scrollable */}
      <ReorderablePanelTabs
        tabs={orderedAgentTabs}
        activeTab={activeTab}
        activeTabRef={activeTabButtonRef}
        onSelectTab={setActiveTab}
        onReorderTabs={reorderAgentTabs}
      />

      {/* Tab content — fills remaining space */}
      {activeTab === "profile" ? (
        <div className="flex-1 overflow-y-auto bg-white">
          {isRemoteJointAgent && (agent.serverName || agent.serverSlug) && (
            <div className="border-b border-black/10 px-5 py-3">
              <SectionEyebrow as="div" className="mb-1">
                From
              </SectionEyebrow>
              <div className="text-sm font-bold text-black">{agent.serverName || agent.serverSlug}</div>
            </div>
          )}
          {/* Profile header — avatar + name + status */}
          <div className="flex items-start gap-4 px-5 py-5">
            {canManageAgent ? (
              <button
                type="button"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="group relative"
                title="Change avatar"
              >
                <AvatarSlot context="profile-tile" type="agent" agentAvatarUrl={agent.avatarUrl} />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Pencil size={18} className="text-white" />
                </div>
              </button>
            ) : (
              <AvatarSlot
                context="profile-tile"
                type="agent"
                agentAvatarUrl={agent.avatarUrl}
                className={agent.deletedAt ? "grayscale opacity-60" : ""}
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <div className="min-w-0 truncate text-lg font-bold leading-tight text-black" title={agent.displayName || agent.name}>{agent.displayName || agent.name}</div>
                {!agent.deletedAt && <AgentStatusBadge agentId={agent.id} fallbackStatus={agent.status} showDetail={canViewPrivateAgentSurfaces} />}
              </div>
              <div className="truncate text-sm text-black/50 font-mono" title={`@${agent.name}`}>@{agent.name}</div>
            </div>
          </div>

          {/* Avatar picker — inline below avatar */}
          {canManageAgent && showAvatarPicker && (
            <div className="px-5 py-3 border-t border-black/10">
              <SectionEyebrow as="div" className="mb-2">
                Choose Avatar
              </SectionEyebrow>
              <div className="flex flex-wrap gap-2 justify-center">
                {/* Upload custom image */}
                <label
                  className={`flex size-10 items-center justify-center border-2 transition-colors ${
                    isCustomAvatar(agent.avatarUrl)
                      ? "border-brutal-pink bg-brutal-pink/20"
                      : "border-black hover:border-brutal-pink"
                  }`}
                  title="Upload image"
                >
                  {isCustomAvatar(agent.avatarUrl) ? (
                    <img src={agent.avatarUrl!} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Upload size={16} className="text-black/60" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadAvatar(file);
                    }}
                  />
                </label>
                {/* Default (robot) */}
                <button
                  type="button"
                  onClick={handleClearAvatar}
                  className={`flex size-10 items-center justify-center border-2 overflow-hidden transition-colors ${
                    !currentPixelKey && !isCustomAvatar(agent.avatarUrl)
                      ? "border-brutal-pink bg-brutal-pink/20"
                      : "border-black hover:border-brutal-pink"
                  }`}
                  title="Default (robot)"
                >
                  <PixelAvatar avatarKey={DEFAULT_AVATAR_KEY} size={36} />
                </button>
                {AVATAR_KEYS.filter((key) => key !== DEFAULT_AVATAR_KEY).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectAvatar(key)}
                    className={`flex size-10 items-center justify-center border-2 overflow-hidden transition-colors ${
                      currentPixelKey === key
                        ? "border-brutal-pink bg-brutal-pink/20"
                        : "border-black hover:border-brutal-pink"
                    }`}
                    title={key}
                  >
                    <PixelAvatar avatarKey={key} size={36} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Profile info: description, computer, created */}
          <AgentProfileInfo
            agent={agent}
            canManageAgent={canManageAgent && !agent.deletedAt}
            showOperationalInfo={!isRemoteJointAgent}
          />

          {/* Skills */}
          {canViewPrivateAgentSurfaces && (
            <div className="border-t border-black/10">
              <AgentSkills agentId={agent.id} embedded />
            </div>
          )}

          {/* Actions */}
          {canManageAgent && !agent.deletedAt && (
            <div className="px-5 py-4 border-t border-black/10">
              <SectionEyebrow as="div" className="mb-3">
                Actions
              </SectionEyebrow>
              <div className="space-y-2">
                <AgentStartStopButton agentId={agent.id} onShowStopConfirm={() => setShowStopConfirm(true)} />
                <button
                  onClick={() => setShowResetDialog(true)}
                  className="btn-brutal flex w-full items-center justify-center gap-2 bg-white px-4 py-2 text-sm font-bold"
                >
                  <RotateCcw size={14} />
                  Restart / Reset
                </button>
                <button
                  onClick={handleCopyDiagnosticInfo}
                  className="btn-brutal flex w-full items-center justify-center gap-2 bg-white px-4 py-2 text-sm font-bold"
                >
                  {diagnosticCopied ? <Check size={14} /> : <Clipboard size={14} />}
                  {diagnosticCopied ? "Diagnostic Info Copied" : "Copy Diagnostic Info"}
                </button>
                {FEEDBACK_EXPORT_ENABLED && (
                  <button
                    onClick={() => setShowReportDialog(true)}
                    className="btn-brutal flex w-full items-center justify-center gap-2 bg-brutal-orange px-4 py-2 text-sm font-bold"
                  >
                    <Bug size={14} />
                    Report Issue
                  </button>
                )}
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn-brutal flex w-full items-center justify-center gap-2 bg-brutal-red px-4 py-2 text-sm font-bold"
                >
                  <Trash2 size={14} />
                  Delete Agent
                </button>
              </div>
            </div>
          )}
        </div>
      ) : activeTab === "dms" ? (
        <AgentDMsTab agentId={agent.id} />
      ) : activeTab === "reminders" ? (
        <AgentRemindersSection
          variant="tab"
          reminders={reminderItems}
          loading={remindersLoading}
          error={remindersError}
          onRetry={handleRetryReminders}
          onOpenMsgRef={handleOpenReminderMsgRef}
        />
      ) : activeTab === "workspace" ? (
        <AgentWorkspace agentId={agent.id} compact={!!onClose} />
      ) : activeTab === "activity" ? (
        <div className="flex min-h-0 flex-1 flex-col bg-white">
          <div className="flex items-center justify-between border-b-2 border-black bg-white px-5 py-2">
            <SectionEyebrow as="div">Activity diagnostics</SectionEyebrow>
            <button
              type="button"
              onClick={handleCopyDiagnosticInfo}
              className="btn-brutal-sm flex items-center gap-1.5 bg-white px-2 py-1 text-xs font-bold"
            >
              {diagnosticCopied ? <Check size={12} /> : <Clipboard size={12} />}
              {diagnosticCopied ? "Copied" : "Copy Diagnostic Info"}
            </button>
          </div>
          <AgentActivityLog agentId={agent.id} />
        </div>
      ) : activeTab === "permissions" ? (
        <div className="flex-1 overflow-y-auto bg-white">
          <AgentScopesPanel agentId={agent.id} />
        </div>
      ) : activeTab === "integrations" ? (
        <AgentIntegrationsTab agentId={agent.id} canManageServer={canManageServer} />
      ) : null}

      {canManageAgent && showResetDialog && (
        <ResetAgentDialog
          agentId={agent.id}
          agentName={agent.displayName || agent.name}
          onClose={() => setShowResetDialog(false)}
        />
      )}

      {canManageAgent && showReportDialog && (
        <ReportIssueDialog
          agent={agent}
          dmChannelId={dmChannel?.id}
          onClose={() => setShowReportDialog(false)}
        />
      )}

      {canManageAgent && showStopConfirm && (
        <ConfirmDialog
          title="Stop Agent"
          message={`Are you sure you want to stop "${agent.displayName || agent.name}"? The agent will stop processing messages.`}
          confirmLabel="Stop Agent"
          loadingLabel="Stopping…"
          confirmColor="bg-brutal-orange"
          onConfirm={handleStop}
          onClose={() => setShowStopConfirm(false)}
        />
      )}

      {canManageAgent && showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Agent"
          message={`Are you sure you want to delete "${agent.displayName || agent.name}"? This will remove all associated data and cannot be undone.`}
          confirmLabel="Delete Agent"
          loadingLabel="Deleting…"
          onConfirm={handleDelete}
          onClose={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
