import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Send, User, UserX, Hash, Paperclip, X, FileText, ImagePlus } from "lucide-react";
import Spinner from "../ui/Spinner";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMessageStore, type MessageMention } from "../../store/messageStore";
import { useAgentStore } from "../../store/agentStore";
import { useServerStore } from "../../store/serverStore";
import { useAuthStore } from "../../store/authStore";
import { useChannelStore } from "../../store/channelStore";
import { useChannelMembers } from "../../hooks/useChannelMembers";
import { useAutocomplete } from "../../hooks/useAutocomplete";
import { useTaskStore } from "../../store/taskStore";
import { extractClipboardFiles } from "../../utils/clipboardFiles";
import AvatarSlot from "../ui/AvatarSlot";
import Checkbox from "../ui/Checkbox";
import SectionEyebrow from "../ui/SectionEyebrow";
import AgentActivityDot from "../agent/AgentActivityDot";
import api from "../../api/client";
import type { Message } from "../../store/messageStore";
import {
  buildMentionCandidateGroups,
  getMentionCandidateDescription,
  getMentionCandidateServerLabel,
  type MentionCandidate,
} from "./mentionCandidates";
import { transparentImageBackgroundClass } from "../../utils/imagePreviewStyles";
import { applyMessageAttachmentLimits, formatMessageAttachmentLimitError } from "../../utils/messageAttachmentLimits";
import { SELECTED_TEXT_QUOTE_EVENT, appendQuoteToComposer, type SelectedTextQuoteDetail } from "./selectedTextQuote";

interface PendingFile {
  id: string;
  file: File;
  preview: string | null; // object URL for image preview
  previewWidth?: number;
  previewHeight?: number;
  uploadStatus: "uploading" | "ready" | "error";
  uploadProgress: number;
  attachmentId?: string;
  uploadError?: string;
}

interface AttachmentUploadResponse {
  attachments: Array<{ id: string }>;
}

const MENTION_TRIGGER = /@([\p{L}\p{N}_-]*)$/u;
const CHANNEL_TRIGGER = /#([\w-]*)$/;

function mentionKey(mention: Pick<MessageMention, "type" | "id">): string {
  return `${mention.type}:${mention.id}`;
}

function mentionStillAppears(content: string, mention: MessageMention): boolean {
  return new RegExp(`@${mention.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "iu").test(content);
}

function isPreviewableImageFile(file: File): boolean {
  const mimeType = file.type.split(";")[0]?.trim().toLowerCase();
  return !!mimeType && mimeType.startsWith("image/") && mimeType !== "image/svg+xml";
}

function readLocalImageDimensions(previewUrl: string): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const width = image.naturalWidth;
      const height = image.naturalHeight;
      resolve(width > 0 && height > 0 ? { width, height } : null);
    };
    image.onerror = () => resolve(null);
    image.src = previewUrl;
  });
}

function SortableAttachment({
  id,
  preview,
  fileName,
  mimeType,
  uploadStatus,
  uploadProgress,
  uploadError,
  onRemove,
  onRetry,
}: {
  id: string;
  preview: string | null;
  fileName: string;
  mimeType: string;
  uploadStatus: PendingFile["uploadStatus"];
  uploadProgress: number;
  uploadError?: string;
  onRemove: () => void;
  onRetry: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };
  return (
    <div ref={setNodeRef} style={style} className="relative group" {...attributes}>
      {/* Drag handle: the chip body itself. Spreading dnd-kit's
          {...listeners} ONLY here (not on the outer container) keeps
          the Remove button outside the drag handle, so taps on the
          ✕ never get captured by PointerSensor's native pointerdown
          listener. Without this split, on touch devices the parent
          element owned both the drag region and the button area —
          dnd-kit attaches NATIVE pointerdown listeners (not React),
          which `e.stopPropagation()` on a React synthetic onClick
          can't preempt; the X tap got swallowed and onRemove never
          fired. tygg #proj-mobile task #8. */}
      <div {...listeners} className="cursor-grab active:cursor-grabbing">
        {preview ? (
          <img src={preview} alt={fileName} className={`size-16 object-cover border-2 border-black ${transparentImageBackgroundClass}`} />
        ) : (
          <div className="flex h-16 w-32 items-center gap-2 border-2 border-black bg-white px-2">
            <FileText size={16} className="shrink-0 text-black/70" />
            <div className="min-w-0">
              <div className="truncate text-xs font-bold text-black">{fileName}</div>
              <div className="truncate text-[10px] text-black/50">{mimeType || "file"}</div>
            </div>
          </div>
        )}
      </div>
      {/* Remove button. Desktop: hidden until hover so the chip reads
          clean. Touch devices: always visible — `(hover: none)` matches
          phones/tablets without an attached pointer, which is exactly
          where the hover-only X disappears.
          size-5 on touch gives a 20px hit area instead of the desktop
          16px — still small but big enough for thumb tap on a 64px
          chip without enlarging the chip itself. */}
      {uploadStatus === "uploading" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center border-2 border-black bg-white/85 px-1 text-center text-[10px] font-bold text-black">
          <Spinner size="sm" className="mb-1" />
          <span>{uploadProgress > 0 ? `${uploadProgress}%` : "Uploading"}</span>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-black/15">
            <div
              className="h-full bg-brutal-pink"
              style={{ width: `${Math.max(4, Math.min(uploadProgress, 100))}%` }}
            />
          </div>
        </div>
      )}
      {uploadStatus === "error" && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRetry();
          }}
          title={uploadError || "Upload failed"}
          aria-label={`Retry uploading ${fileName}`}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center border-2 border-black bg-brutal-orange/90 px-1 text-center text-[10px] font-bold leading-3 text-black"
        >
          <span>Upload failed</span>
          <span className="underline">Tap to retry</span>
        </button>
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${fileName}`}
        className="absolute -top-1.5 -right-1.5 z-20 flex size-4 items-center justify-center rounded-full bg-black text-white opacity-0 transition-opacity group-hover:opacity-100 [@media(hover:none)]:h-6 [@media(hover:none)]:w-6 [@media(hover:none)]:opacity-100"
      >
        <X size={10} />
      </button>
    </div>
  );
}

