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
    <MessageItemThreadRepliesPreview>
      <MessageItemThreadRepliesPreview.Trigger>
        <MessageItemThreadRepliesPreview.Summary />
        <MessageItemThreadRepliesPreview.Reply>
          <MessageItemThreadRepliesPreview.Time />
        </MessageItemThreadRepliesPreview.Reply>
      </MessageItemThreadRepliesPreview.Trigger>
    </MessageItemThreadRepliesPreview>
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

export const ROW_PROPS: readonly PropRow[] = [
  {
    name: "MessageItem",
    type: 'useRender.ComponentProps<"div"> & { compact?: boolean }',
    description:
      "Default message-row root. Use one of the explicit state roots instead when the row is active, a search match, or in selection mode.",
  },
  {
    name: "MessageItemActive / MessageItemSearchMatch / MessageItemSelection",
    type: "MessageItemProps",
    description:
      "Mutually exclusive root variants for active, search-match, and multi-select chrome. They are alternatives to MessageItem, not wrappers around it.",
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
    name: "MessageItemContent / MessageItemInteractionBoundary",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Main row column and an optional boundary that prevents nested controls from triggering row-level interactions.",
  },
  {
    name: "MessageItemHeader / MessageItemSender / MessageItemSenderState",
    type: "div and span props; Sender adds interactive?: boolean",
    description:
      "Header structure, sender name, and source-faithful Deleted / Left / Removed badge. interactive only adds sender affordance styling.",
  },
  {
    name: "MessageItemMeta / MessageItemTime / MessageItemInlineStatus",
    type: 'useRender.ComponentProps<"span">',
    description: "Header metadata, timestamp, and caller-owned transient state such as Converting.",
  },
];

export const CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "MessageItemBody",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Message content slot. Markdown, mentions, links, translation output, and product parsing stay caller-owned.",
  },
  {
    name: "MessageItemAttachments / MessageItemEmbedded / MessageItemNotice",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Dedicated row regions for media/files, embedded cards, and notices. Their content and workflows stay caller-owned.",
  },
  {
    name: "MessageItemFooter",
    type: 'useRender.ComponentProps<"div">',
    description: "Footer layout for receipts, task badges, thread summaries, and reactions.",
  },
];

export const TRANSLATION_REFERENCE_PROPS: readonly PropRow[] = [
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
    name: "MessageReferenceText / Chip / Pending / Unavailable",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Explicit inline text, chip, and resolution-state surfaces. Source parsing and resolution are product-owned; consumers own navigation and integration.",
  },
  {
    name: "MessageReferenceLabel / MessageReferenceMeta",
    type: 'useRender.ComponentProps<"span">',
    description: "Optional label and meta slots for chip-style references (e.g. permalink).",
  },
];

export const ACTION_PROPS: readonly PropRow[] = [
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
];

export const FOOTER_PROPS: readonly PropRow[] = [
  {
    name: "MessageItemReadReceipt",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Footer read-receipt chip. Consumers provide the icon and label; visibility stays product-owned.",
  },
  {
    name: "MessageItemBadge / MessageItemBadgeSeparator",
    type: 'useRender.ComponentProps<"span"> & { status?: "read" | "unread" }',
    description:
      "Footer badge slot with read and unread treatments. Business labels and icons remain caller-owned.",
  },
  {
    name: "MessageItemThreadRepliesPreview",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Thread-preview surface placed after the message footer. It owns the stable preview layout; thread data, display cap, copy, and navigation remain consumer-owned.",
  },
  {
    name: "MessageItemThreadRepliesPreview.Trigger / Summary",
    type: "button props and span props",
    description:
      "One full-width thread opener and its count summary. Render Trigger as the consumer's link or button so the whole muted surface is one interactive target.",
  },
  {
    name: "MessageItemThreadRepliesPreview.Reply / Avatar / Sender / Preview / Time",
    type: "span and time props",
    description:
      "Compact latest-reply row parts. Time is a semantic non-shrinking tabular <time> aligned to the right; rows are display-only children of the single Trigger.",
  },
  {
    name: "MessageItemInlineReplies* / MessageItemInlineReply*",
    type: "legacy props",
    description:
      "Backward-compatible granular exports. New compositions should use MessageItemThreadRepliesPreview instead.",
  },
];

