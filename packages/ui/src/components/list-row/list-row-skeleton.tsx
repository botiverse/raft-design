import { tv } from "../../lib/tv";
import { Skeleton } from "../skeleton/skeleton";
import {
  ListRow,
  ListRowBody,
  ListRowBottom,
  ListRowDescription,
  ListRowMeta,
  ListRowTitle,
  ListRowTop,
} from "./list-row";
import type { ListRowProps } from "./list-row";

// Raft Design System › ListRow, loading: the real ListRow parts with a bar in
// each text slot, so the row's padding, divider and line heights are the
// loaded row's (see inbox-item-skeleton.recipe.ts). Bar widths vary over a run
// of three rows.
const listRowSkeleton = tv({
  slots: {
    row: [
      "[--list-row-skeleton-title:45%] [--list-row-skeleton-description:75%]",
      "nth-[3n+2]:[--list-row-skeleton-title:35%] nth-[3n+2]:[--list-row-skeleton-description:60%]",
      "nth-[3n]:[--list-row-skeleton-title:55%] nth-[3n]:[--list-row-skeleton-description:70%]",
    ],
    avatar: ["size-[35px] shrink-0"],
    icon: ["size-5 shrink-0"],
    bar: ["inline-block h-[0.75em] max-w-full align-middle"],
    titleBar: ["w-(--list-row-skeleton-title)"],
    descriptionBar: ["w-(--list-row-skeleton-description)"],
    metaBar: ["w-9"],
  },
});

export type ListRowSkeletonProps = Omit<
  ListRowProps,
  "tone" | "selected" | "interactive" | "children"
> & {
  /**
   * A leading block: 35px for an avatar or tile in a `default` row, 20px for
   * a `ListRowIcon` in a `plain` or `entry` row. On by default in a `default`
   * row.
   */
  leading?: boolean;
  /** A second line, where the rows have a `ListRowDescription`. On by default in a `default` row. */
  description?: boolean;
};

/**
 * A placeholder for one `ListRow` while the list loads. It is a display-only
 * `ListRow` of the same `variant`, with a bar in its title, its time and its
 * description, so it is the loaded row's size and its divider sits in the
 * same place. Hidden from assistive technology; mark the list `aria-busy`.
 */
export function ListRowSkeleton({
  variant = "default",
  leading = variant === "default",
  description = variant === "default",
  className,
  ...props
}: ListRowSkeletonProps) {
  const slots = listRowSkeleton();
  const bar = (width: string) => (
    <Skeleton variant="line" className={slots.bar({ className: width })} />
  );
  return (
    <ListRow
      aria-hidden
      data-skeleton=""
      interactive={false}
      variant={variant}
      {...props}
      className={slots.row({ className })}
    >
      {leading ? (
        <Skeleton className={variant === "default" ? slots.avatar() : slots.icon()} />
      ) : null}
      <ListRowBody>
        <ListRowTop>
          <ListRowTitle>{bar(slots.titleBar())}</ListRowTitle>
          {variant === "default" ? <ListRowMeta>{bar(slots.metaBar())}</ListRowMeta> : null}
        </ListRowTop>
        {description ? (
          <ListRowBottom>
            <ListRowDescription>{bar(slots.descriptionBar())}</ListRowDescription>
          </ListRowBottom>
        ) : null}
      </ListRowBody>
    </ListRow>
  );
}
