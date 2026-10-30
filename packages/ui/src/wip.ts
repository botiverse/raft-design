// Every entry installs the drag Escape guard on load, before any app code
// runs, so it precedes the app's own capture-phase Escape listeners even when
// the drag parts load later (lazily). Listed in package.json "sideEffects".
import "./lib/drag-escape";

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

// ModeBar is stable (stdrc, 2026-10-29) and exported from the package root;
// this re-export stays until apps import it from there.
export * from "./components/mode-bar/index";

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

// The one drag model (design/patterns/drag-and-drop.md, drag.md): the sensor
// set (the touch rule of states.md, "Dragging on a touch screen", included),
// the lifted copy, the place, the refusal hint, the lists and the
// announcements by name. Until slock's adoption has settled the API. The
// touch sensor subclasses dnd-kit's TouchSensor through fields dnd-kit types
// as private.
export * from "./components/drag/index";

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

// How much of an allowance is used, such as a usage limit that resets: empty
// to start, filling as it is used, orange from 80% used (meter.md). Until the
// API settles.
export * from "./components/meter/index";

// The filter in effect beside a Filter button, with an × back to the default
// (filter-chip.md). Until a second product filter has used it.
export * from "./components/filter-chip/index";

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
// The read receipt on a mention: stable since artin and stdrc approved it on
// 2026-10-23 (message-item.md, "Read receipts on a mention"); exported from
// the package root. Kept here so existing `/wip` imports keep working.
export { MessageReferenceReadMark } from "./components/message-item/index";
export type { MessageReferenceReadMarkProps } from "./components/message-item/index";

// Pull to refresh on a touch screen, for pages that load a snapshot and don't
// update themselves (navigation.md, "Refreshing"; pull-to-refresh.md). Never
// on a page fed by realtime updates. Until Raft Chat's phone web has moved its
// snapshot pages onto it and the native apps' indicator is matched.
export * from "./components/pull-to-refresh/index";

// An always-open list to choose one or several from, when choosing is the
// dialog's or page's main content: rows with a name, up to two description
// lines and a button of their own at the end, and a search box above five
// items (choice-list.md; radio-group.md, "An open list to choose from"). Until
// slock's migration target list and member pickers have moved onto it.
export * from "./components/choice-list/index";

// An avatar stack that is a button, for a stack that opens who is in it (who
// is viewing an Artifact, a channel's members): avatar.md, "A stack that
// opens a list". Until the Artifacts viewer's presence has settled on it.
export { AvatarGroupButton } from "./components/avatar/index";
export type { AvatarGroupButtonProps } from "./components/avatar/index";

// A header action with a menu beside it, read as one control (Comment and its
// ▾ in the Artifact viewer): panel.md, "Split actions". Until stdrc approves
// the parts.
export {
  PanelSplitAction,
  PanelSplitActionMain,
  PanelSplitActionMenu,
  PanelSplitActionToggle,
} from "./components/panel/index";
export type {
  PanelSplitActionMainProps,
  PanelSplitActionMenuProps,
  PanelSplitActionProps,
  PanelSplitActionToggleProps,
} from "./components/panel/index";

// The line under a setting that applies at once, "Saved" or what failed,
// always reserved so its result never moves the card (forms.md, "Settings
// that apply at once"; stdrc, 2026-10-30). Until slock's settings have moved
// onto it.
export * from "./components/save-status/index";
