import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import type { SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { searchThread } from "./search-thread.recipe";

export type SearchThreadResultProps = useRender.ComponentProps<"div"> & { selected?: boolean };
export function SearchThreadResult({
  selected = false,
  className,
  render,
  ...props
}: SearchThreadResultProps) {
  const theme = useThemeFamily();
  const { thread } = searchThread({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "search-thread-result",
    "data-selected": selected ? "true" : undefined,
    className: thread({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type SearchThreadResultHeaderProps = useRender.ComponentProps<"div">;
export function SearchThreadResultHeader({
  className,
  render,
  ...props
}: SearchThreadResultHeaderProps) {
  const theme = useThemeFamily();
  const { threadHeader } = searchThread({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "search-thread-result-header",
    className: threadHeader({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type SearchThreadResultMetaProps = useRender.ComponentProps<"div">;
export function SearchThreadResultMeta({
  className,
  render,
  ...props
}: SearchThreadResultMetaProps) {
  const theme = useThemeFamily();
  const { threadMeta } = searchThread({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "search-thread-result-meta",
    className: threadMeta({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type SearchThreadResultTimestampProps = useRender.ComponentProps<"span">;
export function SearchThreadResultTimestamp({
  className,
  render,
  ...props
}: SearchThreadResultTimestampProps) {
  const theme = useThemeFamily();
  const { threadTimestamp } = searchThread({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "search-thread-result-timestamp",
    className: threadTimestamp({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type SearchThreadResultTitleProps = useRender.ComponentProps<"div">;
export function SearchThreadResultTitle({
  className,
  render,
  ...props
}: SearchThreadResultTitleProps) {
  const theme = useThemeFamily();
  const { threadTitle } = searchThread({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "search-thread-result-title",
    className: threadTitle({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type SearchThreadResultMessagesProps = useRender.ComponentProps<"div">;
export function SearchThreadResultMessages({
  className,
  render,
  ...props
}: SearchThreadResultMessagesProps) {
  const theme = useThemeFamily();
  const { threadMessages } = searchThread({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "search-thread-result-messages",
    className: threadMessages({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
