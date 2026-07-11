import { useState, type ReactNode } from "react";
import { Bookmark, Download, Eye, MessageSquare, Play, Plus, SmilePlus, X } from "lucide-react";
import { Avatar, AvatarFallback, Spinner } from "raft-ui";
import {
  MessageImageGallery,
  MessageImageGalleryAction,
  MessageImageGalleryItem,
  MessageImageGalleryMedia,
  MessageImageGalleryOverlay,
  MessageImageGalleryRow,
  MessageItem,
  MessageItemActive,
  MessageItemAttachments,
  MessageItemAvatarSlot,
  MessageItemBadge,
  MessageItemBody,
  MessageItemContent,
  MessageItemContinuationTime,
  MessageItemFooter,
  MessageItemGutter,
  MessageItemHeader,
  MessageItemInlineStatus,
  MessageItemMeta,
  MessageItemNotice,
  MessageItemSavedIndicator,
  MessageItemSearchMatch,
  MessageItemSelection,
  MessageItemSender,
  MessageItemSenderState,
  MessageItemTime,
  MessageItemToolbar,
  MessageItemToolbarButton,
  MessageItemUnreadBadge,
  MessageReactionAddButton,
  MessageReactionGlyph,
  MessageReactionPicker,
  MessageReactionQuickButton,
  MessageMultiSelect,
  MessageMultiSelectCheckbox,
  MessageVideoPreview,
  MessageVideoPreviewAction,
  MessageVideoPreviewFallback,
  MessageVideoPreviewFrame,
  SystemMessageItem,
  SystemMessageItemContent,
  SystemMessageItemTime,
} from "raft-ui/wip";
import {
  MESSAGE_QUICK_REACTIONS,
  MessageReactionComposition,
  MessageReactionTooltipComposition,
} from "#/compositions/message-item/message-reaction-compositions.tsx";
import {
  MessageAttachmentOpeningComposition,
  MessageAttachmentPendingComposition,
  MessageAttachmentReadyComposition,
} from "#/compositions/message-item/message-attachment-compositions.tsx";
import {
  downloadMessageFixture,
  IMAGE_SRC,
  openMessageFixture,
} from "#/compositions/message-item/message-row-compositions.tsx";

type MatrixCellProps = {
  label: string;
  children: ReactNode;
};

type MatrixSectionProps = {
  title: string;
  children: ReactNode;
};

function MatrixSection({ title, children }: MatrixSectionProps) {
  return (
    <section className="grid min-w-0 gap-2">
      <h3 className="font-mono text-[10px] leading-none font-bold text-foreground/45 uppercase">
        {title}
      </h3>
      <div className="grid min-w-0 gap-2">{children}</div>
    </section>
  );
}

