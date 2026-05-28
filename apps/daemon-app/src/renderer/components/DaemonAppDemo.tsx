import { useState, type ChangeEvent, type ReactNode } from "react";
import {
  ChevronRight,
  Plus,
  ExternalLink,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Key,
  Settings,
  AlertTriangle,
  Trash2,
  RefreshCw,
} from "lucide-react";
import type {
  ActivityLogEntry,
  ConnectedServer,
  LocalDaemonRuntimeState,
  MachineAssignedAgent,
  MachineShellState,
  ProviderConfig,
  ProviderKind,
} from "../../model";
import { buildLoginEntryState } from "../../loginEntryState";
import { buildProviderSetupState, getProviderSetupOptionState } from "../../providerSetupState";
import { SUPPORTED_PROVIDER_KINDS } from "../../providerCapabilities";
import { buildProviderRuntimeSummary } from "../../providerRuntimeSummary";
import { hasDaemonVersionUpdate } from "../../daemonVersion";
import PixelAvatar from "./PixelAvatar";

const slockLockupLightUrl = new URL("../assets/brand/slock-lockup-light.svg", import.meta.url).href;

interface DaemonLoginProps {
  serverUrl: string;
  savedServerCount: number;
  localEncryptionAvailable?: boolean;
  onServerUrlChange?: (value: string) => void;
  onLogin?: () => void;
  onUseMachineKeyInstead?: () => void;
}

interface DaemonProviderSetupProps {
  currentServer: ConnectedServer | null;
  localEncryptionAvailable?: boolean;
  existingProviderKinds: ProviderKind[];
  configuredProviderKinds: ProviderKind[];
  systemProviders: ProviderConfig[];
  onAddProvider?: (kind: ProviderKind) => void;
  onSkip?: () => void;
}

interface DaemonMachineKeyLoginProps {
  serverUrl: string;
  machineBootstrap: string;
  serverUrlLocked?: boolean;
  onServerUrlChange?: (value: string) => void;
  onMachineBootstrapChange?: (value: string) => void;
  onImport?: () => void;
  onBack?: () => void;
}

interface DaemonDashboardProps {
  currentServer: ConnectedServer | null;
  providerCount: number;
  providerActionLabel: string;
  providerBanner: { actionLabel: string; message: string } | null;
  machineState?: MachineShellState | null;
  runtimeState?: LocalDaemonRuntimeState | null;
  agents?: MachineAssignedAgent[];
  activityLog?: ActivityLogEntry[];
  onOpenProviders?: () => void;
  onOpenSlock?: () => void;
  onOpenShell?: () => void;
}

interface DaemonProvidersProps {
  currentServer: ConnectedServer | null;
  agentCount: number;
  providers: ProviderConfig[];
  systemProviders: ProviderConfig[];
  localEncryptionAvailable?: boolean;
  providerApiKeyDrafts?: Record<string, string>;
  providerEndpointDrafts?: Record<string, string>;
  onProviderApiKeyDraftChange?: (providerId: string, value: string) => void;
  onProviderEndpointDraftChange?: (providerId: string, value: string) => void;
  onGoToDashboard?: () => void;
  onGoToSetup?: () => void;
  onOpenSlock?: () => void;
  onOpenShell?: () => void;
  onSaveProviderCredentials?: (providerId: string) => void;
  onClearProviderCredentials?: (providerId: string) => void;
  onRemoveProvider?: (providerId: string) => void;
  onTestProvider?: (providerId: string) => void;
}

const DEFAULT_ACTIVITY_LOG: ActivityLogEntry[] = [
  { id: "1", time: "09:28", source: "Shell", action: "Connected to Botiverse locally" },
  { id: "2", time: "09:25", source: "Shell", action: "Added Anthropic as a provider" },
  { id: "3", time: "09:22", source: "Daemon", action: "Agent runtime attached to this machine" },
];

