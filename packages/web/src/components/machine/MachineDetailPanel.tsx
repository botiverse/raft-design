import { useEffect, useRef, useState } from "react";
import { Trash2, Monitor, Cpu, HardDrive, Copy, Check, RefreshCw, FolderOpen, Play, Plus, Tag, X, Pencil, Square, RotateCcw } from "lucide-react";
import Modal from "../Modal";
import Banner from "../ui/Banner";
import { getRuntimeDisplayName, isDaemonOutdated, RUNTIMES } from "@slock-ai/shared";
import { useMachineStore, type Machine, type MachineWorkspaceEntry } from "../../store/machineStore";
import { resolveAgentDisplayState, useAgentStore } from "../../store/agentStore";
import { useServerStore } from "../../store/serverStore";
import { useNavigate } from "react-router-dom";
import { SIDEBAR_TAB_QUERY_PARAM, useAppNavigate, useMobileBack } from "../../hooks/useAppNavigate";
import { useServerPermissions } from "../../hooks/useServerPermissions";
import { getServerUrl } from "../../utils/server";
import { getComputerSetupCommand } from "../../utils/computerSetupCommand";
import ConfirmDialog from "../ConfirmDialog";
import CreateAgentDialog from "../agent/CreateAgentDialog";
import StatusDot from "../ui/StatusDot";
import PanelHeader from "../ui/PanelHeader";
import SectionEyebrow from "../ui/SectionEyebrow";
import SectionHeader from "../ui/SectionHeader";
import KeyValueRow from "../ui/KeyValueRow";
import { ExperimentalBadge } from "../ui/ExperimentalBadge";
import AvatarSlot from "../ui/AvatarSlot";
import SurfaceListItem from "../ui/SurfaceListItem";
import AvatarListRow from "../ui/AvatarListRow";
import CheckMarker from "../ui/CheckMarker";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const EMPTY_WORKSPACES: MachineWorkspaceEntry[] = [];
type CommandCopyTarget = "daemon" | "computer";

