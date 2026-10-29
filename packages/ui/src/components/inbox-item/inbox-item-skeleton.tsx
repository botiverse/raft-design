import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useEffect, useState } from "react";

import type { SlotElementProps } from "../../lib/data-attributes";
import { Skeleton } from "../skeleton/skeleton";
import {
  InboxItem,
  InboxItemBody,
  InboxItemContent,
  InboxItemContext,
  InboxItemHeading,
  InboxItemLeading,
  InboxItemTimestamp,
  InboxItemTitle,
  InboxItemTrailing,
} from "./inbox-item";
import type { InboxItemDensity, InboxItemProps } from "./inbox-item";
import { inboxItemSkeleton } from "./inbox-item-skeleton.recipe";

type InboxItemSkeletonShape = {
  /** The density of the rows it stands for. */
  density?: InboxItemDensity;
  /** A 35px block where the rows have an `InboxItemLeading` avatar or tile. */
  leading?: boolean;
  /** A context line above the title, where the rows have an `InboxItemContext`. */
  context?: boolean;
};

export type InboxItemSkeletonProps = Omit<InboxItemProps, "active" | "disabled" | "children"> &
  InboxItemSkeletonShape;

/**
 * A placeholder for one `InboxItem` while the list loads. It is an
 * `InboxItem` itself, with the same parts as the loaded row (an optional
 * leading block, the context line, the title, the excerpt, the timestamp),
 * each holding a bar instead of text. The padding, the divider and every
 * line's height are the loaded row's, so nothing moves when the content
 * arrives. Match `density`, `leading` and `context` to the rows it stands for.
 * Hidden from assistive technology: mark the region that stays while the
 * list loads `aria-busy`.
 */
export function InboxItemSkeleton({
  density,
  leading = false,
  context = false,
  ...props
}: InboxItemSkeletonProps) {
  const slots = inboxItemSkeleton();
  const bar = (width: string) => (
    <Skeleton variant="line" className={slots.bar({ className: width })} />
  );
  return (
    <InboxItem
      aria-hidden
      data-skeleton=""
      density={density}
      disabled
      {...props}
      className={slots.row({ className: props.className })}
    >
      {leading ? (
        <InboxItemLeading>
          <Skeleton className={slots.leading()} />
        </InboxItemLeading>
      ) : null}
      <InboxItemContent>
        {context ? (
          <InboxItemContext>
            <span className={slots.line()}>{bar(slots.contextBar())}</span>
          </InboxItemContext>
        ) : null}
        <InboxItemHeading>
          <InboxItemTitle className={slots.title()}>{bar(slots.titleBar())}</InboxItemTitle>
        </InboxItemHeading>
        <InboxItemBody>{bar(slots.bodyBar())}</InboxItemBody>
      </InboxItemContent>
      <InboxItemTrailing>
        <InboxItemTimestamp>{bar(slots.timestampBar())}</InboxItemTimestamp>
      </InboxItemTrailing>
    </InboxItem>
  );
}

export type InboxItemSkeletonListProps = useRender.ComponentProps<"div"> &
  InboxItemSkeletonShape & {
    /** How many rows to show. About a screenful; ignored when there are children. */
    count?: number;
    /**
     * Milliseconds to wait before the rows appear, so a fast load doesn't
     * flash them (Feedback, "Empty, loading and failed"). The list is empty
     * until then. A list skeleton is only for a slow load, so it waits 1
     * second by default; pass `0` to show the rows at once.
     */
    delay?: number;
  };

/**
 * The list of `InboxItemSkeleton` rows that stands in for a list of
 * `InboxItem` rows while it loads, with nothing between or around the rows
 * that the loaded list doesn't have (no border, no card): only the list's
 * 2px gap, which the loaded list has too (design/patterns/lists.md). Renders
 * `count` rows of the given shape, or its children, once `delay` (1 second by
 * default) has passed. It isn't `aria-busy` itself: it goes away when the
 * content arrives, so mark the region that stays, such as the list's panel or
 * viewport, `aria-busy` while it loads.
 */
export function InboxItemSkeletonList({
  count = 6,
  delay = 1000,
  density,
  leading,
  context,
  children,
  className,
  render,
  ...props
}: InboxItemSkeletonListProps) {
  const { list } = inboxItemSkeleton();
  const shown = useDelayPassed(delay);
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "inbox-item-skeleton-list",
    "data-waiting": shown ? undefined : "",
    className: list({ className }),
    children: shown
      ? (children ??
        Array.from({ length: count }, (_, index) => (
          <InboxItemSkeleton key={index} density={density} leading={leading} context={context} />
        )))
      : null,
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

/** Whether `delay` milliseconds have passed since mount; at once for `0`. */
function useDelayPassed(delay: number) {
  const [passed, setPassed] = useState(false);
  useEffect(() => {
    if (delay <= 0) return;
    const timer = setTimeout(() => setPassed(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return passed || delay <= 0;
}