export const REACTION_PROPS: readonly PropRow[] = [
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
    name: "MessageReactionGlyph / MessageReactionCount",
    type: 'useRender.ComponentProps<"span"> & { emoji?: string; size?: number }',
    description: "Native emoji or caller-provided icon plus the numeric reaction-count slot.",
  },
  {
    name: "MessageReactionAddButton / MessageReactionQuickRow / MessageReactionQuickButton",
    type: "button, div, and button props",
    description:
      "Add-reaction affordance and inline quick-reaction controls. Selection state and mutation stay caller-owned.",
  },
  {
    name: "MessageReactionPickerStatic",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Inline picker layout for docs, fallback, or other non-portal surfaces. Its child buttons may still be caller-wired.",
  },
  {
    name: "MessageReactionPickerContent",
    type: "DropdownMenuContentProps",
    description: "Base UI dropdown content for an interactive quick reaction overlay.",
  },
  {
    name: "MessageReactionTooltipContent / Names / Name / NameText / Separator / Meta",
    type: "Tooltip compound parts",
    description:
      "Reactors tooltip with Base UI trigger, positioning, names, and +N overflow anatomy.",
  },
];

export const SELECTION_PROPS: readonly PropRow[] = [
  {
    name: "MessageMultiSelect / useMessageMultiSelect",
    type: "controlled or uncontrolled selection provider and context API",
    description:
      "Owns selection-mode activity and selected IDs. The hook exposes active, selected, enter, toggle, and cancel.",
  },
  {
    name: "MessageMultiSelectCheckbox",
    type: "Checkbox props with required value: string",
    description:
      "Semantic per-row selector. Compose before MessageItemAvatarSlot inside MessageItemSelection.",
  },
  {
    name: "MessageMultiSelectToolbar / ToolbarContent / Count / Actions / Action",
    type: "compound div, span, and button props",
    description:
      "Selection summary and caller-owned bulk actions. Action supports default/accent tone and default/icon size.",
  },
  {
    name: "MessageTextSelection / useMessageTextSelection",
    type: "div props with optional portal container and selection API",
    description:
      "Scopes browser text selection to a message region. The hook exposes selected text and clear().",
  },
  {
    name: "MessageTextSelectionMenu / MenuItem / MenuSeparator",
    type: "Popover content, button, and separator props",
    description:
      "Keyboard-accessible selection menu positioned over the selected range. Commands remain caller-owned.",
  },
];

export const PROPS = [
  ...ROW_PROPS,
  ...CONTENT_PROPS,
  ...TRANSLATION_REFERENCE_PROPS,
  ...ACTION_PROPS,
  ...FOOTER_PROPS,
  ...REACTION_PROPS,
  ...SELECTION_PROPS,
] as const satisfies readonly PropRow[];

export const API_GROUPS = [
  { id: "api-row-structure", title: "Row structure", rows: ROW_PROPS },
  { id: "api-content", title: "Content regions", rows: CONTENT_PROPS },
  {
    id: "api-translation-references",
    title: "Translation and references",
    rows: TRANSLATION_REFERENCE_PROPS,
  },
  { id: "api-actions", title: "Row actions", rows: ACTION_PROPS },
  { id: "api-footer", title: "Footer and thread preview", rows: FOOTER_PROPS },
  { id: "api-reactions", title: "Reactions", rows: REACTION_PROPS },
  { id: "api-selection", title: "Selection", rows: SELECTION_PROPS },
] as const satisfies readonly { id: string; title: string; rows: readonly PropRow[] }[];
