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
      <MessageItemSenderState />
      <MessageItemMeta />
      <MessageItemTime />
      <MessageItemInlineStatus />
    </MessageItemHeader>
    <MessageItemBody />
    <MessageItemAttachments>...</MessageItemAttachments>
    <MessageItemFooter />
  </MessageItemContent>
  <MessageItemToolbar />
</MessageItem>

<MessageItem compact>
  <MessageItemGutter>
    <MessageItemContinuationTime />
  </MessageItemGutter>
  <MessageItemContent>
    <MessageItemBody />
  </MessageItemContent>
</MessageItem>

<MessageMultiSelect>
  <MessageItemSelection>
    <MessageMultiSelectCheckbox value="id" />
    <MessageItemAvatarSlot />
    <MessageItemContent>...</MessageItemContent>
  </MessageItemSelection>
</MessageMultiSelect>`;

export const PROPS: readonly PropRow[] = [
  {
    name: "MessageItem",
    type: 'useRender.ComponentProps<"div"> & { compact?: boolean }',
    description:
      "Root row. Compose MessageItemActive, MessageItemSearchMatch, or MessageItemSelection for explicit row chrome.",
  },
  {
    name: "MessageItemAvatarSlot",
    type: 'useRender.ComponentProps<"div"> & { pressed?: boolean }',
    description:
      "Avatar gutter slot. Optional pressed enables the source long-press scale and brightness treatment via data-avatar-pressed. Keep this slot in select mode beside MessageMultiSelectCheckbox.",
  },
  {
    name: "MessageItemGutter / MessageItemContinuationTime",
    type: 'useRender.ComponentProps<"div"> / useRender.ComponentProps<"span">',
    description:
      "Compact consecutive-row gutter and hover timestamp. Used when compact hides sender chrome.",
  },
  {
    name: "MessageItemHeader",
    type: 'useRender.ComponentProps<"div">',
    description: "Sender, sender state, metadata, timestamp, and inline delivery state row.",
  },
  {
    name: "MessageItemSender",
    type: 'useRender.ComponentProps<"span"> & { interactive?: boolean }',
    description:
      "Sender name. interactive adds pointer cursor and underline hover for mention-style clicks without changing the default span.",
  },
  {
    name: "MessageMultiSelect / MessageMultiSelectCheckbox",
    type: "controlled or uncontrolled selection root + Checkbox props with a required value",
    description:
      "Multi-message selection behavior and semantic checkbox. Compose checkbox before MessageItemAvatarSlot inside MessageItemSelection; the root owns active and selected state.",
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
    name: "MessageReference",
    type: 'useRender.ComponentProps<"span"> & Omit<MessageReferenceVariantProps, "theme">',
    description:
      "Inline message reference (default span). Variants: plain, accent, highlight, muted, info, subtle, panel, external, pending, unavailable. Use render={<a href=… />} for links. Label/Meta compose inside chip variants.",
  },
  {
    name: "MessageReferenceLabel / MessageReferenceMeta",
    type: 'useRender.ComponentProps<"span">',
    description: "Optional label and meta slots for chip-style references (e.g. permalink).",
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
    name: "MessageItemReadReceipt",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Footer read-receipt chip. Consumers provide the icon and label; visibility stays product-owned.",
  },
  {
    name: "MessageItemBadge",
    type: 'useRender.ComponentProps<"span"> & { status?: "read" | "unread" }',
    description:
      "Footer badge slot with read and unread treatments. Business labels and icons remain caller-owned.",
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
];

export const API_GROUPS = [
  { id: "api-row-structure", title: "Row structure", rows: PROPS.slice(0, 7) },
  {
    id: "api-content-references-footer",
    title: "Content, references, and footer",
    rows: PROPS.slice(7, 20),
  },
  { id: "api-reactions", title: "Reactions", rows: PROPS.slice(20) },
] as const satisfies readonly { id: string; title: string; rows: readonly PropRow[] }[];
