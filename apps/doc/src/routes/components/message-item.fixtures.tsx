import {
  Archive,
  Bookmark,
  Copy,
  Download,
  Eye,
  MessageSquare,
  Play,
  Reply,
  SmilePlus,
  Trash2,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  Badge,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "raft-ui";
import {
  MESSAGE_QUICK_REACTIONS,
  MessageAttachmentAction,
  MessageAttachmentBody,
  MessageAttachmentCard,
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
  MessageItemEmbedded,
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
  MessageReactionQuickRow,
  MessageVideoPreview,
  MessageVideoPreviewAction,
  MessageVideoPreviewFallback,
  MessageVideoPreviewFrame,
  SystemMessageItem,
  SystemMessageItemContent,
  SystemMessageItemTime,
} from "raft-ui/wip";

export const IMAGE_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='420' viewBox='0 0 640 420'%3E%3Crect width='640' height='420' fill='%23f4f0e8'/%3E%3Crect x='34' y='34' width='572' height='352' fill='%23f7d358' stroke='%23000' stroke-width='8'/%3E%3Ccircle cx='180' cy='168' r='72' fill='%23ff7ab6' stroke='%23000' stroke-width='8'/%3E%3Cpath d='M292 310 406 190l70 72 56-42 74 90z' fill='%23a3e8ff' stroke='%23000' stroke-width='8'/%3E%3C/svg%3E";

export function AuthoredMessageRow() {
  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <Avatar size="sm" type="agent">
          <AvatarFallback>AT</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Atlas</MessageItemSender>
          <MessageItemMeta>claude-opus</MessageItemMeta>
          <MessageItemTime>2:14 PM</MessageItemTime>
          <MessageItemInlineStatus>edited</MessageItemInlineStatus>
        </MessageItemHeader>
        <MessageItemBody>
          Shipped the token fixture pass. The markdown renderer, mentions, and links stay outside
          this component.
        </MessageItemBody>
        <MessageItemFooter>
          <Reaction emoji="👍" count={3} reacted />
          <Reaction emoji="🔥" count={1} />
        </MessageItemFooter>
      </MessageItemContent>
      <MessageItemSavedIndicator>
        <Bookmark fill="currentColor" />
      </MessageItemSavedIndicator>
      <Toolbar saved />
    </MessageItem>
  );
}

export function SavedToolbarMessageRow() {
  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <Avatar size="sm" type="agent">
          <AvatarFallback>TB</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Toolbar row</MessageItemSender>
          <MessageItemTime>2:18 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>
          Saved indicator remains visible until the hover toolbar appears.
        </MessageItemBody>
      </MessageItemContent>
      <MessageItemSavedIndicator>
        <Bookmark fill="currentColor" />
      </MessageItemSavedIndicator>
      <Toolbar forceVisible saved />
    </MessageItem>
  );
}

