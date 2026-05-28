import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MessageSquare, Trash2, X, Pencil, Upload } from "lucide-react";
import { canChangeMemberRole, type ServerRole } from "@slock-ai/shared";
import { useAuthStore } from "../../store/authStore";
import { useChannelStore } from "../../store/channelStore";
import { useServerStore } from "../../store/serverStore";
import { useProfileStore } from "../../store/profileStore";
import { useThreadStore } from "../../store/threadStore";
import { useServerPermissions } from "../../hooks/useServerPermissions";
import { SIDEBAR_TAB_QUERY_PARAM, useAppNavigate, useMobileBack } from "../../hooks/useAppNavigate";
import ConfirmDialog from "../ConfirmDialog";
import InlineBadgeEditor from "../InlineBadgeEditor";
import AvatarSlot from "../ui/AvatarSlot";
import PanelHeader from "../ui/PanelHeader";
import SectionEyebrow from "../ui/SectionEyebrow";
import SectionHeader from "../ui/SectionHeader";
import KeyValueRow from "../ui/KeyValueRow";
import { resolveAgentDisplayState, useAgentStore, type AgentCreatedSummary } from "../../store/agentStore";
import AvatarListRow from "../ui/AvatarListRow";
import StatusDot from "../ui/StatusDot";
import { getRuntimeDisplayName } from "@slock-ai/shared";

const ROLE_CONFIG: Record<string, { label: string; color: string }> = {
  owner: { label: "Owner", color: "bg-brutal-orange" },
  admin: { label: "Admin", color: "bg-brutal-pink" },
  member: { label: "Member", color: "bg-brutal-lavender" },
};
const EDITABLE_ROLE_OPTIONS: { id: ServerRole; label: string }[] = [
  { id: "owner", label: "Owner" },
  { id: "admin", label: "Admin" },
  { id: "member", label: "Member" },
];
const MAX_HUMAN_DESCRIPTION_LENGTH = 3000;

export interface HumanProfile {
  userId: string;
  serverId?: string;
  serverName?: string | null;
  serverSlug?: string | null;
  email: string | null;
  gravatarHash: string;
  name: string;
  displayName: string | null;
  description: string | null;
  avatarUrl: string | null;
  role: ServerRole | null;
  joinedAt: string | null;
  membershipStatus: "active" | "removed";
  createdAgents: AgentCreatedSummary[];
}

