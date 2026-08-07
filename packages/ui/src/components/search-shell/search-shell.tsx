import { useRender } from "@base-ui/react/use-render";
import { createElement, type ComponentPropsWithRef } from "react";

import { useThemeFamily } from "../../lib/theme/use-theme";
import { ConversationPanelContent } from "../conversation-panel/conversation-panel";
import { Panel, PanelHeaderRoot } from "../panel/panel";
import { searchShell } from "./search-shell.recipe";

export function useSearchShellStyles() {
  const theme = useThemeFamily();
  return searchShell({ theme });
}

function createSearchShellPart<Element extends keyof React.JSX.IntrinsicElements>(
  element: Element,
  slot: keyof ReturnType<typeof searchShell>,
  dataSlot: string,
) {
  return function SearchShellPart({ className, ...props }: ComponentPropsWithRef<Element>) {
    const theme = useThemeFamily();
    const styles = searchShell({ theme });
    return createElement(element, {
      ...(element === "button" ? { type: "button" } : null),
      "data-slot": dataSlot,
      className: styles[slot]({ className }),
      ...props,
    });
  };
}

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
  const { frame } = searchShell({ theme });
  return (
    <Panel {...props} render={render ?? <div />} edge={edge} className={frame({ className })} />
  );
}

export type SearchShellHeaderProps = ComponentPropsWithRef<typeof PanelHeaderRoot>;
export function SearchShellHeader({ className, ...props }: SearchShellHeaderProps) {
  const theme = useThemeFamily();
  const { header } = searchShell({ theme });
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
  const { content } = searchShell({ theme });
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

export const SearchShellHeaderBack = createSearchShellPart(
  "button",
  "headerBack",
  "search-shell-header-back",
);
export type SearchShellHeaderBackProps = ComponentPropsWithRef<typeof SearchShellHeaderBack>;
export const SearchShellHeaderIcon = createSearchShellPart(
  "div",
  "headerIconChip",
  "search-shell-header-icon",
);
export type SearchShellHeaderIconProps = ComponentPropsWithRef<typeof SearchShellHeaderIcon>;
export const SearchShellInputGroup = createSearchShellPart(
  "div",
  "searchInputGroup",
  "search-shell-input-group",
);
export type SearchShellInputGroupProps = ComponentPropsWithRef<typeof SearchShellInputGroup>;
export const SearchShellFilters = createSearchShellPart(
  "div",
  "filtersRow",
  "search-shell-filters",
);
export type SearchShellFiltersProps = ComponentPropsWithRef<typeof SearchShellFilters>;
export const SearchShellActiveFilter = createSearchShellPart(
  "button",
  "channelActiveChip",
  "search-shell-active-filter",
);
export type SearchShellActiveFilterProps = ComponentPropsWithRef<typeof SearchShellActiveFilter>;
export const SearchShellClearFilters = createSearchShellPart(
  "button",
  "clearAllButton",
  "search-shell-clear-filters",
);
export type SearchShellClearFiltersProps = ComponentPropsWithRef<typeof SearchShellClearFilters>;
export const SearchShellResults = createSearchShellPart(
  "div",
  "resultsViewport",
  "search-shell-results",
);
export type SearchShellResultsProps = ComponentPropsWithRef<typeof SearchShellResults>;
export const SearchShellResultsContent = createSearchShellPart(
  "div",
  "resultsContent",
  "search-shell-results-content",
);
export type SearchShellResultsContentProps = ComponentPropsWithRef<
  typeof SearchShellResultsContent
>;
export const SearchShellLoadMore = createSearchShellPart(
  "button",
  "loadMoreButton",
  "search-shell-load-more",
);
export type SearchShellLoadMoreProps = ComponentPropsWithRef<typeof SearchShellLoadMore>;
export const SearchShellEntityIcon = createSearchShellPart(
  "div",
  "entityIconChannel",
  "search-shell-entity-icon",
);
export type SearchShellEntityIconProps = ComponentPropsWithRef<typeof SearchShellEntityIcon>;
export const SearchShellComputerIcon = createSearchShellPart(
  "div",
  "entityIconComputer",
  "search-shell-computer-icon",
);
export type SearchShellComputerIconProps = ComponentPropsWithRef<typeof SearchShellComputerIcon>;
export const SearchShellArchivedIcon = createSearchShellPart(
  "div",
  "entityIconArchived",
  "search-shell-archived-icon",
);
export type SearchShellArchivedIconProps = ComponentPropsWithRef<typeof SearchShellArchivedIcon>;
export const SearchShellActivity = createSearchShellPart(
  "span",
  "activityDot",
  "search-shell-activity",
);
export type SearchShellActivityProps = ComponentPropsWithRef<typeof SearchShellActivity>;
export const SearchShellSkeletonCard = createSearchShellPart(
  "div",
  "skeletonCard",
  "search-shell-skeleton-card",
);
export type SearchShellSkeletonCardProps = ComponentPropsWithRef<typeof SearchShellSkeletonCard>;
