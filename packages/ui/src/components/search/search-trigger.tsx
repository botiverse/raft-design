import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { tv } from "../../lib/tv";
import { Kbd } from "../kbd/index";
import type { KbdProps } from "../kbd/index";

// Raft Design System › Search, the web top bar: the search box that opens the
// search dialog. It reads as a field (36 tall, the 1.5px field line, surface,
// the placeholder in ink-3) but it is a button: pressing it opens the dialog
// whose own field grows out of it. Like every field it doesn't hover; a press
// lays the medium overlay. Disabled, it is a disabled field (sunken, a
// hairline, ink-disabled) and the press overlay is reset, not drawn.
const searchTrigger = tv({
  slots: {
    root: [
      "relative inline-flex h-9 w-[clamp(360px,32vw,520px)] max-w-full min-w-0 shrink-0 items-center gap-2 px-3",
      "rounded-control border-[1.5px] border-line-field bg-layer-card",
      "text-left font-sans text-body font-normal text-foreground-hint",
      "select-none outline-none transition-colors duration-100",
      "active:overlay-medium focus-visible:shadow-focus",
      "disabled:cursor-not-allowed disabled:border-line-hairline disabled:bg-fill-muted disabled:bg-none disabled:text-foreground-disabled",
      "aria-disabled:cursor-not-allowed aria-disabled:border-line-hairline aria-disabled:bg-fill-muted aria-disabled:bg-none aria-disabled:text-foreground-disabled",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&>svg:not([class*='size-'])]:size-[18px]",
    ],
    label: ["min-w-0 flex-1 truncate"],
    shortcut: ["ml-auto shrink-0"],
  },
});

export type SearchTriggerProps = useRender.ComponentProps<"button">;

/** The top bar's search box. Children: a search icon, a `SearchTriggerLabel`
 *  and an optional `SearchTriggerShortcut`. */
export function SearchTrigger({ className, render, ...props }: SearchTriggerProps) {
  const { root } = searchTrigger();
  const defaultProps: SlotElementProps<"button"> = {
    "data-slot": "search-trigger",
    className: root({ className }),
    ...(render ? {} : { type: "button" }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type SearchTriggerLabelProps = useRender.ComponentProps<"span">;

/** The placeholder ("Search Raft"), truncated before the shortcut gives way. */
export function SearchTriggerLabel({ className, render, ...props }: SearchTriggerLabelProps) {
  const { label } = searchTrigger();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "search-trigger-label",
    className: label({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type SearchTriggerShortcutProps = KbdProps;

/** The shortcut that opens search, at the right end. */
export function SearchTriggerShortcut({ className, ...props }: SearchTriggerShortcutProps) {
  const { shortcut } = searchTrigger();
  return <Kbd data-slot="search-trigger-shortcut" className={shortcut({ className })} {...props} />;
}
