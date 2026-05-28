import { useRef, useState } from "react";
import { X, Check, Search, Hash, Lock } from "lucide-react";
import { useAgentStore } from "../../store/agentStore";
import { useChannelStore } from "../../store/channelStore";
import { useServerStore } from "../../store/serverStore";
import { useAuthStore } from "../../store/authStore";
import { validateName, PLAN_CONFIG, getEffectiveLimits, type ServerPlan } from "@slock-ai/shared";
import { useAppNavigate } from "../../hooks/useAppNavigate";
import { useServerPermissions } from "../../hooks/useServerPermissions";
import Modal from "../Modal";
import Banner from "../ui/Banner";
import SectionEyebrow from "../ui/SectionEyebrow";
import AvatarSlot from "../ui/AvatarSlot";
import SegmentedControl from "../ui/SegmentedControl";
import FormField from "../ui/FormField";

interface ArchivedCollision {
  archivedChannelId: string;
  archivedChannelName: string;
}

interface PrefillProps {
  /** Prefilled values from an action card (per #proj-approval msg=40cb9342). */
  prefilledName?: string;
  prefilledDescription?: string;
  prefilledVisibility?: "public" | "private";
  prefilledAgentIds?: string[];
  prefilledHumanIds?: string[];
  /** Fired after successful create — used by ActionCard to mark-executed. */
  onCreated?: (channel: { id: string; name: string }) => void;
  /**
   * Action-card funnel hook: fired right before the create API call (after
   * client-side validation passes). Records `execute_attempt` for the
   * dialog-driven path. No-op for non-card launches.
   */
  onSubmitStart?: () => void;
  /**
   * Action-card funnel hook: fired when the create API throws. Records
   * `execute_fail`. Receives the raw error so the caller can classify.
   */
  onSubmitError?: (err: unknown) => void;
}

