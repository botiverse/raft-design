import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { User, Copy, MessageSquare, Download, ClipboardCheck, Circle, Play, CheckCircle, Ban, RotateCcw, Link, Bookmark, BookmarkMinus, Share2, Check, X, Languages, AlertTriangle, SmilePlus, Plus, TextQuote } from "lucide-react";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import type { ActionCardMetadata } from "@slock-ai/shared";
import { useMessageStore, type Message, type MessageMention } from "../../store/messageStore";
import { ActionCard } from "../actions/ActionCard";
import { useAuthStore } from "../../store/authStore";
import type { Channel } from "../../store/channelStore";
import { useAgentDisplayState, useAgentStore, type Agent } from "../../store/agentStore";
import type { ServerMember } from "../../store/serverStore";
import type { ChannelHuman } from "../../hooks/useChannelMembers";
import { useChannelStore } from "../../store/channelStore";

import { useTaskStore, type Task, type TaskStatus } from "../../store/taskStore";
import { STATUS_BADGE_CONFIG, canEditTaskStatus, getTaskStatusOptions } from "../task/taskStatusUi";
import { StatusBadge } from "../task/StatusBadge";
import { useThreadStore, type ThreadSummary } from "../../store/threadStore";
import { useSavedStore } from "../../store/savedStore";
import { useSelectionStore } from "../../store/selectionStore";
import { useAppNavigate, buildMessagePermalink } from "../../hooks/useAppNavigate";
import { useProfileStore } from "../../store/profileStore";
import { useServerStore } from "../../store/serverStore";
import { useServerPermissions } from "../../hooks/useServerPermissions";
import { isSilentTranslationEntry, useTranslationStore, type TranslationEntry } from "../../store/translationStore";
import { useLegacyTaskPanelStore } from "../../store/legacyTaskPanelStore";
import { getMessageBodyFontSizeClass, useAppearanceStore } from "../../store/appearanceStore";
import api from "../../api/client";
import { useImageLightboxStore } from "../../store/imageLightboxStore";
import { parseSlockPermalink } from "@slock-ai/shared";
import QuotedMessagePermalinkPreview from "./QuotedMessagePermalinkPreview";
import { extractFirstQuotedMessagePermalink } from "./quotedMessagePermalink";
import { emitSelectedTextQuote } from "./selectedTextQuote";
import { getTextSelectionWithinElement } from "./messageScopedSelection";
import MentionLink from "./MentionLink";
import { MSG_REF_CHIP } from "./messageRefChip";
import { useProfileHoverCard } from "../../hooks/useProfileHoverCard";
import { useTimeFormatter } from "../../hooks/useTimeFormatter";
import { BadgeButton, brutalBadgeClassName } from "../ui/Badge";
import StatusDot from "../ui/StatusDot";
import Banner from "../ui/Banner";
import AvatarSlot from "../ui/AvatarSlot";
import ContextMenuDivider from "../ui/ContextMenuDivider";
import MenuItem from "../ui/MenuItem";
import DismissBackdrop from "../ui/DismissBackdrop";
import Lightbox from "../ui/Lightbox";
import Button from "../ui/Button";
import CheckMarker from "../ui/CheckMarker";
import Spinner from "../ui/Spinner";
import SandboxedPreviewFrame from "../ui/SandboxedPreviewFrame";
import { documentPreviewLabel, isDiffPatchAttachment, isDocumentPreviewAttachment, isMp4Attachment, type AttachmentPreview, type DiffAttachmentPreview, type DocumentAttachmentPreview } from "./attachmentPreview";
import MarkdownContent from "../markdown/MarkdownContent";
import {
  createMarkdownOutlineHeadingComponents,
  extractMarkdownOutline,
  MarkdownOutlineNav,
} from "../markdown/MarkdownOutline";
import { AttachmentChip } from "./AttachmentChip";
import InlineBadgeEditor from "../InlineBadgeEditor";

import { formatReminderReceiptContentTitle, formatReminderReceiptTime, formatReminderReceiptTooltip, splitReminderReceiptFireAtTokens } from "../../utils/reminderReceiptTime";
import { imageGalleryBackgroundClass } from "../../utils/imagePreviewStyles";
import { resolveMessageSenderMember } from "../../utils/messageSenderMember";
import { isSlockUploadedHumanAvatarUrl } from "../../utils/humanAvatar";
import type { TimeFormatOptions } from "../../utils/timeFormatting";
import { wrapBareUrlsBeforeCjkPunctuation } from "../../utils/markdownAutolink";
import { createChannelRefRegex, createChannelThreadRefRegex } from "../../utils/messageReferencePatterns";
import { resolveThreadTargetByShortId } from "../../utils/threadRefNavigation";
import { escapeUserRawHtmlForMessageMarkdown, messageMarkdownSanitizeSchema } from "./messageMarkdownSecurity";
import { QUICK_REACTION_EMOJIS } from "./reactionConstants";
import { useFloatingOverlayPosition } from "../ui/useFloatingOverlayPosition";
import { placeTouchMessageContextMenu } from "./messageContextMenuPosition";

const REACTION_PICKER_EVENT = "slock:message-reaction-picker-open";
const REACTION_PICKER_WIDTH = 194;
const REACTION_PICKER_HEIGHT = 42;
const REACTION_PICKER_VIEWPORT_MARGIN = 8;

function buildOptimisticReactionMessage(
  message: Message,
  emoji: string,
  alreadyReacted: boolean,
  viewerUserId: string,
  viewerReactionName: string,
): Message {
  const reactions = message.reactions ?? [];
  const existingIndex = reactions.findIndex((reaction) => reaction.emoji === emoji);

  if (alreadyReacted) {
    if (existingIndex < 0) return message;
    const existing = reactions[existingIndex];
    const nextReactorIds: string[] = [];
    const nextReactorNames: string[] = [];

    existing.reactorIds.forEach((reactorId, index) => {
      if (reactorId === viewerUserId) return;
      nextReactorIds.push(reactorId);
      nextReactorNames.push(existing.reactorNames[index] ?? "Unknown");
    });

    const nextReaction = {
      ...existing,
      count: nextReactorIds.length,
      reactorIds: nextReactorIds,
      reactorNames: nextReactorNames,
    };
    const nextReactions = reactions.map((reaction, index) => (
      index === existingIndex ? nextReaction : reaction
    ));
    return { ...message, reactions: nextReactions };
  }

  if (existingIndex >= 0) {
    const existing = reactions[existingIndex];
    if (existing.reactorIds.includes(viewerUserId)) return message;
    const nextReaction = {
      ...existing,
      count: existing.count + 1,
      reactorIds: [...existing.reactorIds, viewerUserId],
      reactorNames: [...existing.reactorNames, viewerReactionName],
    };
    const nextReactions = reactions.map((reaction, index) => (
      index === existingIndex ? nextReaction : reaction
    ));
    return { ...message, reactions: nextReactions };
  }

  return {
    ...message,
    reactions: [
      ...reactions,
      {
        emoji,
        count: 1,
        reactorIds: [viewerUserId],
        reactorNames: [viewerReactionName],
      },
    ],
  };
}

function replaceReactionForEmoji(
  message: Message,
  source: Message,
  emoji: string,
): Message {
  const sourceReaction = (source.reactions ?? []).find((reaction) => reaction.emoji === emoji);
  const reactions = message.reactions ?? [];

  if (!sourceReaction) {
    return { ...message, reactions: reactions.filter((reaction) => reaction.emoji !== emoji) };
  }

  if (reactions.some((reaction) => reaction.emoji === emoji)) {
    return {
      ...message,
      reactions: reactions.map((reaction) => reaction.emoji === emoji ? sourceReaction : reaction),
    };
  }

  return { ...message, reactions: [...reactions, sourceReaction] };
}

function mergeReactionResponsePreservingPending(
  currentMessage: Message,
  serverMessage: Message,
  pendingEmojis: Set<string>,
): Message {
  if (pendingEmojis.size === 0) return serverMessage;

  let merged = serverMessage;
  for (const emoji of pendingEmojis) {
    merged = replaceReactionForEmoji(merged, currentMessage, emoji);
  }
  return merged;
}

interface ReactionGlyphProps {
  emoji: string;
  size: number;
  className?: string;
}

function ReactionGlyph({ emoji, size, className = "" }: ReactionGlyphProps) {
  const common = {
    "aria-hidden": true,
    className,
    height: size,
    viewBox: "0 0 24 24",
    width: size,
  } as const;

  switch (emoji) {
    case "👍":
      return (
        <svg {...common} fill="none">
          <path fill="#FFD440" d="M8 10h3l1.3-5.2c.2-.8 1-1.3 1.8-1.1 1 .2 1.6 1.2 1.3 2.2L14.5 10H19c1.1 0 2 .9 2 2v1.2c0 .4-.1.8-.3 1.1L18.8 20c-.3.6-1 1-1.7 1H8V10Z" />
          <path fill="#FFF8E7" d="M13.2 5.3c.2-.7.9-1.1 1.6-.8.1.1.2.1.3.2-.6 0-1 .4-1.2 1L13 9h-1.2l1.4-3.7Z" />
          <path fill="#8FC4D9" d="M3 10h5v11H3z" />
          <path stroke="#141111" strokeLinecap="square" strokeLinejoin="round" strokeWidth="2" d="M8 10h3l1.3-5.2c.2-.8 1-1.3 1.8-1.1 1 .2 1.6 1.2 1.3 2.2L14.5 10H19c1.1 0 2 .9 2 2v1.2c0 .4-.1.8-.3 1.1L18.8 20c-.3.6-1 1-1.7 1H8V10Z" />
          <path stroke="#141111" strokeLinejoin="round" strokeWidth="2" d="M3 10h5v11H3z" />
        </svg>
      );
    case "❤️":
    case "❤":
      return (
        <svg {...common} fill="none">
          <path fill="#F97264" d="M12 21 4.4 13.4C2.3 11.3 2.2 8 4.1 6.1 5.8 4.4 8.4 4.5 10 6.1l2 2 2-2c1.6-1.6 4.2-1.7 5.9 0 1.9 1.9 1.8 5.2-.3 7.3L12 21Z" />
          <path fill="#FFF8E7" d="M6.1 7.2c.8-.8 2-.8 2.9-.1L6 10.1c-.5-.9-.4-2.2.1-2.9Z" />
          <path stroke="#141111" strokeLinecap="square" strokeLinejoin="round" strokeWidth="2" d="M12 21 4.4 13.4C2.3 11.3 2.2 8 4.1 6.1 5.8 4.4 8.4 4.5 10 6.1l2 2 2-2c1.6-1.6 4.2-1.7 5.9 0 1.9 1.9 1.8 5.2-.3 7.3L12 21Z" />
        </svg>
      );
    case "🎉":
      return (
        <svg {...common} fill="none">
          <path fill="#BBAFE6" d="M4 20 8.5 8.5 16 16 4 20Z" />
          <path fill="#FFD440" d="M6.8 12.2 11.8 17.2 8.3 18.3 5.7 15.4z" />
          <path stroke="#141111" strokeLinejoin="round" strokeWidth="2" d="M4 20 8.5 8.5 16 16 4 20Z" />
          <path stroke="#141111" strokeLinecap="square" strokeWidth="2" d="M14 5h3M18 9l2.3-2.3M19 13h2.5" />
          <path fill="#F97264" d="M18 3h2.5v2.5H18z" />
          <path fill="#27CCF3" d="M13 6h2.5v2.5H13z" />
        </svg>
      );
    case "👀":
      return (
        <svg {...common} fill="none">
          <path fill="#27CCF3" d="M3 11c0-3.1 2.2-5 4.8-5s4.8 1.9 4.8 5-2.2 5-4.8 5S3 14.1 3 11Z" />
          <path fill="#27CCF3" d="M11.4 11c0-3.1 2.2-5 4.8-5S21 7.9 21 11s-2.2 5-4.8 5-4.8-1.9-4.8-5Z" />
          <path fill="#FFF8E7" d="M5.2 9.2h2v2h-2zM13.6 9.2h2v2h-2z" />
          <path fill="#141111" d="M7.8 8.8h2.8v4.6H7.8zM16.2 8.8H19v4.6h-2.8z" />
          <path stroke="#141111" strokeLinejoin="round" strokeWidth="2" d="M3 11c0-3.1 2.2-5 4.8-5s4.8 1.9 4.8 5-2.2 5-4.8 5S3 14.1 3 11Z" />
          <path stroke="#141111" strokeLinejoin="round" strokeWidth="2" d="M11.4 11c0-3.1 2.2-5 4.8-5S21 7.9 21 11s-2.2 5-4.8 5-4.8-1.9-4.8-5Z" />
        </svg>
      );
    case "🔥":
      return (
        <svg {...common} fill="none">
          <path fill="#F8A16F" d="M12 22c-4.4 0-7.6-3-7.6-7.1 0-3.1 1.9-5.4 4.1-7.1.3 2 1.2 3.2 2.3 3.9-.3-3.3 1-6.3 4.1-8.7.5 3 2.1 4.7 3.4 6.3 1.1 1.4 1.3 2.9 1.3 5.1 0 4.4-3.1 7.6-7.6 7.6Z" />
          <path fill="#FFD440" d="M12.1 19.8c-2.2 0-3.8-1.4-3.8-3.5 0-1.5.9-2.7 2.1-3.6.2 1 .6 1.7 1.3 2 .1-1.8.8-3.2 2.3-4.4.3 1.5 1 2.4 1.7 3.2.6.7.8 1.4.8 2.5 0 2.3-1.7 3.8-4.4 3.8Z" />
          <path stroke="#141111" strokeLinecap="square" strokeLinejoin="round" strokeWidth="2" d="M12 22c-4.4 0-7.6-3-7.6-7.1 0-3.1 1.9-5.4 4.1-7.1.3 2 1.2 3.2 2.3 3.9-.3-3.3 1-6.3 4.1-8.7.5 3 2.1 4.7 3.4 6.3 1.1 1.4 1.3 2.9 1.3 5.1 0 4.4-3.1 7.6-7.6 7.6Z" />
          <path stroke="#141111" strokeLinejoin="round" strokeWidth="1.5" d="M12.1 19.8c-2.2 0-3.8-1.4-3.8-3.5 0-1.5.9-2.7 2.1-3.6.2 1 .6 1.7 1.3 2 .1-1.8.8-3.2 2.3-4.4.3 1.5 1 2.4 1.7 3.2.6.7.8 1.4.8 2.5 0 2.3-1.7 3.8-4.4 3.8Z" />
        </svg>
      );
    case "😂":
      return (
        <svg {...common} fill="none">
          <path fill="#FFD440" d="M4 5h16v14H4z" />
          <path fill="#141111" d="M7 9h3.2v2.4H7zM13.8 9H17v2.4h-3.2zM8 14h8v2H8z" />
          <path fill="#27CCF3" d="M5 12h2.4v4.5H5zM16.6 12H19v4.5h-2.4z" />
          <path stroke="#141111" strokeLinejoin="round" strokeWidth="2" d="M4 5h16v14H4z" />
          <path stroke="#141111" strokeWidth="1.5" d="M8 16c1 1.2 2.2 1.8 4 1.8s3-.6 4-1.8" />
        </svg>
      );
    default:
      return <span className={className} style={{ fontSize: size, lineHeight: 1 }}>{emoji}</span>;
  }
}

