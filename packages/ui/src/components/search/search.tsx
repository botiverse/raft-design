import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ComponentPropsWithRef } from "react";

import type { SlotElementProps } from "../../lib/data-attributes";
import { useMergedRef } from "../../lib/use-merged-ref";
import { useScrollbarSize } from "../../lib/use-scrollbar-size";
import { Panel } from "../panel/panel";
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
  const { frame } = search();
  return (
    <Panel {...props} render={render ?? <div />} edge={edge} className={frame({ className })} />
  );
}

export type SearchShellFiltersProps = ComponentPropsWithRef<"div">;

export function SearchShellFilters({ className, ...props }: SearchShellFiltersProps) {
  const { filtersRow } = search();
  return <div data-slot="search-shell-filters" className={filtersRow({ className })} {...props} />;
}

export type SearchShellViewportProps = ComponentPropsWithRef<"div">;

/** The results' scroller. It publishes its scrollbar's width for the result
 *  cells (useScrollbarSize), so their fills sit 8px from both edges. */
export function SearchShellViewport({ className, ref, ...props }: SearchShellViewportProps) {
  const { viewport } = search();
  const scrollbarRef = useScrollbarSize<HTMLDivElement>();
  const [setRef] = useMergedRef<HTMLDivElement>(ref, scrollbarRef);
  return (
    <div
      data-slot="search-shell-viewport"
      className={viewport({ className })}
      {...props}
      ref={setRef}
    />
  );
}

export type SearchResultsSummaryProps = useRender.ComponentProps<"span">;
export function SearchResultsSummary({ className, render, ...props }: SearchResultsSummaryProps) {
  const { summary } = search();
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
  const { section } = search();
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
  const { sectionHeading } = search();
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
  const { list } = search();
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
