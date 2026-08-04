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
