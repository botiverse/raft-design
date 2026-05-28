import { type ReactNode, useState } from "react";
import { Users, Plus, X, Search } from "lucide-react";
import { useAgentDisplayState, useAgentStore } from "../../store/agentStore";
import type { AgentActivity } from "@slock-ai/shared";
import type { Agent } from "../../store/agentStore";
import { useChannelStore } from "../../store/channelStore";
import { useServerStore } from "../../store/serverStore";
import { useChannelMembers } from "../../hooks/useChannelMembers";
import { useProfileStore } from "../../store/profileStore";
import { useServerPermissions } from "../../hooks/useServerPermissions";
import AvatarSlot from "../ui/AvatarSlot";
import SectionEyebrow from "../ui/SectionEyebrow";
import FormField from "../ui/FormField";
import AgentActivityDot from "./AgentActivityDot";
import {
  ChannelMemberListShell,
  ChannelMemberRemoveButton,
  ChannelMemberRow,
  ChannelMemberSectionHeader,
} from "../channel/ChannelMemberList";
import ConfirmDialog from "../ConfirmDialog";
import Modal from "../Modal";
import Button from "../ui/Button";
import { primeHumanProfileFromChannelMember, setCachedAgentProfile } from "../profile/profileFallbackCache";

function agentStatusFallbackActivity(status: Agent["status"]): AgentActivity {
  return status === "active" ? "online" : "offline";
}

function AgentActivityInfo({ agentId, fallbackStatus }: { agentId: string; fallbackStatus: Agent["status"] }) {
  const displayState = useAgentDisplayState(agentId, { status: fallbackStatus });
  return (
    <div className="text-xs text-black/50 font-mono truncate">
      {displayState.activityText}
    </div>
  );
}

function JointPeerBadge({ label }: { label: string }) {
  return (
    <span className="inline-block max-w-full truncate border border-black bg-brutal-cyan/25 px-1 font-mono text-[10px] font-bold uppercase leading-4 text-black">
      {label}
    </span>
  );
}

function MemberSecondary({
  primary,
  jointPeerLabel,
}: {
  primary?: ReactNode;
  jointPeerLabel?: string | null;
}) {
  if (!jointPeerLabel) return primary || null;
  return (
    <div className="min-w-0 space-y-0.5">
      {primary}
      <JointPeerBadge label={jointPeerLabel} />
    </div>
  );
}

