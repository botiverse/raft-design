import type { PropRow } from "#/components/props-table.tsx";

export const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

export const ANATOMY_SOURCE = `<>
  <MessageItem>
    <MessageItemAvatarSlot>
      <Avatar />
    </MessageItemAvatarSlot>
    <MessageItemContent>
      <MessageItemHeader>
        <MessageItemSender />
        <MessageItemSenderBadges />
        <MessageItemMeta />
        <MessageItemTime />
        <MessageItemInlineStatus />
      </MessageItemHeader>
      <MessageItemBody />
      <MessageItemAttachments />
      <MessageItemEmbedded />
      <MessageItemFooter />
    </MessageItemContent>
    <MessageItemToolbar>
      <MessageItemToolbarButton />
    </MessageItemToolbar>
  </MessageItem>

  <MessageItem compact>
    <MessageItemGutter>
      <MessageItemContinuationTime />
    </MessageItemGutter>
    <MessageItemContent>
      <MessageItemBody />
    </MessageItemContent>
    <MessageItemToolbar>
      <MessageItemToolbarButton />
    </MessageItemToolbar>
  </MessageItem>
</>`;

export const ROW_PROPS: readonly PropRow[] = [
  {
    name: "MessageItem",
    type: 'useRender.ComponentProps<"div"> & { compact?: boolean }',
    description: "Stable message-row root. Keep the same root while composing transient UI parts.",
  },
  {
    name: "MessageItemSearchMatch",
    type: 'useRender.ComponentProps<"mark">',
    description:
      "Inline matched-text part. Rendering it also applies the reusable search-result surface to its containing MessageItem.",
  },
  {
    name: "MessageItemAvatarSlot",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Avatar gutter slot. Consumers own avatar interaction behavior and feedback. Keep this slot in select mode beside MessageMultiSelectCheckbox.",
  },
  {
    name: "MessageItemGutter",
    type: 'useRender.ComponentProps<"div">',
    description: "Compact consecutive-row gutter used when compact hides sender chrome.",
  },
  {
    name: "MessageItemContinuationTime",
    type: 'useRender.ComponentProps<"span">',
    description: "Hover timestamp rendered inside MessageItemGutter for a compact row.",
  },
  {
    name: "MessageItemContent",
    type: 'useRender.ComponentProps<"div">',
    description: "Main row column.",
  },
  {
    name: "MessageItemHeader",
    type: 'useRender.ComponentProps<"div">',
    description: "Header layout for sender and row metadata.",
  },
  {
    name: "MessageItemSender",
    type: 'useRender.ComponentProps<"span">',
    description: "Static sender name.",
  },
  {
    name: "MessageItemSenderButton",
    type: 'useRender.ComponentProps<"button">',
    description: "Interactive sender action with the sender-name visual treatment.",
  },
  {
    name: "MessageItemSenderBadges",
    type: 'useRender.ComponentProps<"span">',
    description: "Inline container for caller-owned Badge elements next to the sender.",
  },
  {
    name: "MessageItemMeta",
    type: 'useRender.ComponentProps<"span">',
    description: "Caller-owned header metadata, such as a role or agent type.",
  },
  {
    name: "MessageItemTime",
    type: 'useRender.ComponentProps<"span">',
    description: "Timestamp in the message header.",
  },
  {
    name: "MessageItemInlineStatus",
    type: 'useRender.ComponentProps<"span">',
    description: "Caller-owned transient header state, such as Converting.",
  },
];

export const CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "MessageItemBody",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Message content slot. Markdown, mentions, links, and product parsing stay caller-owned.",
  },
  {
    name: "MessageItemAttachments",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Dedicated message region for media and files. Its content and workflow stay caller-owned.",
  },
  {
    name: "MessageItemEmbedded",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Dedicated message region for embedded cards. Its content and workflow stay caller-owned.",
  },
  {
    name: "MessageItemFooter",
    type: 'useRender.ComponentProps<"div">',
    description: "Footer layout for receipts, task badges, and reactions.",
  },
];

export const REFERENCE_PROPS: readonly PropRow[] = [
  {
    name: "MessageReferenceText",
    type: 'useRender.ComponentProps<"span">',
    description: "Inline reference text. Source parsing and navigation stay product-owned.",
  },
  {
    name: "MessageReferenceChip",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Chip-shaped inline reference surface. Resolution and navigation stay product-owned.",
  },
  {
    name: "MessageReferencePending",
    type: 'useRender.ComponentProps<"span">',
    description: "Inline reference surface while resolution is pending.",
  },
  {
    name: "MessageReferenceUnavailable",
    type: 'useRender.ComponentProps<"span">',
    description: "Inline reference surface when the target is unavailable.",
  },
  {
    name: "MessageReferenceBadge",
    type: 'useRender.ComponentProps<"span">',
    description: "Badge-shaped inline reference surface.",
  },
  {
    name: "MessageReferenceLabel",
    type: 'useRender.ComponentProps<"span">',
    description: "Optional label slot for a chip-style reference.",
  },
  {
    name: "MessageReferenceIndicator",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Optional child slot for caller-owned read-state or other reference-local status content.",
  },
];