const PROVIDER_OPTIONS: Array<{
  kind: ProviderKind;
  name: string;
  desc: string;
  initial: string;
  color: string;
  hasOAuth: boolean;
}> = [
  {
    kind: "anthropic",
    name: "Anthropic",
    desc: "Claude Sonnet 4, Opus 4",
    initial: "A",
    color: "bg-brutal-lavender",
    hasOAuth: true,
  },
  {
    kind: "openai",
    name: "OpenAI",
    desc: "GPT-4o, o3",
    initial: "O",
    color: "bg-brutal-lime",
    hasOAuth: true,
  },
  {
    kind: "alibaba",
    name: "Alibaba Cloud",
    desc: "Qwen-Max, Qwen-Plus",
    initial: "Q",
    color: "bg-brutal-orange",
    hasOAuth: false,
  },
  {
    kind: "custom",
    name: "Custom Endpoint",
    desc: "Ollama, vLLM, OpenAI-compatible",
    initial: "C",
    color: "bg-brutal-cream",
    hasOAuth: false,
  },
];

function getProviderPresentation(kind: ProviderKind) {
  const match = PROVIDER_OPTIONS.find((provider) => provider.kind === kind);
  return match ?? PROVIDER_OPTIONS[3];
}

function ProviderIcon({ initial, color, size = "md" }: { initial: string; color: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-lg",
    lg: "h-12 w-12 text-xl",
  };

  return (
    <div
      className={`${sizes[size]} flex shrink-0 items-center justify-center border-2 border-black ${color} font-mono font-bold shadow-brutal-sm`}
    >
      {initial}
    </div>
  );
}

function getAgentCardStatus(agent: MachineAssignedAgent): "running" | "stopped" | "error" {
  if (agent.activity === "working" || agent.activity === "online" || agent.status === "active") {
    return "running";
  }
  if (agent.activity === "error") {
    return "error";
  }
  return "stopped";
}

function getAgentAvatarKey(agent: MachineAssignedAgent): string {
  if (agent.avatarUrl?.startsWith("pixel:")) {
    return agent.avatarUrl.slice(6);
  }
  return `random:${agent.id}`;
}

function getAgentHeadline(agent: MachineAssignedAgent): string {
  return agent.description?.trim() || `${agent.runtime} · ${agent.model}`;
}

function hasMachineUpdate(machineState: MachineShellState | null | undefined): boolean {
  return hasDaemonVersionUpdate(
    machineState?.daemonVersion ?? null,
    machineState?.latestDaemonVersion ?? null,
  );
}

function DaemonWindowFrame({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brutal-cream p-4 font-display">
      <div className="w-full max-w-[900px] overflow-hidden border-2 border-black bg-white shadow-brutal-lg">
        <div className="flex items-center gap-2 border-b-2 border-black bg-brutal-black px-4 py-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full border border-black/20 bg-[#FF5F56]" />
            <div className="h-3 w-3 rounded-full border border-black/20 bg-[#FFBD2E]" />
            <div className="h-3 w-3 rounded-full border border-black/20 bg-[#27C93F]" />
          </div>
          <span className="flex-1 text-center text-xs font-mono font-bold text-white/70">
            {title || "Slock Daemon"}
          </span>
          <div className="w-12" />
        </div>
        {children}
      </div>
    </div>
  );
}