function ReactionCount({ count }: { count: number }) {
  const previousCountRef = useRef(count);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (previousCountRef.current === count) return;
    previousCountRef.current = count;
    setAnimationKey((key) => key + 1);
  }, [count]);

  return (
    <span
      key={animationKey}
      className={`font-mono tabular-nums ${animationKey > 0 ? "reaction-count-bump" : ""}`}
    >
      {count}
    </span>
  );
}

type MessageImageAttachment = NonNullable<Message["attachments"]>[number];
type ImageAspectKind = "wide" | "tall" | "normal";
const SINGLE_IMAGE_MAX_WIDTH = 416;
const SINGLE_IMAGE_MAX_HEIGHT = 288;

export interface ImageGalleryRow {
  attachments: MessageImageAttachment[];
  gridClass: string;
  heightClass: string;
}

export function classifyImageAspect(att: Pick<MessageImageAttachment, "width" | "height">): ImageAspectKind {
  if (!att.width || !att.height || att.width <= 0 || att.height <= 0) return "normal";
  const ratio = att.width / att.height;
  if (ratio >= 2.2) return "wide";
  if (ratio <= 0.55) return "tall";
  return "normal";
}

function getImageGalleryRowClasses(attachments: MessageImageAttachment[]): Omit<ImageGalleryRow, "attachments"> {
  if (attachments.length <= 1) {
    return { gridClass: "grid-cols-1", heightClass: "h-32 sm:h-36" };
  }
  if (attachments.length === 2) {
    return { gridClass: "grid-cols-2", heightClass: "h-32 sm:h-36" };
  }
  return { gridClass: "grid-cols-2 md:grid-cols-3", heightClass: "h-28 sm:h-32" };
}

export function buildImageGalleryRows(attachments: MessageImageAttachment[]): ImageGalleryRow[] {
  if (attachments.length <= 1) {
    return attachments.length === 0 ? [] : [{ attachments, ...getImageGalleryRowClasses(attachments) }];
  }

  const rows: ImageGalleryRow[] = [];
  let buffer: MessageImageAttachment[] = [];

  const pushBufferedRows = () => {
    if (buffer.length === 0) return;
    const chunkSize = buffer.length === 4 ? 2 : 3;
    for (let i = 0; i < buffer.length; i += chunkSize) {
      const rowAttachments = buffer.slice(i, i + chunkSize);
      rows.push({ attachments: rowAttachments, ...getImageGalleryRowClasses(rowAttachments) });
    }
    buffer = [];
  };

  for (const attachment of attachments) {
    if (classifyImageAspect(attachment) === "wide") {
      pushBufferedRows();
      rows.push({ attachments: [attachment], ...getImageGalleryRowClasses([attachment]) });
      continue;
    }
    buffer.push(attachment);
  }

  pushBufferedRows();
  return rows;
}

function getImageGalleryFitClass(att: MessageImageAttachment): string {
  return classifyImageAspect(att) === "normal" ? "object-cover" : "object-contain";
}

function getSingleImageReserveStyle(att: MessageImageAttachment) {
  if (!att.width || !att.height || att.width <= 0 || att.height <= 0) {
    return { width: "min(11rem, 100%)", aspectRatio: "4 / 3" };
  }

  const scale = Math.min(SINGLE_IMAGE_MAX_WIDTH / att.width, SINGLE_IMAGE_MAX_HEIGHT / att.height, 1);
  const reservedWidth = Math.max(1, Math.round(att.width * scale));
  return { width: `min(${reservedWidth}px, 100%)`, aspectRatio: `${att.width} / ${att.height}` };
}

export interface MentionEntry {
  displayName: string;
  type: "agent" | "user";
  id: string;
}

/** Build a lookup map of all mentionable names → display info */
export function buildMentionMap(
  agents: Agent[],
  humans: ServerMember[],
  channelAgents: Agent[] = [],
  channelHumans: ChannelHuman[] = [],
): Map<string, MentionEntry> {
  const map = new Map<string, MentionEntry>();
  for (const agent of [...agents, ...channelAgents]) {
    map.set(agent.name.toLowerCase(), {
      displayName: agent.displayName || agent.name,
      type: "agent",
      id: agent.id,
    });
  }
  for (const human of humans) {
    map.set(human.name.toLowerCase(), {
      displayName: human.displayName || human.name,
      type: "user",
      id: human.userId,
    });
  }
  for (const human of channelHumans) {
    map.set(human.name.toLowerCase(), {
      displayName: human.displayName || human.name,
      type: "user",
      id: human.id,
    });
  }
  return map;
}

function buildStructuredMentionMap(mentions: MessageMention[] | undefined): Map<string, MentionEntry> {
  const map = new Map<string, MentionEntry>();
  for (const mention of mentions ?? []) {
    const name = mention.name.trim();
    if (!name) continue;
    map.set(name.toLowerCase(), {
      displayName: name,
      type: mention.type,
      id: mention.id,
    });
  }
  return map;
}

/** Render message content as Markdown with @mention and #channel highlighting */
function renderContent(
  content: string,
  channels: Channel[],
  mentionMap: Map<string, MentionEntry>,
  structuredMentionMap: Map<string, MentionEntry>,
  onNavigateChannel: (channel: Channel) => void,
  onNavigateAgent: (agentId: string) => void,
  onNavigateHuman: (userId: string) => void,
  onOpenThread?: (parentChannelId: string, shortId: string) => void | Promise<void>,
  resolvingThreadRefKey?: string | null,
  onOpenTaskRef?: (taskNumber: number) => void,
  onOpenPermalink?: (href: string) => void,
  currentServerSlug?: string,
  knownTaskNumbers?: Set<number>,
  timeFormatOptions: TimeFormatOptions = {},
) {
  // Pre-process blockquotes: insert blank line after quote blocks so non-quoted
  // lines don't get absorbed as "lazy continuation" (standard markdown behavior)
  let processed = content.replace(
    /(^|\n)(>.*?)(\n)(?!>|\n)/g,
    "$1$2\n$3"
  );

  // Protect code regions from mention/channel replacement.
  // Fenced code blocks (```...```) and inline code (`...`) are replaced with
  // null-byte placeholders so @mention and #channel regexes skip them.
  const codePlaceholders: string[] = [];
  const protectCode = (s: string) => {
    // Fenced code blocks first (greedy across lines)
    s = s.replace(/```[\s\S]*?```/g, (match) => {
      const idx = codePlaceholders.length;
      codePlaceholders.push(match);
      return `\x00CODE${idx}\x00`;
    });
    // Then inline code (backticks — handles `` double backtick `` too)
    s = s.replace(/``[^`]+``|`[^`]+`/g, (match) => {
      const idx = codePlaceholders.length;
      codePlaceholders.push(match);
      return `\x00CODE${idx}\x00`;
    });
    return s;
  };
  const restoreCode = (s: string) =>
    s.replace(/\x00CODE(\d+)\x00/g, (_m, idx) => codePlaceholders[Number(idx)]);

  // Convert literal \n sequences to actual newlines so markdown/remark-breaks
  // can handle them. This is needed because some LLM outputs contain escaped
  // newlines instead of real ones. Code blocks are already protected above.
  processed = protectCode(processed);
  processed = wrapBareUrlsBeforeCjkPunctuation(processed);
  processed = processed.replace(/\\n/g, "\n");
  processed = escapeUserRawHtmlForMessageMarkdown(processed);

  // Pre-process @mentions: only replace if the name matches a known agent or human
  processed = processed.replace(/@([\p{L}\p{N}_-]+)/gu, (match, name: string) => {
    const entry = structuredMentionMap.get(name.toLowerCase()) ?? mentionMap.get(name.toLowerCase());
    if (!entry) return match; // Not a known name — keep as plain text
    const safeName = name.replace(/"/g, "&quot;");
    return `<a data-mention="${safeName}" data-mention-type="${entry.type}" data-mention-id="${entry.id}">@${safeName}</a>`;
  });

  // Pre-process thread references: #channel:shortId or dm:@peer:shortId
  // Use placeholders to avoid double-processing by the channel regex
  const threadPlaceholders: string[] = [];
  const channelNameSet = new Set(channels.map((c) => c.name.toLowerCase()));
  processed = processed.replace(createChannelThreadRefRegex(), (match, chanName: string, shortId: string) => {
    if (!channelNameSet.has(chanName.toLowerCase())) return match;
    const chan = channels.find((c) => c.name.toLowerCase() === chanName.toLowerCase() && (c.type === "channel" || c.type === "private" || c.type === "joint"));
    const html = `<a data-thread-ref="${shortId}" data-thread-parent="${chan?.id || ""}">#${chanName}:${shortId}</a>`;
    const idx = threadPlaceholders.length;
    threadPlaceholders.push(html);
    return `\x00THREAD${idx}\x00`;
  });
  processed = processed.replace(/dm:@([\w-]+):([\da-f]{6,8})/gi, (_match, peerName: string, shortId: string) => {
    const dm = channels.find(
      (c) => c.type === "dm" && (c.peerName?.toLowerCase() === peerName.toLowerCase() || c.name.toLowerCase() === peerName.toLowerCase())
    );
    const html = `<a data-thread-ref="${shortId}" data-thread-parent="${dm?.id || ""}">dm:@${peerName}:${shortId}</a>`;
    const idx = threadPlaceholders.length;
    threadPlaceholders.push(html);
    return `\x00THREAD${idx}\x00`;
  });

  // Pre-process task references: "task #205" always links; bare "#205" only if it's a known task
  const taskPlaceholders: string[] = [];
  processed = processed.replace(/(^|[^\w/])(?:(task\s+))?#(\d+)\b/gi, (match, prefix: string, taskKeyword: string | undefined, taskNumber: string) => {
    const hasExplicitPrefix = !!taskKeyword;
    const isKnownTask = knownTaskNumbers?.has(Number(taskNumber));
    if (!hasExplicitPrefix && !isKnownTask) return match;
    const html = `<a data-task-ref="${taskNumber}">#${taskNumber}</a>`;
    const idx = taskPlaceholders.length;
    taskPlaceholders.push(html);
    return `${prefix}${taskKeyword ?? ""}\x00TASK${idx}\x00`;
  });

  // Pre-process #channel references: only replace if name matches a known channel
  processed = processed.replace(createChannelRefRegex(), (match, name: string) => {
    if (!channelNameSet.has(name.toLowerCase())) return match; // Not a known channel — keep as plain text
    return `<a data-channel="${name}">#${name}</a>`;
  });

  // Restore task/thread placeholders, then code placeholders
  processed = processed.replace(/\x00TASK(\d+)\x00/g, (_m, idx) => taskPlaceholders[Number(idx)]);
  processed = processed.replace(/\x00THREAD(\d+)\x00/g, (_m, idx) => threadPlaceholders[Number(idx)]);
  processed = restoreCode(processed);

  // Chat body shares its visual styling (code blocks, lists, headings, table,
  // etc.) with attachment preview via BASE_MARKDOWN_COMPONENTS in
  // MarkdownContent. We override only the elements that need chat-specific
  // behavior — `a` (mentions / channel refs / task refs / thread refs /
  // slock permalinks) and `span` (reminder receipts).
  // stdrc 2026-05-08 #proj-uiux:6110c1ce (task #137).
  return (
    <MarkdownContent
      source={processed}
      density="compact"
      rehypePlugins={[rehypeRaw, [rehypeSanitize, messageMarkdownSanitizeSchema]]}
      components={{
        // Links — handle @mention, #channel, and regular URLs
        a: ({ href, children, node }) => {
          // @mention → clickable, navigates to agent or human detail
          const mentionName = node?.properties?.dataMention as string | undefined;
          if (mentionName) {
            const mentionType = node?.properties?.dataMentionType as string | undefined;
            const mentionId = node?.properties?.dataMentionId as string | undefined;

            if (!mentionId || (mentionType !== "agent" && mentionType !== "user")) {
              return (
                <span className="font-bold text-black underline decoration-black/30 decoration-2 underline-offset-2 select-text">
                  {children}
                </span>
              );
            }

            return (
              <MentionLink
                mentionType={mentionType}
                mentionId={mentionId}
                onNavigate={() =>
                  mentionType === "agent" ? onNavigateAgent(mentionId) : onNavigateHuman(mentionId)
                }
              >
                {children}
              </MentionLink>
            );
          }
          // Thread reference → clickable, opens thread panel
          const threadRef = node?.properties?.dataThreadRef as string | undefined;
          if (threadRef && onOpenThread) {
            const parentId = node?.properties?.dataThreadParent as string | undefined;
            if (!parentId) {
              return (
                <span className={`${MSG_REF_CHIP} bg-brutal-cyan/30 text-black opacity-60`}>
                  {children}
                </span>
              );
            }
            const threadRefKey = `${parentId}:${threadRef.toLowerCase()}`;
            const isResolvingThreadRef = resolvingThreadRefKey === threadRefKey;
            return (
              <a
                href="#"
                aria-busy={isResolvingThreadRef}
                onClick={(e) => {
                  e.preventDefault();
                  if (isResolvingThreadRef) return;
                  void onOpenThread(parentId, threadRef);
                }}
                className={`${MSG_REF_CHIP} bg-brutal-cyan/30 text-black ${isResolvingThreadRef ? "cursor-wait opacity-80" : "cursor-default hover:bg-brutal-cyan/60"}`}
              >
                <span>{children}</span>
                {isResolvingThreadRef ? (
                  <Spinner size="xs" className="ml-1 align-[-1px]" />
                ) : null}
              </a>
            );
          }
          // #channel → clickable, navigates to channel
          const channelName = node?.properties?.dataChannel as string | undefined;
          if (channelName) {
            const channel = channels.find(
              (c) => c.name.toLowerCase() === channelName.toLowerCase() && (c.type === "channel" || c.type === "private" || c.type === "joint")
            );
            if (!channel) {
              return (
                <span className={`${MSG_REF_CHIP} bg-brutal-pink/30 text-black opacity-60`}>
                  {children}
                </span>
              );
            }
            return (
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateChannel(channel);
                }}
                className={`${MSG_REF_CHIP} bg-brutal-pink/30 text-black cursor-default hover:bg-brutal-pink/60`}
              >
                {children}
              </a>
            );
          }
          // #205 → clickable, resolves a task in the current channel context
          const taskRef = node?.properties?.dataTaskRef as string | undefined;
          if (taskRef && onOpenTaskRef) {
            const taskNumber = Number(taskRef);
            if (!Number.isInteger(taskNumber) || taskNumber <= 0) {
              return (
                <span className={`${MSG_REF_CHIP} bg-brutal-yellow/30 text-black opacity-60`}>
                  {children}
                </span>
              );
            }
            return (
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenTaskRef(taskNumber);
                }}
                className={`${MSG_REF_CHIP} bg-brutal-yellow/40 text-black cursor-default hover:bg-brutal-yellow`}
              >
                {children}
              </a>
            );
          }
          const slockPermalink = href
            ? parseSlockPermalink(
                href,
                typeof window !== "undefined" ? window.location.hostname : undefined
              )
            : null;
          if (href && slockPermalink) {
            const channel = channels.find((entry) => entry.id === slockPermalink.channelId);
            const channelLabel = channel
              ? channel.type === "dm"
                ? `@${channel.peerDisplayName || channel.peerName || channel.name}`
                : `#${channel.name}`
              : "linked message";
            const isCurrentServer = !currentServerSlug || slockPermalink.serverSlug === currentServerSlug;

            return (
              <a
                href={href}
                onClick={(e) => {
                  e.preventDefault();
                  if (isCurrentServer) {
                    onOpenPermalink?.(href);
                    return;
                  }
                  window.open(href, "_blank", "noopener,noreferrer");
                }}
                className={`${MSG_REF_CHIP} cursor-default ${
                  isCurrentServer
                    ? "bg-brutal-yellow/40 text-black hover:bg-brutal-yellow"
                    : "bg-white text-blue-700 hover:bg-black/5"
                }`}
                title={href}
              >
                <Link size={12} className="mr-1 inline-block align-[-2px]" />
                <span>{channelLabel}</span>
                <span className="ml-1 text-[10px] font-normal leading-none text-black/50">msg</span>
              </a>
            );
          }
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline decoration-2 underline-offset-2 hover:text-brutal-pink select-text"
            >
              {children}
            </a>
          );
        },
        // Reminder-receipt span: when ReactMarkdown sees `<span data-reminder-fire-at="...">...</span>`
        // (rehypeRaw + sanitize lets that data attribute through), re-render
        // with a humanized fire time + tooltip. Other `<span>`s pass through
        // unchanged.
        span: ({ children, node, ...props }) => {
          const reminderFireAt = (node?.properties?.dataReminderFireAt
            || node?.properties?.["data-reminder-fire-at"]) as string | undefined;
          if (reminderFireAt) {
            return (
              <span
                {...props}
                title={formatReminderReceiptTooltip(reminderFireAt, timeFormatOptions)}
              >
                {formatReminderReceiptTime(reminderFireAt, new Date(), timeFormatOptions)}
              </span>
            );
          }
          return <span {...props}>{children}</span>;
        },
      }}
    />
  );
}