function MentionCandidateBody({
  candidate,
  showActivity,
  selected,
  muted,
}: {
  candidate: MentionCandidate;
  showActivity: boolean;
  selected: boolean;
  muted: boolean;
}) {
  const description = getMentionCandidateDescription(candidate);
  const serverLabel = getMentionCandidateServerLabel(candidate);
  const nameClass = muted
    ? selected ? "text-black/70" : "text-black/50"
    : "text-black";
  const handleClass = muted
    ? selected ? "text-black/40" : "text-black/30"
    : "text-black/40";
  const descriptionClass = muted
    ? selected ? "text-black/50" : "text-black/40"
    : selected ? "text-black/70" : "text-black/50";
  const nameWidthClass = description ? "max-w-[45%] shrink-0 sm:max-w-[35%]" : "min-w-0";

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5 text-left">
      <span className={`${nameWidthClass} truncate ${nameClass}`}>{candidate.displayName || candidate.name}</span>
      {showActivity && candidate.type === "agent" && (
        <AgentActivityDot
          agentId={candidate.id}
          className="size-2.5 shrink-0"
        />
      )}
      {description && (
        <span className={`min-w-0 flex-1 truncate text-xs font-normal ${descriptionClass}`} title={description}>
          {description}
        </span>
      )}
      {serverLabel && (
        <span className={`min-w-0 max-w-[10rem] truncate text-xs font-normal ${descriptionClass}`} title={`Source server: ${serverLabel}`}>
          {serverLabel}
        </span>
      )}
      <span className={`ml-auto shrink-0 text-xs font-mono ${handleClass}`}>@{candidate.name}</span>
    </div>
  );
}

function MentionCandidateAvatar({
  candidate,
  muted,
}: {
  candidate: MentionCandidate;
  muted: boolean;
}) {
  if (candidate.type === "agent") {
    return (
      <AvatarSlot
        context="compact-list"
        type="agent"
        agentAvatarUrl={candidate.avatarUrl}
        className={muted ? "!border-black/40 opacity-60" : undefined}
      />
    );
  }

  return (
    <AvatarSlot
      context="compact-list"
      type="human"
      humanAvatarUrl={candidate.avatarUrl}
      gravatarHash={candidate.gravatarHash}
      email={candidate.email}
      humanPlaceholder={!candidate.avatarUrl && !candidate.gravatarHash && !candidate.email}
      className={muted ? "!border-black/40 opacity-60 [&_svg]:opacity-50" : undefined}
    />
  );
}

