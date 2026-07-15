import { useState } from "react";
import {
  AlertTriangle,
  Ban,
  Bookmark,
  Check,
  CheckCircle,
  Circle,
  ChevronRight,
  Eye,
  Languages,
  MessageSquare,
  Pencil,
  Play,
  Plus,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useThemeFamily,
} from "raft-ui";
import {
  MessageItem,
  MessageItemActive,
  MessageItemAttachments,
  MessageItemAvatarSlot,
  MessageItemBadge,
  MessageItemBadgeSeparator,
  MessageItemBody,
  MessageItemContent,
  MessageItemContinuationTime,
  MessageItemFooter,
  MessageItemGutter,
  MessageItemHeader,
  MessageItemInlineStatus,
  MessageItemInteractionBoundary,
  MessageItemMeta,
  MessageItemSavedIndicator,
  MessageItemSearchMatch,
  MessageItemSelection,
  MessageItemSender,
  MessageItemSenderState,
  MessageItemTime,
  MessageItemTranslationAction,
  MessageItemTranslationOriginal,
  MessageItemTranslationOriginalLabel,
  MessageItemTranslationPlaceholder,
  MessageItemTranslationStatus,
  MessageMarkdown,
  MessageReactionAddButton,
  MessageReactionGlyph,
  MessageReactionPickerContent,
  MessageReactionQuickButton,
  MessageMultiSelect,
  MessageMultiSelectCheckbox,
  SystemMessageGroupDisclosure,
  SystemMessageItem,
  SystemMessageItemContent,
  SystemMessageItemTime,
} from "raft-ui/wip";
import { MessageReactionComposition } from "./reaction.compositions.tsx";
import {
  MessageCodeBlockComposition,
  MessageMarkdownComposition,
} from "./content.compositions.tsx";
import {
  MessageProductStatePreview,
  type MessageProductStatePreviewState,
} from "./message-product-states.composition.tsx";
import {
  MESSAGE_FIXTURE_IMAGE_SRC,
  MESSAGE_QUICK_REACTIONS,
} from "#/modules/message-item/message-item.fixtures.ts";
import {
  MessageFileAttachmentsComposition,
  MessageImageGallerySingleComposition,
  MessageVideoPreviewComposition,
} from "./media.compositions.tsx";
import { MessageRowToolbar } from "./row-toolbar.composition.tsx";

export type MessageItemPreviewChrome =
  | "default"
  | "active"
  | "search-match"
  | "selected"
  | "continuation";

export type MessageItemPreviewTranslation =
  | "none"
  | "pending"
  | "translated"
  | "bilingual"
  | "failed";

export type MessageItemPreviewProductState = "none" | MessageProductStatePreviewState;

export type MessageItemPreviewSenderState = "none" | "deleted" | "left" | "removed";

export type MessageItemPreviewSystemEvent = "archive" | "reminder" | "group";

type MessageTaskStatus = "todo" | "in-progress" | "in-review" | "done" | "closed";

const TASK_STATUS_OPTIONS = [
  { id: "todo", icon: Circle, label: "Todo", variant: "warning" },
  { id: "in-progress", icon: Play, label: "In Progress", variant: "information" },
  { id: "in-review", icon: Eye, label: "In Review", variant: "accent" },
  { id: "done", icon: CheckCircle, label: "Done", variant: "success" },
  { id: "closed", icon: Ban, label: "Closed", variant: "muted" },
] as const satisfies readonly {
  id: MessageTaskStatus;
  icon: typeof Circle;
  label: string;
  variant: "accent" | "information" | "muted" | "success" | "warning";
}[];

export type MessageItemPreviewProps = {
  chrome?: MessageItemPreviewChrome;
  meta?: boolean;
  markdown?: boolean;
  translation?: MessageItemPreviewTranslation;
  productState?: MessageItemPreviewProductState;
  senderState?: MessageItemPreviewSenderState;
  converting?: boolean;
  systemEvent?: MessageItemPreviewSystemEvent;
  task?: boolean;
  image?: boolean;
  video?: boolean;
  files?: boolean;
  saved?: boolean;
  replies?: boolean;
  newReplies?: boolean;
  draftReply?: boolean;
  reactions?: boolean;
  mobileReactionAdd?: boolean;
  toolbar?: boolean;
};