function isPreviewableImageAttachment(att: NonNullable<Message["attachments"]>[number]): boolean {
  const mimeType = att.mimeType.split(";")[0]?.trim().toLowerCase();
  if (mimeType === "image/svg+xml") {
    return Boolean(att.thumbnailUrl && att.rasterPreviewUrl);
  }
  return mimeType?.startsWith("image/") ?? false;
}

function isOptimisticAttachment(att: NonNullable<Message["attachments"]>[number]): boolean {
  return att.id.startsWith("optimistic-att-");
}

function isPreviewableHtmlAttachment(att: NonNullable<Message["attachments"]>[number]): boolean {
  const mimeType = att.mimeType.split(";")[0]?.trim().toLowerCase();
  return mimeType === "text/html" || /\.html?$/i.test(att.filename);
}

function isPreviewableDocumentAttachment(att: NonNullable<Message["attachments"]>[number]): boolean {
  return isDocumentPreviewAttachment(att);
}

function isPreviewableVideoAttachment(att: NonNullable<Message["attachments"]>[number]): boolean {
  return isMp4Attachment(att);
}

interface DocumentAttachmentPreviewState {
  preview: DocumentAttachmentPreview;
  truncated: boolean;
}

function formatAttachmentSize(sizeBytes: number | undefined): string {
  if (!sizeBytes || sizeBytes <= 0) return "";
  if (sizeBytes >= 1024 * 1024) return `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
}

function DiffPatchStatsLine({ preview }: { preview: DiffAttachmentPreview | null }) {
  if (!preview) {
    return <span className="text-black/70">Diff preview</span>;
  }

  const { files, hunks, additions, deletions } = preview.stats;
  const fileLabel = files === 1 ? "file" : "files";
  const hunkLabel = hunks === 1 ? "hunk" : "hunks";

  return (
    <>
      <span className="text-black/70">{files} {fileLabel} · {hunks} {hunkLabel}</span>
      <span className="text-[#1f883d]">+{additions}</span>
      <span className="text-[#cf222e]">-{deletions}</span>
    </>
  );
}

function DocumentPreviewSummaryLine({ preview }: { preview: DocumentAttachmentPreviewState | null }) {
  if (!preview) {
    return <span className="text-black/70">Document preview</span>;
  }

  if (preview.preview.kind === "csv") {
    const rowLabel = preview.preview.rows.length === 1 ? "row" : "rows";
    const colLabel = preview.preview.columnCount === 1 ? "column" : "columns";
    const prefix = preview.truncated ? "First" : "Preview";
    return <span className="text-black/70">{prefix} {preview.preview.rows.length} {rowLabel} · {preview.preview.columnCount} {colLabel}</span>;
  }
  if (preview.preview.kind === "markdown") {
    return <span className="text-black/70">Markdown document</span>;
  }
  if (preview.preview.kind === "text") {
    return <span className="text-black/70">Plain text document</span>;
  }
  return <span className="text-black/70">PDF document</span>;
}

function AttachmentCard({
  attachment,
  isOptimistic,
  isHtml,
  isImage,
  isVideo,
  isHtmlLoading,
  onClick,
  onDownload,
}: {
  attachment: NonNullable<Message["attachments"]>[number];
  isOptimistic: boolean;
  isHtml: boolean;
  isImage: boolean;
  isVideo: boolean;
  isHtmlLoading: boolean;
  onClick: () => void;
  onDownload: () => void;
}) {
  const [diffPreview, setDiffPreview] = useState<DiffAttachmentPreview | null>(null);
  const [documentPreview, setDocumentPreview] = useState<DocumentAttachmentPreviewState | null>(null);
  const isDiffPatch = isDiffPatchAttachment(attachment);
  const isDocumentPreview = isPreviewableDocumentAttachment(attachment);

  useEffect(() => {
    let cancelled = false;
    if ((!isDiffPatch && !isDocumentPreview) || isOptimistic) {
      setDiffPreview(null);
      setDocumentPreview(null);
      return;
    }
    api.get<AttachmentPreview>(`/attachments/${attachment.id}/preview`)
      .then(({ data }) => {
        if (cancelled) return;
        if (data.status === "ok" && data.data.kind === "diff") {
          setDiffPreview(data.data);
          setDocumentPreview(null);
          return;
        }
        if (data.status === "ok" && (data.data.kind === "csv" || data.data.kind === "markdown" || data.data.kind === "pdf" || data.data.kind === "text")) {
          setDocumentPreview({ preview: data.data, truncated: data.truncated === true });
          setDiffPreview(null);
          return;
        }
        setDiffPreview(null);
        setDocumentPreview(null);
      })
      .catch(() => {
        if (!cancelled) {
          setDiffPreview(null);
          setDocumentPreview(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [attachment.id, isDiffPatch, isDocumentPreview, isOptimistic]);

  if (isDiffPatch) {
    return (
      <AttachmentChip
        attachment={attachment}
        variant="compact"
        isOptimistic={isOptimistic}
        onClick={onDownload}
        affordance="download"
        meta={<>{attachment.mimeType || "patch"}{attachment.sizeBytes ? ` · ${formatAttachmentSize(attachment.sizeBytes)}` : ""}</>}
        summary={<DiffPatchStatsLine preview={diffPreview} />}
      />
    );
  }

  if (isDocumentPreview) {
    return (
      <AttachmentChip
        attachment={attachment}
        variant="compact"
        isOptimistic={isOptimistic}
        loading={isHtmlLoading}
        onClick={onClick}
        affordance="preview"
        affordanceName="document-preview"
        meta={<>{documentPreview ? documentPreviewLabel(documentPreview.preview.kind) : attachment.mimeType || "document"}{attachment.sizeBytes ? ` · ${formatAttachmentSize(attachment.sizeBytes)}` : ""}</>}
        summary={<DocumentPreviewSummaryLine preview={documentPreview} />}
      />
    );
  }

  return (
    <AttachmentChip
      attachment={attachment}
      variant="wide"
      isOptimistic={isOptimistic}
      loading={isHtmlLoading}
      onClick={isImage || isHtml || isVideo ? onClick : onDownload}
      affordance={isImage || isHtml || isVideo ? "preview" : "download"}
      affordanceName={isHtml ? "html-preview" : isImage ? "image-preview" : isVideo ? "video-preview" : "file-download"}
      icon={isVideo ? <Play size={16} className="text-black/70" /> : undefined}
      meta={<><span>{isHtml ? "HTML preview" : isVideo ? "MP4 video preview" : attachment.mimeType || "file"}</span>{attachment.sizeBytes ? <span>· {formatAttachmentSize(attachment.sizeBytes)}</span> : null}</>}
    />
  );
}

function AttachmentPreviewShell({
  filename,
  label,
  onClose,
  onDownload,
  layout = "fill",
  children,
}: {
  filename: string;
  label: string;
  onClose: () => void;
  onDownload: () => void;
  // Markdown previews need the portal root itself to scroll so Chrome's
  // native find-in-page can bring off-screen matches into view.
  layout?: "fill" | "browser-find";
  children: React.ReactNode;
}) {
  const browserFindLayout = layout === "browser-find";
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <Lightbox
      onClose={onClose}
      data-testid={browserFindLayout ? "attachment-preview-browser-find-scroll" : undefined}
      backdropClass={browserFindLayout ? "bg-brutal-cream" : undefined}
      positionClass={browserFindLayout ? "absolute left-0 right-0 top-0 min-h-screen" : undefined}
      lockBodyScroll={!browserFindLayout}
      scrollIntoViewOnMount={browserFindLayout}
      className={
        browserFindLayout
          ? "bg-brutal-cream"
          : "flex flex-col items-center justify-center"
      }
    >
      <div
        className={
          browserFindLayout
            ? "safe-top safe-left pointer-events-auto sticky top-0 z-10 border-b-2 border-black bg-white"
            : "safe-top safe-left pointer-events-auto absolute left-0 right-0 top-0 z-10 border-b-2 border-black bg-white"
        }
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-14 items-center gap-3 px-4">
          {/* Split filename + label into separate flex children so the badge
              keeps a reserved slot (shrink-0) instead of riding inside the
              filename's truncate envelope. Previously a long filename would
              push the label past the truncate boundary and clip it entirely
              on narrow viewports — there's no `text-overflow: ellipsis`
              affordance for "ellipsize the leading text node, keep the
              trailing inline-block". (#proj-uiux task #133, Nana7mi/tygg) */}
          <div className="flex min-w-0 flex-1 items-center gap-2" title={`${filename} · ${label}`}>
            <span className="min-w-0 flex-1 truncate text-sm font-display text-black">
              {filename}
            </span>
            <span className="shrink-0 rounded-full border border-black/20 bg-black/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-black/60">
              {label}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Button type="button" onClick={onDownload} shape="icon" title="Download">
              <Download size={14} />
            </Button>
            <Button type="button" onClick={onClose} shape="icon" title="Close">
              <X size={14} />
            </Button>
          </div>
        </div>
      </div>
      <div
        className={
          browserFindLayout
            ? "pointer-events-auto bg-brutal-cream"
            : "absolute bottom-0 left-0 right-0 overflow-hidden bg-white"
        }
        style={
          browserFindLayout
            ? undefined
            : { top: "calc(56px + env(safe-area-inset-top, 0px))" }
        }
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </Lightbox>
  );
}

function HtmlAttachmentPreviewModal({
  filename,
  url,
  onClose,
  onDownload,
}: {
  filename: string;
  url: string;
  onClose: () => void;
  onDownload: () => void;
}) {
  return (
    <AttachmentPreviewShell filename={filename} label="HTML preview" onClose={onClose} onDownload={onDownload}>
      {/* Threat model: any human or agent can upload hostile HTML. We allow
          scripts for Mermaid/interactive diagrams, but intentionally omit
          allow-same-origin/top-navigation/forms/popups so the preview cannot
          join the Slock origin, read credentials, or affect the parent app.
          Isolation primitive shared with the mermaid diagram preview — config
          pinned here, unchanged from the pre-extraction iframe. */}
      <SandboxedPreviewFrame
        title={`HTML preview: ${filename}`}
        src={url}
        sandbox="allow-scripts"
        referrerPolicy="no-referrer"
        className="h-full w-full border-0 bg-white"
      />
    </AttachmentPreviewShell>
  );
}

function VideoAttachmentPreviewModal({
  filename,
  url,
  onClose,
  onDownload,
}: {
  filename: string;
  url: string;
  onClose: () => void;
  onDownload: () => void;
}) {
  return (
    <AttachmentPreviewShell filename={filename} label="MP4 preview" onClose={onClose} onDownload={onDownload}>
      <div className="flex h-full w-full items-center justify-center bg-black p-4">
        <video
          title={`MP4 preview: ${filename}`}
          src={url}
          controls
          playsInline
          preload="metadata"
          className="max-h-full max-w-full border-2 border-black bg-black"
        />
      </div>
    </AttachmentPreviewShell>
  );
}

function CsvPreviewPane({ preview, truncated }: { preview: Extract<DocumentAttachmentPreview, { kind: "csv" }>; truncated: boolean }) {
  return (
    <div className="h-full overflow-auto bg-brutal-cream/45 p-4 font-mono text-[11px] text-black">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold text-black/55">
        <span>CSV data preview</span>
        <span>{truncated ? `First ${preview.rows.length} rows` : `${preview.rowCount} rows`} · {preview.columnCount} columns</span>
      </div>
      <div className="max-h-[70vh] overflow-auto border-2 border-black bg-white shadow-brutal-sm">
        <table className="min-w-full border-collapse bg-white">
          <thead className="sticky top-0 z-10 bg-brutal-cream">
            <tr>
              {preview.headers.map((header, index) => (
                <th key={`${header}-${index}`} className="max-w-[220px] border border-black px-2 py-1 text-left font-bold">
                  <span className="block truncate" title={header}>{header || `Column ${index + 1}`}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="odd:bg-black/[0.03]">
                {preview.headers.map((_, columnIndex) => {
                  const value = row[columnIndex] ?? "";
                  return (
                    <td key={columnIndex} className="max-w-[220px] border border-black/40 px-2 py-1 align-top">
                      <span className="block truncate" title={value}>{value}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-xs font-bold text-black/50">
        {truncated
          ? `Preview truncated for performance. Showing first ${preview.rows.length} rows from the file prefix.`
          : `Showing ${preview.rows.length} of ${preview.rowCount} rows`}
      </div>
    </div>
  );
}

function MarkdownPreviewPane({ markdown, truncated }: { markdown: string; truncated: boolean }) {
  // Visual styling delegated to MarkdownContent so attachment preview shares
  // chat-body markdown primitives. The preview wrapper owns only the Slock
  // landing/blog-style reading shell: card, measure, and page padding.
  // stdrc 2026-05-08 #proj-uiux:6110c1ce (task #137).
  //
  // The server caps the markdown preview to a byte prefix
  // (markdownPreviewProvider.streamByteCap, 128KB) and returns
  // `truncated: true` when the file is larger. Before #proj-uiux task #269
  // this pane silently dropped that flag (CsvPreviewPane / TextPreviewPane
  // already surface it): a user Cmd-F-searching for text that lives past the
  // cut got no match and no explanation — "Cmd-F won't bring me to the
  // content" (cindyz). Surface the boundary explicitly and point at Download
  // (in the shell header) for the full file. Invariant: a truncated preview
  // must visibly declare its boundary so absent matches read as "not in this
  // preview", not "not in this file".
  const outline = useMemo(() => extractMarkdownOutline(markdown), [markdown]);
  const headingComponents = useMemo(
    () => createMarkdownOutlineHeadingComponents(outline),
    [outline],
  );

  return (
    <div className="min-h-[calc(100vh-56px)] bg-brutal-cream px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto grid max-w-3xl gap-6 xl:max-w-6xl xl:grid-cols-[minmax(0,48rem)_16rem] xl:items-start">
        <div className="min-w-0">
          {truncated ? (
            <Banner
              intent="warning"
              density="lg"
              className="mb-4"
              data-testid="markdown-preview-truncated"
            >
              <span className="font-bold">Preview truncated.</span>{" "}
              This file is large, so only the beginning is shown — find-in-page
              (⌘/Ctrl-F) won't match text beyond this preview. Use Download for
              the full file.
            </Banner>
          ) : null}
          <div className="card-brutal bg-white px-6 py-8 font-display text-base text-black md:px-10 md:py-12">
            <MarkdownContent
              source={markdown}
              density="document"
              enableMermaid
              components={headingComponents}
            />
          </div>
        </div>
        <div className="hidden xl:sticky xl:top-20 xl:block xl:max-h-[calc(100vh-7rem)] xl:self-start xl:overflow-auto">
          <MarkdownOutlineNav outline={outline} />
        </div>
      </div>
    </div>
  );
}

function TextPreviewPane({ text, truncated }: { text: string; truncated: boolean }) {
  return (
    <div className="h-full overflow-auto bg-brutal-cream/45 p-4">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold text-black/55">
        <span>Plain text preview</span>
        {truncated ? <span>Truncated</span> : null}
      </div>
      <pre className="min-h-full whitespace-pre-wrap break-words border-2 border-black bg-white p-4 font-mono text-xs leading-5 text-black shadow-brutal-sm">
        {text}
      </pre>
    </div>
  );
}

function DocumentAttachmentPreviewModal({
  filename,
  preview,
  truncated,
  url,
  onClose,
  onDownload,
}: {
  filename: string;
  preview: DocumentAttachmentPreview;
  truncated: boolean;
  url: string | null;
  onClose: () => void;
  onDownload: () => void;
}) {
  return (
    <AttachmentPreviewShell
      filename={filename}
      label={documentPreviewLabel(preview.kind)}
      onClose={onClose}
      onDownload={onDownload}
      layout={preview.kind === "markdown" ? "browser-find" : "fill"}
    >
      {preview.kind === "csv" ? <CsvPreviewPane preview={preview} truncated={truncated} /> : null}
      {preview.kind === "markdown" ? <MarkdownPreviewPane markdown={preview.markdown} truncated={truncated} /> : null}
      {preview.kind === "text" ? <TextPreviewPane text={preview.text} truncated={truncated} /> : null}
      {preview.kind === "pdf" ? (
        // Threat model: PDFs are uploaded by any human or agent, so the bytes
        // are attacker-controlled. Native PDF viewers (Chrome plugin, Firefox
        // pdf.js) run scripts inside the iframe — `allow-scripts` keeps the
        // viewer working while the absent `allow-same-origin` keeps the frame
        // in an opaque origin, so a hostile PDF cannot reach Slock cookies,
        // storage, or the parent DOM. Shares the same primitive + isolation
        // config as the HTML preview above (#proj-frontend:8b1098b4
        // react-doctor `iframe-missing-sandbox`, Ark security review).
        <SandboxedPreviewFrame
          title={`PDF preview: ${filename}`}
          src={url ?? ""}
          sandbox="allow-scripts"
          referrerPolicy="no-referrer"
          className="h-full w-full border-0 bg-white"
        />
      ) : null}
    </AttachmentPreviewShell>
  );
}

interface MessageItemProps {
  message: Message;
  mentionMap: Map<string, MentionEntry>;
  channels: Channel[];
  previewSenderAgent?: Agent;
  previewSenderMember?: ServerMember;
  threadSummary?: ThreadSummary;
  parentChannelId?: string;
  parentMessageId?: string;
  hideThreadActions?: boolean;
  showThreadFollowAction?: boolean;
  linkedTask?: Task;
  senderAvatarTestId?: string;
  onBeforeOpenThread?: () => void;
}

// Isolated subscriber — only re-renders when this agent's activity changes.
function AgentStatusDot({ agentId }: { agentId: string }) {
  const displayState = useAgentDisplayState(agentId);
  return (
    <StatusDot
      activity={displayState.activity}
      title={displayState.activityText}
      size="lg"
      className="absolute -bottom-[2px] -right-[2px]"
    />
  );
}

// Isolates hover-card state so opening the card doesn't re-render the whole MessageItem.
function MessageSenderAvatar({
  showAgent,
  isDeactivatedAgent,
  senderId,
  agentAvatarUrl,
  avatarUrl,
  gravatarHash,
  email,
  testId,
  onNavigateAgent,
  onNavigateHuman,
}: {
  showAgent: boolean;
  isDeactivatedAgent: boolean;
  senderId: string;
  agentAvatarUrl: string | null;
  avatarUrl: string | null;
  gravatarHash: string | undefined;
  email?: string | null;
  testId?: string;
  onNavigateAgent: (id: string) => void;
  onNavigateHuman: (id: string) => void;
}) {
  const { anchorRef, triggerProps, card, closeImmediate } = useProfileHoverCard<HTMLElement>({
    mentionType: showAgent ? "agent" : "user",
    mentionId: senderId,
  });
  const onClickAgent = () => {
    closeImmediate();
    onNavigateAgent(senderId);
  };
  const onClickHuman = () => {
    closeImmediate();
    onNavigateHuman(senderId);
  };
  const humanAvatarSource = isSlockUploadedHumanAvatarUrl(avatarUrl)
    ? "uploaded"
    : gravatarHash
      ? "gravatar-hash"
      : email
        ? "email-fallback"
        : "placeholder";
  // Unified wrapper structure for both agent + human paths so the avatar
  // top sits at the same vertical offset regardless of sender kind. Was:
  // agent had an extra wrapping <div relative> (for AgentStatusDot's
  // absolute positioning) which inherited inline-block baseline alignment
  // and pushed the inner button down by ~11px. human had only the bare
  // button. Net effect: agent avatar drifted noticeably below human
  // avatar across an otherwise identical message row. (#wg-theme:7470ca2a
  // stdrc 2026-05-11.)
  //
  // Now both kinds render `<button>` as the avatar wrapper. The button
  // owns `relative` so AgentStatusDot can absolute-position against it
  // (no extra div wrapper, no inline-block baseline drift).
  //
  // `mt-1` (was `mt-0.5`) pushes the avatar's top border down to the
  // visible cap-top of the sender-name first line, not the bare line-box
  // top. With text-sm + leading-5, the rendered cap-top of the first line
  // is roughly 4–5px below the line-box top, so a 4px `mt` keeps the
  // avatar's outer border visually flush with the first line of text
  // rather than floating above it. Per stdrc: "头像的上面要留一些空间，
  // 使得头像的顶部边框与其右边第一行内容的顶部保持对齐."
  if (showAgent) {
    return (
      <>
        <button
          ref={anchorRef as React.RefObject<HTMLButtonElement>}
          onClick={onClickAgent}
          {...triggerProps}
          data-testid={testId}
          data-avatar-kind="agent"
          data-avatar-source={agentAvatarUrl ? "agent-avatar" : "placeholder"}
          className="relative mt-1 shrink-0 self-start hover:brightness-90 transition-colors"
        >
          <AvatarSlot
            context="panel-header"
            type="agent"
            agentAvatarUrl={agentAvatarUrl}
            className={isDeactivatedAgent ? "grayscale opacity-60" : ""}
          />
          {!isDeactivatedAgent && <AgentStatusDot agentId={senderId} />}
        </button>
        {card}
      </>
    );
  }
  return (
    <>
      <button
        ref={anchorRef as React.RefObject<HTMLButtonElement>}
        onClick={onClickHuman}
        {...triggerProps}
        data-testid={testId}
        data-avatar-kind="human"
        data-avatar-source={humanAvatarSource}
        data-avatar-has-uploaded={isSlockUploadedHumanAvatarUrl(avatarUrl) ? "true" : "false"}
        data-avatar-has-gravatar-hash={gravatarHash ? "true" : "false"}
        data-avatar-has-email-fallback={email ? "true" : "false"}
        className="mt-1 shrink-0 self-start hover:brightness-90 transition-colors"
      >
        <AvatarSlot
          context="panel-header"
          type="human"
          humanAvatarUrl={avatarUrl}
          gravatarHash={gravatarHash}
          email={email}
        />
      </button>
      {card}
    </>
  );
}

function translationIndicatorText(entry: TranslationEntry, showOriginal: boolean) {
  const reason = entry.reason ?? "";
  if (entry.status === "translated") {
    return showOriginal
      ? { label: "Show translation", message: "", title: "Original shown. Show translation", tone: "normal" as const }
      : { label: "Show original", message: "", title: "Translated. Show original", tone: "normal" as const };
  }
  if (entry.status === "pending") {
    return { label: "", message: "Translating…", title: "Translating", tone: "pending" as const };
  }
  return { label: "Retry", message: "Translation unavailable", title: "Translation unavailable", tone: "failed" as const };
}

function TranslationIndicator({
  entry,
  onToggleOriginal,
  onRetry,
  onUpgrade,
  showOriginal,
}: {
  entry: TranslationEntry;
  onToggleOriginal: () => void;
  onRetry: () => void;
  onUpgrade: () => void;
  showOriginal: boolean;
}) {
  if (isSilentTranslationEntry(entry)) return null;
  const text = translationIndicatorText(entry, showOriginal);
  const Icon = text.tone === "failed" ? AlertTriangle : Languages;
  const handleAction = text.label === "Retry"
    ? onRetry
    : text.label === "Upgrade"
      ? onUpgrade
      : onToggleOriginal;
  const action = text.label
    ? (
      <button
        type="button"
        onClick={handleAction}
        className={`font-bold underline decoration-black/40 underline-offset-2 hover:decoration-black ${
          text.tone === "failed" ? "text-brutal-orange" : ""
        }`}
        title={text.title}
        aria-label={text.label || text.title}
      >
        {text.label}
      </button>
    )
    : null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 text-[11px] font-mono ${
        text.tone === "failed" ? "text-brutal-orange" : "text-black/45"
      }`}
      data-testid={`message-translation-indicator-${entry.messageId}`}
      title={action ? undefined : text.title}
    >
      <Icon size={12} className={text.tone === "pending" ? "animate-pulse" : ""} />
      {text.message && <span>{text.message}</span>}
      {text.message && action && <span aria-hidden>·</span>}
      {action}
    </div>
  );
}

