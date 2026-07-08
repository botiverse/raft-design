import type { ReactNode } from "react";
import { Bookmark, Download, Eye, MessageSquare, Play, Plus, SmilePlus, X } from "lucide-react";
import { Avatar, AvatarFallback, Spinner } from "raft-ui";
import {
  MESSAGE_QUICK_REACTIONS,
  MessageAttachmentAction,
  MessageAttachmentBody,
  MessageAttachmentCard,
  MessageAttachmentLoadingBar,
  MessageAttachmentMeta,
  MessageAttachmentTitle,
  MessageImageGallery,
  MessageImageGalleryAction,
  MessageImageGalleryItem,
  MessageImageGalleryMedia,
  MessageImageGalleryOverlay,
  MessageImageGalleryRow,
  MessageItem,
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
  MessageItemSelectMark,
  MessageItemSender,
  MessageItemSenderState,
  MessageItemTime,
  MessageItemToolbar,
  MessageItemToolbarButton,
  MessageReactionAddButton,
  MessageReactionChip,
  MessageReactionCount,
  MessageReactionGlyph,
  MessageReactionPicker,
  MessageReactionPopover,
  MessageReactionPopoverName,
  MessageReactionPopoverNameText,
  MessageReactionPopoverNames,
  MessageReactionPopoverSeparator,
  MessageReactionQuickButton,
  MessageVideoPreview,
  MessageVideoPreviewAction,
  MessageVideoPreviewFallback,
  MessageVideoPreviewFrame,
  SystemMessageItem,
  SystemMessageItemContent,
  SystemMessageItemTime,
} from "raft-ui/wip";
import { IMAGE_SRC, Reaction } from "./message-item.fixtures";

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
    <div className="grid min-w-0 gap-1.5 border border-black/10 bg-white px-2 py-2">
      <span className="font-mono text-[10px] leading-none font-bold text-black/45">{label}</span>
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
  rowState,
  saved,
  selectMark,
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
  rowState?: "active" | "search-match" | "select";
  saved?: boolean;
  selectMark?: "off" | "checked";
  sender?: string;
  senderState?: string;
  time?: string;
  toolbar?: ReactNode;
}) {
  return (
    <MessageItem compact={compact} rowState={rowState}>
      {selectMark ? <MessageItemSelectMark checked={selectMark === "checked"} /> : null}
      {gutterTime ? (
        <MessageItemGutter>
          <MessageItemContinuationTime>{gutterTime}</MessageItemContinuationTime>
        </MessageItemGutter>
      ) : selectMark ? null : (
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
    </MessageItem>
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
  return (
    <MessageItemToolbar visible={visible}>
      <MessageItemToolbarButton aria-label="Reply in thread">
        <MessageSquare />
      </MessageItemToolbarButton>
      <MessageItemToolbarButton active={active} aria-label="Add reaction">
        <SmilePlus />
      </MessageItemToolbarButton>
      <MessageItemToolbarButton aria-label="Save message" saved={saved}>
        <Bookmark fill={saved ? "currentColor" : "none"} />
      </MessageItemToolbarButton>
    </MessageItemToolbar>
  );
}

function AttachmentState({
  loading,
  optimistic,
  name = "migration.diff",
}: {
  loading?: boolean;
  optimistic?: boolean;
  name?: string;
}) {
  return (
    <MessageAttachmentCard loading={loading} optimistic={optimistic}>
      <MessageAttachmentBody>
        <MessageAttachmentTitle>{name}</MessageAttachmentTitle>
        <MessageAttachmentMeta>
          {loading ? "Uploading · 18 KB" : "Diff · 18 KB"}
        </MessageAttachmentMeta>
      </MessageAttachmentBody>
      {loading ? (
        <MessageAttachmentLoadingBar>
          <Spinner size="sm" />
          <span className="truncate">Preparing preview</span>
        </MessageAttachmentLoadingBar>
      ) : (
        <MessageAttachmentAction>
          <Download />
        </MessageAttachmentAction>
      )}
    </MessageAttachmentCard>
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
            <MessageImageGalleryItem optimistic={optimistic} single={single}>
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
                <MessageImageGalleryAction aria-label="Download image">
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
        <MessageVideoPreview optimistic={optimistic} title="demo-recording.mp4">
          <MessageVideoPreviewFrame>
            <MessageVideoPreviewFallback interactive={interactive}>
              <Play className="size-8 text-white/80" />
            </MessageVideoPreviewFallback>
            <MessageVideoPreviewAction aria-label="Open demo-recording.mp4 in preview">
              <Eye />
            </MessageVideoPreviewAction>
          </MessageVideoPreviewFrame>
        </MessageVideoPreview>
      </MessageItemAttachments>
    </StateRow>
  );
}

function ReactionChipState({
  failed,
  reacted,
  emoji = "👍",
}: {
  failed?: boolean;
  reacted?: boolean;
  emoji?: string;
}) {
  return (
    <MessageReactionChip failed={failed} reacted={reacted} aria-label={`${emoji} 3`}>
      <MessageReactionGlyph emoji={emoji} size={15} />
      <MessageReactionCount>3</MessageReactionCount>
    </MessageReactionChip>
  );
}

function QuickReactionPickerState() {
  return (
    <MessageReactionPicker>
      {MESSAGE_QUICK_REACTIONS.map((emoji) => (
        <MessageReactionQuickButton key={emoji} aria-label={`React with ${emoji}`}>
          <MessageReactionGlyph emoji={emoji} size={18} />
        </MessageReactionQuickButton>
      ))}
    </MessageReactionPicker>
  );
}

function ReactionPopoverState() {
  return (
    <MessageReactionPopover>
      <MessageReactionPopoverNames>
        <MessageReactionPopoverName>
          <MessageReactionPopoverNameText>Atlas</MessageReactionPopoverNameText>
          <MessageReactionPopoverSeparator>, </MessageReactionPopoverSeparator>
        </MessageReactionPopoverName>
        <MessageReactionPopoverName>
          <MessageReactionPopoverNameText>Ada Lovelace</MessageReactionPopoverNameText>
          <MessageReactionPopoverSeparator>, </MessageReactionPopoverSeparator>
        </MessageReactionPopoverName>
        <span className="leading-5 text-foreground/50">+3 more</span>
      </MessageReactionPopoverNames>
    </MessageReactionPopover>
  );
}

export function MessageItemStateMatrix() {
  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
      <MatrixSection title="row chrome">
        <MatrixCell label="authored row">
          <StateRow body="Normal authored row with avatar, sender, time, and body." />
        </MatrixCell>
        <MatrixCell label='rowState="active"'>
          <StateRow rowState="active" body="Anchor/current-row treatment." />
        </MatrixCell>
        <MatrixCell label='rowState="search-match"'>
          <StateRow rowState="search-match" body="Search result highlight treatment." />
        </MatrixCell>
        <MatrixCell label="compact continuation">
          <StateRow compact gutterTime="2:15" body="Continuation row with gutter timestamp." />
        </MatrixCell>
      </MatrixSection>

      <MatrixSection title="selection and sender">
        <MatrixCell label="select mark unchecked">
          <StateRow
            rowState="select"
            selectMark="off"
            body="Selection affordance before the row is checked."
          />
        </MatrixCell>
        <MatrixCell label="select mark checked">
          <StateRow
            rowState="select"
            selectMark="checked"
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
        <MatrixCell label="badge cyan">
          <StateRow
            body="Footer badge cyan tone."
            footer={
              <MessageItemBadge tone="cyan">
                <MessageSquare />6 replies
              </MessageItemBadge>
            }
          />
        </MatrixCell>
        <MatrixCell label="reaction chips">
          <StateRow
            body="Neutral, reacted, failed, and add-reaction chip states."
            footer={
              <>
                <ReactionChipState />
                <ReactionChipState emoji="🔥" reacted />
                <ReactionChipState emoji="❤️" failed />
                <MessageReactionAddButton aria-label="Add reaction">
                  <Plus strokeWidth={2.5} />
                </MessageReactionAddButton>
              </>
            }
          />
        </MatrixCell>
        <MatrixCell label="emoji set">
          <div className="flex flex-wrap items-center gap-1.5">
            <Reaction emoji="👍" count={5} reacted />
            <Reaction emoji="👀" count={2} />
            <Reaction emoji="🔥" count={1} failed />
            <ReactionChipState emoji="✅" />
            <ReactionChipState emoji="😂" />
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
            <AttachmentState />
          </AttachmentRow>
        </MatrixCell>
        <MatrixCell label="attachment loading">
          <AttachmentRow>
            <AttachmentState loading name="uploading.mov" />
          </AttachmentRow>
        </MatrixCell>
        <MatrixCell label="attachment optimistic">
          <AttachmentRow>
            <AttachmentState optimistic name="screening.html" />
          </AttachmentRow>
        </MatrixCell>
        <MatrixCell label="reaction picker">
          <QuickReactionPickerState />
        </MatrixCell>
        <MatrixCell label="reaction popover">
          <ReactionPopoverState />
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