export default function HumanDetailPanel({ human, onClose }: { human: HumanProfile; onClose?: () => void }) {
  const currentUser = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const uploadAvatar = useAuthStore((s) => s.uploadAvatar);
  const isSelf = currentUser?.id === human.userId;
  const openUserDM = useChannelStore((s) => s.openUserDM);
  const dmChannels = useChannelStore((s) => s.dmChannels);
  const updateMemberRole = useServerStore((s) => s.updateMemberRole);
  const removeMember = useServerStore((s) => s.removeMember);
  const loadMembers = useServerStore((s) => s.loadMembers);
  const members = useServerStore((s) => s.members);
  const serverSlug = useServerStore((s) => s.current?.slug);
  const currentServerId = useServerStore((s) => s.current?.id);
  const isRemoteJointHuman = Boolean(currentServerId && human.serverId && human.serverId !== currentServerId);
  const sourceServerLabel = isRemoteJointHuman ? human.serverName || human.serverSlug || null : null;
  const [searchParams] = useSearchParams();
  // Two render modes for HumanDetailPanel — see AgentDetailPanel for the
  // same pattern. Overlay mode (`onClose` provided) routes back through
  // the closer rather than skipping past the underlying channel/DM to
  // /members. Cold-start permalink repro: #proj-mobile:b1c622e5
  // (stdrc 2026-05-08).
  const onMobileBack = useMobileBack(onClose ?? (serverSlug ? `/s/${serverSlug}/members` : "/"));
  const { role: currentRole, capabilities } = useServerPermissions();
  const nav = useAppNavigate();
  const agentActivities = useAgentStore((s) => s.agentActivities);
  const [editingRole, setEditingRole] = useState(false);
  const [roleValue, setRoleValue] = useState<ServerRole>("member");
  const [rolePickerOpen, setRolePickerOpen] = useState(false);
  const [roleSaving, setRoleSaving] = useState(false);
  const [roleError, setRoleError] = useState("");
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState(human.description || "");
  const [descriptionSaving, setDescriptionSaving] = useState(false);
  const [descriptionError, setDescriptionError] = useState("");
  // Derive avatar from the canonical source per render. For self, the
  // currentUser store entry is authoritative — authStore.uploadAvatar
  // calls `set({ user: data })`, so the new URL flows back through the
  // selector without any local mirror. For other humans, the prop is the
  // only writer (no one else can upload their avatar). A bare
  // useState(human.avatarUrl) mirror is what react-doctor's
  // no-derived-useState rule guards against.
  const avatarUrl = isSelf ? (currentUser?.avatarUrl ?? null) : human.avatarUrl;
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [removing, setRemoving] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const roleInfo = human.role ? (ROLE_CONFIG[human.role] || ROLE_CONFIG.member) : null;
  const editableRoleOptions = useMemo(
    () => human.role
      ? EDITABLE_ROLE_OPTIONS.filter((option) => canChangeMemberRole(currentRole, human.role, option.id))
          .filter((option) => !(human.role === "owner" && option.id !== "owner" && members.filter((member) => member.role === "owner").length <= 1))
      : [],
    [currentRole, human.role, members]
  );
  const canEditRole =
    human.membershipStatus === "active" &&
    !isRemoteJointHuman &&
    capabilities.changeMemberRoles &&
    !isSelf &&
    editableRoleOptions.length > 0;
  const canRemove =
    human.membershipStatus === "active" &&
    !isRemoteJointHuman &&
    capabilities.manageMembers &&
    !isSelf &&
    (human.role === "owner"
      ? currentRole === "owner" && members.filter((member) => member.role === "owner").length > 1
      : currentRole === "owner" || human.role === "member");

  const joinedDate = human.joinedAt
    ? new Date(human.joinedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  // Find existing DM channel for this human
  const dmChannel = useMemo(
    () => dmChannels.find((c) => c.peerId === human.userId),
    [dmChannels, human.userId]
  );

  useEffect(() => {
    setDescriptionValue(human.description || "");
    setDescriptionError("");
    setEditingDescription(false);
  }, [human.description, human.userId]);

  useEffect(() => {
    // avatarUrl itself is derived from currentUser/human prop directly,
    // so only the upload-related transient state needs resetting when
    // the panel switches to a different human.
    setAvatarError("");
    setAvatarSaving(false);
  }, [human.userId]);

  useEffect(() => {
    setRoleValue(human.role ?? "member");
    setRolePickerOpen(false);
    setRoleError("");
    setEditingRole(false);
  }, [human.role, human.userId]);

  useEffect(() => {
    if (!editingDescription || !descriptionRef.current) return;
    descriptionRef.current.style.height = "0px";
    descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
  }, [descriptionValue, editingDescription]);

  const handleUploadAvatar = async (file: File) => {
    setAvatarSaving(true);
    setAvatarError("");
    try {
      await uploadAvatar(file);
      // authStore.uploadAvatar already calls `set({ user: data })`, so
      // the currentUser selector above re-renders the derived avatarUrl
      // with the new URL — no local mirror needed.
      await loadMembers();
    } catch (err: any) {
      setAvatarError(err.response?.data?.error || "Failed to upload avatar");
    } finally {
      setAvatarSaving(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {isSelf && human.membershipStatus === "active" && (
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.currentTarget.value = "";
            if (file) void handleUploadAvatar(file);
          }}
        />
      )}
      <PanelHeader
        title={human.displayName || human.name}
        iconSlot={<AvatarSlot context="panel-header" type="human" humanAvatarUrl={avatarUrl} gravatarHash={human.gravatarHash} />}
        iconAlwaysVisible
        onMobileBack={onMobileBack}
        mobileBackProps={{ "data-testid": "human-mobile-back", title: "Back" }}
        actions={
          <>
            {!isSelf && human.membershipStatus === "active" && (
              <button
                onClick={async () => {
                  useProfileStore.getState().closeProfile();
                  useThreadStore.getState().closeThread();
                  if (dmChannel) {
                    nav.toDm(dmChannel.id);
                  } else {
                    const ch = await openUserDM(human.userId);
                    if (ch) nav.toDm(ch.id);
                  }
                }}
                className="btn-brutal-sm flex h-7 items-center gap-1.5 bg-white px-2.5 text-xs font-bold"
                title="Message"
              >
                <MessageSquare size={14} />
                Message
              </button>
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

      {/* Profile content — unified cream background, light separators */}
      <div className="flex-1 overflow-y-auto bg-white">
        {sourceServerLabel && (
          <div className="border-b border-black/10 px-5 py-3">
            <SectionEyebrow as="div" className="mb-1">
              From
            </SectionEyebrow>
            <div className="text-sm font-bold text-black">{sourceServerLabel}</div>
          </div>
        )}
        {/* Avatar + name — left-aligned like agent profile */}
        <div className="flex items-start gap-4 px-5 py-5">
          {isSelf && human.membershipStatus === "active" ? (
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarSaving}
              className="group relative flex shrink-0 disabled:cursor-not-allowed disabled:opacity-70"
              title={avatarSaving ? "Uploading avatar" : "Upload image"}
              aria-label={avatarSaving ? "Uploading avatar" : "Upload image"}
            >
              <AvatarSlot context="profile-tile" type="human" humanAvatarUrl={avatarUrl} gravatarHash={human.gravatarHash} />
              <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Upload size={18} className="text-white" />
              </span>
            </button>
          ) : (
            <AvatarSlot context="profile-tile" type="human" humanAvatarUrl={avatarUrl} gravatarHash={human.gravatarHash} />
          )}
          <div className="min-w-0 flex-1">
            <div className="min-w-0 truncate text-lg font-bold leading-tight text-black" title={human.displayName || human.name}>{human.displayName || human.name}</div>
            <div className="flex min-w-0 items-center gap-2">
              {human.membershipStatus === "removed" && (
                <span className="inline-flex shrink-0 items-center px-1.5 py-0.5 text-[10px] font-bold uppercase border border-black bg-gray-300 text-black/60">
                  Removed
                </span>
              )}
              {isSelf && (
                <span className="shrink-0 text-sm text-black/60 font-mono">(you)</span>
              )}
            </div>
            {isSelf && human.membershipStatus === "active" && avatarError && (
              <div className="mt-2 text-xs font-bold text-brutal-red">
                {avatarError}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-black/10">
          <div className="flex items-center gap-2 mb-1">
            <SectionEyebrow as="div">
              Description
            </SectionEyebrow>
            {isSelf && human.membershipStatus === "active" && !editingDescription && (
              <button
                type="button"
                onClick={() => {
                  setDescriptionValue(human.description || "");
                  setDescriptionError("");
                  setEditingDescription(true);
                }}
                className="text-black/40 hover:text-black transition-colors"
                title="Edit description"
              >
                <Pencil size={12} />
              </button>
            )}
          </div>
          {isSelf && human.membershipStatus === "active" ? (
            editingDescription ? (
              <div className="space-y-[5px]">
                <textarea
                  ref={descriptionRef}
                  value={descriptionValue}
                  onChange={(e) => {
                    if (descriptionError) setDescriptionError("");
                    setDescriptionValue(e.target.value);
                  }}
                  rows={3}
                  maxLength={MAX_HUMAN_DESCRIPTION_LENGTH}
                  placeholder="Describe yourself for other humans and agents in this server"
                  className="m-0 min-h-10 w-full border-2 border-black px-2 py-1 text-sm leading-4 shadow-brutal-sm focus:outline-none focus:shadow-brutal-sm resize-none overflow-hidden"
                />
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={async () => {
                      const nextDescription = descriptionValue.trim();
                      if (nextDescription.length > MAX_HUMAN_DESCRIPTION_LENGTH) {
                        setDescriptionError(`Description must be at most ${MAX_HUMAN_DESCRIPTION_LENGTH} characters`);
                        return;
                      }
                      setDescriptionSaving(true);
                      setDescriptionError("");
                      try {
                        await updateProfile({ description: nextDescription || null });
                        await loadMembers();
                        setEditingDescription(false);
                      } catch (err: any) {
                        setDescriptionError(err.response?.data?.error || "Failed to update description");
                      } finally {
                        setDescriptionSaving(false);
                      }
                    }}
                    className="btn-brutal-sm bg-brutal-pink px-2 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={descriptionSaving}
                  >
                    {descriptionSaving ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDescriptionValue(human.description || "");
                      setDescriptionError("");
                      setEditingDescription(false);
                    }}
                    className="btn-brutal-sm bg-white px-2 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={descriptionSaving}
                  >
                    Cancel
                  </button>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs">
                  {descriptionError ? (
                    <span className="font-bold text-brutal-red">
                      {descriptionError}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="font-mono text-black/50">
                    {descriptionValue.trim().length}/{MAX_HUMAN_DESCRIPTION_LENGTH}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-black">
                {human.description || (
                  <span className="italic text-black/40">No description</span>
                )}
              </p>
            )
          ) : (
            <div className="text-sm text-black">
              {human.description || <span className="italic text-black/40">No description</span>}
            </div>
          )}
        </div>

        {/* Info */}
        {!isRemoteJointHuman && (
          <div className="px-5 py-4 border-t border-black/10">
            <SectionEyebrow as="div" className="mb-3">
              Info
            </SectionEyebrow>
            <div className="space-y-3">
              {/* Role */}
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <div className="text-xs text-black/50">{human.membershipStatus === "removed" ? "Status" : "Role"}</div>
                  {canEditRole && roleInfo && !editingRole && (
                    <button
                      type="button"
                      onClick={() => {
                        setRoleValue(human.role ?? "member");
                        setRolePickerOpen(true);
                        setRoleError("");
                        setEditingRole(true);
                      }}
                      className="text-black/40 hover:text-black transition-colors"
                      title="Edit role"
                    >
                      <Pencil size={12} />
                    </button>
                  )}
                </div>
                {human.membershipStatus === "removed" ? (
                  <span className="inline-block border-2 border-black px-2 py-0.5 text-xs font-bold text-black bg-gray-300">
                    Removed
                  </span>
                ) : canEditRole && roleInfo ? (
                  <div className="space-y-1.5">
                    {editingRole ? (
                      <>
                        <div className="relative inline-block">
                          <InlineBadgeEditor
                            displayValue={(ROLE_CONFIG[roleValue] || ROLE_CONFIG.member).label}
                            selectedId={roleValue}
                            options={editableRoleOptions}
                            onSelect={(nextRole) => {
                              setRoleValue(nextRole as ServerRole);
                              setRolePickerOpen(false);
                            }}
                            open={rolePickerOpen}
                            onToggle={() => setRolePickerOpen((value) => !value)}
                            badgeClassName={(ROLE_CONFIG[roleValue] || ROLE_CONFIG.member).color}
                            dropdownMinWidth="min-w-[140px]"
                            dropdownAlign="left"
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                setRoleSaving(true);
                                setRoleError("");
                                await updateMemberRole(human.userId, roleValue);
                                setEditingRole(false);
                              } catch (err: unknown) {
                                const axiosErr = err as { response?: { data?: { error?: string } } };
                                setRoleError(axiosErr.response?.data?.error || "Failed to update role");
                              } finally {
                                setRoleSaving(false);
                              }
                            }}
                            disabled={roleSaving || roleValue === human.role}
                            className="btn-brutal-sm bg-brutal-pink px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRoleValue(human.role ?? "member");
                              setRolePickerOpen(false);
                              setRoleError("");
                              setEditingRole(false);
                            }}
                            disabled={roleSaving}
                            className="btn-brutal-sm bg-white px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <span className={`inline-block border-2 border-black px-2 py-0.5 text-xs font-bold text-black ${roleInfo.color}`}>
                        {roleInfo.label}
                      </span>
                    )}
                  </div>
                ) : roleInfo ? (
                  <span className={`inline-block border-2 border-black px-2 py-0.5 text-xs font-bold text-black ${roleInfo.color}`}>
                    {roleInfo.label}
                  </span>
                ) : (
                  <span className="inline-block border-2 border-black px-2 py-0.5 text-xs font-bold text-black bg-gray-100">
                    Unknown
                  </span>
                )}
                {roleError && (
                  <div className="mt-1 text-xs font-bold text-brutal-orange">
                    {roleError}
                  </div>
                )}
              </div>
              {/* Email */}
              {human.email && (
                <KeyValueRow label="Email" value={human.email} mono breakAll />
              )}
              {/* Joined */}
              {joinedDate && (
                <KeyValueRow label="Joined" value={joinedDate} mono />
              )}
            </div>
          </div>
        )}
        {!isRemoteJointHuman && (
          <div className="px-5 py-4 border-t border-black/10">
            <SectionHeader
              className="mb-3"
              label="Created Agents"
              count={human.createdAgents?.length ?? 0}
            />
            {human.createdAgents?.length ? (
              <div className="space-y-2">
                {human.createdAgents.map((createdAgent) => {
                  const displayState = resolveAgentDisplayState(createdAgent, agentActivities[createdAgent.id]);
                  return (
                    <AvatarListRow
                      key={createdAgent.id}
                      avatar={<AvatarSlot context="surface-list" type="agent" agentAvatarUrl={createdAgent.avatarUrl} />}
                      name={createdAgent.displayName || createdAgent.name}
                      subtitle={getRuntimeDisplayName(createdAgent.runtime)}
                      rightContent={<StatusDot activity={displayState.activity} title={displayState.activityText} />}
                      onClick={() => useProfileStore.getState().openProfile("agent", createdAgent.id)}
                    />
                  );
                })}
              </div>
            ) : (
              <span className="text-sm italic text-black/40">No created agents</span>
            )}
          </div>
        )}
        {canRemove && (
          <div className="px-5 py-4 border-t border-black/10">
            <SectionEyebrow as="div" className="mb-3">
              Actions
            </SectionEyebrow>
            <button
              onClick={() => setShowRemoveConfirm(true)}
              className="btn-brutal flex w-full items-center justify-center gap-2 bg-brutal-red px-4 py-2 text-sm font-bold"
              title="Remove member"
            >
              <Trash2 size={14} />
              Remove Member
            </button>
          </div>
        )}
      </div>
      {showRemoveConfirm && (
        <ConfirmDialog
          title="Remove Member"
          message={`Remove ${human.displayName || human.name} from this server? They will be removed from all channels, but their past messages will remain in history.`}
          confirmLabel="Remove Member"
          loadingLabel="Removing…"
          onConfirm={async () => {
            setRemoving(true);
            try {
              await removeMember(human.userId);
            } finally {
              setRemoving(false);
            }
          }}
          onClose={() => {
            if (!removing) setShowRemoveConfirm(false);
          }}
        />
      )}
    </div>
  );
}
