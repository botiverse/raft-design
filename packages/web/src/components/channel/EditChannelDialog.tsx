import { useState } from "react";
import { Archive, ArchiveRestore, GitBranch, Hash, Lock, LogOut, Trash2, X } from "lucide-react";
import { useChannelStore } from "../../store/channelStore";
import { validateName } from "@slock-ai/shared";
import Modal from "../Modal";
import Banner from "../ui/Banner";
import ConfirmDialog from "../ConfirmDialog";
import { useAppNavigate } from "../../hooks/useAppNavigate";
import { useServerPermissions } from "../../hooks/useServerPermissions";
import FormField from "../ui/FormField";

export default function EditChannelDialog({
  channelId,
  initialName,
  initialDescription,
  onClose,
}: {
  channelId: string;
  initialName: string;
  initialDescription: string;
  onClose: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [archiveBusy, setArchiveBusy] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showVisibilityConfirm, setShowVisibilityConfirm] = useState(false);
  const [visibilityBusy, setVisibilityBusy] = useState(false);
  const updateChannel = useChannelStore((s) => s.updateChannel);
  const deleteChannel = useChannelStore((s) => s.deleteChannel);
  const disconnectJointChannel = useChannelStore((s) => s.disconnectJointChannel);
  const archiveChannel = useChannelStore((s) => s.archiveChannel);
  const unarchiveChannel = useChannelStore((s) => s.unarchiveChannel);
  const channels = useChannelStore((s) => s.channels);
  const channel = channels.find((c) => c.id === channelId);
  const isJointChannel = channel?.type === "joint";
  const currentVisibility = channel?.type === "private" ? "private" : "public";
  const nextVisibility = currentVisibility === "private" ? "public" : "private";
  const isArchived = !!channel?.archivedAt;
  const { capabilities } = useServerPermissions();
  const nav = useAppNavigate();

  const isAllChannel = initialName === "all";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isAllChannel) {
      const nameError = validateName(name, "Channel name");
      if (nameError) {
        setError(nameError);
        return;
      }
    }

    setSaving(true);
    try {
      const updates: { name?: string; description?: string } = {};
      if (!isAllChannel && name.trim() !== initialName) {
        updates.name = name.trim();
      }
      if (description.trim() !== initialDescription) {
        updates.description = description.trim();
      }
      if (Object.keys(updates).length === 0) {
        onClose();
        return;
      }
      await updateChannel(channelId, updates);
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || "Failed to update channel");
    } finally {
      setSaving(false);
    }
  };

  const handleVisibilityChange = async () => {
    setError("");
    setVisibilityBusy(true);
    try {
      await updateChannel(channelId, { visibility: nextVisibility });
      setShowVisibilityConfirm(false);
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || "Failed to update channel visibility");
      setShowVisibilityConfirm(false);
    } finally {
      setVisibilityBusy(false);
    }
  };

  const handleUnarchive = async () => {
    setError("");
    setArchiveBusy(true);
    try {
      await unarchiveChannel(channelId);
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || "Failed to unarchive channel");
    } finally {
      setArchiveBusy(false);
    }
  };

  const handleDisconnectJointChannel = async () => {
    await disconnectJointChannel(channelId);
    const fallbackChannel =
      channels.find((candidate) => candidate.id !== channelId && candidate.name === "all") ||
      channels.find((candidate) => candidate.id !== channelId);
    onClose();
    if (fallbackChannel) {
      nav.toChannel(fallbackChannel.id);
    } else {
      nav.toSettings("server");
    }
  };

  return (
    <>
      <Modal onClose={onClose}>
        <div className="w-full max-w-md card-brutal p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold uppercase">Edit Channel</h2>
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
            <FormField
              label="Name"
              required
              hint={
                isAllChannel
                  ? "The #all channel cannot be renamed"
                  : isJointChannel
                    ? "Joint channel names are shared across servers"
                    : undefined
              }
            >
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-brutal w-full"
                placeholder="e.g. ai-research"
                required
                autoFocus
                disabled={isAllChannel || isArchived}
              />
            </FormField>
            <FormField label="Description" optional>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-brutal w-full"
                placeholder="What is this channel about?"
                rows={2}
                disabled={isArchived}
              />
            </FormField>
            {isJointChannel && (
              <div className="border-2 border-black bg-white p-3 shadow-brutal-sm">
                <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
                  <GitBranch size={14} />
                  Joint Channel
                </div>
                <p className="text-sm text-black/70">
                  {channel.jointPeerServerName || channel.jointPeerServerSlug
                    ? `Connected server: ${channel.jointPeerServerName || channel.jointPeerServerSlug}${channel.jointPeerStatus === "pending" ? " (pending invite)" : ""}`
                    : "Connected server metadata is not available yet."}
                </p>
              </div>
            )}
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
                disabled={saving || isArchived}
                className="btn-brutal bg-brutal-pink px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>

          {!isAllChannel && capabilities.manageChannels && (
            <>
              <div className="my-5 border-t-2 border-black" />
              <div className="flex flex-col gap-3">
                {!isJointChannel && (
                  <button
                    type="button"
                    onClick={() => setShowVisibilityConfirm(true)}
                    disabled={isArchived || visibilityBusy}
                    className="btn-brutal flex w-full items-center justify-center gap-1.5 bg-brutal-orange px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {currentVisibility === "private" ? <Hash size={14} /> : <Lock size={14} />}
                    {visibilityBusy
                      ? "Updating…"
                      : currentVisibility === "private"
                        ? "Make Public"
                        : "Make Private"}
                  </button>
                )}
                {isArchived ? (
                  <button
                    type="button"
                    onClick={handleUnarchive}
                    disabled={archiveBusy}
                    className="btn-brutal flex w-full items-center justify-center gap-1.5 bg-brutal-lime px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArchiveRestore size={14} />
                    {archiveBusy ? "Unarchiving…" : "Unarchive Channel"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowArchiveConfirm(true)}
                    className="btn-brutal flex w-full items-center justify-center gap-1.5 bg-brutal-orange px-4 py-2 text-sm"
                  >
                    <Archive size={14} />
                    Archive Channel
                  </button>
                )}
                {isJointChannel ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="btn-brutal flex w-full items-center justify-center gap-1.5 bg-brutal-red px-4 py-2 text-sm"
                  >
                    <LogOut size={14} />
                    Disconnect Channel
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="btn-brutal flex w-full items-center justify-center gap-1.5 bg-brutal-red px-4 py-2 text-sm"
                  >
                    <Trash2 size={14} />
                    Delete Channel
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>

      {showArchiveConfirm && (
        <ConfirmDialog
          title="Archive Channel"
          message={`Archive "${initialName}"? Members keep read access and history, but writes will be frozen and the channel will be hidden from sidebars. You can unarchive it later.`}
          confirmLabel="Archive Channel"
          loadingLabel="Archiving…"
          confirmColor="bg-brutal-orange"
          layer={1}
          onConfirm={async () => {
            try {
              await archiveChannel(channelId);
              setShowArchiveConfirm(false);
              onClose();
            } catch (err: unknown) {
              const axiosErr = err as { response?: { data?: { error?: string } } };
              setError(axiosErr.response?.data?.error || "Failed to archive channel");
              setShowArchiveConfirm(false);
            }
          }}
          onClose={() => setShowArchiveConfirm(false)}
        />
      )}

      {showVisibilityConfirm && (
        <ConfirmDialog
          title={currentVisibility === "private" ? "Make Channel Public" : "Make Channel Private"}
          message={
            currentVisibility === "private"
              ? `Make "${initialName}" public? All server members will regain read visibility. Existing joined humans and agents keep their joined state.`
              : `Make "${initialName}" private? Existing joined humans and agents keep access. Non-joined server members and historical thread followers will lose access to this channel and its threads.`
          }
          confirmLabel={currentVisibility === "private" ? "Make Public" : "Make Private"}
          loadingLabel="Updating…"
          confirmColor="bg-brutal-orange"
          layer={1}
          onConfirm={handleVisibilityChange}
          onClose={() => setShowVisibilityConfirm(false)}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          title={isJointChannel ? "Disconnect Joint Channel" : "Delete Channel"}
          message={isJointChannel
            ? `Disconnect "${initialName}" from this server? The joint channel will be removed from this server. Other connected servers keep their own projection and history.`
            : `Are you sure you want to delete "${initialName}"? All messages will be lost.`}
          confirmLabel={isJointChannel ? "Disconnect Channel" : "Delete Channel"}
          loadingLabel={isJointChannel ? "Disconnecting…" : "Deleting…"}
          layer={1}
          onConfirm={async () => {
            if (isJointChannel) {
              await handleDisconnectJointChannel();
              return;
            }
            await deleteChannel(channelId);
            const fallbackChannel =
              channels.find((channel) => channel.id !== channelId && channel.name === "all") ||
              channels.find((channel) => channel.id !== channelId);
            onClose();
            if (fallbackChannel) {
              nav.toChannel(fallbackChannel.id);
            } else {
              nav.toSettings("server");
            }
          }}
          onClose={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
}
