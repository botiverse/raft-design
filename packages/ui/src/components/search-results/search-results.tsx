import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import type { SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { searchResults } from "./search-results.recipe";

type DivProps = useRender.ComponentProps<"div">;
type ButtonProps = useRender.ComponentProps<"button">;

function withSlot<Tag extends "div" | "button" | "span">(
  props: SlotElementProps<Tag>,
): SlotElementProps<Tag> {
  return props;
}

export type SearchResultsSummaryProps = useRender.ComponentProps<"span">;
export function SearchResultsSummary({ className, render, ...props }: SearchResultsSummaryProps) {
  const theme = useThemeFamily();
  const { summary } = searchResults({ theme });
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(
      withSlot<"span">({
        "data-slot": "search-results-summary",
        className: summary({ className }),
      }),
      props,
    ),
  });
}

export type SearchResultsSectionProps = DivProps;
export function SearchResultsSection({ className, render, ...props }: SearchResultsSectionProps) {
  const theme = useThemeFamily();
  const { section } = searchResults({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({ "data-slot": "search-results-section", className: section({ className }) }),
      props,
    ),
  });
}

export type SearchResultsSectionHeadingProps = DivProps;
export function SearchResultsSectionHeading({
  className,
  render,
  ...props
}: SearchResultsSectionHeadingProps) {
  const theme = useThemeFamily();
  const { sectionHeading } = searchResults({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({
        "data-slot": "search-results-section-heading",
        className: sectionHeading({ className }),
      }),
      props,
    ),
  });
}

export type SearchResultsListProps = DivProps;
export function SearchResultsList({ className, render, ...props }: SearchResultsListProps) {
  const theme = useThemeFamily();
  const { list } = searchResults({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({ "data-slot": "search-results-list", className: list({ className }) }),
      props,
    ),
  });
}

export type SearchEntityResultProps = DivProps & { selected?: boolean };
export function SearchEntityResult({
  selected = false,
  className,
  render,
  ...props
}: SearchEntityResultProps) {
  const theme = useThemeFamily();
  const { entity } = searchResults({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({
        "data-slot": "search-entity-result",
        "data-selected": selected ? "true" : undefined,
        className: entity({ className }),
      }),
      props,
    ),
  });
}

export type SearchEntityResultOpenProps = ButtonProps;
export function SearchEntityResultOpen({
  className,
  render,
  ...props
}: SearchEntityResultOpenProps) {
  const theme = useThemeFamily();
  const { entityOpen } = searchResults({ theme });
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(
      withSlot<"button">({
        "data-slot": "search-entity-result-open",
        className: entityOpen({ className }),
        type: "button",
      }),
      props,
    ),
  });
}

type SearchMessageResultBaseProps = ButtonProps & { selected?: boolean; nested?: boolean };

function SearchMessageResultBase({
  nested = false,
  selected = false,
  className,
  render,
  ...props
}: SearchMessageResultBaseProps) {
  const theme = useThemeFamily();
  const { message } = searchResults({ theme });
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(
      withSlot<"button">({
        "data-slot": "search-message-result",
        "data-nested": nested ? "true" : undefined,
        "data-selected": selected ? "true" : undefined,
        className: message({ className }),
        type: "button",
      }),
      props,
    ),
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

export type SearchThreadResultProps = DivProps & { selected?: boolean };
export function SearchThreadResult({
  selected = false,
  className,
  render,
  ...props
}: SearchThreadResultProps) {
  const theme = useThemeFamily();
  const { thread } = searchResults({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({
        "data-slot": "search-thread-result",
        "data-selected": selected ? "true" : undefined,
        className: thread({ className }),
      }),
      props,
    ),
  });
}

export type SearchThreadResultHeaderProps = DivProps;
export function SearchThreadResultHeader({
  className,
  render,
  ...props
}: SearchThreadResultHeaderProps) {
  const theme = useThemeFamily();
  const { threadHeader } = searchResults({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({
        "data-slot": "search-thread-result-header",
        className: threadHeader({ className }),
      }),
      props,
    ),
  });
}

export type SearchThreadResultMessagesProps = DivProps;
export function SearchThreadResultMessages({
  className,
  render,
  ...props
}: SearchThreadResultMessagesProps) {
  const theme = useThemeFamily();
  const { threadMessages } = searchResults({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({
        "data-slot": "search-thread-result-messages",
        className: threadMessages({ className }),
      }),
      props,
    ),
  });
}

export type SearchResultsEmptyProps = DivProps;
export function SearchResultsEmpty({ className, render, ...props }: SearchResultsEmptyProps) {
  const theme = useThemeFamily();
  const { empty } = searchResults({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({ "data-slot": "search-results-empty", className: empty({ className }) }),
      props,
    ),
  });
}

export type SearchResultsErrorProps = DivProps;
export function SearchResultsError({ className, render, ...props }: SearchResultsErrorProps) {
  const theme = useThemeFamily();
  const { error } = searchResults({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({ "data-slot": "search-results-error", className: error({ className }) }),
      props,
    ),
  });
}
