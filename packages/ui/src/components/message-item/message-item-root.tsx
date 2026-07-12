import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { messageItem, type MessageItemVariantProps } from "./message-item.recipe";
import { type DataAttributes } from "../../lib/data-attributes";

export type MessageItemProps = useRender.ComponentProps<"div"> &
  Pick<MessageItemVariantProps, "compact">;

type MessageItemRowState = "active" | "search-match" | "select";

function MessageItemRoot({
  className,
  compact,
  render,
  rowState,
  ...props
}: MessageItemProps & { rowState?: MessageItemRowState }) {
  const theme = useThemeFamily();
  const { root } = messageItem({ compact, rowState, theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-compact": compact ? "true" : undefined,
    className: root({ className }),
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

export type MessageItemActiveProps = MessageItemProps;

export function MessageItemActive(props: MessageItemActiveProps) {
  return <MessageItemRoot rowState="active" {...props} />;
}

export type MessageItemSearchMatchProps = MessageItemProps;

export function MessageItemSearchMatch(props: MessageItemSearchMatchProps) {
  return <MessageItemRoot rowState="search-match" {...props} />;
}

export type MessageItemSelectionProps = MessageItemProps;

export function MessageItemSelection(props: MessageItemSelectionProps) {
  return <MessageItemRoot rowState="select" {...props} />;
}