export function ContextMenuMessageRow() {
  return (
    <ContextMenu>
      <ContextMenuTrigger render={<MessageItem rowState="active" />}>
        <MessageItemAvatarSlot>
          <Avatar size="sm" type="agent">
            <AvatarFallback>AT</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Atlas</MessageItemSender>
            <MessageItemMeta>#design-system</MessageItemMeta>
            <MessageItemTime>2:14 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>Right-click opens the shared ContextMenu composition.</MessageItemBody>
          <MessageItemFooter>
            <MessageItemBadge tone="cyan">
              <MessageSquare />4 replies
            </MessageItemBadge>
            <Reaction emoji="✅" count={2} reacted />
          </MessageItemFooter>
        </MessageItemContent>
        <Toolbar />
      </ContextMenuTrigger>
      <ContextMenuContent className="w-60 min-w-60 shadow-[4px_4px_0px_var(--color-black)]">
        <MessageReactionQuickRow>
          {MESSAGE_QUICK_REACTIONS.map((emoji) => (
            <MessageReactionQuickButton key={emoji} aria-label={`React with ${emoji}`}>
              <MessageReactionGlyph emoji={emoji} size={18} />
            </MessageReactionQuickButton>
          ))}
        </MessageReactionQuickRow>
        <ContextMenuSeparator />
        <ContextMenuLabel>Message</ContextMenuLabel>
        <ContextMenuItem>
          <Reply />
          Reply in thread
        </ContextMenuItem>
        <ContextMenuItem>
          <Copy />
          Copy link
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <Archive />
          Save for later
        </ContextMenuItem>
        <ContextMenuItem className="text-danger-base focus:text-danger-base">
          <Trash2 />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function InteractiveStateRows() {
  return (
    <div className="flex w-full flex-col gap-2">
      <SelectedMessageRow />
      <ActiveMessageRow />
      <SearchMatchMessageRow />
    </div>
  );
}

export function ImageGalleryMessageRow() {
  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <Avatar size="sm" type="agent">
          <AvatarFallback>IM</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Image gallery</MessageItemSender>
          <MessageItemTime>3:01 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemAttachments>
          <MessageImageGallery>
            <MessageImageGalleryRow className="grid-cols-2">
              <MessageImageGalleryItem>
                <MessageImageGalleryMedia src={IMAGE_SRC} alt="" className="aspect-[4/3]" />
                <MessageImageGalleryAction aria-label="Download image">
                  <Download />
                </MessageImageGalleryAction>
              </MessageImageGalleryItem>
              <MessageImageGalleryItem optimistic>
                <MessageImageGalleryMedia src={IMAGE_SRC} alt="" className="aspect-[4/3]" />
                <MessageImageGalleryOverlay>
                  <Badge variant="warning" appearance="solid">
                    Uploading
                  </Badge>
                </MessageImageGalleryOverlay>
              </MessageImageGalleryItem>
            </MessageImageGalleryRow>
          </MessageImageGallery>
        </MessageItemAttachments>
      </MessageItemContent>
    </MessageItem>
  );
}

export function VideoPreviewMessageRow() {
  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <Avatar size="sm" type="agent">
          <AvatarFallback>VD</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Video preview</MessageItemSender>
          <MessageItemTime>3:02 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemAttachments>
          <MessageVideoPreview title="demo-recording.mp4">
            <MessageVideoPreviewFrame>
              <MessageVideoPreviewFallback>
                <Play className="size-8 text-white/80" />
              </MessageVideoPreviewFallback>
              <MessageVideoPreviewAction aria-label="Open demo-recording.mp4 in preview">
                <Eye />
              </MessageVideoPreviewAction>
            </MessageVideoPreviewFrame>
          </MessageVideoPreview>
        </MessageItemAttachments>
      </MessageItemContent>
    </MessageItem>
  );
}

export function FileAttachmentMessageRow() {
  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <Avatar size="sm" type="agent">
          <AvatarFallback>FL</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>File attachments</MessageItemSender>
          <MessageItemTime>3:03 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemAttachments>
          <div className="flex max-w-[22.5rem] flex-wrap items-start gap-2">
            <Attachment name="migration.diff" meta="Diff · 18 KB" summary="+42 -7" />
            <Attachment name="screening.html" meta="HTML preview · 44 KB" />
          </div>
        </MessageItemAttachments>
      </MessageItemContent>
    </MessageItem>
  );
}

export function ConsecutiveMessageRow() {
  return (
    <MessageItem compact>
      <MessageItemGutter>
        <MessageItemContinuationTime>2:15</MessageItemContinuationTime>
      </MessageItemGutter>
      <MessageItemContent>
        <MessageItemBody>
          Consecutive rows keep the gutter timestamp and hide sender chrome.
        </MessageItemBody>
      </MessageItemContent>
    </MessageItem>
  );
}

export function ThreadArchiveEventRow() {
  return (
    <SystemMessageItem>
      <SystemMessageItemTime>2:16 PM</SystemMessageItemTime>
      <SystemMessageItemContent>Atlas archived this thread.</SystemMessageItemContent>
    </SystemMessageItem>
  );
}

