import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import type { SlotElementProps } from "../../lib/data-attributes";
import { searchMessage } from "./search-message.recipe";

type SearchMessageResultBaseProps = useRender.ComponentProps<"button"> & {
  selected?: boolean;
  nested?: boolean;
};

function SearchMessageResultBase({
  nested = false,
  selected = false,
  className,
  render,
  ...props
}: SearchMessageResultBaseProps) {
  const { message } = searchMessage();
  const defaultProps: SlotElementProps<"button"> = {
    "data-slot": "search-message-result",
    "data-nested": nested ? "true" : undefined,
    "data-selected": selected ? "true" : undefined,
    className: message({ className }),
    type: render ? undefined : "button",
  };
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type SearchMessageResultProps = Omit<SearchMessageResultBaseProps, "nested">;
export function SearchMessageResult(props: SearchMessageResultProps) {
  return <SearchMessageResultBase {...props} />;
}

export type SearchThreadMessageResultProps = Omit<SearchMessageResultBaseProps, "nested">;
export function SearchThreadMessageResult(props: SearchThreadMessageResultProps) {
  return <SearchMessageResultBase {...props} nested />;
}

export type SearchMessageResultHeaderProps = useRender.ComponentProps<"div">;
export function SearchMessageResultHeader({
  className,
  render,
  ...props
}: SearchMessageResultHeaderProps) {
  const { messageHeader } = searchMessage();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "search-message-result-header",
    className: messageHeader({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type SearchMessageResultBodyProps = useRender.ComponentProps<"div">;
export function SearchMessageResultBody({
  className,
  render,
  ...props
}: SearchMessageResultBodyProps) {
  const { messageBody } = searchMessage();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "search-message-result-body",
    className: messageBody({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type SearchMessageResultMetaProps = useRender.ComponentProps<"span">;
export function SearchMessageResultMeta({
  className,
  render,
  ...props
}: SearchMessageResultMetaProps) {
  const { messageMeta } = searchMessage();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "search-message-result-meta",
    className: messageMeta({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type SearchMessageResultThreadMetaProps = useRender.ComponentProps<"span">;
export function SearchMessageResultThreadMeta({
  className,
  render,
  ...props
}: SearchMessageResultThreadMetaProps) {
  const { messageThreadMeta } = searchMessage();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "search-message-result-thread-meta",
    className: messageThreadMeta({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type SearchMessageResultSenderProps = useRender.ComponentProps<"span">;
export function SearchMessageResultSender({
  className,
  render,
  ...props
}: SearchMessageResultSenderProps) {
  const { messageSender } = searchMessage();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "search-message-result-sender",
    className: messageSender({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type SearchMessageResultTimestampProps = useRender.ComponentProps<"span">;
export function SearchMessageResultTimestamp({
  className,
  render,
  ...props
}: SearchMessageResultTimestampProps) {
  const { messageTimestamp } = searchMessage();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "search-message-result-timestamp",
    className: messageTimestamp({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type SearchMessageResultMatchProps = useRender.ComponentProps<"mark">;
export function SearchMessageResultMatch({
  className,
  render,
  ...props
}: SearchMessageResultMatchProps) {
  const { messageMatch } = searchMessage();
  const defaultProps: SlotElementProps<"mark"> = {
    "data-slot": "search-message-result-match",
    className: messageMatch({ className }),
  };
  return useRender({
    defaultTagName: "mark",
    render,
    props: mergeProps<"mark">(defaultProps, props),
  });
}
