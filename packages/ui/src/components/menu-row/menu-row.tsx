import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { Check } from "lucide-react";
import type { SlotElementProps } from "../../lib/data-attributes";
import { tv } from "../../lib/tv";
import { Kbd } from "../kbd/index";
import type { KbdProps } from "../kbd/index";

// Raft Design System › Menu, for a row that is not in a Base UI menu: 36 tall,
// a 16px ink-2 icon, 14/20 500. The pointer and the keyboard highlight it in
// yellow-soft; the current value is bold with a check. It is a plain button:
// no menu role, no arrow keys, no typeahead. A list of actions belongs in
// DropdownMenu or ContextMenu, whose items get all of that.
const menuRow = tv({
  slots: {
    list: ["flex w-60 max-w-full flex-col p-1.5"],
    root: [
      "flex w-full min-w-0 cursor-default select-none items-center [@media(max-height:600px)]:py-1",
      "text-left no-underline outline-none transition-colors",
      "min-h-9 gap-2.5 rounded-control px-2.5 py-1.5",
      "font-sans text-callout font-medium text-foreground",
      "not-disabled:not-aria-disabled:hover:bg-primary-soft focus-visible:bg-primary-soft data-highlighted:bg-primary-soft",
      "aria-checked:font-bold aria-selected:font-bold aria-[current=page]:font-bold aria-[current=true]:font-bold data-checked:font-bold",
      "disabled:text-foreground-disabled aria-disabled:text-foreground-disabled",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&>svg:not([class*='size-'])]:size-4",
      "[&>svg]:text-foreground-icon disabled:[&>svg]:text-foreground-disabled aria-disabled:[&>svg]:text-foreground-disabled",
    ],
    label: ["min-w-0 flex-1 truncate"],
    check: [
      "ml-auto flex size-4 shrink-0 items-center justify-center",
      "text-foreground [&_svg]:size-4",
    ],
    shortcut: [
      "ml-auto",
      "h-auto min-w-0 rounded-none bg-transparent p-0 shadow-none inset-ring-0",
      "font-mono text-mono-meta font-normal text-foreground-hint",
    ],
  },
});

export type MenuRowListProps = useRender.ComponentProps<"div">;

/** The column of rows inside a popover: the menu's 240 width and 6px inset. */
export function MenuRowList({ className, render, ...props }: MenuRowListProps) {
  const { list } = menuRow();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "menu-row-list",
    className: list({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type MenuRowProps = useRender.ComponentProps<"button"> & {
  /** A highlight the caller drives, such as the active row of a finder whose
   *  focus stays in its input. */
  highlighted?: boolean;
};

/**
 * The look of a menu item on a plain button, for a list of choices in a
 * popover that is not a menu. Mark the current value with `aria-checked`,
 * `aria-selected` or `aria-current` (it turns bold) and a `MenuRowCheck`.
 */
export function MenuRow({ highlighted = false, className, render, ...props }: MenuRowProps) {
  const { root } = menuRow();
  const defaultProps: SlotElementProps<"button"> = {
    "data-slot": "menu-row",
    "data-highlighted": highlighted ? "" : undefined,
    className: root({ className }),
    ...(render ? {} : { type: "button" }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type MenuRowLabelProps = useRender.ComponentProps<"span">;

/** The row's words: they take the room and truncate. */
export function MenuRowLabel({ className, render, ...props }: MenuRowLabelProps) {
  const { label } = menuRow();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "menu-row-label",
    className: label({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type MenuRowCheckProps = useRender.ComponentProps<"span">;

/** The ink check at the end of the current value's row; decorative. */
export function MenuRowCheck({ className, render, ...props }: MenuRowCheckProps) {
  const { check } = menuRow();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "menu-row-check",
    "aria-hidden": true,
    className: check({ className }),
    children: <Check />,
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type MenuRowShortcutProps = KbdProps;

/** The shortcut at the end of the row, Space Mono 12 ink-3. */
export function MenuRowShortcut({ className, ...props }: MenuRowShortcutProps) {
  const { shortcut } = menuRow();
  return <Kbd data-slot="menu-row-shortcut" className={shortcut({ className })} {...props} />;
}
