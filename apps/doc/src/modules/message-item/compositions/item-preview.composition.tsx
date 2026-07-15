import { useState } from "react";
import { Ban, Bookmark, Check, CheckCircle, Circle, Eye, Play, Plus } from "lucide-react";
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
  MessageItemBody,
  MessageItemContent,
  MessageItemContinuationTime,
  MessageItemFooter,
  MessageItemGutter,
  MessageItemHeader,
  MessageItemInteractionBoundary,
  MessageItemMeta,
  MessageItemSavedIndicator,
  MessageItemSearchMatch,
  MessageItemSelection,
  MessageItemSender,
  MessageItemTime,
  MessageReactionAddButton,
  MessageReactionGlyph,
  MessageReactionPickerContent,
  MessageReactionQuickButton,
  MessageMultiSelect,
  MessageMultiSelectCheckbox,
} from "raft-ui/wip";
import { MessageReactionComposition } from "./reaction.compositions.tsx";
import { MESSAGE_QUICK_REACTIONS } from "#/modules/message-item/message-item.fixtures.ts";
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
  task?: boolean;
  image?: boolean;
  video?: boolean;
  files?: boolean;
  saved?: boolean;
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
  task = false,
  image = false,
  video = false,
  files = false,
  saved = false,
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
  const continuation = chrome === "continuation";

  const footer =
    task || isSaved || reactions ? (
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
        {meta ? <MessageItemMeta>claude-opus</MessageItemMeta> : null}
        <MessageItemTime>2:14 PM</MessageItemTime>
      </MessageItemHeader>
      <MessageItemBody>
        Toggle the controls to preview row chrome, the saved indicator, reactions, and the hover
        toolbar. Markdown, mentions, and links stay caller-owned.
      </MessageItemBody>
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
          <Avatar size="sm" type="agent">
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
