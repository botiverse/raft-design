import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { type SyntheticEvent } from "react";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { messageItem, type MessageItemVariantProps } from "./message-item.recipe";
import { type SlotElementProps } from "../../lib/data-attributes";

export type MessageItemProps = useRender.ComponentProps<"div"> &
  Pick<MessageItemVariantProps, "compact">;

type MessageItemRowState = "search-match" | "select";

function clearTouchTextSelection(event: SyntheticEvent) {
  if (!window.matchMedia("(hover: none)").matches) return;
  event.preventDefault();
  window.getSelection()?.removeAllRanges();
}

function MessageItemRoot({
  className,
  compact,
  render,
  rowState,
  ...props
}: MessageItemProps & { rowState?: MessageItemRowState }) {
  const theme = useThemeFamily();
  const { root } = messageItem({ compact, rowState, theme });
  const defaultProps: useRender.ElementProps<"div"> & SlotElementProps<"div"> = {
    "data-message-item": "",
    "data-compact": compact ? "true" : undefined,
    className: root({ className }),
    onSelect: clearTouchTextSelection,
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-item",
    },
  });
}

export function MessageItem(props: MessageItemProps) {
  return <MessageItemRoot {...props} />;
}

export type MessageItemSearchMatchProps = MessageItemProps;

export function MessageItemSearchMatch(props: MessageItemSearchMatchProps) {
  return <MessageItemRoot rowState="search-match" {...props} />;
}

export type MessageItemSelectionProps = MessageItemProps;

export function MessageItemSelection(props: MessageItemSelectionProps) {
  return <MessageItemRoot rowState="select" {...props} />;
}