export default function ChannelMembers({ channelId }: { channelId: string }) {
  const agents = useAgentStore((s) => s.agents);
  const channels = useChannelStore((s) => s.channels);
  const currentChannel = channels.find((c) => c.id === channelId) ?? null;
  const serverMembers = useServerStore((s) => s.members);
  const { channelAgents, channelHumans, addAgent, removeAgent, addHuman, removeHuman } = useChannelMembers(channelId);
  const openProfile = useProfileStore((s) => s.openProfile);
  const [showPanel, setShowPanel] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [removeTarget, setRemoveTarget] = useState<{ type: "agent" | "human"; id: string; name: string } | null>(null);

  const isAllChannel = currentChannel?.name === "all" && currentChannel?.type === "channel";
  const isLocalMember = (serverId?: string) =>
    !currentChannel?.serverId || !serverId || serverId === currentChannel.serverId;
  const jointPeerLabel = (serverId?: string, serverName?: string | null, serverSlug?: string | null) =>
    currentChannel?.type === "joint" && !isLocalMember(serverId)
      ? serverName || serverSlug || null
      : null;
  const totalParticipants = channelAgents.length + channelHumans.length;
  const { capabilities } = useServerPermissions();
  const canManageChannel = capabilities.manageChannels;

  const channelAgentIds = new Set(channelAgents.map((a) => a.id));
  const channelHumanIds = new Set(channelHumans.map((h) => h.id));
  const availableAgents = agents.filter((a) => !a.deletedAt && !channelAgentIds.has(a.id));
  const availableHumans = serverMembers.filter((m) => !channelHumanIds.has(m.userId));
  const hasAvailable = availableAgents.length > 0 || availableHumans.length > 0;
  const normalizedMemberSearch = memberSearch.trim().toLowerCase();
  const filteredAgents = availableAgents.filter((agent) => {
    if (!normalizedMemberSearch) return true;
    const name = (agent.displayName || agent.name).toLowerCase();
    return name.includes(normalizedMemberSearch);
  });
  const filteredHumans = availableHumans.filter((human) => {
    if (!normalizedMemberSearch) return true;
    const name = (human.displayName || human.name).toLowerCase();
    return name.includes(normalizedMemberSearch);
  });
  const hasFilteredResults = filteredAgents.length > 0 || filteredHumans.length > 0;

  return (
    <>
      {/* Member count button in header */}
      <Button
        onClick={() => setShowPanel(true)}
        shape="iconText"
        className="min-w-7 gap-1 px-1.5"
        title="View participants"
      >
        <Users size={14} className="shrink-0" />
        <span className="min-w-[1ch] text-center font-mono text-[11px] font-bold leading-none tabular-nums">
          {totalParticipants > 99 ? "99+" : totalParticipants}
        </span>
      </Button>

      {/* Members modal panel */}
      {showPanel && (
        <Modal onClose={() => { setShowPanel(false); setShowAddSection(false); setMemberSearch(""); }}>
          <div className="w-full max-w-sm card-brutal p-6">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold uppercase">
                Members ({totalParticipants})
              </h2>
              <button
                onClick={() => { setShowPanel(false); setShowAddSection(false); setMemberSearch(""); }}
                className="btn-brutal-sm bg-white p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Member list */}
            <ChannelMemberListShell>
              {/* Agents section */}
              {channelAgents.length > 0 && (
                <>
                  <ChannelMemberSectionHeader>Agents</ChannelMemberSectionHeader>
                  {channelAgents.map((agent) => {
                    const canRemoveAgent = isLocalMember(agent.serverId);
                    const peerLabel = jointPeerLabel(agent.serverId, agent.serverName, agent.serverSlug);
                    return (
                      <ChannelMemberRow
                        key={agent.id}
                        type="agent"
                        agentId={agent.id}
                        agentAvatarUrl={agent.avatarUrl}
                        agentFallbackActivity={agentStatusFallbackActivity(agent.status)}
                        name={(
                          <span className="flex min-w-0 items-center gap-1.5">
                            <span className="truncate">{agent.displayName || agent.name}</span>
                            {peerLabel && <JointPeerBadge label={peerLabel} />}
                          </span>
                        )}
                        secondary={(
                          <MemberSecondary
                            primary={<AgentActivityInfo agentId={agent.id} fallbackStatus={agent.status} />}
                          />
                        )}
                        onAvatarClick={() => {
                          setCachedAgentProfile(agent);
                          setShowPanel(false);
                          openProfile("agent", agent.id);
                        }}
                        trailing={!isAllChannel && canManageChannel && canRemoveAgent ? (
                          <ChannelMemberRemoveButton
                            label={`Remove ${agent.name}`}
                            onClick={() => setRemoveTarget({ type: "agent", id: agent.id, name: agent.displayName || agent.name })}
                          />
                        ) : null}
                      />
                    );
                  })}
                </>
              )}

              {/* Humans section */}
              {channelHumans.length > 0 && (
                <>
                  <ChannelMemberSectionHeader>Humans</ChannelMemberSectionHeader>
                  {channelHumans.map((human) => {
                    const canRemoveHuman = isLocalMember(human.serverId);
                    const peerLabel = jointPeerLabel(human.serverId, human.serverName, human.serverSlug);
                    return (
                      <ChannelMemberRow
                        key={human.id}
                        type="human"
                        humanAvatarUrl={human.avatarUrl}
                        gravatarHash={human.gravatarHash}
                        name={(
                          <span className="flex min-w-0 items-center gap-1.5">
                            <span className="truncate">{human.displayName || human.name}</span>
                            {peerLabel && <JointPeerBadge label={peerLabel} />}
                          </span>
                        )}
                        secondary={(
                          <MemberSecondary
                            primary={human.description ? <div className="truncate">{human.description}</div> : undefined}
                          />
                        )}
                        onAvatarClick={() => {
                          if (currentChannel?.serverId) {
                            primeHumanProfileFromChannelMember(currentChannel.serverId, human);
                          }
                          setShowPanel(false);
                          openProfile("human", human.id);
                        }}
                        trailing={!isAllChannel && canManageChannel && canRemoveHuman ? (
                          <ChannelMemberRemoveButton
                            label={`Remove ${human.displayName || human.name}`}
                            onClick={() => setRemoveTarget({ type: "human", id: human.id, name: human.displayName || human.name })}
                          />
                        ) : null}
                      />
                    );
                  })}
                </>
              )}

              {totalParticipants === 0 && (
                <div className="px-3 py-4 text-sm text-black/50 font-mono text-center">
                  No members
                </div>
              )}
            </ChannelMemberListShell>

            {/* Action buttons (hidden for #all) */}
            {!isAllChannel && canManageChannel && (
              <div className="mt-4">
                <button
                  onClick={() => setShowAddSection(true)}
                  disabled={!hasAvailable}
                  className="btn-brutal flex w-full items-center justify-center gap-1.5 bg-brutal-pink px-3 py-1.5 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={14} />
                  Add Member
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Add Member modal (stacked on top of Members modal) */}
      {showAddSection && (
        <Modal onClose={() => setShowAddSection(false)} layer={1}>
          <div className="w-full max-w-sm card-brutal p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold uppercase">Add Member</h2>
              <button
                onClick={() => { setShowAddSection(false); setMemberSearch(""); }}
                className="btn-brutal-sm bg-white p-1"
              >
                <X size={20} />
              </button>
            </div>

            {hasAvailable && (
              <FormField label="Search" className="mb-3">
                <div className="relative">
                  <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="input-brutal w-full pl-9 text-sm"
                    placeholder="Name"
                    autoFocus
                  />
                </div>
              </FormField>
            )}

            <div className="border-2 border-black bg-white shadow-brutal-sm max-h-72 overflow-y-auto">
              {/* Available agents */}
              {filteredAgents.length > 0 && (
                <>
                  <SectionEyebrow as="div" className="px-3 py-1.5 bg-white/50">
                    Agents
                  </SectionEyebrow>
                  {filteredAgents.map((agent) => {
                    return (
                      <button
                        key={agent.id}
                        onClick={() => addAgent(agent.id)}
                        className="flex w-full items-center gap-2 px-3 py-2 [@media(max-height:600px)]:py-1 text-sm text-black font-medium hover:bg-brutal-yellow transition-colors"
                      >
                        <AvatarSlot context="compact-list" type="agent" agentAvatarUrl={agent.avatarUrl} />
                        <span>{agent.displayName || agent.name}</span>
                        <AgentActivityDot
                          agentId={agent.id}
                          className="size-2.5 shrink-0"
                        />
                      </button>
                    );
                  })}
                </>
              )}

              {/* Available humans */}
              {filteredHumans.length > 0 && (
                <>
                  <SectionEyebrow as="div" className="px-3 py-1.5 bg-white/50">
                    Humans
                  </SectionEyebrow>
                  {filteredHumans.map((human) => (
                    <button
                      key={human.userId}
                      onClick={() => addHuman(human.userId)}
                      className="flex w-full items-center gap-2 px-3 py-2 [@media(max-height:600px)]:py-1 text-sm text-black font-medium hover:bg-brutal-yellow transition-colors"
                    >
                      <AvatarSlot context="compact-list" type="human" humanAvatarUrl={human.avatarUrl} gravatarHash={human.gravatarHash} />
                      {human.displayName || human.name}
                    </button>
                  ))}
                </>
              )}

              {!hasAvailable && (
                <div className="px-3 py-4 text-sm text-black/50 font-mono text-center">
                  All members added
                </div>
              )}

              {hasAvailable && !hasFilteredResults && (
                <div className="px-3 py-4 text-sm text-black/50 font-mono text-center">
                  No matches for "{memberSearch.trim()}"
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {removeTarget && (
        <ConfirmDialog
          title="Remove Member"
          message={`Are you sure you want to remove ${removeTarget.name} from #${currentChannel?.name || "this channel"}?`}
          confirmLabel="Remove Member"
          loadingLabel="Removing…"
          layer={1}
          onConfirm={() =>
            removeTarget.type === "agent"
              ? removeAgent(removeTarget.id)
              : removeHuman(removeTarget.id)
          }
          onClose={() => setRemoveTarget(null)}
        />
      )}
    </>
  );
}