function DaemonTopBar({
  currentServer,
  providersActive = false,
  showExternalLink = false,
  onGoToDashboard,
  onOpenProviders,
  onOpenShell,
  onOpenSlock,
}: {
  currentServer: ConnectedServer | null;
  providersActive?: boolean;
  showExternalLink?: boolean;
  onGoToDashboard?: () => void;
  onOpenProviders?: () => void;
  onOpenShell?: () => void;
  onOpenSlock?: () => void;
}) {
  const serverInitial = (currentServer?.name ?? "S").trim().charAt(0).toUpperCase() || "S";
  const IdentityTag = onGoToDashboard ? "button" : "div";

  return (
    <div className="flex items-center justify-between border-b-2 border-black bg-brutal-cream px-4 py-3">
      <IdentityTag
        type={onGoToDashboard ? "button" : undefined}
        onClick={onGoToDashboard}
        className={`flex items-center gap-3 ${onGoToDashboard ? "text-left hover:opacity-80" : ""}`}
      >
        <div className="flex h-8 w-8 items-center justify-center border-2 border-black bg-brutal-yellow text-sm font-bold shadow-brutal-sm">
          {serverInitial}
        </div>
        <div>
          <div className="text-sm font-bold">{currentServer?.name ?? "No server selected"}</div>
          <div className="text-[10px] font-mono text-black/45">{currentServer?.accountLabel ?? "Add a server"}</div>
        </div>
      </IdentityTag>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenProviders}
          disabled={!onOpenProviders}
          className={`btn-brutal-sm flex items-center gap-1.5 px-3 py-1.5 text-xs disabled:cursor-default disabled:opacity-100 ${
            providersActive ? "bg-brutal-yellow" : "bg-white"
          }`}
        >
          <Key size={14} />
          Providers
        </button>
        <button
          type="button"
          onClick={onOpenShell}
          disabled={!onOpenShell}
          className="btn-brutal-sm flex h-9 w-9 items-center justify-center bg-white disabled:cursor-default"
        >
          <Settings size={14} />
        </button>
        {showExternalLink ? (
          <button
            type="button"
            onClick={onOpenSlock}
            disabled={!onOpenSlock}
            className="btn-brutal-sm flex h-9 w-9 items-center justify-center bg-white disabled:cursor-default"
          >
            <ExternalLink size={14} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function AgentStatusBadge({ status }: { status: "running" | "stopped" | "error" }) {
  if (status === "running") {
    return <span className="border border-black bg-brutal-lime px-1.5 py-0.5 text-[10px] font-bold uppercase">Running</span>;
  }
  if (status === "error") {
    return <span className="border border-black bg-brutal-orange/40 px-1.5 py-0.5 text-[10px] font-bold uppercase">Error</span>;
  }
  return <span className="border border-black/20 bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase text-black/45">Stopped</span>;
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="mb-3 text-[11px] font-bold uppercase tracking-widest text-black/35">{children}</div>;
}

function ProviderStatusChip({ provider }: { provider: ProviderConfig }) {
  if (provider.status === "connected") {
    return (
      <span className="flex items-center gap-1 border border-green-600/30 bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-800">
        <CheckCircle size={10} />
        {provider.credentialSource === "system" ? "Ready" : "Connected"}
      </span>
    );
  }

  if (provider.status === "error") {
    return (
      <span className="flex items-center gap-1 border border-brutal-orange/40 bg-brutal-orange/20 px-2 py-0.5 text-[10px] font-bold text-black/70">
        <AlertTriangle size={10} />
        {provider.credentialSource === "system" ? "Unable to verify" : "Error"}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 border border-yellow-600/30 bg-yellow-100 px-2 py-0.5 text-[10px] font-bold text-yellow-800">
      <Clock size={10} />
      {provider.credentialSource === "system" ? "Not logged in" : "Needs setup"}
    </span>
  );
}

function SystemProviderCard({ provider }: { provider: ProviderConfig }) {
  const presentation = getProviderPresentation(provider.kind);
  const runtimeSummary = buildProviderRuntimeSummary(provider, [provider]);

  return (
    <div className="border-2 border-black bg-white p-4 shadow-brutal-sm">
      <div className="flex items-start gap-4">
        <ProviderIcon initial={presentation.initial} color={presentation.color} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-bold">{provider.name}</span>
            <span className="border border-black/20 bg-brutal-cyan/15 px-2 py-0.5 text-[10px] font-bold uppercase text-black/60">
              System
            </span>
            <ProviderStatusChip provider={provider} />
          </div>
          <div className="mt-1 text-[11px] font-mono text-black/45">
            {provider.model} · {runtimeSummary}
          </div>
          <div className="mt-2 text-[11px] leading-relaxed text-black/60">{provider.usage}</div>
        </div>
      </div>
    </div>
  );
}

export function DaemonLogin({
  serverUrl,
  savedServerCount: _savedServerCount,
  localEncryptionAvailable = true,
  onServerUrlChange,
  onLogin,
  onUseMachineKeyInstead,
}: DaemonLoginProps) {
  const loginState = buildLoginEntryState(localEncryptionAvailable);

  return (
    <DaemonWindowFrame title="Slock Daemon — Login">
      <div className="flex flex-col items-center justify-center px-8 py-16">
        <div className="mb-8 flex flex-col items-center gap-3">
          <img
            src={slockLockupLightUrl}
            alt="Slock"
            className="block h-12 w-auto select-none"
            draggable={false}
          />
          <span className="text-sm font-bold uppercase tracking-widest text-black/40">Daemon</span>
        </div>

        <p className="mb-8 max-w-sm text-center text-sm text-black/60">
          Manage your AI agents locally. Connect to your Slock server to get started.
        </p>

        <div className="mb-4 w-full max-w-sm">
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-black/50">
            Server URL
          </label>
          <input
            type="text"
            className="input-brutal w-full text-sm font-mono"
            value={serverUrl}
            onChange={(event) => onServerUrlChange?.(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onLogin?.();
              }
            }}
          />
        </div>

        <button
          type="button"
          onClick={onLogin}
          className="btn-brutal mb-3 flex w-full max-w-sm items-center justify-center gap-3 bg-brutal-yellow p-3 text-lg font-bold"
        >
          <Shield size={20} />
          {loginState.buttonLabel}
        </button>

        <p className="max-w-sm text-center text-xs text-black/35">{loginState.description}</p>

        <button
          type="button"
          onClick={onUseMachineKeyInstead}
          className="mt-3 text-[11px] font-mono text-black/28 underline decoration-dotted underline-offset-2 hover:text-black/50"
        >
          Use machine key instead
        </button>

        <div className="mt-10 text-[10px] font-mono text-black/30">slock-daemon v0.1.0</div>
      </div>
    </DaemonWindowFrame>
  );
}

export function DaemonProviderSetup({
  currentServer,
  localEncryptionAvailable = true,
  existingProviderKinds,
  configuredProviderKinds,
  systemProviders,
  onAddProvider,
  onSkip,
}: DaemonProviderSetupProps) {
  const hasAvailableProviderKinds = existingProviderKinds.length < SUPPORTED_PROVIDER_KINDS.length;
  const setupState = buildProviderSetupState(localEncryptionAvailable, hasAvailableProviderKinds);

  return (
    <DaemonWindowFrame title="Slock Daemon — Setup">
      <div className="flex flex-col items-center justify-center px-8 py-12">
        <div className="mb-6 flex items-center gap-2 border-2 border-black bg-brutal-lime/30 px-4 py-2">
          <CheckCircle size={16} className="text-green-700" />
          <span className="text-sm font-bold">
            {currentServer
              ? `Connected to ${currentServer.name} as ${currentServer.accountLabel}`
              : "No active server selected"}
          </span>
        </div>

        <h2 className="mb-2 text-2xl font-bold">Add a Model Provider</h2>
        <p className="mb-8 max-w-md text-center text-sm text-black/60">
          {setupState.description}
          <span className="mt-1 block font-bold text-black/80">{setupState.emphasis}</span>
        </p>

        {systemProviders.length > 0 ? (
          <div className="mb-8 w-full max-w-lg">
            <SectionLabel>Detected on this machine</SectionLabel>
            <div className="space-y-3">
              {systemProviders.map((provider) => (
                <SystemProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          </div>
        ) : null}

        <div className="mb-6 w-full max-w-lg space-y-3">
          {PROVIDER_OPTIONS.map((provider) => {
            const optionState = getProviderSetupOptionState(
              provider.kind,
              existingProviderKinds,
              configuredProviderKinds,
              setupState.canAddProviders,
            );
            const disabled = optionState !== "available";

            return (
              <button
                key={provider.kind}
                type="button"
                disabled={disabled}
                onClick={() => onAddProvider?.(provider.kind)}
                className={`w-full border-2 border-black p-4 text-left transition-all duration-100 ${
                  disabled
                    ? "cursor-not-allowed bg-brutal-cream/60 opacity-70 shadow-brutal-sm"
                    : "bg-white shadow-brutal-sm hover:-translate-y-[1px] hover:shadow-brutal active:translate-x-[2px] active:translate-y-[2px] active:shadow-brutal-active"
                }`}
              >
                <div className="flex items-center gap-4">
                  <ProviderIcon initial={provider.initial} color={provider.color} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-bold">{provider.name}</div>
                      {provider.hasOAuth ? (
                        <span className="border border-black/20 bg-brutal-cyan/20 px-2 py-0.5 text-[10px] font-bold uppercase">
                          OAuth
                        </span>
                      ) : null}
                    </div>
                    <div className="font-mono text-xs text-black/50">{provider.desc}</div>
                  </div>
                  {optionState === "configured" ? (
                    <span className="border border-green-600/30 bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase text-green-800">
                      Added
                    </span>
                  ) : optionState === "pending" ? (
                    <span className="border border-brutal-orange/30 bg-brutal-orange/20 px-2 py-0.5 text-[10px] font-bold uppercase text-black/70">
                      Needs setup
                    </span>
                  ) : optionState === "unavailable" ? (
                    <span className="border border-black/20 bg-brutal-cream px-2 py-0.5 text-[10px] font-bold uppercase text-black/60">
                      Unavailable
                    </span>
                  ) : (
                    <ChevronRight size={16} className="text-black/40" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <button type="button" onClick={onSkip} className="text-sm font-bold text-black/40 underline hover:text-black">
          Skip provider setup
        </button>

        <div className="mt-8 flex max-w-md items-start gap-2 border-2 border-black/20 bg-brutal-cream/50 p-3">
          <Key size={14} className="mt-0.5 shrink-0 text-black/50" />
          <p className="text-[11px] leading-relaxed text-black/50">{setupState.helperText}</p>
        </div>
      </div>
    </DaemonWindowFrame>
  );
}

export function DaemonMachineKeyLogin({
  serverUrl,
  machineBootstrap,
  serverUrlLocked = false,
  onServerUrlChange,
  onMachineBootstrapChange,
  onImport,
  onBack,
}: DaemonMachineKeyLoginProps) {
  return (
    <DaemonWindowFrame title="Slock Daemon — Machine Key">
      <div className="flex flex-col items-center justify-center px-8 py-12">
        <div className="mb-6 inline-block -rotate-1 border-2 border-black bg-brutal-cream px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-widest shadow-brutal-sm">
          Advanced fallback
        </div>

        <h2 className="mb-2 text-2xl font-bold">Use a Machine Key</h2>
        <p className="mb-8 max-w-md text-center text-sm text-black/60">
          Paste a copied daemon bootstrap command or a raw machine key.
          <span className="mt-1 block text-black/45">
            This is the manual path. The normal path is still <span className="font-bold text-black/70">Login with Slock</span>.
          </span>
        </p>

        <div className="mb-4 w-full max-w-lg">
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-black/50">
            Server URL
          </label>
          <input
            type="text"
            className="input-brutal w-full text-sm font-mono disabled:cursor-not-allowed disabled:opacity-60"
            value={serverUrl}
            onChange={(event) => onServerUrlChange?.(event.target.value)}
            disabled={serverUrlLocked}
          />
        </div>

        <div className="w-full max-w-lg">
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-black/50">
            Machine key or bootstrap command
          </label>
          <textarea
            className="input-brutal min-h-[152px] w-full resize-y text-xs font-mono leading-relaxed"
            value={machineBootstrap}
            onChange={(event) => onMachineBootstrapChange?.(event.target.value)}
            placeholder="Paste a raw machine key or a full daemon bootstrap command here"
          />
        </div>

        <div className="mt-6 flex w-full max-w-lg flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onImport}
            disabled={!machineBootstrap.trim()}
            className="btn-brutal flex items-center justify-center gap-2 bg-brutal-yellow px-4 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Key size={16} />
            Continue with machine key
          </button>
          <button
            type="button"
            onClick={onBack}
            className="text-xs font-mono text-black/40 underline decoration-dotted underline-offset-2 hover:text-black/65"
          >
            Back
          </button>
        </div>

        <div className="mt-8 max-w-lg border-2 border-black/20 bg-brutal-cream/50 p-3 text-[11px] leading-relaxed text-black/50">
          This page is intentionally narrow. It does not open shell tools, local runtime panels, or multi-server controls.
        </div>
      </div>
    </DaemonWindowFrame>
  );
}

export function DaemonDashboard({
  currentServer,
  providerCount,
  providerActionLabel,
  providerBanner,
  machineState,
  runtimeState,
  agents = [],
  activityLog = DEFAULT_ACTIVITY_LOG,
  onOpenProviders,
  onOpenSlock,
  onOpenShell,
}: DaemonDashboardProps) {
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(
    agents.find((agent) => getAgentCardStatus(agent) === "running")?.id ?? agents[0]?.id ?? null,
  );
  const runningCount = agents.filter((agent) => getAgentCardStatus(agent) === "running").length;
  const noProviderConfigured = providerCount === 0;
  const recentActivity = activityLog.slice(0, 3);

  return (
    <DaemonWindowFrame title={`Slock Daemon — ${currentServer?.name ?? "Dashboard"}`}>
      <div className="flex h-[600px] flex-col bg-white">
        <DaemonTopBar
          currentServer={currentServer}
          showExternalLink
          onOpenProviders={onOpenProviders}
          onOpenShell={onOpenShell}
          onOpenSlock={onOpenSlock}
        />

        {providerBanner ? (
          <div className="flex items-center gap-2 border-b border-black/10 bg-brutal-orange/10 px-5 py-2 text-xs font-bold text-black/70">
            <AlertTriangle size={14} className="shrink-0" />
            <span>{providerBanner.message}</span>
            <button
              type="button"
              onClick={onOpenProviders}
              className="font-bold underline underline-offset-2 hover:text-black"
            >
              {providerBanner.actionLabel}
            </button>
          </div>
        ) : null}

        <div className="flex items-center gap-3 border-b-2 border-black px-5 py-3">
          <h2 className="text-lg font-bold">Agents</h2>
          <span className="border border-black bg-brutal-lime/40 px-2 py-0.5 text-[10px] font-mono font-bold">
            {runningCount} running
          </span>
          {hasMachineUpdate(machineState) ? (
            <span className="border border-black bg-brutal-orange/40 px-2 py-0.5 text-[10px] font-mono">
              update → {machineState?.latestDaemonVersion}
            </span>
          ) : null}
          {currentServer?.status === "needs_login" ? (
            <span className="border border-black bg-brutal-orange/40 px-2 py-0.5 text-[10px] font-mono">
              {currentServer.accountLabel}
            </span>
          ) : null}
          <button
            type="button"
            onClick={onOpenSlock}
            className="ml-auto text-[11px] font-mono font-bold text-black/45 underline underline-offset-2 hover:text-black"
          >
            Manage in Slock
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-white">
          {agents.length > 0 ? (
            agents.map((agent) => {
              const status = getAgentCardStatus(agent);
              const isExpanded = expandedAgentId === agent.id;

              return (
                <div key={agent.id} className={`${status === "stopped" && noProviderConfigured ? "opacity-65" : ""} border-b-2 border-black`}>
                  <button
                    type="button"
                    onClick={() => setExpandedAgentId((current) => (current === agent.id ? null : agent.id))}
                    className="flex w-full items-center gap-4 px-5 py-3 text-left"
                  >
                    <PixelAvatar avatarKey={getAgentAvatarKey(agent)} size={36} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-bold">{agent.displayName || agent.name}</span>
                        <AgentStatusBadge status={status} />
                      </div>
                      <div className="truncate text-[11px] text-black/45">{getAgentHeadline(agent)}</div>
                    </div>
                    <ChevronRight
                      size={16}
                      className={`shrink-0 text-black/35 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                    />
                  </button>

                  {isExpanded && recentActivity.length > 0 ? (
                    <div className="px-16 pb-4">
                      <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-black/30">Recent Activity</div>
                      <div className="space-y-1.5 text-[11px] text-black/55">
                        {recentActivity.map((entry) => (
                          <div key={entry.id} className="flex items-start gap-2">
                            <span className="font-mono text-black/30">✦</span>
                            <span>{entry.action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })
          ) : (
            <div className="flex h-full items-center justify-center px-8">
              <div className="w-full max-w-xl border-2 border-black bg-white p-6 shadow-brutal">
                <div className="mb-2 text-lg font-bold">
                  {runtimeState?.phase === "running" ? "No agents assigned yet" : "Embedded daemon not started"}
                </div>
                <p className="text-sm text-black/60">
                  {machineState
                    ? `Machine ${machineState.name} is attached. Assigned agents will appear here once this machine owns them.`
                    : "Finish connecting a machine, then start the embedded daemon to see assigned agents here."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={onOpenProviders} className="btn-brutal-sm bg-brutal-yellow px-3 py-2 text-xs">
                    {providerActionLabel}
                  </button>
                  <button type="button" onClick={onOpenSlock} className="btn-brutal-sm bg-white px-3 py-2 text-xs">
                    Open Slock
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t-2 border-black px-4 py-2 text-[10px] font-mono text-black/35">
          <span>slock-daemon v0.1.0</span>
          <span>
            {agents.length} agent{agents.length === 1 ? "" : "s"} · {runningCount} active
          </span>
        </div>
      </div>
    </DaemonWindowFrame>
  );
}

export function DaemonProviders({
  currentServer,
  agentCount,
  providers,
  systemProviders,
  localEncryptionAvailable = true,
  providerApiKeyDrafts = {},
  providerEndpointDrafts = {},
  onProviderApiKeyDraftChange,
  onProviderEndpointDraftChange,
  onGoToDashboard,
  onGoToSetup,
  onOpenSlock: _onOpenSlock,
  onOpenShell,
  onSaveProviderCredentials,
  onClearProviderCredentials,
  onRemoveProvider,
  onTestProvider,
}: DaemonProvidersProps) {
  const [editingProviderId, setEditingProviderId] = useState<string | null>(null);
  const configuredKinds = new Set(providers.map((provider) => provider.kind));
  const providerOnboardingAvailable =
    localEncryptionAvailable && providers.length < SUPPORTED_PROVIDER_KINDS.length;
  const availableOptions = PROVIDER_OPTIONS.filter((provider) => !configuredKinds.has(provider.kind));
  const visibleProviderCount = providers.length + systemProviders.length;

  return (
    <DaemonWindowFrame title={`Slock Daemon — ${currentServer?.name ?? "Providers"}`}>
      <div className="flex h-[600px] flex-col bg-white">
        <DaemonTopBar
          currentServer={currentServer}
          providersActive
          onGoToDashboard={onGoToDashboard}
          onOpenShell={onOpenShell}
        />

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {systemProviders.length > 0 ? (
            <section>
              <SectionLabel>Detected on this machine</SectionLabel>
              <div className="space-y-3">
                {systemProviders.map((provider) => (
                  <SystemProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            </section>
          ) : null}

          {providers.length > 0 ? (
            <section className={systemProviders.length > 0 ? "mt-6" : ""}>
              <SectionLabel>Configured</SectionLabel>
              <div className="space-y-3">
                {providers.map((provider) => {
                  const presentation = getProviderPresentation(provider.kind);
                  const runtimeSummary = buildProviderRuntimeSummary(provider, [...systemProviders, ...providers]);
                  const isEditing = editingProviderId === provider.id;

                  return (
                    <div key={provider.id} className="overflow-hidden border-2 border-black bg-white shadow-brutal-sm">
                      <div className="flex items-center gap-4 px-4 py-3">
                        <ProviderIcon initial={presentation.initial} color={presentation.color} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-lg font-bold">{provider.name}</span>
                            <ProviderStatusChip provider={provider} />
                          </div>
                          <div className="truncate text-[11px] font-mono text-black/45">
                            {provider.model} · {provider.keyHint} · {runtimeSummary}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onTestProvider?.(provider.id)}
                            disabled={!localEncryptionAvailable}
                            className="btn-brutal-sm flex items-center gap-1 bg-white px-2.5 py-1.5 text-[11px] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <RefreshCw size={12} />
                            Test
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingProviderId((current) => (current === provider.id ? null : provider.id))}
                            className="btn-brutal-sm flex items-center gap-1 bg-white px-2.5 py-1.5 text-[11px]"
                          >
                            <Settings size={12} />
                            Edit
                          </button>
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="grid gap-3 border-t-2 border-black bg-brutal-cream/40 px-4 py-3 md:grid-cols-[1fr,1fr,auto]">
                          <div>
                            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-black/50">
                              API Key
                            </label>
                            <input
                              type="password"
                              value={providerApiKeyDrafts[provider.id] ?? ""}
                              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                onProviderApiKeyDraftChange?.(provider.id, event.target.value)
                              }
                              placeholder={
                                provider.kind === "anthropic"
                                  ? "Paste Anthropic API key"
                                  : provider.kind === "openai"
                                    ? "Paste OpenAI API key"
                                    : "Paste compatible API key"
                              }
                              className="input-brutal w-full text-[11px] font-mono disabled:cursor-not-allowed disabled:opacity-50"
                              disabled={!localEncryptionAvailable}
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-black/50">
                              Endpoint
                            </label>
                            <input
                              type="text"
                              value={providerEndpointDrafts[provider.id] ?? provider.endpoint ?? ""}
                              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                onProviderEndpointDraftChange?.(provider.id, event.target.value)
                              }
                              placeholder={provider.kind === "custom" ? "https://your-endpoint/v1" : "Built-in endpoint"}
                              className="input-brutal w-full text-[11px] font-mono"
                              disabled={provider.kind !== "custom"}
                            />
                          </div>

                          <div className="flex flex-wrap items-end gap-2 md:justify-end">
                            <button
                              type="button"
                              onClick={() => onSaveProviderCredentials?.(provider.id)}
                              disabled={!localEncryptionAvailable}
                              className="btn-brutal-sm flex items-center gap-1 bg-brutal-yellow px-2.5 py-1.5 text-[11px] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Key size={12} />
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => onClearProviderCredentials?.(provider.id)}
                              disabled={!localEncryptionAvailable}
                              className="btn-brutal-sm flex items-center gap-1 bg-white px-2.5 py-1.5 text-[11px] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Trash2 size={12} />
                              Clear
                            </button>
                            <button
                              type="button"
                              onClick={() => onRemoveProvider?.(provider.id)}
                              className="btn-brutal-sm flex items-center gap-1 bg-white px-2.5 py-1.5 text-[11px] text-red-600"
                            >
                              <Trash2 size={12} />
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          <section className={providers.length > 0 ? "mt-6" : ""}>
            <SectionLabel>Add Provider</SectionLabel>
            <div className="space-y-3">
              {availableOptions.length > 0 ? (
                availableOptions.map((provider) => (
                  <button
                    key={provider.kind}
                    type="button"
                    onClick={onGoToSetup}
                    disabled={!providerOnboardingAvailable}
                    className="flex w-full items-center gap-4 border-2 border-black bg-white px-4 py-3 text-left shadow-brutal-sm disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <ProviderIcon initial={provider.initial} color={provider.color} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{provider.name}</span>
                        {provider.hasOAuth ? (
                          <span className="border border-black/20 bg-brutal-cyan/20 px-2 py-0.5 text-[10px] font-bold uppercase">
                            OAuth
                          </span>
                        ) : null}
                      </div>
                      <div className="truncate text-[11px] font-mono text-black/45">{provider.desc}</div>
                    </div>
                    <Plus size={16} className="shrink-0 text-black/35" />
                  </button>
                ))
              ) : (
                <div className="border-2 border-black/10 bg-brutal-cream/40 px-4 py-3 text-sm text-black/50">
                  All supported providers are already configured for this server.
                </div>
              )}
            </div>
          </section>

          <div className="mt-6 flex items-start gap-3 border-2 border-black/15 bg-brutal-cream/40 p-4">
            <Shield size={18} className="mt-0.5 shrink-0 text-black/35" />
            <p className="text-[11px] leading-relaxed text-black/45">
              {localEncryptionAvailable
                ? "API keys are encrypted in your OS keychain. They never leave your machine or reach the Slock server."
                : "Local secret encryption is unavailable in this environment, so provider API keys cannot be stored from the daemon app on this machine."}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t-2 border-black px-4 py-2 text-[10px] font-mono text-black/35">
          <span>slock-daemon v0.1.0</span>
          <span>
            {agentCount} agent{agentCount === 1 ? "" : "s"} · {visibleProviderCount} provider{visibleProviderCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </DaemonWindowFrame>
  );
}
