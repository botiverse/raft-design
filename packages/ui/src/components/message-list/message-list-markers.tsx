import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { messageList } from "./message-list.recipe";

export type MessageListDateDividerProps = useRender.ComponentProps<"div"> & {
  sticky?: boolean;
};

export function MessageListDateDivider({
  children,
  className,
  render,
  sticky = false,
  ...props
}: MessageListDateDividerProps) {
  const theme = useThemeFamily();
  const { dateDividerRoot, dateDividerRule, dateDividerChipWrap, dateDividerChip } = messageList({
    theme,
    sticky,
  });
  const chip = <span className={dateDividerChip()}>{children}</span>;
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "message-list-date-divider",
    "data-sticky": sticky ? "true" : undefined,
    className: dateDividerRoot({ className }),
    children: sticky ? (
      chip
    ) : (
      <>
        <div aria-hidden className={dateDividerRule()} />
        <div className={dateDividerChipWrap()}>{chip}</div>
      </>
    ),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type MessageListNoticeProps = useRender.ComponentProps<"div"> & {
  tone?: "faint" | "muted";
};

export function MessageListNotice({
  className,
  render,
  tone = "faint",
  ...props
}: MessageListNoticeProps) {
  const theme = useThemeFamily();
  const { notice } = messageList({ theme, tone });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "message-list-notice",
    className: notice({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type MessageListHistoryLimitedProps = useRender.ComponentProps<"span">;

export function MessageListHistoryLimited({
  className,
  render,
  ...props
}: MessageListHistoryLimitedProps) {
  const theme = useThemeFamily();
  const { historyLimited } = messageList({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "message-list-history-limited",
    className: historyLimited({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