function MessageTaskStatusBadge({ portalContainer }: { portalContainer: HTMLElement | null }) {
  const [status, setStatus] = useState<MessageTaskStatus>("todo");
  const theme = useThemeFamily();
  const current =
    TASK_STATUS_OPTIONS.find((option) => option.id === status) ?? TASK_STATUS_OPTIONS[0];
  const Icon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Badge
            appearance={theme === "brutal" ? "solid" : "soft"}
            variant={current.variant}
            render={
              <button
                type="button"
                title={`Task #1 · ${current.label}`}
                aria-label={`Change status for task #1, currently ${current.label}`}
              />
            }
          />
        }
      >
        <Icon size={10} />
        <span>#1</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        portalProps={portalContainer ? { container: portalContainer } : undefined}
      >
        {TASK_STATUS_OPTIONS.map((option) => (
          <DropdownMenuItem key={option.id} onClick={() => setStatus(option.id)}>
            <option.icon size={14} />
            <span>{option.label}</span>
            {option.id === status ? <Check className="ml-auto" size={14} /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MessageSystemGroupPreview() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mb-1">
      <div className="flex justify-center py-1.5">
        <SystemMessageGroupDisclosure
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
          title="There are 2 system updates: 1 task update, 1 reminder update"
        >
          <span className="truncate">
            There are 2 system updates: 1 task update, 1 reminder update
          </span>
          <ChevronRight aria-hidden />
        </SystemMessageGroupDisclosure>
      </div>
      {expanded ? (
        <div>
          <SystemMessageItem>
            <SystemMessageItemTime>2:18 PM</SystemMessageItemTime>
            <SystemMessageItemContent>Task #41 was completed.</SystemMessageItemContent>
          </SystemMessageItem>
          <SystemMessageItem>
            <SystemMessageItemTime>2:19 PM</SystemMessageItemTime>
            <SystemMessageItemContent title="Reminder fires Jul 16, 9:00 AM">
              Reminder scheduled for tomorrow at 9:00 AM.
            </SystemMessageItemContent>
          </SystemMessageItem>
        </div>
      ) : null}
    </div>
  );
}

function MessageSystemPreview({ event }: { event: MessageItemPreviewSystemEvent }) {
  if (event === "group") return <MessageSystemGroupPreview />;

  return (
    <SystemMessageItem>
      <SystemMessageItemTime>2:17 PM</SystemMessageItemTime>
      <SystemMessageItemContent
        title={event === "reminder" ? "Reminder fires Jul 16, 9:00 AM" : undefined}
      >
        {event === "reminder"
          ? "Reminder scheduled for tomorrow at 9:00 AM."
          : "Atlas archived this thread."}
      </SystemMessageItemContent>
    </SystemMessageItem>
  );
}

function MessageMobileReactionAdd({
  portalContainer,
  onReact,
}: {
  portalContainer: HTMLElement | null;
  onReact: (emoji: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <MessageReactionAddButton
            aria-label="Add reaction"
            data-message-affordance="mobile-reaction-add"
          />
        }
      >
        <Plus strokeWidth={2.5} />
      </DropdownMenuTrigger>
      <MessageReactionPickerContent
        align="start"
        side="top"
        portalProps={portalContainer ? { container: portalContainer } : undefined}
      >
        {MESSAGE_QUICK_REACTIONS.map((emoji) => (
          <DropdownMenuItem
            key={emoji}
            render={
              <MessageReactionQuickButton
                title={`React with ${emoji}`}
                aria-label={`React with ${emoji}`}
              />
            }
            onClick={() => {
              onReact(emoji);
              setOpen(false);
            }}
          >
            <MessageReactionGlyph emoji={emoji} size={18} />
          </DropdownMenuItem>
        ))}
      </MessageReactionPickerContent>
    </DropdownMenu>
  );
}

/**
 * Configurable authored row for the docs playground. Row chrome, the saved
 * indicator, reactions, and the hover toolbar are driven by controls; business
 * state and copy stay caller-owned like every other composition.
 */
export function MessageItemPreview({
  chrome = "default",
  meta = true,
  markdown = false,
  translation = "none",
  productState = "none",
  senderState = "none",
  converting = false,
  systemEvent,
  task = false,
  image = false,
  video = false,
  files = false,
  saved = false,
  replies = false,
  newReplies = false,
  draftReply = false,
  reactions = false,
  mobileReactionAdd = false,
  toolbar = false,
}: MessageItemPreviewProps) {
  // The Saved control is the source of truth; footer and toolbar share one state
  // so the in-preview save button and the control never diverge. Re-sync on the
  // render pass where the control prop changes (no effect needed).
  const [isSaved, setIsSaved] = useState(saved);
  const [savedControl, setSavedControl] = useState(saved);
  if (saved !== savedControl) {
    setSavedControl(saved);
    setIsSaved(saved);
  }
  const [reaction, setReaction] = useState<string>();
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [translationControl, setTranslationControl] = useState(translation);
  const [retryingTranslation, setRetryingTranslation] = useState(false);
  if (translation !== translationControl) {
    setTranslationControl(translation);
    setShowOriginal(false);
    setRetryingTranslation(false);
  }
  const continuation = chrome === "continuation";

  if (systemEvent) return <MessageSystemPreview event={systemEvent} />;

  if (!continuation && productState !== "none") {
    return <MessageProductStatePreview state={productState} />;
  }
  const translationState = retryingTranslation ? "pending" : translation;

  const originalTranslation = "Keep this original message available for the team.";
  const translatedMessage = "让团队保留这条原始消息。";

  const translationStatus =
    translationState === "none" ? null : (
      <MessageItemTranslationStatus
        tone={
          translationState === "failed"
            ? "failed"
            : translationState === "pending"
              ? "pending"
              : "normal"
        }
        data-testid={`message-translation-indicator-preview`}
      >
        {translationState === "failed" ? <AlertTriangle size={12} /> : <Languages size={12} />}
        {translationState === "pending" ? <span>Translating…</span> : null}
        {translationState === "failed" ? (
          <>
            <span>Translation unavailable</span>
            <span aria-hidden>·</span>
            <MessageItemTranslationAction
              tone="failed"
              title="Translation unavailable"
              aria-label="Retry"
              onClick={() => setRetryingTranslation(true)}
            >
              Retry
            </MessageItemTranslationAction>
          </>
        ) : null}
        {translationState === "translated" || translationState === "bilingual" ? (
          <MessageItemTranslationAction
            title={showOriginal ? "Original shown. Show translation" : "Translated. Show original"}
            aria-label={showOriginal ? "Show translation" : "Show original"}
            onClick={() => setShowOriginal((current) => !current)}
          >
            {showOriginal ? "Show translation" : "Show original"}
          </MessageItemTranslationAction>
        ) : null}
      </MessageItemTranslationStatus>
    );

  const messageBody =
    translationState === "pending" ? (
      <MessageItemTranslationPlaceholder data-testid="message-translation-placeholder-preview" />
    ) : translationState === "translated" || translationState === "bilingual" ? (
      <MessageMarkdown>
        <p>{showOriginal ? originalTranslation : translatedMessage}</p>
      </MessageMarkdown>
    ) : translationState === "failed" ? (
      <MessageMarkdown>
        <p>{originalTranslation}</p>
      </MessageMarkdown>
    ) : markdown ? (
      <>
        <MessageMarkdownComposition imageSrc={MESSAGE_FIXTURE_IMAGE_SRC} />
        <MessageCodeBlockComposition />
      </>
    ) : (
      "Toggle the controls to preview row chrome, the saved indicator, reactions, and the hover toolbar. Markdown, mentions, and links stay caller-owned."
    );

  const footer =
    task || isSaved || replies || draftReply || reactions ? (
      <MessageItemFooter>
        {task ? <MessageTaskStatusBadge portalContainer={portalContainer} /> : null}
        {isSaved ? (
          <MessageItemSavedIndicator
            aria-label="Remove from Saved"
            render={<button type="button" onClick={() => setIsSaved(false)} />}
          >
            <Bookmark fill="currentColor" />
            <span>Saved</span>
          </MessageItemSavedIndicator>
        ) : null}
        {replies || draftReply ? (
          <MessageItemBadge status={newReplies ? "unread" : "read"}>
            {replies ? <MessageSquare /> : <Pencil className="text-foreground-muted" />}
            {replies ? <span>2 replies</span> : null}
            {newReplies ? (
              <>
                <MessageItemBadgeSeparator>·</MessageItemBadgeSeparator>
                <span>1 new</span>
              </>
            ) : null}
            {draftReply ? (
              <>
                {replies || newReplies ? (
                  <MessageItemBadgeSeparator>·</MessageItemBadgeSeparator>
                ) : null}
                {replies ? <Pencil className="text-foreground-muted" /> : null}
                <span className="text-foreground-muted">draft</span>
              </>
            ) : null}
          </MessageItemBadge>
        ) : null}
        {reactions ? (
          <>
            <MessageReactionComposition emoji="👍" count={3} reacted />
            <MessageReactionComposition emoji="🔥" count={1} />
            {mobileReactionAdd ? (
              <MessageMobileReactionAdd portalContainer={portalContainer} onReact={setReaction} />
            ) : null}
          </>
        ) : null}
      </MessageItemFooter>
    ) : null;

  const attachments =
    image || video || files ? (
      <MessageItemAttachments>
        {image ? <MessageImageGallerySingleComposition /> : null}
        {video ? <MessageVideoPreviewComposition /> : null}
        {files ? <MessageFileAttachmentsComposition /> : null}
      </MessageItemAttachments>
    ) : null;

  if (continuation) {
    return (
      <MessageItemInteractionBoundary ref={setPortalContainer}>
        <MessageItem>
          <MessageItemAvatarSlot>
            <Avatar size="sm" type="agent">
              <AvatarFallback>AT</AvatarFallback>
            </Avatar>
          </MessageItemAvatarSlot>
          <MessageItemContent>
            <MessageItemHeader>
              <MessageItemSender>Atlas</MessageItemSender>
              {meta ? <MessageItemMeta>claude-opus</MessageItemMeta> : null}
              <MessageItemTime>2:14 PM</MessageItemTime>
            </MessageItemHeader>
            <MessageItemBody>Starting a short sequence of related updates.</MessageItemBody>
          </MessageItemContent>
        </MessageItem>
        <MessageItem compact>
          <MessageItemGutter>
            <MessageItemContinuationTime>2:15</MessageItemContinuationTime>
          </MessageItemGutter>
          <MessageItemContent>
            <MessageItemBody>
              The second row keeps only its timestamp in the message gutter.
            </MessageItemBody>
          </MessageItemContent>
        </MessageItem>
        <MessageItem compact>
          <MessageItemGutter>
            <MessageItemContinuationTime>2:16</MessageItemContinuationTime>
          </MessageItemGutter>
          <MessageItemContent>
            <MessageItemBody>
              The final continuation carries the optional message details.
            </MessageItemBody>
            {attachments}
            {footer}
          </MessageItemContent>
          {toolbar ? (
            <MessageRowToolbar
              saved={isSaved}
              visible
              portalContainer={portalContainer}
              onReact={setReaction}
              onSavedChange={setIsSaved}
            />
          ) : null}
        </MessageItem>
        {reaction ? (
          <span className="sr-only" role="status">
            Reacted with {reaction}
          </span>
        ) : null}
      </MessageItemInteractionBoundary>
    );
  }

  const content = (
    <MessageItemContent>
      <MessageItemHeader>
        <MessageItemSender>Atlas</MessageItemSender>
        {senderState !== "none" ? (
          <MessageItemSenderState>
            {senderState === "deleted" ? "Deleted" : senderState === "left" ? "Left" : "Removed"}
          </MessageItemSenderState>
        ) : null}
        {meta ? <MessageItemMeta>claude-opus</MessageItemMeta> : null}
        <MessageItemTime>2:14 PM</MessageItemTime>
        {converting ? <MessageItemInlineStatus>Converting…</MessageItemInlineStatus> : null}
      </MessageItemHeader>
      <MessageItemBody>{messageBody}</MessageItemBody>
      {translationState === "bilingual" && !showOriginal ? (
        <MessageItemTranslationOriginal data-testid="message-translation-bilingual-original-preview">
          <MessageItemTranslationOriginalLabel>Original</MessageItemTranslationOriginalLabel>
          <MessageMarkdown>
            <p>{originalTranslation}</p>
          </MessageMarkdown>
        </MessageItemTranslationOriginal>
      ) : null}
      {translationStatus}
      {attachments}
      {footer}
    </MessageItemContent>
  );

  if (chrome === "selected") {
    return (
      <MessageMultiSelect defaultActive defaultSelected={new Set(["preview"])}>
        <MessageItemInteractionBoundary>
          <MessageItemSelection>
            <MessageMultiSelectCheckbox value="preview" aria-label="Select message" />
            {content}
          </MessageItemSelection>
        </MessageItemInteractionBoundary>
      </MessageMultiSelect>
    );
  }

  const RowChrome =
    chrome === "active"
      ? MessageItemActive
      : chrome === "search-match"
        ? MessageItemSearchMatch
        : MessageItem;

  return (
    <MessageItemInteractionBoundary ref={setPortalContainer}>
      <RowChrome>
        <MessageItemAvatarSlot>
          <Avatar
            size="sm"
            type="agent"
            className={senderState === "deleted" ? "grayscale opacity-60" : undefined}
          >
            <AvatarFallback>AT</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        {content}
        {toolbar ? (
          <MessageRowToolbar
            saved={isSaved}
            visible
            portalContainer={portalContainer}
            onReact={setReaction}
            onSavedChange={setIsSaved}
          />
        ) : null}
      </RowChrome>
      {reaction ? (
        <span className="sr-only" role="status">
          Reacted with {reaction}
        </span>
      ) : null}
    </MessageItemInteractionBoundary>
  );
}