export function RemovedSenderMessageRow() {
  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <Avatar size="sm" type="human">
          <AvatarFallback>MX</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Mx. Chen</MessageItemSender>
          <MessageItemSenderState>removed</MessageItemSenderState>
          <MessageItemTime>Yesterday</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>
          This row covers removed human and deactivated agent badges.
        </MessageItemBody>
        <MessageItemNotice>
          Message is visible because it belongs to the archived thread.
        </MessageItemNotice>
      </MessageItemContent>
    </MessageItem>
  );
}

export function RichAttachmentMessageRow() {
  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <Avatar size="sm" type="agent">
          <AvatarFallback>AP</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>App Planner</MessageItemSender>
          <MessageItemMeta>gpt-4.1</MessageItemMeta>
          <MessageItemTime>3:04 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>
          Here is the source parity pass for <strong>#222</strong>. Mention chip, channel link, task
          link, and markdown are rendered by the caller.
        </MessageItemBody>
        <MessageItemEmbedded>
          <MessageItemNotice>Forwarded from #release-notes by Ada.</MessageItemNotice>
        </MessageItemEmbedded>
        <MessageItemAttachments>
          <MessageImageGallery>
            <MessageImageGalleryRow className="grid-cols-2">
              <MessageImageGalleryItem>
                <MessageImageGalleryMedia src={IMAGE_SRC} alt="" className="aspect-[4/3]" />
                <MessageImageGalleryAction aria-label="Download image">
                  <Download />
                </MessageImageGalleryAction>
              </MessageImageGalleryItem>
              <MessageImageGalleryItem optimistic>
                <MessageImageGalleryMedia src={IMAGE_SRC} alt="" className="aspect-[4/3]" />
                <MessageImageGalleryOverlay>
                  <Badge variant="warning" appearance="solid">
                    Uploading
                  </Badge>
                </MessageImageGalleryOverlay>
              </MessageImageGalleryItem>
            </MessageImageGalleryRow>
          </MessageImageGallery>
          <MessageVideoPreview title="demo-recording.mp4">
            <MessageVideoPreviewFrame>
              <MessageVideoPreviewFallback>
                <Play className="size-8 text-white/80" />
              </MessageVideoPreviewFallback>
              <MessageVideoPreviewAction aria-label="Open demo-recording.mp4 in preview">
                <Eye />
              </MessageVideoPreviewAction>
            </MessageVideoPreviewFrame>
          </MessageVideoPreview>
          <div className="flex max-w-[22.5rem] flex-wrap items-start gap-2">
            <Attachment name="migration.diff" meta="Diff · 18 KB" summary="+42 -7" />
            <Attachment name="screening.html" meta="HTML preview · 44 KB" />
          </div>
        </MessageItemAttachments>
        <MessageItemFooter>
          <Badge variant="primary" appearance="solid">
            Task #222
          </Badge>
          <MessageItemBadge tone="cyan">
            <MessageSquare />6 replies
          </MessageItemBadge>
          <Reaction emoji="👍" count={5} reacted />
          <Reaction emoji="👀" count={2} />
          <Reaction emoji="🔥" count={1} failed />
          <MessageReactionChip aria-label="Add reaction">
            <MessageReactionGlyph>
              <SmilePlus />
            </MessageReactionGlyph>
          </MessageReactionChip>
        </MessageItemFooter>
      </MessageItemContent>
      <Toolbar />
    </MessageItem>
  );
}

export function ReactionOverlays() {
  return (
    <div className="flex flex-wrap items-start gap-4 px-2">
      <MessageReactionPicker>
        {MESSAGE_QUICK_REACTIONS.map((emoji) => (
          <MessageReactionQuickButton key={emoji} aria-label={`React with ${emoji}`}>
            <MessageReactionGlyph emoji={emoji} size={18} />
          </MessageReactionQuickButton>
        ))}
      </MessageReactionPicker>
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
    </div>
  );
}

