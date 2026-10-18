import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import type { StyledProps } from "../../lib/styled-props";
import { messageTextSelectionToolbar } from "./message-text-selection-toolbar.recipe";

export type MessageTextSelectionToolbarProps = StyledProps<BaseToolbar.Root.Props>;

export function MessageTextSelectionToolbar({
  className,
  ...props
}: MessageTextSelectionToolbarProps) {
  const { toolbar } = messageTextSelectionToolbar();

  return (
    <BaseToolbar.Root
      data-slot="message-text-selection-toolbar"
      className={toolbar({ className })}
      {...props}
    />
  );
}

export type MessageTextSelectionToolbarButtonProps = StyledProps<BaseToolbar.Button.Props>;

export function MessageTextSelectionToolbarButton({
  className,
  ...props
}: MessageTextSelectionToolbarButtonProps) {
  const { button } = messageTextSelectionToolbar();

  return (
    <BaseToolbar.Button
      data-slot="message-text-selection-toolbar-button"
      type="button"
      className={button({ className })}
      {...props}
    />
  );
}

export type MessageTextSelectionToolbarSeparatorProps = StyledProps<BaseToolbar.Separator.Props>;

export function MessageTextSelectionToolbarSeparator({
  className,
  ...props
}: MessageTextSelectionToolbarSeparatorProps) {
  const { separator } = messageTextSelectionToolbar();

  return (
    <BaseToolbar.Separator
      data-slot="message-text-selection-toolbar-separator"
      className={separator({ className })}
      {...props}
    />
  );
}