export default function CreateChannelDialog({
  onClose,
  prefilledName,
  prefilledDescription,
  prefilledVisibility,
  prefilledAgentIds,
  prefilledHumanIds,
  onCreated,
  onSubmitStart,
  onSubmitError,
}: {
  onClose: () => void;
} & PrefillProps) {
  const [name, setName] = useState(prefilledName ?? "");
  const [description, setDescription] = useState(prefilledDescription ?? "");
  const [memberSearch, setMemberSearch] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">(prefilledVisibility ?? "public");
  const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(new Set(prefilledAgentIds ?? []));
  const [selectedHumanIds, setSelectedHumanIds] = useState<Set<string>>(new Set(prefilledHumanIds ?? []));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [archivedCollision, setArchivedCollision] = useState<ArchivedCollision | null>(null);
  const [unarchiving, setUnarchiving] = useState(false);
  const submitInFlightRef = useRef(false);
  const allAgents = useAgentStore((s) => s.agents);
  const agents = allAgents.filter((a) => !a.deletedAt);
  const members = useServerStore((s) => s.members);
  const currentUser = useAuthStore((s) => s.user);
  const createChannel = useChannelStore((s) => s.createChannel);
  const unarchiveChannel = useChannelStore((s) => s.unarchiveChannel);
  const channels = useChannelStore((s) => s.channels);
  const { capabilities } = useServerPermissions();
  const nav = useAppNavigate();

  const plan = (useServerStore((s) => s.current?.plan) || "free") as ServerPlan;
  const maxChannels = getEffectiveLimits(plan).maxChannels;
  const atLimit = maxChannels !== -1 && channels.length >= maxChannels;

  // Exclude self from selectable humans (creator auto-joins)
  const selectableHumans = members.filter((m) => m.userId !== currentUser?.id);
  const normalizedMemberSearch = memberSearch.trim().toLowerCase();
  const filteredAgents = agents.filter((agent) => {
    if (!normalizedMemberSearch) return true;
    const name = (agent.displayName || agent.name).toLowerCase();
    return name.includes(normalizedMemberSearch);
  });
  const filteredHumans = selectableHumans.filter((human) => {
    if (!normalizedMemberSearch) return true;
    const name = (human.displayName || human.name).toLowerCase();
    return name.includes(normalizedMemberSearch);
  });
  const hasFilteredMembers = filteredAgents.length > 0 || filteredHumans.length > 0;

  const toggleAgent = (agentId: string) => {
    setSelectedAgentIds((prev) => {
      const next = new Set(prev);
      if (next.has(agentId)) {
        next.delete(agentId);
      } else {
        next.add(agentId);
      }
      return next;
    });
  };

  const toggleHuman = (userId: string) => {
    setSelectedHumanIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitInFlightRef.current) return;
    setError("");
    setArchivedCollision(null);
    const nameError = validateName(name, "Channel name");
    if (nameError) {
      setError(nameError);
      return;
    }
    submitInFlightRef.current = true;
    setSubmitting(true);
    // Funnel hook: dialog-driven `execute_attempt` (action-card flow only).
    onSubmitStart?.();
    try {
      const channel = await createChannel(
        name.trim(),
        description.trim() || undefined,
        {
          visibility,
          agentIds: [...selectedAgentIds],
          userIds: [...selectedHumanIds],
        }
      );
      onCreated?.({ id: channel.id, name: channel.name });
      onClose();
      nav.toChannel(channel.id);
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: {
          data?: {
            error?: string;
            code?: string;
            archivedChannelId?: string;
            archivedChannelName?: string;
          };
        };
      };
      const body = axiosErr.response?.data;
      if (body?.code === "archived_name_collision" && body.archivedChannelId && body.archivedChannelName) {
        setArchivedCollision({
          archivedChannelId: body.archivedChannelId,
          archivedChannelName: body.archivedChannelName,
        });
      } else {
        setError(body?.error || "Failed to create channel");
      }
      // Funnel hook: dialog-driven `execute_fail`. Fired for both archived-
      // collision and generic errors — both are the same product event
      // ("user submitted, server rejected"). Caller classifies.
      onSubmitError?.(err);
    } finally {
      submitInFlightRef.current = false;
      setSubmitting(false);
    }
  };

  const handleUnarchiveCollision = async () => {
    if (!archivedCollision) return;
    setUnarchiving(true);
    try {
      const channel = await unarchiveChannel(archivedCollision.archivedChannelId);
      onClose();
      nav.toChannel(channel.id);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || "Failed to unarchive channel");
    } finally {
      setUnarchiving(false);
    }
  };

  const hasMembers = agents.length > 0 || selectableHumans.length > 0;

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-md card-brutal p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase">Create Channel</h2>
          <button onClick={onClose} className="btn-brutal-sm bg-white p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {atLimit && (
            <div className="border-2 border-black bg-brutal-orange p-3 text-sm text-black font-bold">
              Channel limit reached ({channels.length}/{maxChannels} on {PLAN_CONFIG[plan].displayName} plan).{" "}
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
            </Banner>
          )}
          {archivedCollision && (
            <Banner intent="warning" className="space-y-2">
              <p className="font-bold">
                The name <span className="font-mono">#{archivedCollision.archivedChannelName}</span> is held by an archived channel.
              </p>
              <p className="text-xs text-black/70">
                {capabilities.manageChannels
                  ? "Unarchive it to keep its history, or choose a different name."
                  : "Pick a different name, or ask an admin to unarchive it."}
              </p>
              <div className="flex flex-wrap gap-2">
                {capabilities.manageChannels && (
                  <button
                    type="button"
                    onClick={handleUnarchiveCollision}
                    disabled={unarchiving}
                    className="btn-brutal-sm bg-brutal-lime px-2 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {unarchiving ? "Unarchiving…" : "Unarchive"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setArchivedCollision(null);
                    setName("");
                  }}
                  className="btn-brutal-sm bg-white px-2 py-1 text-xs"
                >
                  Change name
                </button>
              </div>
            </Banner>
          )}
          <FormField label="Name" required>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-brutal w-full"
              placeholder="e.g. ai-research"
              required
              autoFocus
            />
          </FormField>
          <FormField label="Description" optional>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-brutal w-full"
              placeholder="What is this channel about?"
              rows={2}
            />
          </FormField>
          <FormField label="Visibility">
            <SegmentedControl
              value={visibility}
              onChange={setVisibility}
              ariaLabel="Channel visibility"
              options={[
                { value: "public", label: "Public", icon: <Hash size={12} /> },
                { value: "private", label: "Private", icon: <Lock size={12} /> },
              ]}
            />
          </FormField>
          <FormField label="Members" optional>
            {hasMembers ? (
              <div className="space-y-2">
                <div className="relative">
                  <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="input-brutal w-full pl-9 text-sm"
                    placeholder="Search members by name"
                  />
                </div>

                <div className="border-2 border-black bg-white shadow-brutal-sm max-h-48 overflow-y-auto">
                  {/* Agents section */}
                  {filteredAgents.length > 0 && (
                    <>
                      <SectionEyebrow as="div" className="px-3 py-1.5 bg-white/50">
                        Agents
                      </SectionEyebrow>
                      {filteredAgents.map((agent) => {
                        const selected = selectedAgentIds.has(agent.id);
                        return (
                          <button
                            key={agent.id}
                            type="button"
                            onClick={() => toggleAgent(agent.id)}
                            className={`flex w-full items-center gap-2 px-3 py-1.5 text-sm font-medium text-black transition-colors ${
                              selected ? "bg-brutal-pink/20" : "hover:bg-brutal-yellow"
                            }`}
                          >
                            <AvatarSlot context="sidebar-list" type="agent" agentAvatarUrl={agent.avatarUrl} />
                            <span className="flex-1 text-left truncate">{agent.displayName || agent.name}</span>
                            {selected && <Check size={14} className="shrink-0 text-brutal-pink" />}
                          </button>
                        );
                      })}
                    </>
                  )}

                  {/* Humans section */}
                  {filteredHumans.length > 0 && (
                    <>
                      <SectionEyebrow as="div" className="px-3 py-1.5 bg-white/50">
                        Humans
                      </SectionEyebrow>
                      {filteredHumans.map((human) => {
                        const selected = selectedHumanIds.has(human.userId);
                        return (
                          <button
                            key={human.userId}
                            type="button"
                            onClick={() => toggleHuman(human.userId)}
                            className={`flex w-full items-center gap-2 px-3 py-1.5 text-sm font-medium text-black transition-colors ${
                              selected ? "bg-brutal-pink/20" : "hover:bg-brutal-yellow"
                            }`}
                          >
                            <AvatarSlot context="sidebar-list" type="human" humanPlaceholder />
                            <span className="flex-1 text-left truncate">{human.displayName || human.name}</span>
                            {selected && <Check size={14} className="shrink-0 text-brutal-pink" />}
                          </button>
                        );
                      })}
                    </>
                  )}

                  {!hasFilteredMembers && (
                    <div className="px-3 py-4 text-sm text-black/50 font-mono text-center">
                      No matches for "{memberSearch.trim()}"
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-sm text-black/50 font-mono">No members available</div>
            )}
          </FormField>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn-brutal bg-white px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={atLimit || submitting}
              className="btn-brutal bg-brutal-pink px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating…" : "Create Channel"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
