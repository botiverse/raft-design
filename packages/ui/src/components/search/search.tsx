import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ComponentPropsWithRef } from "react";

import type { SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { ConversationPanelContent } from "../conversation-panel/conversation-panel";
import { Panel, PanelHeaderRoot } from "../panel/panel";
import { search } from "./search.recipe";

export type SearchShellRootProps = useRender.ComponentProps<"div"> & {
  edge?: ComponentPropsWithRef<typeof Panel>["edge"];
};
export function SearchShellRoot({
  className,
  edge = "inset",
  render,
  ...props
}: SearchShellRootProps) {
  const theme = useThemeFamily();
  const { frame } = search({ theme });
  return (
    <Panel {...props} render={render ?? <div />} edge={edge} className={frame({ className })} />
  );
}

export type SearchShellHeaderProps = ComponentPropsWithRef<typeof PanelHeaderRoot>;
export function SearchShellHeader({ className, ...props }: SearchShellHeaderProps) {
  const theme = useThemeFamily();
  const { header } = search({ theme });
  return (
    <PanelHeaderRoot
      data-panel-frame-header=""
      data-slot="search-shell-header"
      className={header({ className })}
      {...props}
    />
  );
}

export type SearchShellContentProps = useRender.ComponentProps<"section">;
export function SearchShellContent({ className, render, ...props }: SearchShellContentProps) {
  const theme = useThemeFamily();
  const { content } = search({ theme });
  const conversationContentProps = props as unknown as ComponentPropsWithRef<
    typeof ConversationPanelContent
  >;
  return (
    <ConversationPanelContent
      {...conversationContentProps}
      render={render ?? <section />}
      data-slot="search-shell-content"
      className={content({ className })}
    />
  );
}

export type SearchShellFiltersProps = ComponentPropsWithRef<"div">;

export function SearchShellFilters({ className, ...props }: SearchShellFiltersProps) {
  const theme = useThemeFamily();
  const { filtersRow } = search({ theme });
  return <div data-slot="search-shell-filters" className={filtersRow({ className })} {...props} />;
}

export type SearchShellViewportProps = ComponentPropsWithRef<"div">;

export function SearchShellViewport({ className, ...props }: SearchShellViewportProps) {
  const theme = useThemeFamily();
  const { viewport } = search({ theme });
  return <div data-slot="search-shell-viewport" className={viewport({ className })} {...props} />;
}

export type SearchShellHeaderIconProps = ComponentPropsWithRef<"div">;
export function SearchShellHeaderIcon({ className, ...props }: SearchShellHeaderIconProps) {
  const theme = useThemeFamily();
  const { headerIconChip } = search({ theme });
  return (
    <div
      data-slot="search-shell-header-icon"
      className={headerIconChip({ className })}
      {...props}
    />
  );
}

export type SearchResultsSummaryProps = useRender.ComponentProps<"span">;
export function SearchResultsSummary({ className, render, ...props }: SearchResultsSummaryProps) {
  const theme = useThemeFamily();
  const { summary } = search({ theme });
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
  const { section } = search({ theme });
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
  const { sectionHeading } = search({ theme });
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
  const { list } = search({ theme });
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
