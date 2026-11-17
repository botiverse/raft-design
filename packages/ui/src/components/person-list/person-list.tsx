import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { personList } from "./person-list.recipe";

export type PersonListProps = useRender.ComponentProps<"ul">;

/**
 * The people in a popover: who is viewing, who has read it. A `ul`, the
 * column of list cells (2px between rows, 8px at its ends); put it straight
 * in `PopoverContent`, under a `PopoverHeader` if it has one, with no
 * `PopoverBody` around it: each row brings its own 8px inset.
 */
export function PersonList({ className, render, ...props }: PersonListProps) {
  const { list } = personList();
  const defaultProps: SlotElementProps<"ul"> = {
    "data-slot": "person-list",
    className: list({ className }),
  };

  return useRender({
    defaultTagName: "ul",
    render,
    props: mergeProps<"ul">(defaultProps, props),
  });
}

export type PersonListItemProps = useRender.ComponentProps<"button"> & {
  /** `false` renders a row that opens nothing: a `div` with no hover, press
   *  or focus, for someone who can't be opened (a deleted person or agent, a
   *  system row). */
  interactive?: boolean;
};

/**
 * One person: an `li` holding the row. The row is a `button` by default;
 * pass `render={<a />}` (or a router link) for a row that goes to a page.
 * Every prop, `className`, `ref` and `render` go to the row, not the `li`.
 * Children: an `xs` `Avatar`, `PersonListItemName`, then up to two
 * `PersonListItemStatus`.
 */
export function PersonListItem({
  interactive = true,
  className,
  render,
  ...props
}: PersonListItemProps) {
  const { item, row } = personList({ interactive });
  const defaultProps: SlotElementProps<"button"> = {
    "data-slot": "person-list-row",
    "data-interactive": interactive ? "" : undefined,
    className: row({ className }),
    ...(interactive && !render ? { type: "button" } : {}),
  };

  const element = useRender({
    defaultTagName: interactive ? "button" : "div",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });

  return (
    <li data-slot="person-list-item" className={item()}>
      {element}
    </li>
  );
}

export type PersonListItemNameProps = useRender.ComponentProps<"span">;

/** The person's name. It truncates first, so the status stays whole. */
export function PersonListItemName({ className, render, ...props }: PersonListItemNameProps) {
  const { name } = personList();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "person-list-item-name",
    className: name({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type PersonListItemStatusProps = useRender.ComponentProps<"span">;

/**
 * What the person is doing or has done ("viewing", "read this version", a
 * time), in `text-footnote` and `foreground-muted`. The last status in a row
 * ends the row; one before it stays beside the name. The name and a status
 * followed by a status end with a comma only a screen reader hears, so the
 * row is announced "Martin, viewing".
 */
export function PersonListItemStatus({ className, render, ...props }: PersonListItemStatusProps) {
  const { status } = personList();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "person-list-item-status",
    className: status({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