function MatrixCell({ label, children }: MatrixCellProps) {
  return (
    <div className="grid min-w-0 gap-1.5 border border-line-muted bg-layer-panel px-2 py-2">
      <span className="font-mono text-[10px] leading-none font-bold text-foreground/45">
        {label}
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function AvatarSlot({ children = "AT" }: { children?: string }) {
  return (
    <MessageItemAvatarSlot>
      <Avatar size="sm" type="agent">
        <AvatarFallback>{children}</AvatarFallback>
      </Avatar>
    </MessageItemAvatarSlot>
  );
}

function StateRow({
  body,
  children,
  compact,
  footer,
  gutterTime,
  inlineStatus,
  meta,
  notice,
  surface,
  saved,
  selection,
  sender = "Atlas",
  senderState,
  time = "2:14 PM",
  toolbar,
}: {
  body: ReactNode;
  children?: ReactNode;
  compact?: boolean;
  footer?: ReactNode;
  gutterTime?: string;
  inlineStatus?: string;
  meta?: string;
  notice?: ReactNode;
  surface?: "active" | "search-match" | "select";
  saved?: boolean;
  selection?: "unchecked" | "checked";
  sender?: string;
  senderState?: string;
  time?: string;
  toolbar?: ReactNode;
}) {
  const ItemRoot =
    surface === "active"
      ? MessageItemActive
      : surface === "search-match"
        ? MessageItemSearchMatch
        : surface === "select"
          ? MessageItemSelection
          : MessageItem;
  const row = (
    <ItemRoot compact={compact}>
      {selection ? (
        <MessageMultiSelectCheckbox value="fixture-message" aria-label="Select message" />
      ) : null}
      {gutterTime ? (
        <MessageItemGutter>
          <MessageItemContinuationTime>{gutterTime}</MessageItemContinuationTime>
        </MessageItemGutter>
      ) : selection ? null : (
        <AvatarSlot>{sender.slice(0, 2).toUpperCase()}</AvatarSlot>
      )}
      <MessageItemContent>
        {compact ? null : (
          <MessageItemHeader>
            <MessageItemSender>{sender}</MessageItemSender>
            {senderState ? <MessageItemSenderState>{senderState}</MessageItemSenderState> : null}
            {meta ? <MessageItemMeta>{meta}</MessageItemMeta> : null}
            <MessageItemTime>{time}</MessageItemTime>
            {inlineStatus ? (
              <MessageItemInlineStatus>{inlineStatus}</MessageItemInlineStatus>
            ) : null}
          </MessageItemHeader>
        )}
        <MessageItemBody>{body}</MessageItemBody>
        {notice ? <MessageItemNotice>{notice}</MessageItemNotice> : null}
        {children}
        {footer ? <MessageItemFooter>{footer}</MessageItemFooter> : null}
      </MessageItemContent>
      {saved ? (
        <MessageItemSavedIndicator>
          <Bookmark fill="currentColor" />
        </MessageItemSavedIndicator>
      ) : null}
      {toolbar}
    </ItemRoot>
  );

  if (!selection) return row;

  return (
    <MessageMultiSelect
      defaultActive
      defaultSelected={selection === "checked" ? new Set(["fixture-message"]) : new Set()}
    >
      {row}
    </MessageMultiSelect>
  );
}

function ToolbarState({
  active,
  saved,
  visible,
}: {
  active?: boolean;
  saved?: boolean;
  visible?: boolean;
}) {
  const [isActive, setIsActive] = useState(active);
  const [isSaved, setIsSaved] = useState(saved);

  return (
    <MessageItemToolbar visible={visible}>
      <MessageItemToolbarButton aria-label="Reply in thread" disabled>
        <MessageSquare />
      </MessageItemToolbarButton>
      <MessageItemToolbarButton
        aria-pressed={isActive}
        aria-label="Add reaction"
        onClick={() => setIsActive((current) => !current)}
      >
        <SmilePlus />
      </MessageItemToolbarButton>
      <MessageItemToolbarButton
        aria-label="Save message"
        aria-pressed={isSaved}
        onClick={() => setIsSaved((current) => !current)}
      >
        <Bookmark fill={isSaved ? "currentColor" : "none"} />
      </MessageItemToolbarButton>
    </MessageItemToolbar>
  );
}

function AttachmentRow({ children }: { children: ReactNode }) {
  return (
    <StateRow body="Attachment states are caller-composed inside MessageItemAttachments.">
      <MessageItemAttachments>
        <div className="flex max-w-[22.5rem] flex-wrap items-start gap-2">{children}</div>
      </MessageItemAttachments>
    </StateRow>
  );
}

function ImageGalleryState({
  fit = "cover",
  optimistic,
  single,
}: {
  fit?: "contain" | "cover";
  optimistic?: boolean;
  single?: boolean;
}) {
  return (
    <StateRow body="Image state">
      <MessageItemAttachments>
        <MessageImageGallery>
          <MessageImageGalleryRow className={single ? "grid-cols-1" : "grid-cols-2"}>
            <MessageImageGalleryItem aria-busy={optimistic || undefined} single={single}>
              <MessageImageGalleryMedia
                src={IMAGE_SRC}
                alt=""
                fit={fit}
                className={single ? "aspect-[4/3] max-h-36" : "aspect-[4/3]"}
              />
              {optimistic ? (
                <MessageImageGalleryOverlay>
                  <Spinner size="lg" className="text-white" />
                </MessageImageGalleryOverlay>
              ) : (
                <MessageImageGalleryAction
                  aria-label="Download image"
                  onClick={() => downloadMessageFixture("message-image.svg")}
                >
                  <Download />
                </MessageImageGalleryAction>
              )}
            </MessageImageGalleryItem>
          </MessageImageGalleryRow>
        </MessageImageGallery>
      </MessageItemAttachments>
    </StateRow>
  );
}

function VideoState({ interactive, optimistic }: { interactive?: boolean; optimistic?: boolean }) {
  return (
    <StateRow body="Video preview state">
      <MessageItemAttachments>
        <MessageVideoPreview aria-busy={optimistic || undefined} title="demo-recording.mp4">
          <MessageVideoPreviewFrame>
            {optimistic ? (
              <MessageVideoPreviewFallback>
                <Spinner size="lg" className="text-white" />
              </MessageVideoPreviewFallback>
            ) : (
              <>
                <MessageVideoPreviewFallback interactive={interactive}>
                  <Play className="size-8 text-white/80" />
                </MessageVideoPreviewFallback>
                <MessageVideoPreviewAction
                  aria-label="Open demo-recording.mp4 in preview"
                  onClick={openMessageFixture}
                >
                  <Eye />
                </MessageVideoPreviewAction>
              </>
            )}
          </MessageVideoPreviewFrame>
        </MessageVideoPreview>
      </MessageItemAttachments>
    </StateRow>
  );
}

function QuickReactionPickerState() {
  const [selectedReaction, setSelectedReaction] = useState<string>();

  return (
    <MessageReactionPicker>
      {MESSAGE_QUICK_REACTIONS.map((emoji) => (
        <MessageReactionQuickButton
          key={emoji}
          aria-label={`React with ${emoji}`}
          aria-pressed={selectedReaction === emoji}
          onClick={() => setSelectedReaction(emoji)}
        >
          <MessageReactionGlyph emoji={emoji} size={18} />
        </MessageReactionQuickButton>
      ))}
    </MessageReactionPicker>
  );
}

function ReactionTooltipState() {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div ref={setPortalContainer} className="relative">
      <MessageReactionTooltipComposition
        container={portalContainer}
        count={3}
        emoji="👍"
        names={["Atlas", "Ada Lovelace", "Grace Hopper", "Linus Torvalds", "Margaret Hamilton"]}
        open
      />
    </div>
  );
}

export function MessageItemStateMatrix() {
  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
      <MatrixSection title="row chrome">
        <MatrixCell label="authored row">
          <StateRow body="Normal authored row with avatar, sender, time, and body." />
        </MatrixCell>
        <MatrixCell label="MessageItemActive">
          <StateRow surface="active" body="Anchor/current-row treatment." />
        </MatrixCell>
        <MatrixCell label="MessageItemSearchMatch">
          <StateRow surface="search-match" body="Search result highlight treatment." />
        </MatrixCell>
        <MatrixCell label="compact continuation">
          <StateRow compact gutterTime="2:15" body="Continuation row with gutter timestamp." />
        </MatrixCell>
      </MatrixSection>

      <MatrixSection title="selection and sender">
        <MatrixCell label="selection checkbox unchecked">
          <StateRow
            surface="select"
            selection="unchecked"
            body="Selection affordance before the row is checked."
          />
        </MatrixCell>
        <MatrixCell label="selection checkbox checked">
          <StateRow
            surface="select"
            selection="checked"
            body="Selection affordance after the row is checked."
          />
        </MatrixCell>
        <MatrixCell label="sender state removed">
          <StateRow sender="Mx. Chen" senderState="removed" body="Human sender removed state." />
        </MatrixCell>
        <MatrixCell label="sender state deactivated">
          <StateRow
            sender="Deploy Bot"
            senderState="deactivated"
            body="Agent sender inactive state."
          />
        </MatrixCell>
      </MatrixSection>

      <MatrixSection title="header and toolbar">
        <MatrixCell label="meta + inline status">
          <StateRow
            meta="claude-opus"
            inlineStatus="Converting…"
            body="Model/channel metadata and converting status."
          />
        </MatrixCell>
        <MatrixCell label="toolbar visible">
          <StateRow
            body="Toolbar forced open for fixture inspection."
            toolbar={<ToolbarState visible />}
          />
        </MatrixCell>
        <MatrixCell label="toolbar reaction active">
          <StateRow
            body="Reaction button active while picker/menu is open."
            toolbar={<ToolbarState active visible />}
          />
        </MatrixCell>
        <MatrixCell label="saved indicator + saved action">
          <StateRow
            saved
            body="Saved indicator and saved toolbar affordance."
            toolbar={<ToolbarState saved visible />}
          />
        </MatrixCell>
      </MatrixSection>

      <MatrixSection title="footer badges and reactions">
        <MatrixCell label="badge default">
          <StateRow
            body="Footer badge default tone."
            footer={<MessageItemBadge>4 replies</MessageItemBadge>}
          />
        </MatrixCell>
        <MatrixCell label="unread badge">
          <StateRow
            body="Unread footer badge composition."
            footer={
              <MessageItemUnreadBadge>
                <MessageSquare />6 replies
              </MessageItemUnreadBadge>
            }
          />
        </MatrixCell>
        <MatrixCell label="reaction chips">
          <StateRow
            body="Neutral, reacted, failed, and add-reaction chip states."
            footer={
              <>
                <MessageReactionComposition emoji="👍" count={3} />
                <MessageReactionComposition emoji="🔥" count={3} reacted />
                <MessageReactionComposition emoji="❤️" count={3} failed />
                <MessageReactionAddButton aria-label="Add reaction" disabled>
                  <Plus strokeWidth={2.5} />
                </MessageReactionAddButton>
              </>
            }
          />
        </MatrixCell>
        <MatrixCell label="emoji set">
          <div className="flex flex-wrap items-center gap-1.5">
            <MessageReactionComposition emoji="👍" count={5} reacted />
            <MessageReactionComposition emoji="👀" count={2} />
            <MessageReactionComposition emoji="🔥" count={1} failed />
            <MessageReactionComposition emoji="✅" count={3} />
            <MessageReactionComposition emoji="😂" count={3} />
            <MessageReactionGlyph>
              <X className="size-[13px]" />
            </MessageReactionGlyph>
          </div>
        </MatrixCell>
      </MatrixSection>

      <MatrixSection title="media attachments">
        <MatrixCell label="image single cover">
          <ImageGalleryState single />
        </MatrixCell>
        <MatrixCell label="image contain">
          <ImageGalleryState fit="contain" single />
        </MatrixCell>
        <MatrixCell label="image optimistic">
          <ImageGalleryState optimistic />
        </MatrixCell>
        <MatrixCell label="video fallback">
          <VideoState />
        </MatrixCell>
        <MatrixCell label="video interactive">
          <VideoState interactive />
        </MatrixCell>
        <MatrixCell label="video optimistic">
          <VideoState optimistic />
        </MatrixCell>
      </MatrixSection>

      <MatrixSection title="file attachments and overlays">
        <MatrixCell label="attachment card">
          <AttachmentRow>
            <MessageAttachmentReadyComposition
              name="migration.diff"
              meta="Diff · 18 KB"
              primaryAction={<Download />}
              primaryActionLabel="Download migration.diff"
              onPrimaryAction={() => downloadMessageFixture("migration.diff")}
            />
          </AttachmentRow>
        </MatrixCell>
        <MatrixCell label="attachment loading">
          <AttachmentRow>
            <MessageAttachmentOpeningComposition
              name="uploading.mov"
              meta="Uploading · 18 KB"
              label="Preparing preview"
            />
          </AttachmentRow>
        </MatrixCell>
        <MatrixCell label="attachment optimistic">
          <AttachmentRow>
            <MessageAttachmentPendingComposition name="screening.html" meta="Diff · 18 KB" />
          </AttachmentRow>
        </MatrixCell>
        <MatrixCell label="reaction picker">
          <QuickReactionPickerState />
        </MatrixCell>
        <MatrixCell label="reaction tooltip">
          <ReactionTooltipState />
        </MatrixCell>
        <MatrixCell label="system event">
          <SystemMessageItem>
            <SystemMessageItemTime>2:16 PM</SystemMessageItemTime>
            <SystemMessageItemContent>Atlas archived this thread.</SystemMessageItemContent>
          </SystemMessageItem>
        </MatrixCell>
      </MatrixSection>
    </div>
  );
}
