export { ComboboxSelect } from "./components/combobox-select/index";
export type {
  ComboboxSelectProps,
  ComboboxSelectOption,
  ComboboxSelectGroup,
  ComboboxSelectValue,
  ComboboxSelectSelection,
  ComboboxSelectMessages,
} from "./components/combobox-select/index";

export * from "./components/announcement-dialog/index";

export * from "./components/comment/index";

// Messages an assistant sent for its owner (RFC 077), until stdrc approves
// the parts: the "sent by" label, the face on the owner's avatar, and the
// label in a quoted message.
export {
  MessageItemDelegatedAvatar,
  MessageItemDelegatedBy,
  MessageItemDelegatedByButton,
  MessageItemDelegatedByName,
} from "./components/message-item/index";
export type {
  MessageItemDelegatedAvatarProps,
  MessageItemDelegatedByButtonProps,
  MessageItemDelegatedByNameProps,
  MessageItemDelegatedByProps,
} from "./components/message-item/index";
export { MessageQuotedPreviewAuthorDelegatedBy } from "./components/message-quoted-preview/index";
export type { MessageQuotedPreviewAuthorDelegatedByProps } from "./components/message-quoted-preview/index";

// The floating jump controls of a conversation (Back to Bottom, New Messages,
// Next Unread Thread), until stdrc approves the parts.
export {
  MessageListJumpControls,
  MessageListJumpPill,
  MessageListJumpPillDismiss,
  MessageListJumpPillGroup,
} from "./components/message-list/index";
export type {
  MessageListJumpControlsProps,
  MessageListJumpPillDismissProps,
  MessageListJumpPillGroupProps,
  MessageListJumpPillProps,
} from "./components/message-list/index";

// The touch drag rule (states.md, "Dragging on a touch screen"): hold still
// for a menu, hold and move to drag. It subclasses dnd-kit's TouchSensor
// through fields dnd-kit types as private, so it stays here until that is
// settled.
export { useHoldThenMoveTouchSensor } from "./lib/touch-drag";
export type { HoldThenMoveOptions } from "./lib/touch-drag";

// Text cut with CSS that knows when it was: the tooltip opens and the expand
// control shows only on a text that is actually cut. Until its API settles.
export * from "./components/ellipsis/index";

// The thread badge on an Activity row's leading visual, in the corner a
// presence light takes, on a channel's tile or a direct message's avatar
// alike (inbox-item.md, "The leading image"). Until the part settles.
export { InboxItemLeadingBadge } from "./components/inbox-item/inbox-item-leading-badge";
export type { InboxItemLeadingBadgeProps } from "./components/inbox-item/inbox-item-leading-badge";

// Loading rows for a list of InboxItem or ListRow rows, built from the real
// row parts so they are the loaded row's size (feedback.md, "Empty, loading
// and failed"). Until a product list has moved onto them.
export {
  InboxItemSkeleton,
  InboxItemSkeletonList,
} from "./components/inbox-item/inbox-item-skeleton";
export type {
  InboxItemSkeletonListProps,
  InboxItemSkeletonProps,
} from "./components/inbox-item/inbox-item-skeleton";
export { ListRowSkeleton } from "./components/list-row/list-row-skeleton";
export type { ListRowSkeletonProps } from "./components/list-row/list-row-skeleton";

// How much of an allowance is left, such as a usage limit that resets: full
// to start, draining as it is used, orange when low (meter.md). Until the
// API settles.
export * from "./components/meter/index";

// A menu item that is a link (the docs site's language menu), until it is
// used in a product.
export { DropdownMenuLinkItem } from "./components/dropdown-menu/dropdown-menu";
export type { DropdownMenuLinkItemProps } from "./components/dropdown-menu/dropdown-menu";

// Dialog's phone presentation (dialog.md, "On a phone"): a sheet below 768px
// with a pushed page's head, until Raft Chat has moved its sheets onto them.
export { DialogCommit, DialogSheetBack, DialogSheetContent } from "./components/dialog/index";
export type {
  DialogCommitProps,
  DialogSheetBackProps,
  DialogSheetContentProps,
} from "./components/dialog/index";

// The footer note of a lg or wide dialog (dialog.md, "The footer"), until its
// rules settle in product use.
export { DialogFooterNote } from "./components/dialog/index";
export type { DialogFooterNoteProps } from "./components/dialog/index";

// The modal-overlay stack behind stacked scrims (elevation.md, "Stacked
// overlays"), for an app's own modal to join, until its contract settles.
export { OverlayLayerProvider, useParentOverlayKind } from "./lib/overlay-depth";
export type { OverlayLayerKind, OverlayLayerProviderProps } from "./lib/overlay-depth";

// The last phone tab as the current server (navigation.md, "Servers"): the
// one tab that opens a popover, on a press or a long press, above the tab bar.
// Until slock ships it and stdrc settles the parts.
export {
  MobileNavServerItem,
  MobileNavServerPopover,
  MobileNavServerPopoverContent,
  MobileNavServerPopoverList,
  MobileNavServerPopoverGroup,
  MobileNavServerPopoverRow,
  MobileNavServerPopoverRowBody,
  MobileNavServerPopoverRowDescription,
  MobileNavServerPopoverRowLabel,
  MobileNavServerPopoverDestinations,
  MobileNavServerPopoverDestination,
} from "./components/mobile-nav/index";
export type {
  MobileNavServerItemProps,
  MobileNavServerPopoverContentProps,
  MobileNavServerPopoverListProps,
  MobileNavServerPopoverGroupProps,
  MobileNavServerPopoverRowProps,
  MobileNavServerPopoverRowBodyProps,
  MobileNavServerPopoverRowDescriptionProps,
  MobileNavServerPopoverRowLabelProps,
  MobileNavServerPopoverDestinationsProps,
  MobileNavServerPopoverDestinationProps,
  MobileNavServerPopoverProps,
} from "./components/mobile-nav/index";

// App links in a message (#150), until stdrc approves the parts: the leading
// icon of a reference chip (an app's registered icon), and the item card a
// chip opens on hover.
export { MessageReferenceIcon } from "./components/message-item/index";
export type { MessageReferenceIconProps } from "./components/message-item/index";
export {
  PreviewCardActions,
  PreviewCardBody,
  PreviewCardEyebrow,
  PreviewCardFooter,
  PreviewCardMeta,
} from "./components/preview-card/index";
export type {
  PreviewCardActionsProps,
  PreviewCardBodyProps,
  PreviewCardEyebrowProps,
  PreviewCardFooterProps,
  PreviewCardMetaProps,
} from "./components/preview-card/index";

// A popover that asks something, such as whether to show an app's previews:
// its text and its buttons, inset like a preview card's (popover.md). Until a
// product uses them.
export { PopoverActions, PopoverBody } from "./components/popover/popover";
export type { PopoverActionsProps, PopoverBodyProps } from "./components/popover/popover";
// The read receipt on a mention of an agent: a check after the mention, not
// the square status light, which means presence and task status
// (message-item.md, "Read receipts on a mention"). Until stdrc approves it.
export { MessageReferenceReadMark } from "./components/message-item/index";
export type { MessageReferenceReadMarkProps } from "./components/message-item/index";