export function SelectedMessageRow() {
  return (
    <MessageItem>
      <MessageItemSelectMark checked />
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Selected row</MessageItemSender>
          <MessageItemTime>3:18 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>Selection is primarily represented by the check marker.</MessageItemBody>
      </MessageItemContent>
    </MessageItem>
  );
}

export function ActiveMessageRow() {
  return (
    <MessageItem rowState="active">
      <MessageItemAvatarSlot>
        <Avatar size="sm" type="agent">
          <AvatarFallback>AC</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Active anchor</MessageItemSender>
          <MessageItemTime>3:19 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>Used for menu anchor, current row, or permalink focus.</MessageItemBody>
      </MessageItemContent>
    </MessageItem>
  );
}

export function SearchMatchMessageRow() {
  return (
    <MessageItem rowState="search-match">
      <MessageItemAvatarSlot>
        <Avatar size="sm" type="agent">
          <AvatarFallback>SR</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Search result</MessageItemSender>
          <MessageItemTime>3:20 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>Search jump highlight keeps the cyan source treatment.</MessageItemBody>
      </MessageItemContent>
    </MessageItem>
  );
}

function Toolbar({
  forceVisible = false,
  reactionActive = false,
  saved = false,
}: {
  forceVisible?: boolean;
  reactionActive?: boolean;
  saved?: boolean;
}) {
  return (
    <MessageItemToolbar visible={forceVisible}>
      <MessageItemToolbarButton aria-label="Reply in thread">
        <MessageSquare />
      </MessageItemToolbarButton>
      <MessageItemToolbarButton active={reactionActive} aria-label="Add Reaction">
        <SmilePlus />
      </MessageItemToolbarButton>
      <MessageItemToolbarButton
        aria-label={saved ? "Remove from Saved" : "Save Message"}
        saved={saved}
      >
        <Bookmark fill={saved ? "currentColor" : "none"} />
      </MessageItemToolbarButton>
    </MessageItemToolbar>
  );
}

function Attachment({ name, meta, summary }: { name: string; meta: string; summary?: string }) {
  return (
    <MessageAttachmentCard>
      <MessageAttachmentBody>
        <MessageAttachmentTitle>{name}</MessageAttachmentTitle>
        <MessageAttachmentMeta>{meta}</MessageAttachmentMeta>
      </MessageAttachmentBody>
      {summary ? (
        <MessageAttachmentMeta className="pr-5 font-mono font-bold">
          {summary}
        </MessageAttachmentMeta>
      ) : null}
      <MessageAttachmentAction>
        <Download />
      </MessageAttachmentAction>
    </MessageAttachmentCard>
  );
}

export function Reaction({
  emoji,
  count,
  reacted = false,
  failed = false,
}: {
  emoji: string;
  count: number;
  reacted?: boolean;
  failed?: boolean;
}) {
  return (
    <MessageReactionChip reacted={reacted} failed={failed} aria-label={`${emoji} ${count}`}>
      <MessageReactionGlyph emoji={emoji} size={15} />
      <MessageReactionCount>{count}</MessageReactionCount>
    </MessageReactionChip>
  );
}

export function BrutalContextMenu() {
  return (
    <div className="w-60 overflow-hidden border-2 border-black bg-white shadow-[4px_4px_0px_var(--color-black)]">
      <MessageReactionQuickRow>
        {MESSAGE_QUICK_REACTIONS.map((emoji) => (
          <MessageReactionQuickButton key={emoji} aria-label={`React with ${emoji}`}>
            <MessageReactionGlyph emoji={emoji} size={18} />
          </MessageReactionQuickButton>
        ))}
      </MessageReactionQuickRow>
      <div className="border-t-2 border-black" />
      {["Copy Link", "Copy Markdown", "Select Message", "Open Thread", "Remove from Saved"].map(
        (label) => (
          <div
            key={label}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-black transition-colors hover:bg-soft-signal/30"
          >
            {label}
          </div>
        ),
      )}
    </div>
  );
}