function WorkspacesSection({ machineId, canManageMachines }: { machineId: string; canManageMachines: boolean }) {
  const scanMachineWorkspaces = useMachineStore((s) => s.scanMachineWorkspaces);
  const deleteMachineWorkspace = useMachineStore((s) => s.deleteMachineWorkspace);
  const workspaces = useMachineStore((s) => s.machineWorkspaces[machineId]) ?? EMPTY_WORKSPACES;
  const loading = useMachineStore((s) => s.machineWorkspacesLoading[machineId]) ?? false;
  const [scanned, setScanned] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const deleteEntry = deleteTarget
    ? workspaces.find((w: MachineWorkspaceEntry) => w.directoryName === deleteTarget)
    : null;

  const handleScan = async () => {
    await scanMachineWorkspaces(machineId);
    setScanned(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMachineWorkspace(machineId, deleteTarget);
    setDeleteTarget(null);
  };

  const sortedWorkspaces = [...workspaces].sort((a: MachineWorkspaceEntry, b: MachineWorkspaceEntry) => {
    const order: Record<string, number> = { orphan: 0, deleted: 1, stopped: 2, active: 3 };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });

  const orphanCount = workspaces.filter((w: MachineWorkspaceEntry) => w.status === "orphan").length;
  const deletedCount = workspaces.filter((w: MachineWorkspaceEntry) => w.status === "deleted").length;

  return (
    <div>
      <SectionHeader
        className="mb-2"
        icon={<FolderOpen size={14} className="text-black" />}
        label="Agent Workspaces"
        action={
          <button
            onClick={handleScan}
            disabled={loading}
            className="btn-brutal-sm bg-white px-2 py-1 text-xs flex items-center gap-1"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            {loading ? "Scanning…" : scanned ? "Rescan" : "Scan"}
          </button>
        }
      />

      {!scanned && !loading && (
        <div className="text-xs text-black/40 italic">
          Click Scan to check for workspace directories on this computer.
        </div>
      )}

      {scanned && workspaces.length === 0 && (
        <div className="text-xs text-black/40 italic">
          No workspace directories found.
        </div>
      )}

      {scanned && orphanCount > 0 && (
        <Banner intent="warning" density="sm" className="mb-2">
          <strong>{orphanCount} orphaned</strong> workspace{orphanCount !== 1 ? "s" : ""} found
          — no matching agent record exists for these directories.
        </Banner>
      )}

      {scanned && deletedCount > 0 && (
        <div className="mb-2 border-2 border-black bg-gray-200 px-3 py-2 text-xs text-black">
          <strong>{deletedCount} deleted-agent</strong> workspace{deletedCount !== 1 ? "s" : ""} found
          — the agent is deleted but its files still remain on disk.
        </div>
      )}

      {sortedWorkspaces.length > 0 && (
        <div className="space-y-1.5">
          {sortedWorkspaces.map((ws: MachineWorkspaceEntry) => (
            <div
              key={ws.directoryName}
              className={`flex items-center gap-2 border-2 px-3 py-2 ${
                ws.status === "orphan"
                  ? "border-brutal-orange bg-brutal-orange/10"
                  : ws.status === "deleted"
                    ? "border-black bg-gray-100"
                    : "border-black/30"
              }`}
            >
              <FolderOpen size={14} className="shrink-0 text-black/40" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-black truncate">
                    {ws.agentName || ws.directoryName}
                  </span>
                  <span
                    className={`inline-block border border-black px-1.5 text-[10px] font-bold uppercase leading-4 ${
                      ws.status === "active"
                        ? "bg-brutal-lime"
                        : ws.status === "stopped"
                          ? "bg-gray-200"
                          : ws.status === "deleted"
                            ? "bg-gray-300"
                            : "bg-brutal-orange"
                    }`}
                  >
                    {ws.status}
                  </span>
                </div>
                <div className="mt-0.5 text-[10px] text-black/40 font-mono break-all">
                  ~/.slock/agents/{ws.directoryName}/
                </div>
                {ws.status === "deleted" && (
                  <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-black/60">
                    Agent deleted. Workspace retained on disk.
                  </div>
                )}
                {ws.status === "orphan" && (
                  <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-brutal-orange">
                    No matching agent record found.
                  </div>
                )}
                <div className="flex items-center gap-3 mt-0.5 text-[10px] text-black/50 font-mono">
                  <span>{formatSize(ws.totalSizeBytes)}</span>
                  <span>{ws.fileCount} files</span>
                  <span>
                    Modified{" "}
                    {new Date(ws.lastModified).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
              {canManageMachines && (
                <button
                  onClick={() => setDeleteTarget(ws.directoryName)}
                  className="shrink-0 btn-brutal-sm bg-white p-1"
                  title="Delete workspace"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Workspace"
          message={`Delete workspace for "${
            deleteEntry?.agentName || deleteTarget
          }"? This will permanently remove all workspace files (MEMORY.md, notes/, etc.) from the computer.`}
          confirmLabel="Delete Workspace"
          loadingLabel="Deleting…"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// Isolated component — subscribes to agentActivities only for agents on this machine,
// preventing activity changes from re-rendering the entire MachineDetailPanel.
function MachineAgentList({ machine, canManageMachines }: { machine: Machine; canManageMachines: boolean }) {
  const allAgents = useAgentStore((s) => s.agents);
  const agentActivities = useAgentStore((s) => s.agentActivities);
  const startAgent = useAgentStore((s) => s.startAgent);
  const stopAgent = useAgentStore((s) => s.stopAgent);
  const resetAgent = useAgentStore((s) => s.resetAgent);
  const nav = useAppNavigate();
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(() => new Set());
  const [bulkAction, setBulkAction] = useState<"start" | "stop" | "restart" | "session" | "full" | null>(null);
  const [bulkError, setBulkError] = useState("");
  const [showResetOptions, setShowResetOptions] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [bulkResetMode, setBulkResetMode] = useState<"restart" | "session" | "full">("restart");

  const machineAgents = allAgents.filter((a) => !a.deletedAt && a.machineId === machine.id);
  const selectedAgents = machineAgents.filter((a) => selectedAgentIds.has(a.id));
  const selectedOfflineAgents = selectedAgents.filter((a) => !resolveAgentDisplayState(a, agentActivities[a.id]).isOnline);
  const selectedOnlineAgents = selectedAgents.filter((a) => resolveAgentDisplayState(a, agentActivities[a.id]).isOnline);
  const machineAgentIdKey = machineAgents.map((a) => a.id).join("\0");
  const selectedCount = selectedAgents.length;
  const allSelected = machineAgents.length > 0 && selectedCount === machineAgents.length;
  const canStartLike = machine.status === "online";
  const bulkResetOptions: {
    mode: "restart" | "session" | "full";
    label: string;
    desc: string;
    selectedClass: string;
  }[] = [
    {
      mode: "restart",
      label: "Restart",
      desc: "Stop and restart the selected agents. Runtime sessions and workspace files are preserved.",
      selectedClass: "border-black bg-brutal-cyan/20 shadow-brutal-sm",
    },
    {
      mode: "session",
      label: "Reset Session & Restart",
      desc: "Clear runtime sessions and restart the selected agents. Workspace files are preserved.",
      selectedClass: "border-black bg-brutal-orange/20 shadow-brutal-sm",
    },
    {
      mode: "full",
      label: "Full Reset & Restart",
      desc: "Clear runtime sessions, delete workspace files, and restart the selected agents.",
      selectedClass: "border-black bg-brutal-red/20 shadow-brutal-sm",
    },
  ];

  useEffect(() => {
    const validIds = new Set(machineAgents.map((a) => a.id));
    setSelectedAgentIds((current) => {
      let changed = false;
      const next = new Set<string>();
      for (const id of current) {
        if (validIds.has(id)) {
          next.add(id);
        } else {
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, [machineAgentIdKey]);

  const toggleAgentSelection = (agentId: string) => {
    setSelectedAgentIds((current) => {
      const next = new Set(current);
      if (next.has(agentId)) next.delete(agentId);
      else next.add(agentId);
      return next;
    });
  };

  const selectAllAgents = () => {
    setSelectionMode(true);
    setSelectedAgentIds(new Set(machineAgents.map((a) => a.id)));
  };

  const clearSelection = () => {
    setSelectionMode(false);
    setSelectedAgentIds(new Set());
    setBulkError("");
  };

  const runBulkAction = async (action: "start" | "stop" | "restart" | "session" | "full") => {
    const targets =
      action === "start"
        ? selectedOfflineAgents
        : action === "stop"
          ? selectedOnlineAgents
          : selectedAgents;
    if (targets.length === 0) return;

    setBulkAction(action);
    setBulkError("");
    try {
      const results = await Promise.allSettled(
        targets.map((agent) => {
          if (action === "start") return startAgent(agent.id);
          if (action === "stop") return stopAgent(agent.id);
          return resetAgent(agent.id, action);
        })
      );
      const failed = results.filter((result) => result.status === "rejected").length;
      if (failed > 0) {
        setBulkError(`${failed} of ${targets.length} agent action${targets.length === 1 ? "" : "s"} failed. Try again or open an agent for details.`);
      } else {
        clearSelection();
        setShowResetOptions(false);
      }
    } finally {
      setBulkAction(null);
    }
  };

  return (
    <>
      <div>
        <SectionHeader
          className="mb-3 flex-wrap gap-y-2"
          label="Agents on this computer"
          count={machineAgents.length}
          action={
            <div className="flex items-center gap-1.5">
              {canManageMachines && machineAgents.length > 0 && (
                selectionMode ? (
                  <>
                    <button
                      type="button"
                      onClick={allSelected ? () => setSelectedAgentIds(new Set()) : selectAllAgents}
                      className="btn-brutal-sm bg-white px-2 py-1 text-xs flex items-center gap-1"
                    >
                      <Check size={12} />
                      {allSelected ? "Clear All" : "Select All"}
                    </button>
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="btn-brutal-sm bg-white px-2 py-1 text-xs flex items-center gap-1"
                    >
                      <X size={12} />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSelectionMode(true)}
                    className="btn-brutal-sm bg-white px-2 py-1 text-xs flex items-center gap-1"
                  >
                    <Check size={12} />
                    Select
                  </button>
                )
              )}
              {canManageMachines && !selectionMode && (
                <button
                  onClick={() => setShowCreateAgent(true)}
                  className="btn-brutal-sm bg-brutal-pink px-2 py-1 text-xs flex items-center gap-1"
                >
                  <Plus size={12} />
                  Create
                </button>
              )}
            </div>
          }
        />
        {machineAgents.length === 0 ? (
          <div className="text-sm text-black/40 italic">
            No agents assigned to this computer yet.
          </div>
        ) : (
          <div className="space-y-2">
            {canManageMachines && selectedCount > 0 && (
              <SurfaceListItem selected interactive={false} className="bg-gray-100 px-3 py-2">
                <div className="flex flex-wrap items-center gap-2">
                  <SectionEyebrow className="mr-auto !text-black">
                    {selectedCount} selected
                  </SectionEyebrow>
                  <button
                    type="button"
                    onClick={() => runBulkAction("start")}
                    disabled={bulkAction !== null || selectedOfflineAgents.length === 0 || !canStartLike}
                    className="btn-brutal-sm flex items-center gap-1 bg-brutal-lime px-2 py-1 text-xs disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-black/40"
                    title={!canStartLike ? "Computer must be online to start agents" : "Start selected offline agents"}
                  >
                    <Play size={12} />
                    {bulkAction === "start" ? "Starting…" : "Start"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowStopConfirm(true)}
                    disabled={bulkAction !== null || selectedOnlineAgents.length === 0}
                    className="btn-brutal-sm flex items-center gap-1 bg-white px-2 py-1 text-xs disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-black/40"
                    title="Stop selected online agents"
                  >
                    <Square size={12} />
                    Stop
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetOptions(true)}
                    disabled={bulkAction !== null || !canStartLike}
                    className="btn-brutal-sm flex items-center gap-1 bg-white px-2 py-1 text-xs disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-black/40"
                    title={!canStartLike ? "Computer must be online to restart or reset agents" : "Restart or reset selected agents"}
                  >
                    <RotateCcw size={12} />
                    Restart / Reset
                  </button>
                </div>
                {bulkError && (
                  <Banner intent="warning" density="sm" className="mt-2 font-bold">
                    {bulkError}
                  </Banner>
                )}
              </SurfaceListItem>
            )}
            {machineAgents.map((agent) => {
              const displayState = resolveAgentDisplayState(agent, agentActivities[agent.id]);
              const selected = selectedAgentIds.has(agent.id);
              const avatar = <AvatarSlot context="surface-list" type="agent" agentAvatarUrl={agent.avatarUrl} />;
              const rightStatus = (
                <>
                  <StatusDot activity={displayState.activity} title={displayState.activityText} />
                  <span className="hidden text-xs font-mono text-black/50 sm:inline">
                    {displayState.activityText}
                  </span>
                </>
              );
              if (selectionMode) {
                // Selection mode adds a leading CheckMarker column that
                // is outside AvatarListRow's slot contract. Keep the inline
                // SurfaceListItem here — the row body still mirrors the
                // primitive's avatar / name / subtitle / rightContent layout
                // so the visual is identical to the normal-mode AvatarListRow.
                return (
                  <SurfaceListItem
                    key={agent.id}
                    selected={canManageMachines && selected}
                    className={`group px-3 py-2 ${selected ? "" : "bg-gray-100 hover:bg-white"}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleAgentSelection(agent.id)}
                      className="flex w-full min-w-0 items-center gap-3 text-left"
                      title={selected ? "Deselect agent" : "Select agent"}
                      aria-label={selected ? `Deselect ${agent.displayName || agent.name}` : `Select ${agent.displayName || agent.name}`}
                    >
                      <CheckMarker
                        checked={selected}
                        size="lg"
                        tone="yellow-fill"
                        previewOnHover
                        className="mt-0"
                      />
                      {avatar}
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
                          <span className="truncate text-sm font-bold text-black">
                            {agent.displayName || agent.name}
                          </span>
                          <span className="text-xs font-mono text-black/50">
                            {getRuntimeDisplayName(agent.runtime)}
                          </span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">{rightStatus}</div>
                    </button>
                  </SurfaceListItem>
                );
              }
              return (
                <AvatarListRow
                  key={agent.id}
                  avatar={avatar}
                  name={agent.displayName || agent.name}
                  subtitle={getRuntimeDisplayName(agent.runtime)}
                  rightContent={rightStatus}
                  onClick={() => nav.toAgent(agent.id)}
                  selected={false}
                  className="bg-gray-100 hover:bg-white"
                />
              );
            })}
          </div>
        )}
      </div>

      {canManageMachines && showCreateAgent && (
        <CreateAgentDialog
          defaultMachineId={machine.id}
          onClose={() => setShowCreateAgent(false)}
        />
      )}

      {showResetOptions && (
        <Modal onClose={() => setShowResetOptions(false)}>
          <div className="w-full max-w-md card-brutal p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold uppercase">Restart {selectedCount} Agent{selectedCount === 1 ? "" : "s"}</h2>
              <button
                type="button"
                onClick={() => setShowResetOptions(false)}
                className="btn-brutal-sm bg-white p-1"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              {bulkResetOptions.map((opt) => (
                <button
                  key={opt.mode}
                  type="button"
                  onClick={() => setBulkResetMode(opt.mode)}
                  disabled={bulkAction !== null}
                  className={`w-full border-2 p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    bulkResetMode === opt.mode
                      ? opt.selectedClass
                      : "border-black/30 bg-white hover:border-black"
                  }`}
                >
                  <div className="text-sm font-bold uppercase">{opt.label}</div>
                  <p className="mt-1 text-xs text-black/60">{opt.desc}</p>
                </button>
              ))}
            </div>
            {bulkResetMode === "full" && (
              <Banner intent="warning" density="sm" withIcon className="mt-3 font-bold">
                Full reset permanently deletes workspace files including MEMORY.md and notes/. This cannot be undone.
              </Banner>
            )}
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowResetOptions(false)}
                className="btn-brutal bg-white px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => runBulkAction(bulkResetMode)}
                disabled={bulkAction !== null}
                className={`btn-brutal flex items-center gap-1.5 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60 ${
                  bulkResetMode === "full" ? "bg-brutal-red" : bulkResetMode === "session" ? "bg-brutal-orange" : "bg-brutal-cyan"
                }`}
              >
                <RotateCcw size={14} />
                {bulkAction ? "Restarting…" : bulkResetOptions.find((opt) => opt.mode === bulkResetMode)!.label}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showStopConfirm && (
        <ConfirmDialog
          title="Stop Agents"
          message={`Stop ${selectedOnlineAgents.length} selected online agent${selectedOnlineAgents.length === 1 ? "" : "s"}? They will stop processing messages.`}
          confirmLabel="Stop Agents"
          loadingLabel="Stopping…"
          confirmColor="bg-brutal-orange"
          onConfirm={() => runBulkAction("stop")}
          onClose={() => setShowStopConfirm(false)}
        />
      )}
    </>
  );
}

export default function MachineDetailPanel({ machine }: { machine: Machine }) {
  const deleteMachine = useMachineStore((s) => s.deleteMachine);
  const renameMachine = useMachineStore((s) => s.renameMachine);
  const rotateApiKey = useMachineStore((s) => s.rotateApiKey);
  const latestDaemonVersion = useMachineStore((s) => s.latestDaemonVersion);
  const allAgents = useAgentStore((s) => s.agents);
  const { capabilities } = useServerPermissions();
  const machineAgents = allAgents.filter((a) => !a.deletedAt && a.machineId === machine.id);
  const serverName = useServerStore((s) => s.current?.name) || "server";
  const serverSlug = useServerStore((s) => s.current?.slug);
  const navigate = useNavigate();
  const onMobileBack = useMobileBack(serverSlug ? `/s/${serverSlug}/settings` : "/");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState<CommandCopyTarget | null>(null);
  const [rotating, setRotating] = useState(false);
  const [editingName, setEditingName] = useState(false);
  // draftName is only read while editingName=true. handleStartRename seeds
  // it from machine.name before flipping editingName, so an empty initial
  // value never reaches the rendered input. Initializing with the prop
  // would freeze the mirror on first mount and is what react-doctor's
  // no-derived-useState guards against.
  const [draftName, setDraftName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  const serverUrl = getServerUrl();
  const savedKey = localStorage.getItem(`slock_machine_apikey_${machine.id}`);
  // Validate cached key against server's apiKeyPrefix to detect stale keys
  const isKeyValid = savedKey && machine.apiKeyPrefix && savedKey.startsWith(machine.apiKeyPrefix);
  if (savedKey && !isKeyValid) {
    localStorage.removeItem(`slock_machine_apikey_${machine.id}`);
  }
  const connectCommand = isKeyValid
    ? `npx @slock-ai/daemon@latest --server-url ${serverUrl} --api-key ${savedKey} # ${serverName}`
    : null;
  const computerSetupCommand = getComputerSetupCommand(serverSlug, import.meta.env.VITE_DEPLOYMENT_ENV, serverUrl, {
    legacyApiKey: isKeyValid ? savedKey : null,
  });
  const canManageMachines = capabilities.manageMachines;

  const handleDelete = async () => {
    await deleteMachine(machine.id);
    navigate("/");
  };

  const handleCopy = async (target: CommandCopyTarget, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedCommand(target);
    setTimeout(() => {
      setCopiedCommand((current) => (current === target ? null : current));
    }, 2000);
  };

  const handleRotateKey = async () => {
    setRotating(true);
    try {
      await rotateApiKey(machine.id);
    } catch {
      // handled in store
    } finally {
      setRotating(false);
    }
  };

  const handleStartRename = () => {
    setDraftName(machine.name);
    setNameError("");
    setEditingName(true);
  };

  const handleSaveRename = async () => {
    const nextName = draftName.trim();
    if (!nextName) {
      setNameError("Computer name is required");
      return;
    }
    if (nextName === machine.name) {
      setEditingName(false);
      setDraftName(machine.name);
      return;
    }
    setNameError("");
    setSavingName(true);
    try {
      await renameMachine(machine.id, nextName);
      setEditingName(false);
    } catch {
      setNameError("Failed to rename computer");
    } finally {
      setSavingName(false);
    }
  };

  const handleCancelRename = () => {
    setDraftName(machine.name);
    setNameError("");
    setEditingName(false);
  };

  const createdDate = new Date(machine.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PanelHeader
        title={machine.name}
        icon={<Monitor size={18} />}
        iconBg="bg-brutal-yellow text-black"
        iconAlwaysVisible
        onMobileBack={onMobileBack}
        mobileBackProps={{ "data-testid": "machine-mobile-back", title: "Back" }}
      />

      <div className="flex-1 overflow-y-auto bg-white">
        {/* Profile info — machine icon + name + status */}
        <div className="flex items-start gap-4 px-5 py-5 border-b border-black/10">
          <div className="flex size-16 shrink-0 items-center justify-center border-2 border-black bg-brutal-yellow text-black">
            <Monitor size={28} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="min-w-0 truncate text-lg font-bold leading-tight text-black" title={machine.name}>{machine.name}</div>
            <div className="flex min-w-0 items-center gap-2">
              <StatusDot
                tone={machine.status === "online" ? "bg-brutal-lime" : "bg-gray-400"}
                className="shrink-0"
              />
              <span className="shrink-0 text-sm text-black/60 font-mono">
                {machine.status === "online" ? "Connected" : "Offline"}
              </span>
            </div>
            {machine.hostname && (
              <div className="truncate text-sm text-black/50 font-mono" title={machine.hostname}>{machine.hostname}</div>
            )}
          </div>
        </div>

        {/* Name */}
        <div className="px-5 py-4 border-b border-black/10">
          <div className="flex items-center gap-2 mb-1">
            <SectionEyebrow as="div">
              Name
            </SectionEyebrow>
            {canManageMachines && !editingName && (
              <button
                type="button"
                onClick={handleStartRename}
                className="text-black/40 hover:text-black transition-colors"
                title="Edit computer name"
              >
                <Pencil size={12} />
              </button>
            )}
          </div>
          {canManageMachines && editingName ? (
            <div className="space-y-[5px]">
              <input
                ref={nameInputRef}
                value={draftName}
                onChange={(e) => {
                  setDraftName(e.target.value.replace(/[\r\n]+/g, " "));
                  if (nameError) setNameError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleSaveRename();
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    handleCancelRename();
                  }
                }}
                className="h-8 w-full border-2 border-black px-2 py-1 text-sm shadow-brutal-sm focus:outline-none focus:shadow-brutal-sm"
                placeholder="Computer name"
                autoFocus
                disabled={savingName}
              />
            <div className="flex items-center gap-1.5">
              <button
                  onClick={() => void handleSaveRename()}
                  disabled={savingName}
                  className="btn-brutal-sm bg-brutal-pink px-2 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelRename}
                  disabled={savingName}
                  className="btn-brutal-sm bg-white px-2 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                Cancel
              </button>
            </div>
            {nameError && (
              <div className="text-xs font-bold text-brutal-orange">
                {nameError}
              </div>
            )}
            </div>
          ) : (
            <p className="text-sm text-black">{machine.name}</p>
          )}
        </div>

        {/* Info */}
        <div className="px-5 py-4 border-b border-black/10">
          <SectionEyebrow as="div" className="mb-3">
            Info
          </SectionEyebrow>
          <div className="space-y-3">
            {/* OS */}
            {machine.os && <KeyValueRow label="OS" value={machine.os} mono />}
            {/* Version */}
            <KeyValueRow
              label="Daemon Version"
              value={
                machine.daemonVersion ? (
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-mono ${isDaemonOutdated(machine.daemonVersion, latestDaemonVersion) ? "text-brutal-orange font-bold" : "text-black"}`}>
                      v{machine.daemonVersion}
                    </span>
                    {isDaemonOutdated(machine.daemonVersion, latestDaemonVersion) && (
                      <span className="text-xs text-brutal-orange font-bold">(update available)</span>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-black/40 italic">—</span>
                )
              }
            />
            {/* Detected Runtimes */}
            <KeyValueRow
              label="Detected Runtimes"
              value={
                <div className="flex items-center gap-1.5 flex-wrap">
                  {RUNTIMES.map((r) => {
                    const detected = machine.runtimes.includes(r.id);
                    return (
                      <span
                        key={r.id}
                        className={`inline-block border-2 px-2 py-0.5 text-xs font-bold ${
                          detected
                            ? "border-black bg-brutal-cyan text-black"
                            : "border-black/30 bg-gray-100 text-black/40"
                        }`}
                      >
                        {r.displayName}{!detected && !r.supported ? " (coming soon)" : !detected ? " (not installed)" : ""}
                      </span>
                    );
                  })}
                </div>
              }
            />
            {/* Created */}
            <KeyValueRow label="Created" value={createdDate} mono />
          </div>
        </div>

        <div className="px-5 py-4 space-y-6">
          {/* Connect command (when offline) */}
          {machine.status === "offline" && (
            <div>
              {connectCommand && canManageMachines ? (
                <div>
                  <SectionEyebrow as="div" className="mb-2">
                    Connect Command
                  </SectionEyebrow>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 border-2 border-black bg-black text-brutal-lime px-3 py-1.5 font-mono text-xs break-all shadow-brutal-sm">
                      {connectCommand}
                    </code>
                    <button
                      onClick={() => handleCopy("daemon", connectCommand)}
                      className="btn-brutal-sm bg-white px-2 py-1.5"
                      title="Copy command"
                    >
                      {copiedCommand === "daemon" ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  {computerSetupCommand && (
                    <div className="mt-3">
                      <div className="mb-2 flex items-center gap-2">
                        <SectionEyebrow as="div">
                          Computer
                        </SectionEyebrow>
                        <ExperimentalBadge />
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 border-2 border-black bg-black text-brutal-lime px-3 py-1.5 font-mono text-xs break-all shadow-brutal-sm">
                          {computerSetupCommand}
                        </code>
                        <button
                          onClick={() => handleCopy("computer", computerSetupCommand)}
                          className="btn-brutal-sm bg-white px-2 py-1.5"
                          title="Copy Computer (experimental) command"
                        >
                          {copiedCommand === "computer" ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : canManageMachines ? (
                <div>
                  <SectionEyebrow as="div" className="mb-2">
                    Connection
                  </SectionEyebrow>
                  <button
                    onClick={handleRotateKey}
                    disabled={rotating}
                    className="btn-brutal bg-brutal-pink px-3 py-1.5 text-xs flex items-center gap-1.5"
                  >
                    <RefreshCw size={12} className={rotating ? "animate-spin" : ""} />
                    {rotating ? "Generating…" : "Generate Connect Command"}
                  </button>
                </div>
              ) : (
                <div>
                  <SectionEyebrow as="div" className="mb-2">
                    Connection
                  </SectionEyebrow>
                  <div className="text-xs text-black/40 font-mono">
                    Connect commands and API key rotation are admin-only.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Agents on this machine — isolated to prevent activity re-renders */}
          <MachineAgentList machine={machine} canManageMachines={canManageMachines} />

          {/* Agent Workspaces — only when machine is online */}
          {machine.status === "online" && (
            <div className="mt-2 border-t border-black/10 pt-4">
              <WorkspacesSection machineId={machine.id} canManageMachines={canManageMachines} />
            </div>
          )}

          {/* Actions */}
          {canManageMachines && (
            <div className="mt-2 border-t border-black/10 pt-4">
              <SectionEyebrow as="div" className="mb-3">
                Actions
              </SectionEyebrow>
              <div className="border-2 border-black bg-white shadow-brutal-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-black">Delete Computer</div>
                    <p className="text-xs text-black/60 mt-0.5">Permanently remove this computer. All agents must be deleted first.</p>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="btn-brutal bg-brutal-red px-4 py-2 text-sm font-bold flex items-center gap-1.5 shrink-0 ml-4"
                  >
                    <Trash2 size={14} />
                    Delete Computer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        machineAgents.length > 0 ? (
          <Modal onClose={() => setShowDeleteConfirm(false)}>
            <div className="w-full max-w-sm card-brutal p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold uppercase">Cannot Delete Computer</h2>
                <button onClick={() => setShowDeleteConfirm(false)} className="btn-brutal-sm bg-white p-1">
                  <X size={20} />
                </button>
              </div>
              <Banner intent="warning" withIcon className="mb-5">
                This computer has {machineAgents.length} agent{machineAgents.length > 1 ? "s" : ""} assigned. Remove all agents before deleting the computer.
              </Banner>
              <div className="flex justify-end">
                <button onClick={() => setShowDeleteConfirm(false)} className="btn-brutal bg-white px-4 py-2 text-sm">
                  OK
                </button>
              </div>
            </div>
          </Modal>
        ) : (
          <ConfirmDialog
            title="Delete Computer"
            message={`Are you sure you want to delete "${machine.name}"?`}
            confirmLabel="Delete Computer"
            loadingLabel="Deleting…"
            onConfirm={handleDelete}
            onClose={() => setShowDeleteConfirm(false)}
          />
        )
      )}

    </div>
  );
}
