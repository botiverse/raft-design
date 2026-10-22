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
