import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import type { StyledProps } from "../../lib/styled-props";
import { textSelectionToolbar } from "./text-selection-toolbar.recipe";

export type TextSelectionToolbarProps = StyledProps<BaseToolbar.Root.Props>;

/**
 * The toolbar that floats over selected text, with actions such as Quote,
 * Copy and Comment: in a message, in an Artifact, anywhere text can be
 * selected. Place it with `createTextSelectionAnchor` in a Popover.
 */
export function TextSelectionToolbar({ className, ...props }: TextSelectionToolbarProps) {
  const { toolbar } = textSelectionToolbar();

  return (
    <BaseToolbar.Root
      data-slot="text-selection-toolbar"
      className={toolbar({ className })}
      {...props}
    />
  );
}

export type TextSelectionToolbarButtonProps = StyledProps<BaseToolbar.Button.Props>;

export function TextSelectionToolbarButton({
  className,
  ...props
}: TextSelectionToolbarButtonProps) {
  const { button } = textSelectionToolbar();

  return (
    <BaseToolbar.Button
      data-slot="text-selection-toolbar-button"
      type="button"
      className={button({ className })}
      {...props}
    />
  );
}

export type TextSelectionToolbarSeparatorProps = StyledProps<BaseToolbar.Separator.Props>;

export function TextSelectionToolbarSeparator({
  className,
  ...props
}: TextSelectionToolbarSeparatorProps) {
  const { separator } = textSelectionToolbar();

  return (
    <BaseToolbar.Separator
      data-slot="text-selection-toolbar-separator"
      className={separator({ className })}
      {...props}
    />
  );
}
