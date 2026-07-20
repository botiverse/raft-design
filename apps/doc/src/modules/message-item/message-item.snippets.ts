import type { PropRow } from "#/components/props-table.tsx";

export const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

export const ANATOMY_SOURCE = `<MessageItem>
  <MessageItemAvatarSlot />
  <MessageItemContent>
    <MessageItemHeader>
      <MessageItemSender />
      <MessageItemMeta />
      <MessageItemTime />
    </MessageItemHeader>
    <MessageItemBody />
    <MessageAttachmentGroup>...</MessageAttachmentGroup>
    <MessageItemFooter />
  </MessageItemContent>
  <MessageItemToolbar />
</MessageItem>`;

export const PROPS: readonly PropRow[] = [
  {
    name: "MessageItem",
    type: 'useRender.ComponentProps<"div"> & { compact?: boolean }',
    description:
      "Root row. Compose MessageItemActive, MessageItemSearchMatch, or MessageItemSelection for explicit row chrome.",
  },
  {
    name: "MessageItemHeader",
    type: 'useRender.ComponentProps<"div">',
    description: "Sender, sender state, metadata, timestamp, and inline delivery state row.",
  },
  {
    name: "MessageMultiSelect / MessageMultiSelectCheckbox",
    type: "controlled or uncontrolled selection root + Checkbox props with a required value",
    description:
      "Multi-message selection behavior and semantic checkbox. The root owns active and selected state.",
  },
  {
    name: "MessageItemSenderState",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Source-faithful sender badge. Consumers provide labels such as Deleted, Left, or Removed.",
  },
  {
    name: "MessageItemInlineStatus",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Caller-owned transient header status, such as the source Converting state. It does not own an async workflow.",
  },
  {
    name: "MessageItemBody",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Message content slot. Markdown, mentions, links, and translation output are caller-owned.",
  },
  {
    name: "MessageItemTranslationPlaceholder",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Source-faithful pending translation placeholder. Translation eligibility stays caller-owned.",
  },
  {
    name: "MessageItemTranslationOriginal / MessageItemTranslationOriginalLabel",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Bilingual original-content container and label. Consumers choose when the original is visible.",
  },
  {
    name: "MessageItemTranslationStatus / MessageItemTranslationAction",
    type: 'useRender.ComponentProps<"div"> / useRender.ComponentProps<"button">',
    description: "Translation status and caller-wired original/translation toggle or retry action.",
  },
  {
    name: "MessageReferenceSelfMention / MessageReferenceChannel / MessageReferenceTask / MessageReferenceThread",
    type: 'useRender.ComponentProps<"a">',
    description:
      "Resolved inline reference treatments. Consumers own entity lookup and navigation, while the primitives preserve the source chip treatment.",
  },
  {
    name: "MessageReferenceChannelUnavailable / MessageReferenceTaskUnavailable / MessageReferenceThreadUnavailable",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Non-interactive unavailable reference treatments. Consumers choose the resolved label and when a referenced entity is unavailable.",
  },
  {
    name: "MessageReferenceComment",
    type: 'useRender.ComponentProps<"a">',
    description:
      "Attachment-comment reference chip. Consumers provide the label, optional quoted context, and jump behavior.",
  },
  {
    name: "MessageForwardedBundle",
    type: "compound slots",
    description:
      "Source-faithful forwarded-message structure. Provenance, permissions, and source navigation remain caller-owned.",
  },
  {
    name: "MessageQuotedPreview",
    type: "compound slots",
    description:
      "Quoted message preview with loaded, loading, and unavailable shells. Fetching and permalink resolution remain caller-owned.",
  },
  {
    name: "MessageActionCard",
    type: "compound slots",
    description:
      "Action-card structure for caller-provided action metadata, callbacks, and completion content.",
  },
  {
    name: "MessageItemToolbar",
    type: 'useRender.ComponentProps<"div"> & { visible?: boolean }',
    description:
      "Action toolbar revealed on row hover or when keyboard focus enters it via focus-within.",
  },
  {
    name: "MessageItemToolbarButton",
    type: 'useRender.ComponentProps<"button">',
    description: "Toolbar action button. Use native aria-pressed for toggled actions.",
  },
  {
    name: "MessageItemSaveButton",
    type: 'useRender.ComponentProps<"button">',
    description: "Semantic saved action with the source accent treatment when pressed.",
  },
  {
    name: "MessageItemSavedIndicator",
    type: 'useRender.ComponentProps<"span">',
    description: "Pinned saved marker shown on the row until the hover toolbar takes over.",
  },
  {
    name: "MessageItemBadge",
    type: 'useRender.ComponentProps<"span"> & { status?: "read" | "unread" }',
    description:
      "Footer badge slot with read and unread treatments. Business labels and icons remain caller-owned.",
  },
  {
    name: "MessageImageGallery",
    type: "compound slots",
    description:
      "Image grid, overlay-driven pending treatment, and media fit slots for source image attachment variants.",
  },
  {
    name: "MessageImageGalleryItem",
    type: 'useRender.ComponentProps<"div"> & { single?: boolean }',
    description:
      "Image item shell. Rendering MessageImageGalleryOverlay derives pending dimming; single controls layout only.",
  },
  {
    name: "MessageImageGalleryMedia",
    type: 'useRender.ComponentProps<"img"> & { fit?: "contain" | "cover" }',
    description: "Image media fit mode used by preview thumbnails and contain-style attachments.",
  },
  {
    name: "MessageAttachmentCard",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Attachment card shell. Loading, pending, error, and action visuals are caller-composed parts.",
  },
  {
    name: "MessageAttachmentGroup",
    type: 'useRender.ComponentProps<"div">',
    description: "Reusable wrapping layout for one or more attachment cards.",
  },
  {
    name: "MessageVideoPreview",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Inline video preview shell. Consumers compose media, fallback, action, and pending content as children.",
  },
  {
    name: "MessageVideoPreviewFallback",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Non-interactive fallback surface. Compose MessageVideoPreviewAction for real controls.",
  },
  {
    name: "MessageReactionChip",
    type: 'useRender.ComponentProps<"button">',
    description:
      "Reaction chip styled through native aria-pressed. Mutation failure is composed as an explicit indicator child.",
  },
  {
    name: "MessageReactionErrorIndicator",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Screen-reader status and stable styling slot for caller-owned reaction failure copy.",
  },
  {
    name: "MessageReactionGlyph",
    type: 'useRender.ComponentProps<"span"> & { emoji?: string; size?: number }',
    description: "Native emoji or caller-provided icon slot for reaction affordances.",
  },
  {
    name: "MessageReactionQuickRow",
    type: "compound slots",
    description: "Quick reaction row, picker, and reactors list. Open state stays caller-owned.",
  },
  {
    name: "MessageReactionPickerContent",
    type: "DropdownMenuContentProps",
    description: "Base UI dropdown content for an interactive quick reaction overlay.",
  },
  {
    name: "MessageReactionTooltip",
    type: "Tooltip compound parts",
    description:
      "Reactors tooltip with Base UI trigger, positioning, names, and +N overflow anatomy.",
  },
  {
    name: "SystemMessageItem / SystemMessageGroupDisclosure",
    type: 'useRender.ComponentProps<"div"> / useRender.ComponentProps<"button">',
    description:
      "Centered system row and caller-controlled summary disclosure for archive, reminder, join/leave, and grouped system events.",
  },
];

export const API_GROUPS = [
  { id: "api-row-structure", title: "Row structure", rows: PROPS.slice(0, 5) },
  {
    id: "api-content-product-states-footer",
    title: "Content, product states, and footer",
    rows: PROPS.slice(5, 18),
  },
  { id: "api-attachments", title: "Attachments", rows: PROPS.slice(18, 25) },
  { id: "api-reactions", title: "Reactions", rows: PROPS.slice(25, 31) },
  { id: "api-system-events", title: "System events", rows: PROPS.slice(31) },
] as const satisfies readonly { id: string; title: string; rows: readonly PropRow[] }[];
