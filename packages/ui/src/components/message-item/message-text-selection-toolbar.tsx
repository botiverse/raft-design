import type { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
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

/**
 * @deprecated Use `TextSelectionToolbarProps`. Base UI's Toolbar is in
 * scope here so the generated API names its types as the new part's do.
 */
export type MessageTextSelectionToolbarProps = TextSelectionToolbarProps &
  Pick<BaseToolbar.Root.Props, "orientation">;
/** @deprecated Use `TextSelectionToolbarButtonProps`. */
export type MessageTextSelectionToolbarButtonProps = TextSelectionToolbarButtonProps;
/** @deprecated Use `TextSelectionToolbarSeparatorProps`. */
export type MessageTextSelectionToolbarSeparatorProps = TextSelectionToolbarSeparatorProps;
/** @deprecated Use `TextSelectionAnchor`. */
export type MessageTextSelectionAnchor = TextSelectionAnchor;