export const ACTION_PROPS: readonly PropRow[] = [
  {
    name: "MessageItemToolbar",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Action toolbar revealed on row hover or when keyboard focus enters it via focus-within.",
  },
  {
    name: "MessageItemToolbarButton",
    type: 'useRender.ComponentProps<"button">',
    description:
      "Toolbar action button. Popup triggers receive Base UI state attributes through render composition.",
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
    name: "MessageItemBadge",
    type: 'useRender.ComponentProps<"span"> & { status?: "read" | "unread" }',
    description:
      "Footer badge with read and unread treatments. Labels and icons stay caller-owned.",
  },
  {
    name: "MessageItemBadgeSeparator",
    type: 'useRender.ComponentProps<"span">',
    description: "Decorative separator for adjacent footer badges.",
  },
];

export const REACTION_PROPS: readonly PropRow[] = [
  {
    name: "MessageReactionChip",
    type: 'Omit<StyledProps<Toggle.Props>, "type">',
    description:
      "Base UI toggle for adding or removing the caller-owned reaction. Supports controlled and uncontrolled pressed state.",
  },
  {
    name: "MessageReactionErrorIndicator",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Screen-reader status and stable styling slot for caller-owned reaction failure copy.",
  },
  {
    name: "MessageReactionGlyph",
    type: 'useRender.ComponentProps<"span">',
    description: "Reaction glyph slot for a native emoji or caller-provided icon.",
  },
  {
    name: "MessageReactionCount",
    type: 'useRender.ComponentProps<"span">',
    description: "Numeric reaction-count slot.",
  },
  {
    name: "MessageReactionAddButton",
    type: 'useRender.ComponentProps<"button">',
    description: "Add-reaction affordance. Selection state and mutation stay caller-owned.",
  },
  {
    name: "MessageReactionQuickRow",
    type: 'useRender.ComponentProps<"div">',
    description: "Inline layout for quick-reaction controls.",
  },
  {
    name: "MessageReactionQuickButton",
    type: 'useRender.ComponentProps<"button">',
    description: "Quick-reaction control. Selection state and mutation stay caller-owned.",
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
    name: "MessageReactionTooltipContent",
    type: "TooltipContentProps",
    description: "Base UI tooltip content for reactors.",
  },
  {
    name: "MessageReactionTooltipNames",
    type: 'useRender.ComponentProps<"span">',
    description: "Container for reactor names in the tooltip.",
  },
  {
    name: "MessageReactionTooltipName",
    type: 'useRender.ComponentProps<"span">',
    description: "Single reactor-name slot in the tooltip.",
  },
  {
    name: "MessageReactionTooltipNameText",
    type: 'useRender.ComponentProps<"span">',
    description: "Text slot inside a reactor name.",
  },
  {
    name: "MessageReactionTooltipSeparator",
    type: 'useRender.ComponentProps<"span">',
    description: "Decorative separator between tooltip names.",
  },
  {
    name: "MessageReactionTooltipMeta",
    type: 'useRender.ComponentProps<"span">',
    description: "Tooltip meta slot for overflow information such as +N.",
  },
];

export const SELECTION_PROPS: readonly PropRow[] = [
  {
    name: "MessageMultiSelect",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Stateless multi-select structure root. Consumers own selection mode, selected IDs, and selection actions.",
  },
  {
    name: "MessageMultiSelectToolbar",
    type: "div props",
    description:
      "Shared select-mode toolbar shell. Pass the selected count and consumer-owned Button or DropdownMenu actions as children.",
  },
  {
    name: "MessageMultiSelectCheckbox",
    type: "CheckboxProps",
    description:
      "Styled per-row selector with native Checkbox props. Control it with checked and onCheckedChange.",
  },
  {
    name: "MessageTextSelectionToolbar",
    type: "Toolbar.Root props",
    description:
      "Selection-toolbar surface with Base UI keyboard navigation. Consumers own the Popover, range anchor, and visibility.",
  },
  {
    name: "MessageTextSelectionToolbarButton",
    type: "Toolbar.Button props",
    description:
      "Selection command button with toolbar focus behavior. Its command remains caller-owned.",
  },
  {
    name: "MessageTextSelectionToolbarSeparator",
    type: "Toolbar.Separator props",
    description: "Semantic separator between selection toolbar commands.",
  },
];

export const PROPS = [
  ...ROW_PROPS,
  ...CONTENT_PROPS,
  ...REFERENCE_PROPS,
  ...ACTION_PROPS,
  ...FOOTER_PROPS,
  ...REACTION_PROPS,
  ...SELECTION_PROPS,
] as const satisfies readonly PropRow[];

export const API_GROUPS = [
  { id: "api-row-structure", title: "Row structure", rows: ROW_PROPS },
  { id: "api-content", title: "Content regions", rows: CONTENT_PROPS },
  {
    id: "api-references",
    title: "References",
    rows: REFERENCE_PROPS,
  },
  { id: "api-actions", title: "Row actions", rows: ACTION_PROPS },
  { id: "api-footer", title: "Footer", rows: FOOTER_PROPS },
  { id: "api-reactions", title: "Reactions", rows: REACTION_PROPS },
  { id: "api-selection", title: "Selection", rows: SELECTION_PROPS },
] as const satisfies readonly { id: string; title: string; rows: readonly PropRow[] }[];
