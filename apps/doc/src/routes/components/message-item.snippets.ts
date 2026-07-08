import type { PropRow } from "#/components/props-table.tsx";

export const TOC = [
  { id: "preview", title: "Preview" },
  { id: "state-matrix", title: "State matrix" },
  { id: "fixtures", title: "Fixtures" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

export const SNIPPETS = {
  anatomy: `import { Bookmark, MessageSquare, SmilePlus } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "raft-ui";
import {
  MESSAGE_QUICK_REACTIONS,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemFooter,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
  MessageItemToolbar,
  MessageItemToolbarButton,
  MessageReactionGlyph,
  MessageReactionQuickButton,
  MessageReactionQuickRow,
} from "raft-ui/wip";

<ContextMenu>
  <ContextMenuTrigger render={<MessageItem />}>
    <MessageItemAvatarSlot>
      <Avatar size="sm" type="agent">
        <AvatarFallback>AT</AvatarFallback>
      </Avatar>
    </MessageItemAvatarSlot>
    <MessageItemContent>
      <MessageItemHeader>
        <MessageItemSender>Atlas</MessageItemSender>
        <MessageItemTime>2:14 PM</MessageItemTime>
      </MessageItemHeader>
      <MessageItemBody>Shipped the token fixture pass.</MessageItemBody>
      <MessageItemFooter>{reactions}</MessageItemFooter>
    </MessageItemContent>
    <MessageItemToolbar>
      <MessageItemToolbarButton aria-label="Reply in thread">
        <MessageSquare />
      </MessageItemToolbarButton>
      <MessageItemToolbarButton aria-label="Add Reaction">
        <SmilePlus />
      </MessageItemToolbarButton>
      <MessageItemToolbarButton aria-label="Save Message">
        <Bookmark />
      </MessageItemToolbarButton>
    </MessageItemToolbar>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <MessageReactionQuickRow>
      {MESSAGE_QUICK_REACTIONS.map((emoji) => (
        <MessageReactionQuickButton key={emoji} aria-label={\`React with \${emoji}\`}>
          <MessageReactionGlyph emoji={emoji} size={18} />
        </MessageReactionQuickButton>
      ))}
    </MessageReactionQuickRow>
    <ContextMenuSeparator />
    <ContextMenuItem>Reply in thread</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>`,
  stateMatrix: `import {
  MessageAttachmentBody,
  MessageAttachmentCard,
  MessageAttachmentMeta,
  MessageAttachmentTitle,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSelectMark,
  MessageItemSender,
  MessageItemSenderState,
  MessageItemTime,
  MessageReactionChip,
  MessageReactionCount,
  MessageReactionGlyph,
} from "raft-ui/wip";

<div className="grid gap-5 xl:grid-cols-2">
  <section className="grid gap-2">
    <MessageItem rowState="active">
      <MessageItemAvatarSlot>{avatar}</MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Atlas</MessageItemSender>
          <MessageItemTime>2:14 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>Anchor/current-row treatment.</MessageItemBody>
      </MessageItemContent>
    </MessageItem>

    <MessageItem>
      <MessageItemSelectMark checked />
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Atlas</MessageItemSender>
          <MessageItemTime>2:15 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>Selection marker state.</MessageItemBody>
      </MessageItemContent>
    </MessageItem>

    <MessageItem>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Mx. Chen</MessageItemSender>
          <MessageItemSenderState>removed</MessageItemSenderState>
          <MessageItemTime>Yesterday</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>Sender state badge.</MessageItemBody>
      </MessageItemContent>
    </MessageItem>
  </section>

  <section className="grid gap-2">
    <MessageReactionChip reacted aria-label="👍 3">
      <MessageReactionGlyph emoji="👍" size={15} />
      <MessageReactionCount>3</MessageReactionCount>
    </MessageReactionChip>

    <MessageAttachmentCard loading>
      <MessageAttachmentBody>
        <MessageAttachmentTitle>uploading.mov</MessageAttachmentTitle>
        <MessageAttachmentMeta>Uploading · 18 KB</MessageAttachmentMeta>
      </MessageAttachmentBody>
    </MessageAttachmentCard>
  </section>
</div>`,
  fixtureRows: `<div className="flex flex-col gap-3">
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
      </MessageItemHeader>
      <MessageItemBody>Shipped the token fixture pass.</MessageItemBody>
      <MessageItemFooter>
        <MessageReactionChip reacted aria-label="👍 3">
          <MessageReactionGlyph emoji="👍" size={15} />
          <MessageReactionCount>3</MessageReactionCount>
        </MessageReactionChip>
      </MessageItemFooter>
    </MessageItemContent>
  </MessageItem>

  <MessageItem compact>
    <MessageItemGutter>
      <MessageItemContinuationTime>2:15</MessageItemContinuationTime>
    </MessageItemGutter>
    <MessageItemContent>
      <MessageItemBody>Continuation rows hide sender chrome.</MessageItemBody>
    </MessageItemContent>
  </MessageItem>

  <SystemMessageItem>
    <SystemMessageItemTime>2:16 PM</SystemMessageItemTime>
    <SystemMessageItemContent>Atlas archived this thread.</SystemMessageItemContent>
  </SystemMessageItem>

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
      <MessageItemBody>Removed sender badge and archived-thread notice.</MessageItemBody>
      <MessageItemNotice>Message is visible because it belongs to the archived thread.</MessageItemNotice>
    </MessageItemContent>
  </MessageItem>
</div>`,
  fixtureRich: `<MessageItem>
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
    <MessageItemBody>Here is the source parity pass for #222.</MessageItemBody>
    <MessageItemEmbedded>
      <MessageItemNotice>Forwarded from #release-notes by Ada.</MessageItemNotice>
    </MessageItemEmbedded>
    <MessageItemAttachments>
      <MessageImageGallery>
        <MessageImageGalleryRow className="grid-cols-2">
          <MessageImageGalleryItem>
            <MessageImageGalleryMedia src={imageSrc} alt="" className="aspect-[4/3]" />
            <MessageImageGalleryAction aria-label="Download image">{downloadIcon}</MessageImageGalleryAction>
          </MessageImageGalleryItem>
          <MessageImageGalleryItem optimistic>
            <MessageImageGalleryMedia src={imageSrc} alt="" className="aspect-[4/3]" />
            <MessageImageGalleryOverlay>
              <Badge variant="warning" appearance="solid">Uploading</Badge>
            </MessageImageGalleryOverlay>
          </MessageImageGalleryItem>
        </MessageImageGalleryRow>
      </MessageImageGallery>
      <MessageVideoPreview title="demo-recording.mp4">
        <MessageVideoPreviewFrame>
          <MessageVideoPreviewFallback>{playIcon}</MessageVideoPreviewFallback>
          <MessageVideoPreviewAction aria-label="Open demo-recording.mp4 in preview">{previewIcon}</MessageVideoPreviewAction>
        </MessageVideoPreviewFrame>
      </MessageVideoPreview>
      <div className="flex max-w-[22.5rem] flex-wrap items-start gap-2">
        <MessageAttachmentCard>
          <MessageAttachmentBody>
            <MessageAttachmentTitle>migration.diff</MessageAttachmentTitle>
            <MessageAttachmentMeta>Diff · 18 KB</MessageAttachmentMeta>
          </MessageAttachmentBody>
        </MessageAttachmentCard>
      </div>
    </MessageItemAttachments>
  </MessageItemContent>
</MessageItem>`,
  fixtureStates: `<div className="flex flex-col gap-3">
  <MessageItem>
    <MessageItemSelectMark checked />
    <MessageItemContent>
      <MessageItemHeader>
        <MessageItemSender>Selected row</MessageItemSender>
        <MessageItemTime>3:18 PM</MessageItemTime>
      </MessageItemHeader>
      <MessageItemBody>Selection is represented by the check marker.</MessageItemBody>
    </MessageItemContent>
  </MessageItem>

  <MessageItem rowState="active">
    <MessageItemAvatarSlot>{avatar}</MessageItemAvatarSlot>
    <MessageItemContent>
      <MessageItemHeader>
        <MessageItemSender>Active anchor</MessageItemSender>
        <MessageItemTime>3:19 PM</MessageItemTime>
      </MessageItemHeader>
      <MessageItemBody>Used for menu anchor, current row, or permalink focus.</MessageItemBody>
    </MessageItemContent>
  </MessageItem>

  <MessageItem rowState="search-match">
    <MessageItemAvatarSlot>{avatar}</MessageItemAvatarSlot>
    <MessageItemContent>
      <MessageItemHeader>
        <MessageItemSender>Search result</MessageItemSender>
        <MessageItemTime>3:20 PM</MessageItemTime>
      </MessageItemHeader>
      <MessageItemBody>Search jump highlight keeps the source treatment.</MessageItemBody>
    </MessageItemContent>
  </MessageItem>
</div>`,
  fixtureReactions: `<div className="flex flex-wrap items-start gap-4">
  <MessageReactionPicker>
    {MESSAGE_QUICK_REACTIONS.map((emoji) => (
      <MessageReactionQuickButton key={emoji} aria-label={\`React with \${emoji}\`}>
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
      <span className="leading-5 text-foreground/50">+3 more</span>
    </MessageReactionPopoverNames>
  </MessageReactionPopover>
</div>`,
  sourceAuthoredRow: `<div className="group/message relative mb-1 mt-1.5 flex h-fit min-h-12 gap-3 px-2 py-1 hover:border-2 hover:border-black hover:bg-white">
  <Avatar />
  <div>
    <div className="flex items-center gap-2 pr-24">
      <span className="text-sm font-bold">Atlas</span>
      <span className="font-mono text-xs text-black/40">2:14 PM</span>
    </div>
    <div className="break-words text-sm leading-5">Source rendered markdown and message parts here.</div>
  </div>
</div>`,
  currentAuthoredRow: `<MessageItem>
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
    </MessageItemHeader>
    <MessageItemBody>Source rendered markdown and message parts here.</MessageItemBody>
  </MessageItemContent>
</MessageItem>`,
} as const;

export const PROPS: readonly PropRow[] = [
  {
    name: "MessageItem",
    type: 'useRender.ComponentProps<"div"> & { compact?: boolean; rowState?: "active" | "search-match" }',
    description:
      "Root row. Use rowState for mutually exclusive row chrome, compact for consecutive rows, and MessageItemSelectMark for selection.",
  },
  {
    name: "MessageItemHeader",
    type: 'useRender.ComponentProps<"div">',
    description: "Sender, sender state, metadata, timestamp, and inline delivery state row.",
  },
  {
    name: "MessageItemSelectMark",
    type: 'Omit<useRender.ComponentProps<"span">, "children"> & { checked?: boolean }',
    description: "Selection marker. The checked state controls the yellow filled check affordance.",
  },
  {
    name: "MessageItemSenderState",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Sender status badge for removed, deactivated, or similarly caller-owned sender states.",
  },
  {
    name: "MessageItemBody",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Message content slot. Markdown, mentions, links, and translation output are caller-owned.",
  },
  {
    name: "MessageItemToolbar",
    type: 'useRender.ComponentProps<"div"> & { visible?: boolean }',
    description: "Hover toolbar slot matching the source brutal pill treatment.",
  },
  {
    name: "MessageItemToolbarButton",
    type: 'useRender.ComponentProps<"button"> & { active?: boolean; saved?: boolean }',
    description:
      "Toolbar action button. Active covers open picker/menu state; saved colors the bookmark action.",
  },
  {
    name: "MessageItemSavedIndicator",
    type: 'useRender.ComponentProps<"span">',
    description: "Pinned saved marker shown on the row until the hover toolbar takes over.",
  },
  {
    name: "MessageItemBadge",
    type: 'useRender.ComponentProps<"span"> & { tone?: "default" | "cyan" }',
    description:
      "Footer badge for thread/task chips. Tone is visual only; business meaning stays outside.",
  },
  {
    name: "MessageImageGallery",
    type: "compound slots",
    description:
      "Image grid, optimistic overlay, and media fit slots for source image attachment variants.",
  },
  {
    name: "MessageImageGalleryItem",
    type: 'useRender.ComponentProps<"div"> & { optimistic?: boolean; single?: boolean }',
    description: "Image item state for upload opacity and single-image sizing.",
  },
  {
    name: "MessageImageGalleryMedia",
    type: 'useRender.ComponentProps<"img"> & { fit?: "contain" | "cover" }',
    description: "Image media fit mode used by preview thumbnails and contain-style attachments.",
  },
  {
    name: "MessageAttachmentCard",
    type: 'useRender.ComponentProps<"button"> & { optimistic?: boolean; loading?: boolean }',
    description: "File/html/diff attachment card with upload and optimistic states.",
  },
  {
    name: "MessageVideoPreview",
    type: 'useRender.ComponentProps<"div"> & { optimistic?: boolean }',
    description:
      "Inline video preview shell with black media frame, expand action, and optimistic state.",
  },
  {
    name: "MessageVideoPreviewFallback",
    type: 'useRender.ComponentProps<"div"> & { interactive?: boolean }',
    description: "Fallback/play surface. Interactive changes cursor and hover treatment only.",
  },
  {
    name: "MessageReactionChip",
    type: 'useRender.ComponentProps<"button"> & { reacted?: boolean; failed?: boolean }',
    description: "Reaction chip with reacted and failed data-state styling.",
  },
  {
    name: "MessageReactionGlyph",
    type: 'useRender.ComponentProps<"span"> & { emoji?: string; size?: number; spritePath?: string }',
    description:
      "Emoji sprite renderer with icon/child fallback for add/remove reaction affordances.",
  },
  {
    name: "MessageReactionQuickRow",
    type: "compound slots",
    description: "Quick reaction row, picker, and reactors list. Open state stays caller-owned.",
  },
  {
    name: "MessageReactionPicker",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Standalone quick reaction picker shell. Positioning and open state are caller-owned.",
  },
  {
    name: "MessageReactionPopover",
    type: 'useRender.ComponentProps<"div">',
    description: "Reactors list popover shell for names and +N overflow text.",
  },
  {
    name: "SystemMessageItem",
    type: 'useRender.ComponentProps<"div">',
    description: "Centered compact system row for join, leave, archive, and similar system events.",
  },
];
