import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import type { SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { searchResults } from "./search-results.recipe";

export type SearchResultsSummaryProps = useRender.ComponentProps<"span">;
export function SearchResultsSummary({ className, render, ...props }: SearchResultsSummaryProps) {
  const theme = useThemeFamily();
  const { summary } = searchResults({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "search-results-summary",
    className: summary({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type SearchResultsSectionProps = useRender.ComponentProps<"div">;
export function SearchResultsSection({ className, render, ...props }: SearchResultsSectionProps) {
  const theme = useThemeFamily();
  const { section } = searchResults({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "search-results-section",
    className: section({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type SearchResultsSectionHeadingProps = useRender.ComponentProps<"div">;
export function SearchResultsSectionHeading({
  className,
  render,
  ...props
}: SearchResultsSectionHeadingProps) {
  const theme = useThemeFamily();
  const { sectionHeading } = searchResults({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "search-results-section-heading",
    className: sectionHeading({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type SearchResultsListProps = useRender.ComponentProps<"div">;
export function SearchResultsList({ className, render, ...props }: SearchResultsListProps) {
  const theme = useThemeFamily();
  const { list } = searchResults({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "search-results-list",
    className: list({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type SearchEntityResultProps = useRender.ComponentProps<"div"> & { selected?: boolean };
export function SearchEntityResult({
  selected = false,
  className,
  render,
  ...props
}: SearchEntityResultProps) {
  const theme = useThemeFamily();
  const { entity } = searchResults({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "search-entity-result",
    "data-selected": selected ? "true" : undefined,
    className: entity({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type SearchEntityResultOpenProps = useRender.ComponentProps<"button">;
export function SearchEntityResultOpen({
  className,
  render,
  ...props
}: SearchEntityResultOpenProps) {
  const theme = useThemeFamily();
  const { entityOpen } = searchResults({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    "data-slot": "search-entity-result-open",
    className: entityOpen({ className }),
    type: "button",
  };
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type SearchEntityResultLeadingProps = useRender.ComponentProps<"div">;
export function SearchEntityResultLeading({
  className,
  render,
  ...props
}: SearchEntityResultLeadingProps) {
  const theme = useThemeFamily();
  const { entityLeading } = searchResults({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "search-entity-result-leading",
    className: entityLeading({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

type SearchEntityResultTextProps = useRender.ComponentProps<"span"> & { muted?: boolean };

export type SearchEntityResultTitleProps = SearchEntityResultTextProps;
export function SearchEntityResultTitle({
  muted = false,
  className,
  render,
  ...props
}: SearchEntityResultTitleProps) {
  const theme = useThemeFamily();
  const { entityTitle } = searchResults({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "search-entity-result-title",
    "data-muted": muted ? "" : undefined,
    className: entityTitle({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type SearchEntityResultDescriptionProps = SearchEntityResultTextProps;
export function SearchEntityResultDescription({
  muted = false,
  className,
  render,
  ...props
}: SearchEntityResultDescriptionProps) {
  const theme = useThemeFamily();
  const { entityDescription } = searchResults({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "search-entity-result-description",
    "data-muted": muted ? "" : undefined,
    className: entityDescription({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type SearchEntityResultBadgeProps = useRender.ComponentProps<"span"> & {
  muted?: boolean;
};
export function SearchEntityResultBadge({
  muted = false,
  className,
  render,
  ...props
}: SearchEntityResultBadgeProps) {
  const theme = useThemeFamily();
  const { entityBadge } = searchResults({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "search-entity-result-badge",
    "data-muted": muted ? "" : undefined,
    className: entityBadge({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type SearchEntityResultAttentionBadgeProps = useRender.ComponentProps<"span">;
export function SearchEntityResultAttentionBadge({
  className,
  render,
  ...props
}: SearchEntityResultAttentionBadgeProps) {
  const theme = useThemeFamily();
  const { entityAttentionBadge } = searchResults({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "search-entity-result-attention-badge",
    className: entityAttentionBadge({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

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
  const theme = useThemeFamily();
  const { message } = searchResults({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    "data-slot": "search-message-result",
    "data-nested": nested ? "true" : undefined,
    "data-selected": selected ? "true" : undefined,
    className: message({ className }),
    type: "button",
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
  const theme = useThemeFamily();
  const { messageHeader } = searchResults({ theme });
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
  const theme = useThemeFamily();
  const { messageBody } = searchResults({ theme });
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
  const theme = useThemeFamily();
  const { messageMeta } = searchResults({ theme });
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
  const theme = useThemeFamily();
  const { messageThreadMeta } = searchResults({ theme });
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
  const theme = useThemeFamily();
  const { messageSender } = searchResults({ theme });
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

export type SearchMessageResultBadgeProps = useRender.ComponentProps<"span">;
export function SearchMessageResultBadge({
  className,
  render,
  ...props
}: SearchMessageResultBadgeProps) {
  const theme = useThemeFamily();
  const { messageBadge } = searchResults({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "search-message-result-badge",
    className: messageBadge({ className }),
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
  const theme = useThemeFamily();
  const { messageTimestamp } = searchResults({ theme });
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
  const theme = useThemeFamily();
  const { messageMatch } = searchResults({ theme });
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

export type SearchThreadResultProps = useRender.ComponentProps<"div"> & { selected?: boolean };
export function SearchThreadResult({
  selected = false,
  className,
  render,
  ...props
}: SearchThreadResultProps) {
  const theme = useThemeFamily();
  const { thread } = searchResults({ theme });
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
  const { threadHeader } = searchResults({ theme });
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
  const { threadMeta } = searchResults({ theme });
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

export type SearchThreadResultBadgeProps = useRender.ComponentProps<"span">;
export function SearchThreadResultBadge({
  className,
  render,
  ...props
}: SearchThreadResultBadgeProps) {
  const theme = useThemeFamily();
  const { threadBadge } = searchResults({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "search-thread-result-badge",
    className: threadBadge({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type SearchThreadResultTimestampProps = useRender.ComponentProps<"span">;
export function SearchThreadResultTimestamp({
  className,
  render,
  ...props
}: SearchThreadResultTimestampProps) {
  const theme = useThemeFamily();
  const { threadTimestamp } = searchResults({ theme });
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
  const { threadTitle } = searchResults({ theme });
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
  const { threadMessages } = searchResults({ theme });
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

export type SearchResultsErrorProps = useRender.ComponentProps<"div">;
export function SearchResultsError({ className, render, ...props }: SearchResultsErrorProps) {
  const theme = useThemeFamily();
  const { error } = searchResults({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "search-results-error",
    className: error({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type SearchResultsErrorTitleProps = useRender.ComponentProps<"div">;
export function SearchResultsErrorTitle({
  className,
  render,
  ...props
}: SearchResultsErrorTitleProps) {
  const theme = useThemeFamily();
  const { errorTitle } = searchResults({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "search-results-error-title",
    className: errorTitle({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type SearchResultsErrorDescriptionProps = useRender.ComponentProps<"div">;
export function SearchResultsErrorDescription({
  className,
  render,
  ...props
}: SearchResultsErrorDescriptionProps) {
  const theme = useThemeFamily();
  const { errorDescription } = searchResults({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "search-results-error-description",
    className: errorDescription({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type SearchResultsErrorActionProps = useRender.ComponentProps<"button">;
export function SearchResultsErrorAction({
  className,
  render,
  ...props
}: SearchResultsErrorActionProps) {
  const theme = useThemeFamily();
  const { errorAction } = searchResults({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    "data-slot": "search-results-error-action",
    className: errorAction({ className }),
    type: "button",
  };
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}