export default function MessageInput({
  channelId,
  channelName,
  showTaskButton,
  onWillSend,
  mentionChannelId,
  isChannelThread,
  threadMessages,
  autoFocus,
}: {
  channelId: string;
  channelName: string;
  showTaskButton?: boolean;
  onWillSend?: () => void | Promise<void>;
  /** Channel ID to use for @mention autocomplete (defaults to channelId). Use parent channel ID in threads. */
  mentionChannelId?: string;
  /** Whether this is a thread under a regular channel (not DM). Controls whether @mention shows all server members. */
  isChannelThread?: boolean;
  /** Current thread messages used to lightly prioritize recent participants. */
  threadMessages?: Message[];
  /** Auto-focus the textarea on mount */
  autoFocus?: boolean;
}) {

  const draft = useMessageStore((s) => s.drafts[channelId] ?? "");
  const setDraft = useMessageStore((s) => s.setDraft);
  const clearDraft = useMessageStore((s) => s.clearDraft);
  const [content, setContent] = useState(draft);
  const sendMessage = useMessageStore((s) => s.sendMessage);
  const addOptimisticMessage = useMessageStore((s) => s.addOptimisticMessage);
  const removeOptimisticMessage = useMessageStore((s) => s.removeOptimisticMessage);
  const [alsoCreateTask, setAlsoCreateTask] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [selectedMentions, setSelectedMentions] = useState<MessageMention[]>([]);
  const pendingFilesRef = useRef<PendingFile[]>([]);
  const uploadControllersRef = useRef<Map<string, AbortController>>(new Map());
  const [error, setError] = useState("");
  const dndSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Restore draft when switching channels
  useEffect(() => {
    const saved = useMessageStore.getState().drafts[channelId] ?? "";
    setContent(saved);
    setSelectedMentions([]);
    setError("");
    if (textareaRef.current) textareaRef.current.style.height = "";
    // Clear pending files when switching channels
    setPendingFiles((prev) => {
      for (const p of prev) {
        uploadControllersRef.current.get(p.id)?.abort();
        uploadControllersRef.current.delete(p.id);
        if (p.preview) URL.revokeObjectURL(p.preview);
      }
      return [];
    });
  }, [channelId]);

  // Auto-focus on mount (desktop only — on mobile it triggers the keyboard and shifts the page)
  useEffect(() => {
    if (autoFocus && window.matchMedia("(hover: hover)").matches) {
      textareaRef.current?.focus();
    }
  }, [autoFocus, channelId]);

  useEffect(() => {
    pendingFilesRef.current = pendingFiles;
  }, [pendingFiles]);

  // Cleanup object URLs and in-flight uploads on unmount
  useEffect(() => {
    return () => {
      for (const controller of uploadControllersRef.current.values()) {
        controller.abort();
      }
      uploadControllersRef.current.clear();
      for (const p of pendingFilesRef.current) {
        if (p.preview) URL.revokeObjectURL(p.preview);
      }
    };
  }, []);

  // Save draft on content change
  useEffect(() => {
    setDraft(channelId, content);
  }, [channelId, content, setDraft]);

  const agents = useAgentStore((s) => s.agents);
  const humans = useServerStore((s) => s.members);
  const currentServer = useServerStore((s) => s.current);
  const currentUser = useAuthStore((s) => s.user);
  const { channelAgents, channelHumans } = useChannelMembers(mentionChannelId || channelId);
  const channels = useChannelStore((s) => s.channels);
  const mentionScopeChannel = useMemo(
    () => channels.find((c) => c.id === (mentionChannelId || channelId)),
    [channels, mentionChannelId, channelId],
  );

  // Autocomplete hooks (state only — filtering done below)
  const mention = useAutocomplete(MENTION_TRIGGER, "@");
  const channel = useAutocomplete(CHANNEL_TRIGGER, "#");

  // Channel switches keep MessageInput mounted, so any open autocomplete
  // popover must be cleared explicitly instead of relying on unmount cleanup.
  useEffect(() => {
    mention.dismiss();
    channel.dismiss();
  }, [channelId, mention.dismiss, channel.dismiss]);

  // Build channel member ID sets for fast lookup
  const channelMemberIds = useMemo(() => {
    const ids = new Set<string>();
    for (const a of channelAgents) ids.add(a.id);
    for (const h of channelHumans) ids.add(h.id);
    return ids;
  }, [channelAgents, channelHumans]);

  // Build & filter mention candidates
  const allCandidates = useMemo(() => {
    const byKey = new Map<string, MentionCandidate>();
    const addCandidate = (candidate: MentionCandidate) => {
      byKey.set(`${candidate.type}:${candidate.id}`, candidate);
    };
    const memberScopedMentions = mentionScopeChannel?.type === "private" || mentionScopeChannel?.type === "joint";
    if (!memberScopedMentions && currentUser) {
      addCandidate({
        id: currentUser.id,
        name: currentUser.name,
        displayName: currentUser.displayName,
        type: "user",
        avatarUrl: currentUser.avatarUrl,
        email: currentUser.email,
      });
    }
    if (!memberScopedMentions) {
      for (const human of humans) {
        if (currentUser && human.userId === currentUser.id) continue;
        addCandidate({
          id: human.userId,
          name: human.name,
          displayName: human.displayName,
          type: "user",
          avatarUrl: human.avatarUrl,
          gravatarHash: human.gravatarHash,
        });
      }
      for (const agent of agents) {
        if (agent.deletedAt) continue;
        addCandidate({
          id: agent.id,
          serverId: agent.serverId,
          serverName: agent.serverName,
          serverSlug: agent.serverSlug,
          name: agent.name,
          displayName: agent.displayName,
          type: "agent",
          avatarUrl: agent.avatarUrl,
          description: agent.description,
        });
      }
    }
    for (const human of channelHumans) {
      if (currentUser && human.id === currentUser.id) continue;
      const isRemoteHuman = Boolean(currentServer?.id && human.serverId && human.serverId !== currentServer.id);
      addCandidate({
        id: human.id,
        serverId: isRemoteHuman ? human.serverId : undefined,
        serverName: isRemoteHuman ? human.serverName : undefined,
        serverSlug: isRemoteHuman ? human.serverSlug : undefined,
        name: human.name,
        displayName: human.displayName,
        type: "user",
        avatarUrl: human.avatarUrl,
        gravatarHash: human.gravatarHash,
        description: human.description,
      });
    }
    for (const agent of channelAgents) {
      if (agent.deletedAt) continue;
      const isRemoteAgent = Boolean(currentServer?.id && agent.serverId && agent.serverId !== currentServer.id);
      addCandidate({
        id: agent.id,
        serverId: isRemoteAgent ? agent.serverId : undefined,
        serverName: isRemoteAgent ? agent.serverName : undefined,
        serverSlug: isRemoteAgent ? agent.serverSlug : undefined,
        name: agent.name,
        displayName: agent.displayName,
        type: "agent",
        avatarUrl: agent.avatarUrl,
        description: agent.description,
      });
    }
    return [...byKey.values()];
  }, [currentUser, currentServer?.id, humans, agents, channelHumans, channelAgents, mentionScopeChannel?.type]);

  const filteredMentions = useMemo(() => {
    return buildMentionCandidateGroups({
      candidates: allCandidates,
      query: mention.query,
      channelMemberIds,
      threadMessages,
      prioritizeThreadParticipants: Boolean(isChannelThread),
    });
  }, [allCandidates, channelMemberIds, mention.query, isChannelThread, threadMessages]);

  const filteredChannels = useMemo(() => {
    const candidates = channels.filter((c) => c.type === "channel" || c.type === "private" || c.type === "joint");
    if (!channel.query) return candidates;
    const q = channel.query.toLowerCase();
    return candidates.filter((c) => c.name.toLowerCase().includes(q));
  }, [channels, channel.query]);

  // Clamp indices when filtered lists change
  useEffect(() => { mention.clampIndex(filteredMentions.flat.length); }, [filteredMentions.flat.length]);
  useEffect(() => { channel.clampIndex(filteredChannels.length); }, [filteredChannels.length]);

  // Auto-resize textarea
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const minH = parseFloat(getComputedStyle(el).minHeight) || 0;
    el.style.height = `${Math.max(Math.min(el.scrollHeight, 160), minH)}px`;
  }, []);

  // Selection-quote v0 (#proj-chat task #32): a message's selection context
  // menu "Quote" dispatches SELECTED_TEXT_QUOTE_EVENT with the target composer
  // channelId. Only the composer whose channelId matches pulls it in, so a
  // channel timeline + open thread panel (two mounted MessageInputs) route
  // correctly. Append to live `content` (the draft-save effect persists it).
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<SelectedTextQuoteDetail>).detail;
      if (!detail || detail.channelId !== channelId) return;
      setContent((prev) => appendQuoteToComposer(prev, detail.quote));
      setTimeout(() => {
        const el = textareaRef.current;
        if (el) {
          el.focus();
          const end = el.value.length;
          el.setSelectionRange(end, end);
        }
        autoResize();
      }, 0);
    };
    window.addEventListener(SELECTED_TEXT_QUOTE_EVENT, handler);
    return () => window.removeEventListener(SELECTED_TEXT_QUOTE_EVENT, handler);
  }, [channelId, autoResize]);

  // Insert helpers
  const doInsertMention = useCallback((candidate: MentionCandidate) => {
    const cursorPos = textareaRef.current?.selectionStart ?? content.length;
    const { newContent, newCursor } = mention.buildInsert(candidate.name, content, cursorPos);
    setContent(newContent);
    const selected: MessageMention = {
      type: candidate.type,
      id: candidate.id,
      name: candidate.name,
    };
    setSelectedMentions((prev) => {
      const key = mentionKey(selected);
      const without = prev.filter((item) => mentionKey(item) !== key);
      return [...without, selected];
    });
    mention.dismiss();
    setTimeout(() => { textareaRef.current?.focus(); textareaRef.current?.setSelectionRange(newCursor, newCursor); }, 0);
  }, [content, mention]);

  const doInsertChannel = useCallback((ch: { name: string }) => {
    const cursorPos = textareaRef.current?.selectionStart ?? content.length;
    const { newContent, newCursor } = channel.buildInsert(ch.name, content, cursorPos);
    setContent(newContent);
    channel.dismiss();
    setTimeout(() => { textareaRef.current?.focus(); textareaRef.current?.setSelectionRange(newCursor, newCursor); }, 0);
  }, [content, channel]);

  // File handling
  const formatUploadError = useCallback((err: unknown): string => {
    const responseError =
      typeof err === "object" &&
      err !== null &&
      "response" in err &&
      typeof (err as { response?: { data?: { error?: string } } }).response?.data?.error === "string"
        ? (err as { response?: { data?: { error?: string } } }).response!.data!.error!
        : null;
    if (responseError) return responseError;
    return "File no longer available or upload failed. Tap to retry.";
  }, []);

  const startAttachmentUpload = useCallback(async (pending: PendingFile) => {
    uploadControllersRef.current.get(pending.id)?.abort();
    const controller = new AbortController();
    uploadControllersRef.current.set(pending.id, controller);

    setPendingFiles((prev) => prev.map((pf) => (
      pf.id === pending.id
        ? { ...pf, uploadStatus: "uploading", uploadProgress: 0, attachmentId: undefined, uploadError: undefined }
        : pf
    )));

    try {
      const formData = new FormData();
      formData.append("channelId", channelId);
      formData.append("files", pending.file);
      const { data } = await api.post<AttachmentUploadResponse>("/attachments/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        signal: controller.signal,
        onUploadProgress: (event) => {
          if (!event.total) return;
          const progress = Math.max(1, Math.min(99, Math.round((event.loaded / event.total) * 100)));
          setPendingFiles((prev) => prev.map((pf) => (
            pf.id === pending.id ? { ...pf, uploadProgress: progress } : pf
          )));
        },
      });
      const attachmentId = data.attachments[0]?.id;
      if (!attachmentId) throw new Error("Upload response did not include an attachment id");
      setPendingFiles((prev) => prev.map((pf) => (
        pf.id === pending.id
          ? { ...pf, uploadStatus: "ready", uploadProgress: 100, attachmentId, uploadError: undefined }
          : pf
      )));
    } catch (err) {
      if (controller.signal.aborted) return;
      setPendingFiles((prev) => prev.map((pf) => (
        pf.id === pending.id
          ? { ...pf, uploadStatus: "error", uploadProgress: 0, attachmentId: undefined, uploadError: formatUploadError(err) }
          : pf
      )));
    } finally {
      if (uploadControllersRef.current.get(pending.id) === controller) {
        uploadControllersRef.current.delete(pending.id);
      }
    }
  }, [channelId, formatUploadError]);

  const addFiles = useCallback((files: FileList | File[]) => {
    const result = applyMessageAttachmentLimits(pendingFiles.length, Array.from(files));
    const newFiles: PendingFile[] = result.accepted.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      file,
      preview: isPreviewableImageFile(file) ? URL.createObjectURL(file) : null,
      uploadStatus: "uploading",
      uploadProgress: 0,
    }));

    if (newFiles.length > 0) {
      setPendingFiles((prev) => [...prev, ...newFiles]);
      for (const pending of newFiles) {
        if (pending.preview) {
          void readLocalImageDimensions(pending.preview).then((dimensions) => {
            if (!dimensions) return;
            setPendingFiles((prev) => prev.map((pf) => (
              pf.id === pending.id
                ? { ...pf, previewWidth: dimensions.width, previewHeight: dimensions.height }
                : pf
            )));
          });
        }
        void startAttachmentUpload(pending);
      }
    }
    setError(formatMessageAttachmentLimitError(result));
  }, [pendingFiles.length, startAttachmentUpload]);

  const removeFile = useCallback((index: number) => {
    setPendingFiles((prev) => {
      const removed = prev[index];
      if (removed) {
        uploadControllersRef.current.get(removed.id)?.abort();
        uploadControllersRef.current.delete(removed.id);
      }
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const retryFile = useCallback((id: string) => {
    const pending = pendingFilesRef.current.find((pf) => pf.id === id);
    if (pending) {
      void startAttachmentUpload(pending);
    }
  }, [startAttachmentUpload]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const cursorPos = e.target.selectionStart;
    setContent(val);
    setSelectedMentions((prev) => prev.filter((selected) => mentionStillAppears(val, selected)));
    autoResize();

    const textBeforeCursor = val.slice(0, cursorPos);
    if (mention.detect(textBeforeCursor, cursorPos)) {
      channel.dismiss();
    } else if (!channel.detect(textBeforeCursor, cursorPos)) {
      // Neither matched — both are already dismissed by detect()
    }
  };

  // Handle pasting copied files from the OS clipboard into the attachment flow.
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const pastedFiles = extractClipboardFiles(e.clipboardData);
    if (pastedFiles.length > 0) {
      e.preventDefault();
      addFiles(pastedFiles);
    }
  }, [addFiles]);

  // ── Drag-and-drop file upload ──────────────────────────────────────
  // tygg / cindyz 2026-05-06 #proj-uiux task #121:
  //   "input box 应该可以支持文件拖拽上传，这个小心点做"
  //
  // The "small care" cindyz called for translates to four things:
  //   1. Only react to file drags. Text drags must not trigger the overlay
  //      or push 0-byte files into pendingFiles. We gate on
  //      `dataTransfer.types.includes("Files")` (set by the browser only
  //      when the OS-level drag carries files).
  //   2. Don't flicker the overlay when the cursor crosses nested children
  //      inside the composer (textarea, attachment chips, send button).
  //      `dragenter` / `dragleave` fire on every parent/child crossing —
  //      track an enter-count ref and only hide when it returns to 0.
  //   3. Don't conflict with the existing paste path. Both reuse `addFiles`,
  //      which already enforces the per-file size cap, the empty-file
  //      reject, and the max-5 attachment cap.
  //   4. No-op on touch devices. Touch doesn't fire HTML5 drag events at
  //      all, so the overlay simply never appears — no extra mobile guard
  //      needed.
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const dragCounterRef = useRef(0);

  const isFileDrag = (e: React.DragEvent): boolean => {
    if (!e.dataTransfer) return false;
    // `types` is a DOMStringList; spec guarantees "Files" when the OS-level
    // drag is files. Text drags carry "text/plain" / "text/html" instead.
    return Array.from(e.dataTransfer.types).includes("Files");
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    dragCounterRef.current += 1;
    if (dragCounterRef.current === 1) setIsDraggingFiles(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDraggingFiles(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!isFileDrag(e)) return;
    // Required to allow the drop event. Without preventDefault on dragover
    // the browser falls back to its default "open file" behavior (which
    // would navigate the tab away from Slock — exactly the disaster
    // cindyz's "小心点做" is asking us to avoid).
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDraggingFiles(false);

    // Folder filter — cindyz #proj-uiux:040edcd0 follow-up:
    //   "现在好像一整个文件夹拖入也是会显示 overlay?".
    //
    // The overlay can't be suppressed during drag (DataTransfer.items only
    // exposes `kind`/`type` synchronously, not the underlying File-vs-Folder
    // distinction — `webkitGetAsEntry()` is what tells you that, and it's
    // only safely callable on drop in some browsers). So we let the overlay
    // reveal, then on drop we walk the items, identify folders via
    // `webkitGetAsEntry()`, skip them, and surface a clear error so the
    // user knows what happened. Without this, dropping a folder would
    // produce a 0-byte phantom File which `addFiles` rejects as "Empty
    // files cannot be uploaded." — accurate but confusing.
    let folderSkipped = false;
    const items = e.dataTransfer.items;
    if (items && items.length > 0) {
      const fileItems: File[] = [];
      const seen = new Set<string>();
      for (const item of Array.from(items)) {
        if (item.kind !== "file") continue;
        const entry = (item as { webkitGetAsEntry?: () => { isDirectory: boolean } | null })
          .webkitGetAsEntry?.();
        if (entry && entry.isDirectory) {
          folderSkipped = true;
          continue;
        }
        const file = item.getAsFile();
        if (!file) continue;
        const key = `${file.name}::${file.size}::${file.type}`;
        if (seen.has(key)) continue;
        seen.add(key);
        fileItems.push(file);
      }
      if (fileItems.length > 0) addFiles(fileItems);
      if (folderSkipped && fileItems.length === 0) {
        setError("Folders can't be uploaded — drag individual files instead.");
      } else if (folderSkipped) {
        // Mixed drop: at least one real file went through, plus at least
        // one folder was skipped. Best-effort: surface a softer notice.
        setError("Folders were skipped — only individual files can be uploaded.");
      }
      return;
    }
    // Fallback for browsers / events without `items` — use `files` directly.
    // No way to tell folders apart in this branch; addFiles' empty-file
    // reject will catch most cases.
    const fallback = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    if (fallback.length > 0) addFiles(fallback);
  }, [addFiles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasContent = content.trim().length > 0;
    const hasFiles = pendingFiles.length > 0;
    if (!hasContent && !hasFiles) return;
    if (pendingFiles.some((pf) => pf.uploadStatus === "uploading")) {
      setError("Wait for attachments to finish uploading before sending.");
      return;
    }
    if (pendingFiles.some((pf) => pf.uploadStatus === "error")) {
      setError("Remove or retry failed attachments before sending.");
      return;
    }

    const msg = content;
    const mentionsToSend = selectedMentions.filter((selected) => mentionStillAppears(msg, selected));
    const filesToSend = [...pendingFiles];
    const attachmentIds = filesToSend.map((pf) => pf.attachmentId);
    if (hasFiles && attachmentIds.some((id) => !id)) {
      setError("Wait for attachments to finish uploading before sending.");
      return;
    }
    setContent("");
    setSelectedMentions([]);
    clearDraft(channelId);
    setPendingFiles([]);
    mention.dismiss();
    channel.dismiss();
    if (textareaRef.current) textareaRef.current.style.height = "";

    const messageContent = hasContent ? msg : `[${filesToSend.length} attachment${filesToSend.length > 1 ? "s" : ""}]`;
    const optimisticId = `optimistic-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    try {
      await onWillSend?.();
      setError("");

      // Create optimistic message immediately. Images get local blob previews; other files get filename cards.
      const optimisticAttachments = filesToSend.map((pf, i) => ({
        id: `optimistic-att-${i}`,
        filename: pf.file.name,
        mimeType: pf.file.type,
        sizeBytes: pf.file.size,
        width: pf.previewWidth ?? null,
        height: pf.previewHeight ?? null,
        localPreviewUrl: pf.preview,
        thumbnailUrl: null,
      }));
      addOptimisticMessage({
        id: optimisticId,
        channelId,
        senderType: "user",
        senderId: currentUser?.id || "",
        senderName: currentUser?.displayName || currentUser?.name || "You",
        messageType: "chat",
        content: messageContent,
        mentions: hasContent ? mentionsToSend : undefined,
        createdAt: new Date().toISOString(),
        attachments: optimisticAttachments.length > 0 ? optimisticAttachments : undefined,
      });

      // Send message with already-uploaded attachment ids — server response
      // arrives via socket, which auto-replaces the optimistic message.
      await sendMessage(channelId, messageContent, attachmentIds.filter((id): id is string => Boolean(id)), alsoCreateTask || undefined, optimisticId, hasContent ? mentionsToSend : undefined);
      // Do not revoke image blob URLs here. The message store preserves them
      // through the optimistic -> persisted handoff so sent images do not
      // flash/reload when the server ack replaces the local row.

      if (alsoCreateTask) {
        setAlsoCreateTask(false);
      }
    } catch (err) {
      // Remove optimistic message on failure, restore content
      removeOptimisticMessage(optimisticId, channelId);
      setContent(msg);
      setSelectedMentions(mentionsToSend);
      setPendingFiles(filesToSend);
      const errorMessage =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { error?: string } } }).response?.data?.error === "string"
          ? (err as { response?: { data?: { error?: string } } }).response!.data!.error!
          : "Failed to send message";
      setError(errorMessage);
      console.error("Failed to send message:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;

    if (mention.handleKeyDown(e, filteredMentions.flat.length, () => {
      const item = filteredMentions.flat[mention.index];
      if (item) doInsertMention(item);
    })) return;

    if (channel.handleKeyDown(e, filteredChannels.length, () => {
      const item = filteredChannels[channel.index];
      if (item) doInsertChannel(item);
    })) return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const hasUploadingAttachments = pendingFiles.some((pf) => pf.uploadStatus === "uploading");
  const hasFailedAttachments = pendingFiles.some((pf) => pf.uploadStatus === "error");
  const canSubmit = content.trim().length > 0 || pendingFiles.length > 0;

  return (
    <form
      onSubmit={handleSubmit}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative flex items-center border-t-2 border-black px-3 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] bg-white"
    >
      {/* Drop overlay — only visible while a file drag is in progress over
          the composer area. Pointer-events are kept on so the overlay
          itself is the drop target (browser fires drop on the topmost
          element under the cursor at drop time). */}
      {isDraggingFiles && (
        <div
          aria-hidden
          data-testid="composer-drop-overlay"
          className="absolute inset-0 z-30 flex items-center justify-center border-2 border-dashed border-brutal-pink bg-brutal-pink/15"
        >
          <span className="border-2 border-black bg-white px-3 py-1.5 text-sm font-bold text-black shadow-brutal-sm">
            Drop files to attach
          </span>
        </div>
      )}
      {/* @mention dropdown */}
      {mention.show && filteredMentions.flat.length > 0 && (
        <div
          ref={mention.popupRef}
          data-testid="mention-autocomplete-popover"
          className="absolute bottom-full left-3 right-3 mb-1 max-h-48 overflow-y-auto card-brutal"
        >
          {filteredMentions.inChannel.length > 0 && filteredMentions.notInChannel.length > 0 && (
            <SectionEyebrow as="div" className="px-3 py-1.5">
              In this channel
            </SectionEyebrow>
          )}
          {filteredMentions.inChannel.map((candidate, i) => (
            <button
              key={candidate.id}
              type="button"
              data-ac-index={i}
              onClick={() => doInsertMention(candidate)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                i === mention.index
                  ? "bg-brutal-yellow text-black font-bold"
                  : "text-black hover:bg-brutal-yellow/50"
              }`}
            >
              <MentionCandidateAvatar candidate={candidate} muted={false} />
              <MentionCandidateBody candidate={candidate} showActivity selected={i === mention.index} muted={false} />
            </button>
          ))}
          {filteredMentions.notInChannel.length > 0 && (
            <SectionEyebrow as="div" className={`px-3 py-1.5 ${filteredMentions.inChannel.length > 0 ? "border-t-2 border-black" : ""}`}>
              Not in this channel
            </SectionEyebrow>
          )}
          {filteredMentions.notInChannel.map((candidate, i) => {
            const flatIndex = filteredMentions.inChannel.length + i;
            const isSelected = flatIndex === mention.index;
            return (
              <button
                key={candidate.id}
                type="button"
                data-ac-index={flatIndex}
                onClick={() => doInsertMention(candidate)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                  isSelected
                    ? "bg-black/10 text-black/70 font-bold"
                    : "text-black/50 hover:bg-black/5"
                }`}
              >
                <MentionCandidateAvatar candidate={candidate} muted />
                <UserX size={12} className="shrink-0 text-black/40 -ml-1" />
                <MentionCandidateBody candidate={candidate} showActivity={false} selected={isSelected} muted />
              </button>
            );
          })}
        </div>
      )}

      {/* #channel dropdown */}
      {channel.show && filteredChannels.length > 0 && (
        <div
          ref={channel.popupRef}
          className="absolute bottom-full left-3 right-3 mb-1 max-h-48 overflow-y-auto card-brutal"
        >
          {filteredChannels.map((ch, i) => {
            const isSelected = i === channel.index;
            const isArchived = !!ch.archivedAt;
            return (
              <button
                key={ch.id}
                type="button"
                data-ac-index={i}
                onClick={() => doInsertChannel(ch)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                  isSelected
                    ? isArchived
                      ? "bg-black/10 text-black/70 font-bold"
                      : "bg-brutal-pink text-black font-bold"
                    : isArchived
                      ? "text-black/45 hover:bg-black/5"
                      : "text-black hover:bg-brutal-yellow"
                }`}
              >
                <div
                  className={`flex size-5 shrink-0 items-center justify-center border ${
                    isArchived
                      ? "border-black/40 bg-black/5 text-black/45"
                      : "border-black bg-brutal-yellow text-black"
                  }`}
                >
                  <Hash size={12} />
                </div>
                <span className="truncate">{ch.name}</span>
                {ch.description && (
                  <span className={`truncate text-xs ${isArchived ? "text-black/30" : "text-black/40"}`}>
                    {ch.description}
                  </span>
                )}
                {isArchived && (
                  <span className="ml-auto shrink-0 border border-black/40 bg-black/5 px-1 py-0.5 text-[9px] font-bold leading-none text-black/45">
                    archived
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="flex w-full flex-col gap-2">
        {error && (
          <div className="border-2 border-black bg-brutal-orange/20 px-2 py-1 text-[11px] font-bold leading-4 text-black">
            {error}
          </div>
        )}

        {/* Pending attachments */}
        {pendingFiles.length > 0 && (
          <DndContext
            sensors={dndSensors}
            collisionDetection={closestCenter}
            onDragEnd={(event: DragEndEvent) => {
              const { active, over } = event;
              if (over && active.id !== over.id) {
                setPendingFiles((prev) => {
                  const oldIndex = prev.findIndex((p) => p.id === active.id);
                  const newIndex = prev.findIndex((p) => p.id === over.id);
                  return arrayMove(prev, oldIndex, newIndex);
                });
              }
            }}
          >
            <SortableContext items={pendingFiles.map((pf) => pf.id)} strategy={horizontalListSortingStrategy}>
              <div className="flex gap-2 flex-wrap">
                {pendingFiles.map((pf, i) => (
                  <SortableAttachment
                    key={pf.id}
                    id={pf.id}
                    preview={pf.preview}
                    fileName={pf.file.name}
                    mimeType={pf.file.type}
                    uploadStatus={pf.uploadStatus}
                    uploadProgress={pf.uploadProgress}
                    uploadError={pf.uploadError}
                    onRemove={() => removeFile(i)}
                    onRetry={() => retryFile(pf.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Composer shell — single bordered card holding the textarea AND
            the action toolbar. stdrc 2026-05-07 #proj-message task #18:
            "参考分支 bugen/theme-skin-poc 做一下输入框的，按钮整合进输入框内部".
            Modern composer pattern (Linear / OpenAI playground / ChatGPT)
            unifies typing + actions into one card instead of stacking
            input + separate toolbar row. */}
        <div className="flex flex-col gap-2 border-2 border-black bg-white p-2 shadow-brutal-sm focus-within:shadow-brutal">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={`Message ${channelName}`}
            className="max-h-32 w-full resize-none text-base md:text-sm font-display focus:outline-none leading-5 min-h-5 md:min-h-10"
            rows={1}
          />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="btn-brutal-sm bg-white p-1"
                title="Attach image"
              >
                <ImagePlus size={14} />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-brutal-sm bg-white p-1"
                title="Attach file"
              >
                <Paperclip size={14} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              {showTaskButton && (
                <label className="inline-flex items-center gap-1.5 select-none">
                  <Checkbox
                    checked={alsoCreateTask}
                    onChange={(e) => setAlsoCreateTask(e.target.checked)}
                  />
                  <span className="text-xs font-bold text-black/60">As Task</span>
                </label>
              )}
              <button
                type="submit"
                disabled={!canSubmit || hasUploadingAttachments || hasFailedAttachments}
                className="btn-brutal-sm bg-brutal-pink p-1 disabled:opacity-30 disabled:pointer-events-none"
                title={
                  hasUploadingAttachments
                    ? "Uploading attachments…"
                    : hasFailedAttachments
                      ? "Retry or remove failed attachments"
                      : "Send"
                }
                aria-label={
                  hasUploadingAttachments
                    ? "Uploading attachments"
                    : hasFailedAttachments
                      ? "Retry or remove failed attachments"
                      : "Send"
                }
              >
                {hasUploadingAttachments ? (
                  <Spinner size="sm" />
                ) : (
                  <Send size={14} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
