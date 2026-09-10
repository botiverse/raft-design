import type { PropRow } from "#/components/props-table.tsx";

export const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

export const ANATOMY_SOURCE = `import {
  Avatar,
  MessageItem,
  MessageItemAttachments,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemContinuationTime,
  MessageItemEmbedded,
  MessageItemFooter,
  MessageItemGutter,
  MessageItemHeader,
  MessageItemInlineStatus,
  MessageItemMeta,
  MessageItemSender,
  MessageItemSenderBadges,
  MessageItemTime,
  MessageItemToolbar,
  MessageItemToolbarButton,
} from "raft-ui";

<>
  <MessageItem>
    <MessageItemAvatarSlot>
      <Avatar size="md" type="human" />
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

export const MESSAGE_ITEM_PROPS: readonly PropRow[] = [
  {
    name: "compact",
    type: "boolean",
    description: "Compact row layout that hides sender chrome and tightens the vertical rhythm.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Stable message-row root. Keep the same root while composing transient UI parts.",
  },
];

export const MESSAGE_ITEM_SEARCH_MATCH_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"mark">',
    description:
      "Inline matched-text part. Rendering it also applies the reusable search-result surface to its containing MessageItem.",
  },
];

export const MESSAGE_ITEM_AVATAR_SLOT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Avatar gutter slot. Consumers own avatar interaction behavior and feedback. Keep this slot in select mode beside MessageMultiSelectCheckbox.",
  },
];

export const MESSAGE_ITEM_GUTTER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Compact consecutive-row gutter used when compact hides sender chrome.",
  },
];

export const MESSAGE_ITEM_CONTINUATION_TIME_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Hover timestamp rendered inside MessageItemGutter for a compact row.",
  },
];

export const MESSAGE_ITEM_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Main row column.",
  },
];

export const MESSAGE_ITEM_HEADER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Header layout for sender and row metadata.",
  },
];

export const MESSAGE_ITEM_SENDER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Static sender name.",
  },
];

export const MESSAGE_ITEM_SENDER_BUTTON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"button">',
    description: "Interactive sender action with the sender-name visual treatment.",
  },
];

export const MESSAGE_ITEM_SENDER_BADGES_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Inline container for caller-owned Badge elements next to the sender.",
  },
];

export const MESSAGE_ITEM_META_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Caller-owned header metadata, such as a role or agent type.",
  },
];

export const MESSAGE_ITEM_TIME_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Timestamp in the message header.",
  },
];

export const MESSAGE_ITEM_INLINE_STATUS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Caller-owned transient header state, such as Converting.",
  },
];

export const MESSAGE_ITEM_BODY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Message content slot. Markdown, mentions, links, and product parsing stay caller-owned.",
  },
];

export const MESSAGE_ITEM_ATTACHMENTS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Dedicated message region for media and files. Its content and workflow stay caller-owned.",
  },
];

export const MESSAGE_ITEM_EMBEDDED_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Dedicated message region for embedded cards. Its content and workflow stay caller-owned.",
  },
];

export const MESSAGE_ITEM_FOOTER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Footer layout for receipts, task badges, and reactions.",
  },
];

export const MESSAGE_ITEM_TOOLBAR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Action toolbar revealed on row hover or when keyboard focus enters it via focus-within.",
  },
];

export const MESSAGE_ITEM_TOOLBAR_BUTTON_PROPS: readonly PropRow[] = [
  {
    name: "active",
    type: "boolean",
    description: "Drives data-active styling on the toolbar button.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"button">',
    description:
      "Toolbar action button. active drives data-active styling; popup triggers receive Base UI state attributes through render composition.",
  },
];

export const MESSAGE_ITEM_SAVED_INDICATOR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Pinned saved marker shown on the row until the hover toolbar takes over.",
  },
];

export const MESSAGE_ITEM_READ_RECEIPT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Footer read-receipt chip. Consumers provide the icon and label; visibility stays product-owned.",
  },
];

export const MESSAGE_ITEM_BADGE_PROPS: readonly PropRow[] = [
  {
    name: "status",
    type: '"read" | "unread"',
    description: "Read or unread footer badge treatment.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Footer badge with read and unread treatments. Labels and icons stay caller-owned.",
  },
];

export const MESSAGE_ITEM_BADGE_SEPARATOR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Decorative separator for adjacent footer badges.",
  },
];

export const MESSAGE_REFERENCE_TEXT_PROPS: readonly PropRow[] = [
  {
    name: "variant",
    type: '"primary" | "secondary"',
    description: "Visual treatment for inline reference text.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Inline reference text. Source parsing and navigation stay product-owned.",
  },
];

export const MESSAGE_REFERENCE_CHIP_PROPS: readonly PropRow[] = [
  {
    name: "variant",
    type: '"accent" | "muted" | "info" | "link"',
    description: "Visual treatment for the chip-shaped reference surface.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Chip-shaped inline reference surface. Resolution and navigation stay product-owned.",
  },
];

export const MESSAGE_REFERENCE_PENDING_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Inline reference surface while resolution is pending.",
  },
];

export const MESSAGE_REFERENCE_UNAVAILABLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Inline reference surface when the target is unavailable.",
  },
];

export const MESSAGE_REFERENCE_BADGE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Badge-shaped inline reference surface.",
  },
];

export const MESSAGE_REFERENCE_LABEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Optional label slot for a chip-style reference.",
  },
];

export const MESSAGE_REFERENCE_INDICATOR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Optional child slot for caller-owned read-state or other reference-local status content.",
  },
];

export const MESSAGE_REACTION_CHIP_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'Omit<StyledProps<Toggle.Props>, "type">',
    description:
      "Base UI toggle for adding or removing the caller-owned reaction. Supports controlled and uncontrolled pressed state.",
  },
];

export const MESSAGE_REACTION_ERROR_INDICATOR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Screen-reader status and stable styling slot for caller-owned reaction failure copy.",
  },
];

export const MESSAGE_REACTION_GLYPH_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Reaction glyph slot for a native emoji or caller-provided icon.",
  },
];

export const MESSAGE_REACTION_COUNT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Numeric children bump for 180ms when their value changes, never on mount. Respects reduced motion. Non-numeric children remain static; native props, refs, and render substitution are preserved.",
  },
];

export const MESSAGE_REACTION_ADD_BUTTON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"button">',
    description: "Add-reaction affordance. Selection state and mutation stay caller-owned.",
  },
];

export const MESSAGE_REACTION_QUICK_ROW_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Inline layout for quick-reaction controls.",
  },
];

export const MESSAGE_REACTION_QUICK_BUTTON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"button">',
    description: "Quick-reaction control. Selection state and mutation stay caller-owned.",
  },
];

export const MESSAGE_REACTION_PICKER_STATIC_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Inline picker layout for docs, fallback, or other non-portal surfaces. Its child buttons may still be caller-wired.",
  },
];

export const MESSAGE_REACTION_PICKER_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "DropdownMenuContentProps",
    description: "Base UI dropdown content for an interactive quick reaction overlay.",
  },
];

export const MESSAGE_REACTION_TOOLTIP_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "TooltipContentProps",
    description: "Base UI tooltip content for reactors.",
  },
];

export const MESSAGE_REACTION_TOOLTIP_NAMES_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Container for reactor names in the tooltip.",
  },
];

export const MESSAGE_REACTION_TOOLTIP_NAME_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Single reactor-name slot in the tooltip.",
  },
];

export const MESSAGE_REACTION_TOOLTIP_NAME_TEXT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Text slot inside a reactor name.",
  },
];

export const MESSAGE_REACTION_TOOLTIP_SEPARATOR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Decorative separator between tooltip names.",
  },
];

export const MESSAGE_REACTION_TOOLTIP_META_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Tooltip meta slot for overflow information such as +N.",
  },
];

export const MESSAGE_MULTI_SELECT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Stateless multi-select structure root. Consumers own selection mode, selected IDs, and selection actions.",
  },
];

export const MESSAGE_MULTI_SELECT_TOOLBAR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Shared select-mode toolbar shell. Pass the selected count and consumer-owned Button or DropdownMenu actions as children.",
  },
];

export const MESSAGE_MULTI_SELECT_CHECKBOX_PROPS: readonly PropRow[] = [
  {
    name: "checked",
    type: "boolean",
    description: "Controlled checked state for the per-row selector.",
  },
  {
    name: "onCheckedChange",
    type: "CheckboxProps['onCheckedChange']",
    description: "Callback fired when the per-row selector is toggled.",
  },
  {
    name: "...props",
    type: "CheckboxProps",
    description:
      "Styled per-row selector with native Checkbox props. Control it with checked and onCheckedChange.",
  },
];

export const MESSAGE_TEXT_SELECTION_TOOLBAR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Toolbar.Root props",
    description:
      "Selection-toolbar surface with Base UI keyboard navigation. Consumers own the Popover, range anchor, and visibility.",
  },
];

export const MESSAGE_TEXT_SELECTION_TOOLBAR_BUTTON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Toolbar.Button props",
    description:
      "Selection command button with toolbar focus behavior. Its command remains caller-owned.",
  },
];

export const MESSAGE_TEXT_SELECTION_TOOLBAR_SEPARATOR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Toolbar.Separator props",
    description: "Semantic separator between selection toolbar commands.",
  },
];
