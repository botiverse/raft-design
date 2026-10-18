import { tv } from "../../lib/tv";

export const card = tv({
  slots: {
    root: ["flex min-w-0 flex-col overflow-hidden", "text-foreground"],
    header: [
      "group/card-header grid min-w-0 auto-rows-min grid-cols-1 items-start gap-x-4 gap-y-1",
      "has-[>[data-slot=card-leading]]:grid-cols-[auto_minmax(0,1fr)]",
      "has-[>[data-slot=card-trailing]]:grid-cols-[minmax(0,1fr)_auto]",
      "has-[>[data-slot=card-leading]]:has-[>[data-slot=card-trailing]]:grid-cols-[auto_minmax(0,1fr)_auto]",
      // Column placement of the text/trailing parts depends on the leading part;
      // the header mirrors that into variables instead of styling descendants
      // from an ancestor `:has()` (a whole-page recalc trap, #133).
      "has-[>[data-slot=card-leading]]:[--card-text-col:2]",
      "has-[>[data-slot=card-leading]]:[--card-trailing-col:3]",
    ],
    title: [
      "row-start-1 min-w-0",
      "col-start-(--card-text-col,1)",
      "font-sans text-card-title font-card-title text-foreground",
    ],
    leading: [
      "col-start-1 row-span-2 row-start-1",
      "flex shrink-0 items-center self-start",
      "[&>svg]:size-4 [&>svg]:shrink-0",
      "min-h-(--card-title-line-height)",
    ],
    description: [
      "row-start-2 min-w-0",
      "col-start-(--card-text-col,1)",
      "font-sans text-callout text-pretty text-foreground-muted",
    ],
    trailing: [
      "row-start-1 col-start-(--card-trailing-col,2)",
      "flex shrink-0 items-center self-center justify-self-end",
    ],
    content: ["min-w-0"],
    footer: [
      "flex min-w-0 gap-2",
      "flex-nowrap items-center",
      "font-sans text-caption text-foreground-hint",
      "[&>svg]:size-3.5 [&>svg]:shrink-0",
      "[&>:not(svg)]:min-w-0",
    ],
  },
  variants: {
    variant: {
      default: {
        root: ["rounded-container border border-line-muted bg-layer-card", "shadow-none"],
        header: ["p-4 has-[+[data-slot=card-content]]:pb-0"],
        content: ["p-4"],
        footer: ["border-t border-line-muted px-4 py-3"],
      },
      /** A selectable option INSIDE a form, not a panel on top of one: it sits
       *  in the control plane, and its title drops from the card-title scale
       *  to the field scale so it cannot outrank the field label above it. */
      option: {
        root: ["rounded-control border-[1.5px] border-line-field bg-layer-card", "shadow-none"],
        header: ["gap-x-3 p-3"],
        content: ["px-3 pb-3"],
        title: ["font-sans text-callout font-semibold"],
        description: ["font-sans text-footnote text-foreground-muted"],
      },
      inset: {
        root: ["rounded-container border border-line-muted bg-layer-card", "shadow-none"],
        header: ["px-4 py-3"],
        content: ["border-t border-line-muted p-4 first:border-t-0"],
        footer: ["border-t border-line-muted px-4 py-3"],
      },
    },
  },
  defaultVariants: {
    variant: "default",
  },
});
