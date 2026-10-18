import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { ChevronRight } from "lucide-react";
import type { SlotElementProps } from "../../lib/data-attributes";
import type { VariantProps } from "../../lib/tv";
import { listRow } from "./list-row.recipe";

export type ListRowGroupProps = useRender.ComponentProps<"div">;

/** An inset group: rows wrapped in a card (surface, hairline, radius-lg). */
export function ListRowGroup({ className, render, ...props }: ListRowGroupProps) {
  const { group } = listRow();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "list-row-group",
    className: group({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ListRowTone = "default" | "unread" | "muted" | "away";

export type ListRowProps = useRender.ComponentProps<"button"> &
  Pick<VariantProps<typeof listRow>, "variant"> & {
    /** Something waits for you here (bold title, ink preview), the place is
     *  muted (ink-2 title), or you are not in it yet (ink-3 title and preview). */
    tone?: ListRowTone;
    /** The item open beside the list: the row takes the cyan wash and stops
     *  reacting to hover. Say why it is selected with `aria-current` or
     *  `aria-selected` yourself. */
    selected?: boolean;
    /** `false` renders a display-only row: a `div` with no hover or press,
     *  for a row whose controls (a switch, a button) are its only targets. */
    interactive?: boolean;
  };

/**
 * One row of a list. It renders a `button` by default; pass `render={<a />}`
 * (or a router link) for a row that goes somewhere. Children are the leading
 * block (an avatar, a channel or icon tile, `ListRowIcon`), `ListRowBody`, and
 * anything trailing (a value, a badge, a switch, `ListRowChevron`).
 */
export function ListRow({
  variant = "default",
  tone = "default",
  selected = false,
  interactive = true,
  className,
  render,
  ...props
}: ListRowProps) {
  const { root } = listRow({ variant, interactive });
  const defaultProps: SlotElementProps<"button"> = {
    "data-slot": "list-row",
    "data-variant": variant,
    "data-tone": tone === "default" ? undefined : tone,
    "data-selected": selected ? "" : undefined,
    className: root({ className }),
    ...(interactive && !render ? { type: "button" } : {}),
  };

  return useRender({
    defaultTagName: interactive ? "button" : "div",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type ListRowIconProps = useRender.ComponentProps<"span">;

/** A 20px leading icon in ink-3: entry rows and settings. */
export function ListRowIcon({ className, render, ...props }: ListRowIconProps) {
  const { icon } = listRow();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "list-row-icon",
    "aria-hidden": true,
    className: icon({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ListRowBodyProps = useRender.ComponentProps<"span">;

/** The text column: the title and the preview, or a `ListRowTop` and a `ListRowBottom`. */
export function ListRowBody({ className, render, ...props }: ListRowBodyProps) {
  const { body } = listRow();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "list-row-body",
    className: body({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ListRowTopProps = useRender.ComponentProps<"span">;

/** The first line: the title, then the time. */
export function ListRowTop({ className, render, ...props }: ListRowTopProps) {
  const { line } = listRow();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "list-row-top",
    className: line({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ListRowBottomProps = useRender.ComponentProps<"span">;

/** The second line: the preview, then at most one badge. */
export function ListRowBottom({ className, render, ...props }: ListRowBottomProps) {
  const { line } = listRow();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "list-row-bottom",
    className: line({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ListRowTitleProps = useRender.ComponentProps<"span">;

/** 16/24 600 on one line; the row's tone sets its weight and ink. */
export function ListRowTitle({ className, render, ...props }: ListRowTitleProps) {
  const { title } = listRow();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "list-row-title",
    className: title({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ListRowDescriptionProps = useRender.ComponentProps<"span"> & {
  /** Let the text run onto more lines instead of truncating: a setting's
   *  consequence. */
  wrap?: boolean;
};

/** The preview (who spoke first: "Wug: …") or a setting's consequence, 14/20 ink-2. */
export function ListRowDescription({
  className,
  render,
  wrap = false,
  ...props
}: ListRowDescriptionProps) {
  const { description } = listRow({ wrap });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "list-row-description",
    className: description({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ListRowMetaProps = useRender.ComponentProps<"span">;

/** Machine-written facts in Space Mono 12, ink-3: the time, a gray count. */
export function ListRowMeta({ className, render, ...props }: ListRowMetaProps) {
  const { meta } = listRow();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "list-row-meta",
    className: meta({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ListRowValueProps = useRender.ComponentProps<"span">;

/** A setting's current value on the right, 15/20 ink-3, at most 45% of the row. */
export function ListRowValue({ className, render, ...props }: ListRowValueProps) {
  const { value } = listRow();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "list-row-value",
    className: value({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ListRowChevronProps = useRender.ComponentProps<"span">;

/** The ink-3 arrow of a row that opens another page. */
export function ListRowChevron({ className, render, ...props }: ListRowChevronProps) {
  const { chevron } = listRow();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "list-row-chevron",
    "aria-hidden": true,
    className: chevron({ className }),
    children: <ChevronRight />,
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
