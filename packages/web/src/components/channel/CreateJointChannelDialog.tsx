import { useRef, useState } from "react";
import { Check, GitBranch, Search, X } from "lucide-react";
import { validateName } from "@slock-ai/shared";
import { useAgentStore } from "../../store/agentStore";
import { useAuthStore } from "../../store/authStore";
import { useChannelStore } from "../../store/channelStore";
import { useServerStore } from "../../store/serverStore";
import { useAppNavigate } from "../../hooks/useAppNavigate";
import AvatarSlot from "../ui/AvatarSlot";
import Banner from "../ui/Banner";
import FormField from "../ui/FormField";
import SectionEyebrow from "../ui/SectionEyebrow";
import SlugInput from "../ui/SlugInput";
import Modal from "../Modal";

interface ArchivedCollision {
  archivedChannelId: string;
  archivedChannelName: string;
}

export default function CreateJointChannelDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetServerSlug, setTargetServerSlug] = useState("");
  const [invitedPeopleText, setInvitedPeopleText] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(new Set());
  const [selectedHumanIds, setSelectedHumanIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [archivedCollision, setArchivedCollision] = useState<ArchivedCollision | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submitInFlightRef = useRef(false);
  const createChannel = useChannelStore((s) => s.createChannel);
  const unarchiveChannel = useChannelStore((s) => s.unarchiveChannel);
  const allAgents = useAgentStore((s) => s.agents);
  const agents = allAgents.filter((agent) => !agent.deletedAt);
  const members = useServerStore((s) => s.members);
  const currentUser = useAuthStore((s) => s.user);
  const nav = useAppNavigate();

  const selectableHumans = members.filter((member) => member.userId !== currentUser?.id);
  const normalizedMemberSearch = memberSearch.trim().toLowerCase();
  const filteredAgents = agents.filter((agent) => {
    if (!normalizedMemberSearch) return true;
    return (agent.displayName || agent.name).toLowerCase().includes(normalizedMemberSearch);
  });
  const filteredHumans = selectableHumans.filter((human) => {
    if (!normalizedMemberSearch) return true;
    return (human.displayName || human.name).toLowerCase().includes(normalizedMemberSearch);
  });
  const hasMembers = agents.length > 0 || selectableHumans.length > 0;
  const hasFilteredMembers = filteredAgents.length > 0 || filteredHumans.length > 0;

  const toggleAgent = (agentId: string) => {
    setSelectedAgentIds((prev) => {
      const next = new Set(prev);
      if (next.has(agentId)) next.delete(agentId);
      else next.add(agentId);
      return next;
    });
  };

  const toggleHuman = (userId: string) => {
    setSelectedHumanIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitInFlightRef.current) return;
    setError("");
    setArchivedCollision(null);

    const nameError = validateName(name, "Channel name");
    if (nameError) {
      setError(nameError);
      return;
    }
    if (!targetServerSlug.trim()) {
      setError("Invite server slug is required");
      return;
    }
    const invitedPeople = invitedPeopleText
      .split(/[\n,]+/)
      .map((person) => person.trim())
      .filter(Boolean);
    if (invitedPeople.length === 0) {
      setError("At least one invited person is required");
      return;
    }

    submitInFlightRef.current = true;
    setSubmitting(true);
    try {
      const channel = await createChannel(name.trim(), description.trim() || undefined, {
        visibility: "joint",
        targetServerSlug: targetServerSlug.trim(),
        agentIds: [...selectedAgentIds],
        userIds: [...selectedHumanIds],
        invitedPeople,
      });
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
        setError(body?.error || "Failed to create joint channel");
      }
    } finally {
      submitInFlightRef.current = false;
      setSubmitting(false);
    }
  };

  const handleUnarchiveCollision = async () => {
    if (!archivedCollision) return;
    setSubmitting(true);
    try {
      const channel = await unarchiveChannel(archivedCollision.archivedChannelId);
      onClose();
      nav.toChannel(channel.id);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || "Failed to unarchive channel");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-md card-brutal p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <GitBranch size={18} className="shrink-0" />
            <h2 className="truncate text-lg font-bold uppercase">Create Joint Channel</h2>
          </div>
          <button onClick={onClose} className="btn-brutal-sm bg-white p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Banner intent="warning" className="font-bold">
              {error}
            </Banner>
          )}
          {archivedCollision && (
            <Banner intent="warning" className="space-y-2">
              <p className="font-bold">
                The name <span className="font-mono">#{archivedCollision.archivedChannelName}</span> is held by an archived channel.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleUnarchiveCollision}
                  disabled={submitting}
                  className="btn-brutal-sm bg-brutal-lime px-2 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Unarchive
                </button>
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
              onChange={(event) => setName(event.target.value)}
              className="input-brutal w-full"
              placeholder="e.g. partner-launch"
              required
              autoFocus
            />
          </FormField>

          <FormField label="Description" optional>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="input-brutal w-full"
              placeholder="What will both servers use this channel for?"
              rows={2}
            />
          </FormField>

          <FormField label="Invite server slug" required>
            <SlugInput
              type="text"
              value={targetServerSlug}
              onChange={(event) => setTargetServerSlug(event.target.value)}
              placeholder="partner-workspace"
              required
            />
            <p className="mt-1 text-xs text-black/50">
              This chooses the server. The invite itself is sent only to the people below.
            </p>
          </FormField>

          <FormField label="Invited people" required>
            <textarea
              value={invitedPeopleText}
              onChange={(event) => setInvitedPeopleText(event.target.value)}
              className="input-brutal w-full"
              placeholder="alice@example.com, @partner-admin"
              rows={2}
              required
            />
            <p className="mt-1 text-xs text-black/50">
              Enter handles or emails from the invited server. At least one person must be invited.
            </p>
          </FormField>

          <FormField label="Current server members" optional>
            {hasMembers ? (
              <div className="space-y-2">
                <div className="relative">
                  <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(event) => setMemberSearch(event.target.value)}
                    className="input-brutal w-full pl-9 text-sm"
                    placeholder="Search members by name"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto border-2 border-black bg-white shadow-brutal-sm">
                  {filteredAgents.length > 0 && (
                    <>
                      <SectionEyebrow as="div" className="bg-white/50 px-3 py-1.5">
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
                            <span className="flex-1 truncate text-left">{agent.displayName || agent.name}</span>
                            {selected && <Check size={14} className="shrink-0 text-brutal-pink" />}
                          </button>
                        );
                      })}
                    </>
                  )}

                  {filteredHumans.length > 0 && (
                    <>
                      <SectionEyebrow as="div" className="bg-white/50 px-3 py-1.5">
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
                            <span className="flex-1 truncate text-left">{human.displayName || human.name}</span>
                            {selected && <Check size={14} className="shrink-0 text-brutal-pink" />}
                          </button>
                        );
                      })}
                    </>
                  )}

                  {!hasFilteredMembers && (
                    <div className="px-3 py-4 text-center font-mono text-sm text-black/50">
                      No matches for "{memberSearch.trim()}"
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="font-mono text-sm text-black/50">No members available</div>
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
              disabled={submitting}
              className="btn-brutal bg-brutal-pink px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating…" : "Create Joint Channel"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
