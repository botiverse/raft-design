import {
  TextSelectionToolbar,
  TextSelectionToolbarButton,
  TextSelectionToolbarSeparator,
} from "../text-selection-toolbar/text-selection-toolbar";
import type {
  TextSelectionToolbarButtonProps,
  TextSelectionToolbarProps,
  TextSelectionToolbarSeparatorProps,
} from "../text-selection-toolbar/text-selection-toolbar";
import { createTextSelectionAnchor } from "../text-selection-toolbar/text-selection-anchor";
import type { TextSelectionAnchor } from "../text-selection-toolbar/text-selection-anchor";

// The toolbar over selected text is not a message's own part: an Artifact
// selects text too. These names stay until apps move to TextSelectionToolbar.

/** @deprecated Use `TextSelectionToolbar`. */
export const MessageTextSelectionToolbar = TextSelectionToolbar;
/** @deprecated Use `TextSelectionToolbarButton`. */
export const MessageTextSelectionToolbarButton = TextSelectionToolbarButton;
/** @deprecated Use `TextSelectionToolbarSeparator`. */
export const MessageTextSelectionToolbarSeparator = TextSelectionToolbarSeparator;
/** @deprecated Use `createTextSelectionAnchor`. */
export const createMessageTextSelectionAnchor = createTextSelectionAnchor;

/** @deprecated Use `TextSelectionToolbarProps`. */
export type MessageTextSelectionToolbarProps = TextSelectionToolbarProps;
/** @deprecated Use `TextSelectionToolbarButtonProps`. */
export type MessageTextSelectionToolbarButtonProps = TextSelectionToolbarButtonProps;
/** @deprecated Use `TextSelectionToolbarSeparatorProps`. */
export type MessageTextSelectionToolbarSeparatorProps = TextSelectionToolbarSeparatorProps;
/** @deprecated Use `TextSelectionAnchor`. */
export type MessageTextSelectionAnchor = TextSelectionAnchor;