const MessageItem = memo(function MessageItem({ message, mentionMap, channels, previewSenderAgent, previewSenderMember, threadSummary, parentChannelId, parentMessageId, hideThreadActions, showThreadFollowAction, linkedTask, senderAvatarTestId, onBeforeOpenThread }: MessageItemProps) {
  const isHighlightedInChannel = useMessageStore((s) => s.highlightedMessageId === message.id);
  const isHighlightedInThread = useThreadStore((s) => s.focusedMessageId === message.id);
  const isHighlighted = isHighlightedInChannel || isHighlightedInThread;
  const isAgent = message.senderType === "agent";
  const isSystem = message.messageType === "system";
  const isRemovedHuman = !isAgent && message.senderMembershipStatus === "removed";
  const structuredMentionMap = useMemo(() => buildStructuredMentionMap(message.mentions), [message.mentions]);
  const { formatMessageTime, options: timeFormatOptions } = useTimeFormatter();
  const time = formatMessageTime(message.createdAt);
  const viewer = useAuthStore((s) => s.user);
  const currentUser = viewer;
  const storeSenderAgent = useAgentStore((s) =>
    message.senderType === "agent"
      ? s.agents.find((agent) => agent.id === message.senderId)
      : undefined
  );
  const storeSenderMember = useServerStore((s) =>
    message.senderType === "user"
      ? s.members.find((member) => member.userId === message.senderId)
      : undefined
  );
  const senderAgent = previewSenderAgent ?? storeSenderAgent;
  const senderMember = useMemo(() => {
    if (previewSenderMember) return previewSenderMember;
    const memberById = new Map<string, ServerMember>();
    if (storeSenderMember) memberById.set(storeSenderMember.userId, storeSenderMember);
    return resolveMessageSenderMember(message, memberById, currentUser);
  }, [currentUser, message, previewSenderMember, storeSenderMember]);
  const isDeactivatedAgent = isAgent && !!senderAgent?.deletedAt;
  const viewerUserId = viewer?.id ?? null;
  const viewerReactionName = viewer?.displayName || viewer?.name || viewer?.email || "You";
  const { capabilities } = useServerPermissions();
  const canManageServer = capabilities.manageServer;

  const serverSlug = useServerStore((s) => s.current?.slug);
  const dmChannels = useChannelStore((s) => s.dmChannels);
  const requestTransientFocus = useMessageStore((s) => s.requestTransientFocus);
  const nav = useAppNavigate();
  const translationSettings = useTranslationStore((s) => s.settings);
  const translationEntry = useTranslationStore((s) => s.entries[message.id]);
  const retryTranslation = useTranslationStore((s) => s.retryMessage);
  const setTranslationShowOriginal = useTranslationStore((s) => s.setShowOriginal);
  const messageBodyFontSize = useAppearanceStore((s) => s.messageBodyFontSize);
  const messageBodyFontSizeClass = getMessageBodyFontSizeClass(messageBodyFontSize);
  const translationTargetLanguage = translationSettings.available
    ? translationSettings.effectiveLanguage
    : null;
  const translationEligible =
    !isSystem &&
    !!translationTargetLanguage &&
    !(message.senderType === "user" && viewerUserId === message.senderId);
  const activeTranslationEntry = translationEligible ? translationEntry : undefined;
  const activeTranslationShowOriginal =
    activeTranslationEntry?.showOriginal ?? translationSettings.preferredTranslationDisplay === "original";
  const isTranslationPending =
    translationEligible &&
    !activeTranslationShowOriginal &&
    (!activeTranslationEntry || activeTranslationEntry.status === "pending");
  const translatedContent =
    activeTranslationEntry?.status === "translated" &&
    activeTranslationEntry.translatedContent &&
    !activeTranslationShowOriginal
      ? activeTranslationEntry.translatedContent
      : null;
  const visibleMessageContent = translatedContent ?? message.content;
  const currentHostname = typeof window !== "undefined" ? window.location.hostname : undefined;
  const quotedPermalink = useMemo(
    () => extractFirstQuotedMessagePermalink(message.content, currentHostname, serverSlug),
    [currentHostname, message.content, serverSlug],
  );
  const handleNavigateAgent = (agentId: string) => {
    useProfileStore.getState().openProfile("agent", agentId);
  };

  const handleNavigateHuman = (userId: string) => {
    useProfileStore.getState().openProfile("human", userId);
  };

  // Look up agent's avatar
  const agentAvatarUrl = senderAgent?.avatarUrl ?? null;
  const humanAvatarUrl = senderMember?.avatarUrl ?? null;
  const senderAgentDmChannel = isAgent
    ? dmChannels.find((channel) => channel.peerType === "agent" && channel.peerId === message.senderId)
    : null;
  const senderEmailForAvatar =
    !isAgent && currentUser?.id === message.senderId && !senderMember?.gravatarHash
      ? currentUser.email
      : null;

  // Sender subtitle: agent description or human description (fallback to role)
  const senderDisplayName = isAgent
    ? senderAgent?.displayName || senderAgentDmChannel?.peerDisplayName || senderAgent?.name || message.senderName || "Agent"
    : message.senderName || "User";
  const senderSubtitle = isAgent
    ? senderAgent?.description || message.senderDescription || null
    : senderMember?.description || message.senderDescription || senderMember?.role || null;

  const openThread = useThreadStore((s) => s.openThread);
  const closeThread = useThreadStore((s) => s.closeThread);
  const followedThreads = useThreadStore((s) => s.followedThreads);
  const followThread = useThreadStore((s) => s.followThread);
  const unfollowThread = useThreadStore((s) => s.unfollowThread);
  const openParentMessageId = useThreadStore((s) => s.openParentMessageId);
  const openParentChannelId = useThreadStore((s) => s.openParentChannelId);

  // Select mode (multi-select share). Subscribed early because handleMobileTap
  // below intercepts clicks when scoped here.
  //
  // Two scopes:
  //  - Channel mode (selection.threadRootId === null): top-level rows in
  //    `channelId` are selectable — that's `!parentMessageId` rows whose
  //    `message.channelId === selection.channelId`.
  //  - Thread mode (selection.threadRootId !== null): the parent message
  //    (rendered in its parent channel) AND its thread replies (rendered with
  //    `parentMessageId === threadRootId`) are selectable. Channel-timeline
  //    rows are NOT selectable in this scope.
  const selectionActive = useSelectionStore((s) => s.isActive);
  const selectionChannelId = useSelectionStore((s) => s.channelId);
  const selectionThreadRootId = useSelectionStore((s) => s.threadRootId);
  const selectionScopedHere =
    selectionActive &&
    (selectionThreadRootId === null
      ? !parentMessageId && selectionChannelId === message.channelId
      : message.id === selectionThreadRootId ||
        parentMessageId === selectionThreadRootId);
  const isSelected = useSelectionStore((s) => s.selectedIds.has(message.id));
  const toggleSelection = useSelectionStore((s) => s.toggle);
  const enterSelection = useSelectionStore((s) => s.enter);
  const enterThreadSelection = useSelectionStore((s) => s.enterThread);
  const isSelectedAsThreadParent =
    !parentMessageId &&
    !hideThreadActions &&
    message.id === openParentMessageId &&
    message.channelId === openParentChannelId;
  const openLegacyTask = useLegacyTaskPanelStore((s) => s.openLegacyTask);
  const closeProfile = useProfileStore((s) => s.closeProfile);
  const canShowThreadFollowAction = !hideThreadActions || !!showThreadFollowAction;
  const messageRef = useRef<HTMLDivElement | null>(null);
  const messageBodyRef = useRef<HTMLDivElement | null>(null);
  const followedThread = canShowThreadFollowAction
    ? followedThreads.find((thread) => thread.parentMessageId === message.id)
    : null;
  const hasThreadConversation = !!threadSummary?.threadChannelId || (threadSummary?.replyCount ?? 0) > 0 || !!followedThread;
  const threadUnreadCount = threadSummary?.unreadCount ?? 0;
  const firstUnreadThreadMessageId = threadUnreadCount > 0 ? threadSummary?.firstUnreadMessageId ?? null : null;

  const handleReplyInThread = useCallback(() => {
    onBeforeOpenThread?.();
    const chId = parentChannelId || message.channelId;
    openThread(chId, message.id);
  }, [onBeforeOpenThread, openThread, parentChannelId, message.channelId, message.id]);

  const handleOpenThreadReplies = useCallback(() => {
    onBeforeOpenThread?.();
    const chId = parentChannelId || message.channelId;
    openThread(chId, message.id, firstUnreadThreadMessageId);
  }, [firstUnreadThreadMessageId, onBeforeOpenThread, openThread, parentChannelId, message.channelId, message.id]);

  // On mobile (no hover), tapping a message opens its thread.
  // When select mode is active for this message's channel, single-click (any
  // device) toggles selection instead and we suppress the thread-open path.
  const handleMobileTap = useCallback((e: React.MouseEvent) => {
    if (selectionScopedHere) {
      const target = e.target as HTMLElement;
      // Allow links/buttons inside selected rows to still work
      if (target.closest("a, button")) return;
      e.preventDefault();
      toggleSelection(message.id);
      return;
    }
    if (hideThreadActions) return;
    // Don't open thread if long-press context menu just fired
    if (longPressFired.current) return;
    // Only on touch devices (no hover capability)
    if (window.matchMedia("(hover: hover)").matches) return;
    // Don't intercept clicks on interactive elements (links, buttons, code blocks, images)
    const target = e.target as HTMLElement;
    if (target.closest("a, button, pre, code, img")) return;
    handleReplyInThread();
  }, [hideThreadActions, handleReplyInThread, selectionScopedHere, toggleSelection, message.id]);

  const [resolvingThreadRefKey, setResolvingThreadRefKey] = useState<string | null>(null);
  const [threadRefNotice, setThreadRefNotice] = useState<string | null>(null);
  const threadRefNoticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearThreadRefNoticeTimer = useCallback(() => {
    if (threadRefNoticeTimerRef.current) {
      clearTimeout(threadRefNoticeTimerRef.current);
      threadRefNoticeTimerRef.current = null;
    }
  }, []);

  const showThreadRefNotice = useCallback((notice: string) => {
    clearThreadRefNoticeTimer();
    setThreadRefNotice(notice);
    threadRefNoticeTimerRef.current = setTimeout(() => {
      setThreadRefNotice(null);
      threadRefNoticeTimerRef.current = null;
    }, 4000);
  }, [clearThreadRefNoticeTimer]);

  useEffect(() => () => clearThreadRefNoticeTimer(), [clearThreadRefNoticeTimer]);

  const navigableChannels = useMemo(
    () => [...channels, ...dmChannels.filter((dm) => !channels.some((channel) => channel.id === dm.id))],
    [channels, dmChannels],
  );
  const taskSurfaceChannel = useMemo(
    () => navigableChannels.find((channel) => channel.id === (parentChannelId || message.channelId)),
    [message.channelId, navigableChannels, parentChannelId],
  );
  const supportsMessageTasks = taskSurfaceChannel?.type !== "joint";

  const handleOpenThreadRef = useCallback(async (parentChId: string, shortId: string) => {
    const threadRefKey = `${parentChId}:${shortId.toLowerCase()}`;
    clearThreadRefNoticeTimer();
    setThreadRefNotice(null);
    setResolvingThreadRefKey(threadRefKey);

    let threadTarget: { parentMessageId: string; focusedMessageId?: string | null } | null = null;
    try {
      threadTarget = await resolveThreadTargetByShortId({
        parentChannelId: parentChId,
        shortId,
        summaries: useThreadStore.getState().summaries,
        followedThreads: useThreadStore.getState().followedThreads,
        loadContext: async (channelId, targetShortId) => {
          const { data } = await api.get<{ targetMessageId?: string | null }>(
            `/messages/context/${targetShortId}`,
            { params: { channelId } },
          );
          return data;
        },
      });
    } finally {
      setResolvingThreadRefKey((current) => current === threadRefKey ? null : current);
    }

    if (threadTarget) {
      const parentChannel = navigableChannels.find((channel) => channel.id === parentChId);
      if (parentChannel?.type === "dm") {
        nav.toDmMessage(parentChId, threadTarget.parentMessageId);
      } else {
        nav.toMessage(parentChId, threadTarget.parentMessageId);
      }
      void openThread(parentChId, threadTarget.parentMessageId, threadTarget.focusedMessageId);
      return;
    }
    showThreadRefNotice("Unable to open thread. It may be unavailable or deleted.");
  }, [clearThreadRefNoticeTimer, nav, navigableChannels, openThread, showThreadRefNotice]);

  // Save / unsave message
  const isSaved = useSavedStore((s) => s.savedIds.has(message.id));

  const handleToggleSave = useCallback(() => {
    if (isSaved) {
      useSavedStore.getState().unsaveMessage(message.id);
    } else {
      useSavedStore.getState().saveMessage(message.id);
    }
  }, [isSaved, message.id]);

  // Context menu for "Convert to task"
  const [ctxMenu, setCtxMenu] = useState<{ anchorX: number; anchorY: number; x: number; y: number; source: "pointer" | "touch"; selectionText?: string } | null>(null);
  const ctxMenuRef = useRef<HTMLDivElement | null>(null);
  // iOS can emit a synthetic mousedown/click pair after long-press touchend.
  // Keep a short-lived portal shield mounted so neither event reaches the
  // outside-click overlay and closes the menu as soon as the finger lifts.
  const [ctxMenuClickShielded, setCtxMenuClickShielded] = useState(false);
  const ctxMenuShieldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const convertMessage = useTaskStore((s) => s.convertMessage);
  const channelTasks = useTaskStore((s) => s.tasks);
  const serverTasks = useTaskStore((s) => s.serverTasks);
  const knownTaskNumbers = useMemo(() => {
    const nums = new Set<number>();
    for (const t of channelTasks) nums.add(t.taskNumber);
    for (const t of serverTasks) nums.add(t.taskNumber);
    return nums;
  }, [channelTasks, serverTasks]);
  const updateTaskStatus = useTaskStore((s) => s.updateTaskStatus);
  const [converting, setConverting] = useState(false);
  const pendingReactionEmojisRef = useRef<Set<string>>(new Set());
  const reactionFailureFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [reactionFailureEmoji, setReactionFailureEmoji] = useState<string | null>(null);
  const [reactionPicker, setReactionPicker] = useState<{ x: number; y: number } | null>(null);
  const reactionPickerCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleOpenThreadFromContextMenu = useCallback(() => {
    setCtxMenu(null);
    handleReplyInThread();
  }, [handleReplyInThread]);
  const [reactionPopover, setReactionPopover] = useState<{
    emoji: string;
    visibleNames: string[];
    hiddenCount: number;
    x: number;
    y: number;
  } | null>(null);
  const [htmlPreview, setHtmlPreview] = useState<{
    attachment: NonNullable<Message["attachments"]>[number];
    url: string;
  } | null>(null);
  const [videoPreview, setVideoPreview] = useState<{
    attachment: NonNullable<Message["attachments"]>[number];
    url: string;
  } | null>(null);
  const [documentPreview, setDocumentPreview] = useState<{
    attachment: NonNullable<Message["attachments"]>[number];
    preview: DocumentAttachmentPreview;
    truncated: boolean;
    url: string | null;
  } | null>(null);
  const [htmlPreviewLoadingId, setHtmlPreviewLoadingId] = useState<string | null>(null);
  const [videoPreviewLoadingId, setVideoPreviewLoadingId] = useState<string | null>(null);
  const [documentPreviewLoadingId, setDocumentPreviewLoadingId] = useState<string | null>(null);
  const documentPreviewRequestRef = useRef<Map<string, Promise<void>>>(new Map());

  const positionReactionPickerFromRect = useCallback((rect: DOMRect) => {
    if (reactionPickerCloseTimerRef.current) {
      clearTimeout(reactionPickerCloseTimerRef.current);
      reactionPickerCloseTimerRef.current = null;
    }
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const minLeft = REACTION_PICKER_VIEWPORT_MARGIN;
    const maxLeft = Math.max(minLeft, viewportWidth - REACTION_PICKER_WIDTH - REACTION_PICKER_VIEWPORT_MARGIN);
    const desiredLeft = rect.right - REACTION_PICKER_WIDTH;
    const belowTop = rect.bottom + 4;
    const maxTop = Math.max(REACTION_PICKER_VIEWPORT_MARGIN, viewportHeight - REACTION_PICKER_HEIGHT - REACTION_PICKER_VIEWPORT_MARGIN);
    const desiredTop = belowTop > maxTop && rect.top > REACTION_PICKER_HEIGHT + REACTION_PICKER_VIEWPORT_MARGIN
      ? rect.top - REACTION_PICKER_HEIGHT - 4
      : belowTop;

    window.dispatchEvent(new CustomEvent(REACTION_PICKER_EVENT, { detail: { messageId: message.id } }));
    setReactionPicker({
      x: Math.min(Math.max(desiredLeft, minLeft), maxLeft),
      y: Math.min(Math.max(desiredTop, REACTION_PICKER_VIEWPORT_MARGIN), maxTop),
    });
  }, [message.id]);

  const getScopedSelectionText = useCallback(() => {
    if (typeof window === "undefined") return "";
    return getTextSelectionWithinElement(window.getSelection(), messageBodyRef.current);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (isSystem) return;
    // Once select mode is active, a second right-click should not re-open the
    // context menu — the user is in a focused selection task and the menu's
    // "Share messages…" / "Copy link" entries either duplicate their current
    // state or would derail the flow. Still preventDefault so the browser's
    // native menu also stays out of the way.
    if (selectionActive) {
      e.preventDefault();
      return;
    }
    // Read the selection synchronously here — opening the menu won't preserve
    // it across the render. When there's an in-message selection we show the
    // selection context menu (Quote / Copy) instead of the
    // message-level row menu (#proj-chat task #32).
    const selectionText = getScopedSelectionText();
    e.preventDefault();
    setCtxMenu({
      anchorX: e.clientX,
      anchorY: e.clientY,
      x: e.clientX,
      y: e.clientY,
      source: "pointer",
      selectionText: selectionText || undefined,
    });
    setReactionPicker(null);
  }, [getScopedSelectionText, isSystem, selectionActive]);

  // Long-press to open context menu on mobile
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isSystem) return;
    const target = e.target as HTMLElement;
    if (target.closest("[data-message-selectable='true']")) return;
    // Parity with handleContextMenu: once select mode is active, long-press
    // should not re-open the context menu either. Mobile users toggle
    // selection by tapping rows in select mode; the popup menu here would
    // only get in the way.
    if (selectionActive) return;
    longPressFired.current = false;
    const touch = e.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      setCtxMenu(placeTouchMessageContextMenu({ x, y }));
      setReactionPicker(null);
      setCtxMenuClickShielded(true);
      if (ctxMenuShieldTimerRef.current) clearTimeout(ctxMenuShieldTimerRef.current);
      ctxMenuShieldTimerRef.current = setTimeout(() => {
        setCtxMenuClickShielded(false);
        ctxMenuShieldTimerRef.current = null;
      }, 600);
    }, 500);
  }, [isSystem, selectionActive]);

  useEffect(() => () => {
    if (ctxMenuShieldTimerRef.current) {
      clearTimeout(ctxMenuShieldTimerRef.current);
      ctxMenuShieldTimerRef.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (longPressFired.current) {
      // Prevent synthetic click from closing the menu
      e.preventDefault();
    }
  }, []);

  const handleTouchMove = useCallback(() => {
    // Cancel long press if finger moves (scrolling)
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // Selection-quote v0 (#proj-chat task #32). Which composer the Quote lands
  // in — mirrors the "Share messages…" routing exactly so a thread reply
  // quotes into the thread composer, a thread parent rendered in ThreadPanel
  // quotes into that thread, and a channel-timeline row quotes into the
  // channel composer.
  const quoteComposerChannelId = useMemo(() => {
    if (parentMessageId) return message.channelId; // thread reply → thread channel
    if (hideThreadActions && message.threadId) return message.threadId; // parent in ThreadPanel
    return parentChannelId || message.channelId; // channel timeline
  }, [parentMessageId, hideThreadActions, message.threadId, parentChannelId, message.channelId]);

  const handleQuoteSelection = useCallback(() => {
    const text = ctxMenu?.selectionText;
    setCtxMenu(null);
    if (text) emitSelectedTextQuote(quoteComposerChannelId, text);
  }, [ctxMenu?.selectionText, quoteComposerChannelId]);

  // "Copy" — copies the selection as plain text (Selection.toString()).
  // Labeled plainly "Copy" not "Copy markdown" because v0 has no source
  // markdown (stdrc msg=5d1369ae); DOM→markdown fidelity is the v1 follow-up.
  const handleCopySelection = useCallback(() => {
    const text = ctxMenu?.selectionText;
    setCtxMenu(null);
    if (text) navigator.clipboard.writeText(text);
  }, [ctxMenu?.selectionText]);

  const handleConvertToTask = useCallback(async () => {
    setCtxMenu(null);
    setConverting(true);
    try {
      await convertMessage(message.id);
    } catch (err) {
      console.error("Failed to convert message to task:", err);
    } finally {
      setConverting(false);
    }
  }, [convertMessage, message.id]);

  const canEditLinkedTaskStatus = linkedTask
    ? canEditTaskStatus(linkedTask, viewerUserId ?? undefined, canManageServer)
    : false;
  const linkedTaskStatusOptions = useMemo(
    () => linkedTask
      ? getTaskStatusOptions(linkedTask, viewerUserId ?? undefined, canManageServer)
      : [],
    [canManageServer, linkedTask, viewerUserId],
  );
  const [editingTaskStatus, setEditingTaskStatus] = useState(false);
  const [taskStatusBusy, setTaskStatusBusy] = useState(false);

  const handleSelectTaskStatus = useCallback(async (id: string) => {
    if (!linkedTask) return;
    const nextStatus = id as TaskStatus;
    if (nextStatus === linkedTask.status) {
      setEditingTaskStatus(false);
      return;
    }
    setTaskStatusBusy(true);
    try {
      await updateTaskStatus(linkedTask.channelId, linkedTask.id, nextStatus);
      setEditingTaskStatus(false);
    } catch (err) {
      console.error("Failed to update task status:", err);
    } finally {
      setTaskStatusBusy(false);
    }
  }, [linkedTask, updateTaskStatus]);

  const handleToggleTaskDone = useCallback(async () => {
    if (!linkedTask) return;
    setCtxMenu(null);
    const nextStatus = linkedTask.status === "done" ? "todo" : "done";
    try {
      await updateTaskStatus(linkedTask.channelId, linkedTask.id, nextStatus);
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  }, [linkedTask, updateTaskStatus]);

  const handleFollowThread = useCallback(async () => {
    setCtxMenu(null);
    try {
      await followThread(message.id);
    } catch (err) {
      console.error("Failed to follow thread:", err);
    }
  }, [followThread, message.id]);

  const handleUnfollowThread = useCallback(async () => {
    if (!followedThread) return;
    setCtxMenu(null);
    try {
      await unfollowThread(followedThread.threadChannelId);
    } catch (err) {
      console.error("Failed to unfollow thread:", err);
    }
  }, [followedThread, unfollowThread]);

  const reactions = message.reactions ?? [];
  const visibleReactions = reactions.filter((reaction) => reaction.count > 0);
  const hasCurrentUserReaction = useCallback((emoji: string) => {
    if (!viewerUserId) return false;
    return reactions.some((reaction) => reaction.emoji === emoji && reaction.reactorIds.includes(viewerUserId));
  }, [reactions, viewerUserId]);

  const handleToggleReaction = useCallback(async (emoji: string) => {
    if (!viewerUserId || isSystem || pendingReactionEmojisRef.current.has(emoji)) return;
    const alreadyReacted = hasCurrentUserReaction(emoji);
    const previousMessage = message;
    const getCurrentMessage = () => (
      useMessageStore.getState().channelMessages[message.channelId]?.find((cached) => cached.id === message.id)
      ?? message
    );
    const optimisticMessage = buildOptimisticReactionMessage(
      message,
      emoji,
      alreadyReacted,
      viewerUserId,
      viewerReactionName,
    );
    pendingReactionEmojisRef.current.add(emoji);
    useMessageStore.getState().updateMessage(optimisticMessage);
    try {
      const { data } = await api.request({
        method: alreadyReacted ? "delete" : "post",
        url: `/messages/${message.id}/reactions`,
        data: { emoji },
      });
      pendingReactionEmojisRef.current.delete(emoji);
      const currentMessage = getCurrentMessage();
      const reconciledMessage = mergeReactionResponsePreservingPending(
        currentMessage,
        data,
        pendingReactionEmojisRef.current,
      );
      useMessageStore.getState().updateMessage(reconciledMessage);
    } catch (err) {
      console.error("Failed to toggle reaction:", err);
      pendingReactionEmojisRef.current.delete(emoji);
      const currentMessage = getCurrentMessage();
      useMessageStore.getState().updateMessage(replaceReactionForEmoji(currentMessage, previousMessage, emoji));
      setReactionFailureEmoji(emoji);
      if (reactionFailureFlashTimerRef.current) {
        clearTimeout(reactionFailureFlashTimerRef.current);
      }
      reactionFailureFlashTimerRef.current = setTimeout(() => {
        setReactionFailureEmoji(null);
        reactionFailureFlashTimerRef.current = null;
      }, 400);
    } finally {
      pendingReactionEmojisRef.current.delete(emoji);
    }
  }, [hasCurrentUserReaction, isSystem, message, viewerReactionName, viewerUserId]);

  useEffect(() => () => {
    if (reactionFailureFlashTimerRef.current) {
      clearTimeout(reactionFailureFlashTimerRef.current);
      reactionFailureFlashTimerRef.current = null;
    }
  }, []);

  const clearReactionPickerCloseTimer = useCallback(() => {
    if (reactionPickerCloseTimerRef.current) {
      clearTimeout(reactionPickerCloseTimerRef.current);
      reactionPickerCloseTimerRef.current = null;
    }
  }, []);

  const closeReactionPicker = useCallback(() => {
    clearReactionPickerCloseTimer();
    setReactionPicker(null);
  }, [clearReactionPickerCloseTimer]);

  const scheduleReactionPickerClose = useCallback(() => {
    clearReactionPickerCloseTimer();
    reactionPickerCloseTimerRef.current = setTimeout(() => {
      setReactionPicker(null);
      reactionPickerCloseTimerRef.current = null;
    }, 120);
  }, [clearReactionPickerCloseTimer]);

  const isReactionPickerBoundaryTarget = useCallback((target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return !!messageRef.current?.contains(target) || !!target.closest("[data-message-affordance='reaction-picker']");
  }, []);

  const openReactionPicker = useCallback((target: HTMLElement) => {
    positionReactionPickerFromRect(target.getBoundingClientRect());
  }, [positionReactionPickerFromRect]);

  const handleQuickReactionClick = useCallback((emoji: string) => {
    closeReactionPicker();
    setCtxMenu(null);
    setCtxMenuClickShielded(false);
    if (ctxMenuShieldTimerRef.current) {
      clearTimeout(ctxMenuShieldTimerRef.current);
      ctxMenuShieldTimerRef.current = null;
    }
    void handleToggleReaction(emoji);
  }, [closeReactionPicker, handleToggleReaction]);

  useEffect(() => {
    const handlePeerPickerOpen = (event: Event) => {
      const detail = (event as CustomEvent<{ messageId?: string }>).detail;
      if (detail?.messageId !== message.id) closeReactionPicker();
    };
    window.addEventListener(REACTION_PICKER_EVENT, handlePeerPickerOpen);
    return () => window.removeEventListener(REACTION_PICKER_EVENT, handlePeerPickerOpen);
  }, [closeReactionPicker, message.id]);

  useEffect(() => {
    if (!reactionPicker) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-message-affordance='reaction'], [data-message-affordance='reaction-picker']")) return;
      closeReactionPicker();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeReactionPicker();
    };
    const handleViewportChange = () => {
      closeReactionPicker();
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("scroll", handleViewportChange, true);
    window.addEventListener("resize", handleViewportChange);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("scroll", handleViewportChange, true);
      window.removeEventListener("resize", handleViewportChange);
    };
  }, [closeReactionPicker, reactionPicker]);

  useEffect(() => () => clearReactionPickerCloseTimer(), [clearReactionPickerCloseTimer]);

  const handleReactionPickerBoundaryEnter = useCallback(() => {
    clearReactionPickerCloseTimer();
  }, [clearReactionPickerCloseTimer]);

  const handleReactionPickerBoundaryLeave = useCallback((event: React.MouseEvent) => {
    if (!reactionPicker) return;
    if (isReactionPickerBoundaryTarget(event.relatedTarget)) return;
    scheduleReactionPickerClose();
  }, [isReactionPickerBoundaryTarget, reactionPicker, scheduleReactionPickerClose]);

  const showReactionPopover = useCallback((
    reaction: NonNullable<Message["reactions"]>[number],
    target: HTMLElement,
  ) => {
    const rect = target.getBoundingClientRect();
    const currentViewerReacted = !!viewerUserId && reaction.reactorIds.includes(viewerUserId);
    const reactorNames = currentViewerReacted
      ? [
        "You",
        ...reaction.reactorNames.filter((_name, index) => reaction.reactorIds[index] !== viewerUserId),
      ]
      : reaction.reactorNames;
    const visibleNames = reactorNames.slice(0, 5);
    const hiddenCount = Math.max(0, reaction.reactorNames.length - visibleNames.length);

    setReactionPopover({
      emoji: reaction.emoji,
      visibleNames,
      hiddenCount,
      x: rect.left,
      y: rect.bottom + 4,
    });
  }, [viewerUserId]);

  const hideReactionPopover = useCallback(() => {
    setReactionPopover(null);
  }, []);

  const handleCopyLink = useCallback(() => {
    if (!serverSlug) return;
    const channelForLink = parentChannelId || message.channelId;
    const routeKind = navigableChannels.find((channel) => channel.id === channelForLink)?.type === "dm" ? "dm" : "channel";
    const url = buildMessagePermalink(serverSlug, channelForLink, message.id, {
      routeKind,
      threadParentMessageId: parentMessageId ?? null,
    });
    navigator.clipboard.writeText(url).then(() => {
      setCtxMenu(null);
    });
  }, [serverSlug, parentChannelId, parentMessageId, message.channelId, message.id, navigableChannels]);

  const handleOpenPermalink = useCallback((href: string) => {
    const permalink = parseSlockPermalink(href, currentHostname);
    if (!permalink) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }

    if (serverSlug && permalink.serverSlug === serverSlug) {
      if (permalink.threadParentMessageId) {
        nav.toThreadMessage(
          permalink.channelId,
          permalink.threadParentMessageId,
          permalink.messageId,
          permalink.routeKind,
        );
      } else if (permalink.routeKind === "dm") {
        nav.toDmMessage(permalink.channelId, permalink.messageId);
      } else {
        nav.toMessage(permalink.channelId, permalink.messageId);
      }
      return;
    }

    window.location.href = href;
  }, [currentHostname, nav, serverSlug]);

  const handleOpenQuotedPermalink = useCallback((permalink: ReturnType<typeof parseSlockPermalink>) => {
    if (!permalink) return;

    if (permalink.threadParentMessageId) {
      if (permalink.routeKind === "dm") {
        nav.toDm(permalink.channelId);
      } else {
        nav.toChannel(permalink.channelId);
      }
      openThread(permalink.channelId, permalink.threadParentMessageId, permalink.messageId);
      return;
    }

    requestTransientFocus(permalink.channelId, permalink.messageId);
    if (permalink.routeKind === "dm") {
      nav.toDm(permalink.channelId);
    } else {
      nav.toChannel(permalink.channelId);
    }
  }, [nav, openThread, requestTransientFocus]);

  const handleOpenTaskRef = useCallback(async (taskNumber: number) => {
    const taskContextChannelId = parentChannelId || message.channelId;
    try {
      const { data } = await api.get(`/tasks/channel/${taskContextChannelId}/number/${taskNumber}`);
      const task = (data as { task: Task }).task;
      closeProfile();
      if (task.isLegacy) {
        closeThread();
        nav.toChannel(task.channelId, { chatTab: "tasks" });
        openLegacyTask(task);
        return;
      }
      void openThread(task.channelId, task.messageId);
    } catch (err) {
      console.error(`Failed to resolve task #${taskNumber}:`, err);
    }
  }, [closeProfile, closeThread, message.channelId, nav, openLegacyTask, openThread, parentChannelId]);

  const handleDownloadAttachment = useCallback(async (attachment: NonNullable<Message["attachments"]>[number]) => {
    try {
      const { data } = await api.get(`/attachments/${attachment.id}/url?disposition=attachment`);
      const link = document.createElement("a");
      link.href = data.url;
      link.download = attachment.filename;
      link.rel = "noopener";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      // noop: keep attachment card interactive for retry
    }
  }, []);

  const handleOpenHtmlPreview = useCallback(async (attachment: NonNullable<Message["attachments"]>[number]) => {
    setHtmlPreviewLoadingId(attachment.id);
    try {
      const { data } = await api.get(`/attachments/${attachment.id}/html-preview-url`);
      setHtmlPreview({ attachment, url: data.url });
    } catch (err) {
      console.error("Failed to open HTML attachment preview:", err);
    } finally {
      setHtmlPreviewLoadingId((current) => current === attachment.id ? null : current);
    }
  }, []);

  const handleOpenVideoPreview = useCallback(async (attachment: NonNullable<Message["attachments"]>[number]) => {
    setVideoPreviewLoadingId(attachment.id);
    try {
      const { data } = await api.get(`/attachments/${attachment.id}/url?disposition=inline`);
      setVideoPreview({ attachment, url: data.url });
    } catch (err) {
      console.error("Failed to open video attachment preview:", err);
      await handleDownloadAttachment(attachment);
    } finally {
      setVideoPreviewLoadingId((current) => current === attachment.id ? null : current);
    }
  }, [handleDownloadAttachment]);

  const handleOpenDocumentPreview = useCallback(async (attachment: NonNullable<Message["attachments"]>[number]) => {
    if (documentPreviewRequestRef.current.has(attachment.id)) {
      return;
    }
    setDocumentPreviewLoadingId(attachment.id);
    const request = (async () => {
      const { data: previewResponse } = await api.get<AttachmentPreview>(`/attachments/${attachment.id}/preview`);
      if (previewResponse.status !== "ok" || !(previewResponse.data.kind === "csv" || previewResponse.data.kind === "markdown" || previewResponse.data.kind === "pdf" || previewResponse.data.kind === "text")) {
        await handleDownloadAttachment(attachment);
        return;
      }

      const url = previewResponse.data.kind === "pdf"
        ? (await api.get(`/attachments/${attachment.id}/url?disposition=inline`)).data.url
        : null;
      setDocumentPreview({
        attachment,
        preview: previewResponse.data,
        truncated: previewResponse.truncated === true,
        url,
      });
    })();
    documentPreviewRequestRef.current.set(attachment.id, request);
    try {
      await request;
    } catch (err) {
      console.error("Failed to open document attachment preview:", err);
      await handleDownloadAttachment(attachment);
    } finally {
      documentPreviewRequestRef.current.delete(attachment.id);
      setDocumentPreviewLoadingId((current) => current === attachment.id ? null : current);
    }
  }, [handleDownloadAttachment]);


  // Close context menu on click outside
  const handleCloseCtx = useCallback(() => {
    setCtxMenu(null);
    closeReactionPicker();
    setCtxMenuClickShielded(false);
    if (ctxMenuShieldTimerRef.current) {
      clearTimeout(ctxMenuShieldTimerRef.current);
      ctxMenuShieldTimerRef.current = null;
    }
  }, [closeReactionPicker]);

  useEffect(() => {
    if (!ctxMenu) return;
    const handleViewportChange = () => handleCloseCtx();
    window.addEventListener("scroll", handleViewportChange, true);
    window.addEventListener("resize", handleViewportChange);
    return () => {
      window.removeEventListener("scroll", handleViewportChange, true);
      window.removeEventListener("resize", handleViewportChange);
    };
  }, [ctxMenu, handleCloseCtx]);

  const updateCtxMenuPosition = useCallback((position: { x: number; y: number }) => {
    setCtxMenu((current) => {
      if (!current) return current;
      if (current.x === position.x && current.y === position.y) return current;
      return { ...current, x: position.x, y: position.y };
    });
  }, []);

  useFloatingOverlayPosition({
    open: Boolean(ctxMenu),
    anchor: ctxMenu ? { x: ctxMenu.anchorX, y: ctxMenu.anchorY } : null,
    floatingRef: ctxMenuRef,
    onPositionChange: updateCtxMenuPosition,
  });

  // System messages: centered, compact, no avatar.
  // Title content is summarized server-side; clamp to a single line as a
  // defense-in-depth so any unexpectedly long body still renders on one line.
  if (isSystem) {
    const systemContentParts = splitReminderReceiptFireAtTokens(message.content);
    const systemContentTitle = formatReminderReceiptContentTitle(message.content, timeFormatOptions);
    return (
      <div className="flex items-center justify-center gap-2 py-1.5 px-2 mb-1 min-w-0">
        <span className="text-xs text-black/40 font-mono whitespace-nowrap shrink-0">{time}</span>
        <span className="text-xs text-black/50 truncate min-w-0" title={systemContentTitle}>
          {systemContentParts.map((part, index) => (
            part.type === "reminderFireAt" ? (
              <span key={`${part.value}-${index}`} title={formatReminderReceiptTooltip(part.value, timeFormatOptions)}>
                {formatReminderReceiptTime(part.value, new Date(), timeFormatOptions)}
              </span>
            ) : (
              part.value
            )
          ))}
        </span>
      </div>
    );
  }

  return (
    <>
    <div
      ref={messageRef}
      id={`message-${message.id}`}
      onClick={handleMobileTap}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onMouseEnter={handleReactionPickerBoundaryEnter}
      onMouseLeave={handleReactionPickerBoundaryLeave}
        className={`group relative flex h-fit gap-3 py-2 px-2 ${
        isHighlighted
          ? "border-2 border-black bg-brutal-cyan/25 shadow-brutal mb-1"
          : ctxMenu
          ? "border-2 border-black bg-white mb-1"
          : isSelectedAsThreadParent
          ? "border-2 border-black bg-white mb-1"
          : selectionScopedHere
          ? "border-2 border-transparent hover:bg-white active:bg-white mb-1"
          : "border-2 border-transparent hover:border-black hover:bg-white active:border-black active:bg-white mb-1"
      }`}
    >
      {selectionScopedHere && (
        <CheckMarker
          // v1.5 (huxijin 2026-05-01): was `self-center`, which dropped the
          // circle into the vertical middle of the row. On long messages
          // this sits far below the viewport's top edge and users lose
          // track of which message they're toggling. Pin to the top row
          // (`self-start`) at avatar height so the indicator is always
          // visible alongside the sender name.
          checked={isSelected}
          shape="circle"
          size="lg"
          tone="yellow-fill"
          className="self-start mt-1.5"
          data-testid={`message-select-circle-${message.id}`}
        />
      )}
      {!hideThreadActions && (
        <div
          className="absolute top-1 right-[3.75rem] hidden group-hover:flex items-center gap-0.5"
          data-message-affordance="thread"
        >
          <button
            type="button"
            onClick={handleReplyInThread}
            title="Reply in thread"
            className="flex items-center justify-center size-6 text-black/30 hover:text-black/70"
          >
            <MessageSquare size={13} />
          </button>
        </div>
      )}
      {!isSystem && (
        <div
          className="absolute top-1 right-8 hidden group-hover:flex items-center gap-0.5"
          data-message-affordance="reaction"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCtxMenu(null);
              if (reactionPicker) {
                closeReactionPicker();
              } else {
                openReactionPicker(e.currentTarget);
              }
            }}
            title="Add Reaction"
            aria-label="Add Reaction"
            aria-expanded={!!reactionPicker}
            className={`flex size-6 items-center justify-center ${
              reactionPicker ? "text-black/70" : "text-black/30 hover:text-black/70"
            }`}
          >
            <SmilePlus size={13} strokeWidth={2} />
          </button>
        </div>
      )}
      {/* Bookmark button — always visible on right edge; filled when saved */}
      <button
        type="button"
        onClick={handleToggleSave}
        title={isSaved ? "Remove from Saved" : "Save Message"}
        data-message-affordance="bookmark"
        className={`absolute top-1 right-1 flex items-center justify-center size-6 ${
          isSaved ? "text-brutal-orange" : "text-black/0 group-hover:text-black/30 hover:text-black/70"
        }`}
      >
        <Bookmark size={13} fill={isSaved ? "currentColor" : "none"} />
      </button>
      <MessageSenderAvatar
        showAgent={isAgent && !!senderAgent}
        isDeactivatedAgent={isDeactivatedAgent}
        senderId={message.senderId}
        agentAvatarUrl={agentAvatarUrl}
        avatarUrl={humanAvatarUrl}
        gravatarHash={senderMember?.gravatarHash}
        email={senderEmailForAvatar}
        testId={senderAvatarTestId}
        onNavigateAgent={handleNavigateAgent}
        onNavigateHuman={handleNavigateHuman}
      />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2 overflow-hidden pr-24">
          <span className="min-w-0 shrink-0 truncate text-sm font-bold text-black">
            {senderDisplayName}
          </span>
          {isDeactivatedAgent && (
            <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase border border-black bg-gray-300 text-black/60">
              Deleted
            </span>
          )}
          {isRemovedHuman && (
            <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase border border-black bg-gray-300 text-black/60">
              Removed
            </span>
          )}
          {senderSubtitle && (
            <span className="min-w-0 truncate text-xs text-black/40 font-mono" title={senderSubtitle}>
              {senderSubtitle}
            </span>
          )}
          <span className="shrink-0 text-xs text-black/40 font-mono whitespace-nowrap">{time}</span>
          {converting && (
            <span className="text-[10px] font-bold text-black/40">Converting…</span>
          )}
        </div>
        <div
          ref={messageBodyRef}
          data-message-selectable="true"
          data-message-font-size={messageBodyFontSize}
          className={`${messageBodyFontSizeClass} text-black break-words select-text [&_*]:select-text`}
          style={{ userSelect: "text", WebkitUserSelect: "text" }}
        >
          {(() => {
            // Operation card (B-mode): the message body IS the card. Skip
            // markdown rendering and inline the structured card from
            // `actionMetadata`.
            const meta = message.actionMetadata as { kind?: string } | null | undefined;
            if (meta?.kind === "action-card") {
              return (
                <ActionCard
                  messageId={message.id}
                  metadata={message.actionMetadata as ActionCardMetadata}
                  channelId={message.channelId}
                />
              );
            }
            if (isTranslationPending) {
              return (
                <span
                  className="inline-block h-4 w-44 max-w-full animate-pulse border-2 border-black/20 bg-black/10 align-middle"
                  data-testid={`message-translation-placeholder-${message.id}`}
                />
              );
            }
            return renderContent(
              visibleMessageContent,
              navigableChannels,
              mentionMap,
              structuredMentionMap,
              (channel) => {
                nav.toChannel(channel.id);
              },
              handleNavigateAgent,
              handleNavigateHuman,
              handleOpenThreadRef,
              resolvingThreadRefKey,
              handleOpenTaskRef,
              handleOpenPermalink,
              serverSlug,
              knownTaskNumbers,
              timeFormatOptions,
            );
          })()}
        </div>
        {quotedPermalink ? (
          <div className="mt-1.5">
            <QuotedMessagePermalinkPreview
              permalink={quotedPermalink.parsed}
              onOpen={handleOpenQuotedPermalink}
            />
          </div>
        ) : null}
        {threadRefNotice ? (
          <div className="mt-1 inline-flex max-w-full border border-black bg-brutal-yellow/40 px-2 py-1 text-xs font-bold text-black/70">
            {threadRefNotice}
          </div>
        ) : null}
        {/* Attached files */}
        {message.attachments && message.attachments.length > 0 && (() => {
          const imageAttachments = message.attachments.filter((att) => isPreviewableImageAttachment(att));
          const lightboxImages = imageAttachments.filter((att) => !isOptimisticAttachment(att));
          const renderedImages = imageAttachments.filter((att) => !!(att.localPreviewUrl || att.thumbnailUrl));
          const imageRows = buildImageGalleryRows(renderedImages);
          const otherAttachments = message.attachments.filter((att) => {
            if (!isPreviewableImageAttachment(att)) return true;
            return !(att.localPreviewUrl || att.thumbnailUrl);
          });

          return (
            <div className="mt-1 space-y-2">
              {imageRows.length > 0 && (
                <div className="max-w-[min(22rem,calc(100vw-7rem))] space-y-2 md:max-w-[28rem]">
                  {imageRows.map((row, rowIndex) => (
                    <div
                      key={`${row.attachments.map((att) => att.id).join("-")}-${rowIndex}`}
                      className={`grid gap-2 ${row.gridClass}`}
                    >
                      {row.attachments.map((att) => {
                        const previewSrc = att.localPreviewUrl || att.thumbnailUrl;
                        if (!previewSrc) return null;
                        const isOptimistic = isOptimisticAttachment(att);
                        const imageIndex = lightboxImages.findIndex((img) => img.id === att.id);
                        const handleOpenImage = () => {
                          if (!isOptimistic && imageIndex >= 0) {
                            useImageLightboxStore.getState().open(lightboxImages, imageIndex);
                          }
                        };
                        const isSingleImage = renderedImages.length === 1;
                        const fitClass = getImageGalleryFitClass(att);
                        const imageBackgroundClass = fitClass === "object-contain" ? imageGalleryBackgroundClass : "";
                        const imageReserveStyle = isSingleImage ? getSingleImageReserveStyle(att) : undefined;
                        return (
                          <button
                            key={att.id}
                            type="button"
                            onClick={isOptimistic ? undefined : handleOpenImage}
                            className={`group/img relative overflow-hidden border-2 border-black text-left ${
                              isSingleImage ? "inline-block w-fit max-w-[26rem] justify-self-start" : row.heightClass
                            } bg-brutal-cream/60 ${isOptimistic ? "opacity-70" : "hover:brightness-95"}`}
                            style={imageReserveStyle}
                            title={att.filename}
                          >
                            <img
                              src={previewSrc}
                              alt={att.filename}
                              data-select-screenshot-attachment-id={att.id}
                              data-select-screenshot-attachment-width={att.width ?? undefined}
                              data-select-screenshot-attachment-height={att.height ?? undefined}
                              className={
                                isSingleImage
                                  ? `block h-full w-full object-contain ${imageGalleryBackgroundClass}`
                                  : `block h-full w-full ${fitClass} ${imageBackgroundClass}`
                              }
                              width={att.width ?? undefined}
                              height={att.height ?? undefined}
                              loading="lazy"
                            />
                            {isOptimistic && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Spinner size="md" variant="inverse" />
                              </div>
                            )}
                            {!isOptimistic && (
                              <span
                                data-message-affordance="image-download"
                                className="absolute bottom-1 right-1 hidden size-6 items-center justify-center border border-black bg-white/80 text-black/50 group-hover/img:flex hover:text-black"
                              >
                                <Download size={12} />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
              {otherAttachments.length > 0 && (
                <div className="flex max-w-[22.5rem] flex-wrap items-start gap-2">
                  {otherAttachments.map((att) => {
                    const isImage = isPreviewableImageAttachment(att);
                    const isHtml = isPreviewableHtmlAttachment(att);
                    const isVideo = isPreviewableVideoAttachment(att);
                    const isDocument = isPreviewableDocumentAttachment(att);
                    const isOptimistic = isOptimisticAttachment(att);
                    const isHtmlLoading = htmlPreviewLoadingId === att.id || videoPreviewLoadingId === att.id || documentPreviewLoadingId === att.id;
                    const handleClick = () => {
                      if (isImage && !isOptimistic) {
                        const imageIndex = lightboxImages.findIndex((img) => img.id === att.id);
                        useImageLightboxStore.getState().open(lightboxImages, imageIndex >= 0 ? imageIndex : 0);
                      } else if (isHtml && !isOptimistic) {
                        void handleOpenHtmlPreview(att);
                      } else if (isVideo && !isOptimistic) {
                        void handleOpenVideoPreview(att);
                      } else if (isDocument && !isOptimistic) {
                        void handleOpenDocumentPreview(att);
                      }
                    };
                    const handleDownload = async () => {
                      await handleDownloadAttachment(att);
                    };
                    return (
                      <AttachmentCard
                        key={att.id}
                        attachment={att}
                        isOptimistic={isOptimistic}
                        isHtml={isHtml}
                        isImage={isImage}
                        isVideo={isVideo}
                        isHtmlLoading={isHtmlLoading}
                        onClick={handleClick}
                        onDownload={handleDownload}
                      />
                    );
                  })}
                </div>
              )}
	            </div>
	          );
	        })()}
	        {activeTranslationEntry && !isSilentTranslationEntry(activeTranslationEntry) ? (
	          <div className="mt-0">
	            <TranslationIndicator
	              entry={activeTranslationEntry}
	              showOriginal={activeTranslationShowOriginal}
	              onToggleOriginal={() => setTranslationShowOriginal(message.id, !activeTranslationShowOriginal)}
	              onRetry={() => {
	                if (!translationTargetLanguage) return;
	                void retryTranslation(message, { targetLanguage: translationTargetLanguage, viewerUserId });
	              }}
	              onUpgrade={() => nav.toSettings("server")}
	            />
	          </div>
	        ) : null}
	        {/* Footer metadata/actions — below translation status and the full message content block. */}
	        {linkedTask ||
	        visibleReactions.length > 0 ||
	        (threadSummary && threadSummary.replyCount > 0 && !hideThreadActions) ? (
	          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
	            {linkedTask && (() => {
	              const fullLabel = linkedTask.claimedByName ? `task #${linkedTask.taskNumber} @${linkedTask.claimedByName}` : `task #${linkedTask.taskNumber}`;
	              const assignee = linkedTask.claimedByName ? (
	                <span className="min-w-0 truncate">@{linkedTask.claimedByName}</span>
	              ) : null;
	              // Source of truth: STATUS_BADGE_CONFIG in taskStatusUi.ts.
	              // Before this dedup, the below-content variant had its own
	              // inline 4-entry config (no `closed`) and silently fell
	              // through to todo styling for closed tasks — see
	              // #proj-uiux:c697be7a (task #141). PR #1464 (task #145)
	              // separately swapped closed from brutal-red to brutal-stone;
	              // both fixes converge in STATUS_BADGE_CONFIG.
	              //
	              // Placement contract: task status is footer metadata, not sender
	              // identity. Keep it below content alongside replies instead of
	              // crowding the message header.
	              if (canEditLinkedTaskStatus) {
	                const cfg = STATUS_BADGE_CONFIG[linkedTask.status] ?? STATUS_BADGE_CONFIG.todo;
	                const Icon = cfg.icon;
	                return (
	                  <div
	                    className={`relative inline-flex min-w-0 max-w-full items-center gap-1.5 overflow-hidden whitespace-nowrap ${taskStatusBusy ? "pointer-events-none opacity-60" : ""}`}
	                    title={fullLabel}
	                  >
	                    <InlineBadgeEditor
	                      displayValue={linkedTask.status}
	                      selectedId={linkedTask.status}
	                      options={linkedTaskStatusOptions}
	                      onSelect={handleSelectTaskStatus}
	                      open={editingTaskStatus}
	                      onToggle={() => setEditingTaskStatus((prev) => !prev)}
	                      onRequestClose={() => setEditingTaskStatus(false)}
	                      badgeClassName={cfg.bg}
	                      dropdownMinWidth="min-w-[140px]"
	                      dropdownAlign="left"
	                      disabled={taskStatusBusy}
	                      buttonTestId="message-task-badge"
	                      buttonDataTaskStatus={linkedTask.status}
	                      buttonTitle={`${fullLabel} · Change task status`}
	                      buttonAriaLabel={`Change status for ${fullLabel}`}
	                      dropdownTestId="message-task-status-menu"
	                      optionTestIdPrefix="message-task-status-option"
	                      buttonClassName={brutalBadgeClassName({ tone: cfg.tone, uppercase: false, className: "transition-[filter,opacity] duration-100 hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-60" })}
	                      buttonChildren={(
	                        <>
	                          <Icon size={10} className="shrink-0" />
	                          <span className="shrink-0">#{linkedTask.taskNumber}</span>
	                          {assignee}
	                        </>
	                      )}
	                    />
	                  </div>
	                );
	              }
	              return (
	                <StatusBadge
	                  status={linkedTask.status}
	                  data-testid="message-task-badge"
	                  data-task-status={linkedTask.status}
	                  title={fullLabel}
	                >
	                  <span className="shrink-0">#{linkedTask.taskNumber}</span>
	                  {assignee}
	                </StatusBadge>
	              );
	            })()}
	            {threadSummary && threadSummary.replyCount > 0 && !hideThreadActions ? (
	              <BadgeButton
	                data-testid="message-thread-replies-badge"
	                onClick={handleOpenThreadReplies}
	                uppercase={false}
	                className="bg-brutal-cyan/20 text-black transition-colors hover:bg-brutal-cyan/40"
	              >
	                <MessageSquare size={12} className="shrink-0" />
	                {threadSummary.replyCount} {threadSummary.replyCount === 1 ? "reply" : "replies"}
	                {threadUnreadCount > 0 ? (
	                  <>
	                    <span className="text-black/45">·</span>
	                    <span>{threadUnreadCount} new</span>
	                  </>
	                ) : null}
	              </BadgeButton>
	            ) : null}
	            {visibleReactions.map((reaction) => {
	              const currentViewerReacted = hasCurrentUserReaction(reaction.emoji);
                const showFailureFlash = reactionFailureEmoji === reaction.emoji;
	              const reactorSummary = reaction.reactorNames.join(", ") || reaction.emoji;
	              return (
	                <span key={reaction.emoji} className="inline-flex">
	                  <button
	                    type="button"
	                    onClick={() => {
	                      hideReactionPopover();
	                      void handleToggleReaction(reaction.emoji);
	                    }}
	                    onMouseEnter={(event) => showReactionPopover(reaction, event.currentTarget)}
	                    onMouseLeave={hideReactionPopover}
	                    onFocus={(event) => showReactionPopover(reaction, event.currentTarget)}
	                    onBlur={hideReactionPopover}
	                    className={`inline-flex h-5 min-w-0 max-w-full items-center gap-1 overflow-hidden whitespace-nowrap rounded px-1.5 text-[12px] font-bold leading-none text-black transition-colors ${
	                      showFailureFlash
                          ? "bg-brutal-orange/30"
                          : currentViewerReacted
	                        ? "bg-brutal-pink/20 hover:bg-brutal-pink/30"
	                        : "bg-[#EEEDE6] hover:bg-[#E0DED4]"
	                    }`}
	                    title={reactorSummary}
	                    aria-label={`${reaction.emoji} reaction from ${reactorSummary}`}
	                  >
	                    <span className="inline-flex items-center leading-none">
                        <ReactionGlyph emoji={reaction.emoji} size={15} className="block" />
                      </span>
	                    <ReactionCount count={reaction.count} />
	                  </button>
	                </span>
	              );
	            })}
              {!isSystem && visibleReactions.length > 0 ? (
                <span className="inline-flex md:hidden">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      hideReactionPopover();
                      setCtxMenu(null);
                      if (reactionPicker) {
                        closeReactionPicker();
                      } else {
                        openReactionPicker(event.currentTarget);
                      }
                    }}
                    className="inline-flex h-5 min-w-0 items-center justify-center rounded bg-[#EEEDE6] px-1.5 text-black transition-colors hover:bg-[#E0DED4] active:bg-[#E0DED4]"
                    title="Add Reaction"
                    aria-label="Add Reaction"
                    data-message-affordance="mobile-reaction-add"
                  >
                    <Plus size={13} strokeWidth={2.5} />
                  </button>
                </span>
              ) : null}
	          </div>
	        ) : null}
      </div>
    </div>
    {reactionPicker && typeof document !== "undefined" && createPortal(
      <div
        className="fixed z-[80] flex items-center gap-0.5 border-2 border-black bg-white px-1.5 py-1 shadow-soft-popover"
        data-message-affordance="reaction-picker"
        style={{
          left: reactionPicker.x,
          top: reactionPicker.y,
        }}
        onMouseEnter={handleReactionPickerBoundaryEnter}
        onMouseLeave={handleReactionPickerBoundaryLeave}
        onClick={(e) => e.stopPropagation()}
      >
        {QUICK_REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => handleQuickReactionClick(emoji)}
            className="flex size-7 items-center justify-center rounded bg-transparent transition-colors hover:bg-brutal-pink/20"
            title={`React with ${emoji}`}
          >
            <ReactionGlyph emoji={emoji} size={24} className="block" />
          </button>
        ))}
      </div>,
      document.body,
    )}
    {htmlPreview && (
      <HtmlAttachmentPreviewModal
        filename={htmlPreview.attachment.filename}
        url={htmlPreview.url}
        onClose={() => setHtmlPreview(null)}
        onDownload={() => void handleDownloadAttachment(htmlPreview.attachment)}
      />
    )}
    {videoPreview && (
      <VideoAttachmentPreviewModal
        filename={videoPreview.attachment.filename}
        url={videoPreview.url}
        onClose={() => setVideoPreview(null)}
        onDownload={() => void handleDownloadAttachment(videoPreview.attachment)}
      />
    )}
    {documentPreview && (
      <DocumentAttachmentPreviewModal
        filename={documentPreview.attachment.filename}
        preview={documentPreview.preview}
        truncated={documentPreview.truncated}
        url={documentPreview.url}
        onClose={() => setDocumentPreview(null)}
        onDownload={() => void handleDownloadAttachment(documentPreview.attachment)}
      />
    )}
    {reactionPopover && typeof document !== "undefined" && createPortal(
        <div
        role="tooltip"
        data-message-affordance="reaction-reactors-popover"
        className="pointer-events-none fixed z-[80] max-w-[280px] border-2 border-black bg-white px-2 py-1.5 text-xs font-bold text-black"
        style={{
          left: reactionPopover.x,
          top: reactionPopover.y,
        }}
      >
        {reactionPopover.visibleNames.length > 0 ? (
          <div className="flex max-w-60 flex-wrap items-center gap-y-0.5">
            {reactionPopover.visibleNames.map((name, index) => (
              <span key={`${reactionPopover.emoji}-${index}-${name}`} className="inline-flex min-w-0 items-baseline leading-5">
                <span className="max-w-28 truncate">{name}</span>
                {index < reactionPopover.visibleNames.length - 1 || reactionPopover.hiddenCount > 0 ? (
                  <span className="shrink-0 text-black/45">, </span>
                ) : null}
              </span>
            ))}
            {reactionPopover.hiddenCount > 0 && (
              <span className="leading-5 text-black/50">+{reactionPopover.hiddenCount} more</span>
            )}
          </div>
        ) : (
          <span className="block leading-5">{reactionPopover.emoji}</span>
        )}
      </div>,
      document.body,
    )}
    {ctxMenu && createPortal(
      <>
        <DismissBackdrop onDismiss={handleCloseCtx} trapContextMenu />
        {ctxMenuClickShielded && (
          <DismissBackdrop onDismiss={handleCloseCtx} zIndex={70} stopPropagation />
        )}
        <div
          ref={ctxMenuRef}
          className="fixed z-[60] card-brutal overflow-hidden select-none"
          style={{ left: ctxMenu.x, top: ctxMenu.y, maxHeight: "calc(100dvh - 16px)", overflowY: "auto" }}
        >
          {ctxMenu.selectionText ? (
            /* Selection context menu (#proj-chat task #32). Shown only when
               the user right-clicked with an in-message text selection.
               Two items, scoped to the selection — deliberately NOT merged
               with the message-level row menu (locked stdrc #proj-chat
               msg=213104e2). Collapsed 3→2 per stdrc msg=35695d2b: dropped
               the separate blockquote-markdown copy. Second item is plain
               "Copy" — v0 only has Selection.toString() (rendered plain
               text), so an honest "Copy" label, not "Copy markdown"
               (stdrc msg=5d1369ae); true source-markdown copy is the
               documented v1 follow-up. Quote icon → TextQuote
               (msg=4552fc4a) — visually a blockquote, matching the action
               (Quote appends a markdown blockquote to the composer). To
               reach the row menu in a selection state, clear the selection
               and right-click again. */
            <>
              <MenuItem
                icon={<TextQuote size={14} />}
                onClick={handleQuoteSelection}
              >
                Quote
              </MenuItem>
              <MenuItem
                icon={<Copy size={14} />}
                onClick={handleCopySelection}
              >
                Copy
              </MenuItem>
            </>
          ) : (
          <>
          {/* Reaction quick row — shown on both desktop right-click ("pointer")
              and mobile long-press ("touch") per stdrc 2026-05-14
              #proj-mobile:a8293493 msg=2cebeb18: "无论是移动端还是桌面端，其右
              键菜单和长按菜单都应该补上这个 reaction，也就是说移动端和桌面端
              的菜单保持一致". Previously gated on `ctxMenu.source === "touch"`
              (mobile-only). Visual separator below is a standalone
              `<ContextMenuDivider />` matching the other in-menu section
              dividers (CLAUDE.md "Menu dividers" token) — the row itself
              no longer carries `border-b
              border-black/20` because that produced a thinner, lighter
              line than other section dividers in the same menu (stdrc
              msg=ed2eee8c "只要一样就行，说白了就分 section"). */}
          {!isSystem && (
            <>
              <div
                className="flex h-9 items-center gap-1 bg-white px-2"
                data-message-affordance="reaction-quick-row"
              >
                {QUICK_REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleQuickReactionClick(emoji);
                    }}
                    className="flex size-7 items-center justify-center rounded bg-transparent transition-colors hover:bg-brutal-pink/20 active:bg-brutal-pink/20"
                    title={`React with ${emoji}`}
                    aria-label={`React with ${emoji}`}
                  >
                    <ReactionGlyph emoji={emoji} size={18} className="block" />
                  </button>
                ))}
              </div>
              <ContextMenuDivider />
            </>
          )}
          <MenuItem
            icon={<Link size={14} />}
            onClick={handleCopyLink}
          >
            Copy Link
          </MenuItem>
          <MenuItem
            icon={<Copy size={14} />}
            onClick={() => { navigator.clipboard.writeText(message.content).then(() => setCtxMenu(null)); }}
          >
            Copy Markdown
          </MenuItem>
          {(() => {
            // "Share messages…" — last item in the outbound-content-propagation
            // section (Copy link → Copy markdown → Share messages…), in
            // ascending "weight" of what gets propagated: pointer →
            // content → multi-message render+send. Was previously
            // a standalone section above Copy link; relocated to this
            // section per stdrc 2026-05-14 #proj-mobile:a8293493
            // msg=ad3320ce ("share messages 可能应该放到 copy markdown
            // 下面，并且跟 copy markdown 在同一个 section 里面").
            //
            // Three entry points for "Share messages…":
            //  1. Channel timeline (top-level row, not in a panel) → channel
            //     mode with just this message pre-selected. Auto-including
            //     thread replies here would lie about what the PNG can
            //     render (replies aren't in the DOM until the thread panel
            //     is open), so we keep the contract honest: what you see is
            //     what you share. Thread auto-include is reserved for thread
            //     mode where ThreadPanel guarantees the replies are mounted.
            //  2. Thread reply row (parentMessageId is set) → thread mode,
            //     anchored at the reply's parent, with only the clicked row
            //     selected. ThreadPanel exposes a Select all button for the
            //     full parent + replies export.
            //  3. Thread parent rendered inside ThreadPanel
            //     (`hideThreadActions` plus a non-empty `threadId` on the
            //     parent) → thread mode, anchored at this message, with only
            //     the parent selected.
            const onSelectShare = () => {
              setCtxMenu(null);
              if (parentMessageId) {
                // Thread reply row → thread mode, clicked reply only.
                const threadCh = message.channelId; // replies live in the thread channel
                enterThreadSelection(
                  threadCh,
                  parentMessageId,
                  parentChannelId || message.channelId,
                  [message.id],
                );
                return;
              }
              if (hideThreadActions && message.threadId) {
                enterThreadSelection(message.threadId, message.id, message.channelId, [message.id]);
                return;
              }
              // Channel timeline: just this message. To share a thread the
              // user opens the panel and triggers select from there.
              enterSelection(message.channelId, [message.id]);
            };
            // System messages can't be selected. Outside of those, every row
            // path resolves to one of the three modes above.
            if (isSystem) return null;
            return (
              <MenuItem
                icon={<Share2 size={14} />}
                onClick={onSelectShare}
              >
                Share Messages…
              </MenuItem>
            );
          })()}
          <ContextMenuDivider />
          {!hideThreadActions && (
            <MenuItem
              icon={<MessageSquare size={14} />}
              onClick={handleOpenThreadFromContextMenu}
            >
              Open Thread
            </MenuItem>
          )}
          <MenuItem
            icon={isSaved ? <BookmarkMinus size={14} /> : <Bookmark size={14} />}
            onClick={() => { handleToggleSave(); setCtxMenu(null); }}
          >
            {isSaved ? "Remove from Saved" : "Save Message"}
          </MenuItem>
          {canShowThreadFollowAction && hasThreadConversation && (
            <MenuItem
              icon={<MessageSquare size={14} />}
              onClick={followedThread ? handleUnfollowThread : handleFollowThread}
            >
              {followedThread ? "Unfollow Thread" : "Follow Thread"}
            </MenuItem>
          )}
          {canShowThreadFollowAction && hasThreadConversation && (
            <ContextMenuDivider />
          )}
          {!parentMessageId && supportsMessageTasks && (
            linkedTask ? (
              <MenuItem
                icon={linkedTask.status === "done" ? <RotateCcw size={14} /> : <CheckCircle size={14} />}
                onClick={handleToggleTaskDone}
              >
                {linkedTask.status === "done" ? "Reopen Task" : "Mark as Done"}
              </MenuItem>
            ) : (
              <MenuItem
                icon={<ClipboardCheck size={14} />}
                onClick={handleConvertToTask}
              >
                Convert to Task
              </MenuItem>
            )
          )}
          </>
          )}
        </div>
      </>,
      document.body
    )}
    </>
  );
});

export default MessageItem;
