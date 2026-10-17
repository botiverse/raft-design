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
    title: ["row-start-1 min-w-0", "col-start-(--card-text-col,1)"],
    leading: [
      "col-start-1 row-span-2 row-start-1",
      "flex shrink-0 items-center self-start",
      "[&>svg]:size-4 [&>svg]:shrink-0",
    ],
    description: ["row-start-2 min-w-0", "col-start-(--card-text-col,1)"],
    trailing: [
      "row-start-1 col-start-(--card-trailing-col,2)",
      "flex shrink-0 items-center self-center justify-self-end",
    ],
    content: ["min-w-0"],
    footer: ["flex min-w-0 flex-wrap items-center gap-2"],
  },
  variants: {
    theme: {
      brutal: {
        leading: ["min-h-(--card-title-line-height)"],
        title: ["font-heading text-card-title font-card-title"],
        description: ["font-sans text-sm leading-5 text-foreground-strong/60"],
        footer: [
          "flex-nowrap items-center",
          "font-sans text-xs leading-4 text-foreground-muted",
          "[&>svg]:size-3.5 [&>svg]:shrink-0",
          "[&>:not(svg)]:min-w-0",
        ],
      },
      elegant: {
        leading: ["min-h-(--card-title-line-height)"],
        title: ["font-sans text-card-title font-card-title"],
        description: [
          "font-sans text-xs leading-4 tracking-[0.01em] text-pretty",
          "text-foreground-muted",
        ],
        footer: [
          "flex-nowrap items-center",
          "font-sans text-xs leading-4 text-foreground-hint",
          "[&>svg]:size-3.5 [&>svg]:shrink-0",
          "[&>:not(svg)]:min-w-0",
        ],
      },
      raft: {
        leading: ["min-h-(--card-title-line-height)"],
        title: ["font-sans text-card-title font-card-title text-foreground"],
        description: ["font-sans text-callout text-pretty text-foreground-muted"],
        footer: [
          "flex-nowrap items-center",
          "font-sans text-caption text-foreground-hint",
          "[&>svg]:size-3.5 [&>svg]:shrink-0",
          "[&>:not(svg)]:min-w-0",
        ],
      },
    },
    variant: {
      default: {},
      /** A selectable option INSIDE a form, not a panel on top of one.
       *
       *  `default` is panel chrome: brutal gives it `shadow-raft-md` (4px) while
       *  every control in a form — Input, SelectTrigger — sits at
       *  `shadow-raft-sm` (2px). In brutal the shadow offset IS the elevation,
       *  so a default Card used as a checkbox row renders one step above the
       *  fields around it and reads as a floating panel rather than a boxed
       *  choice. `option` puts it back in the control plane and drops the title
       *  from the card-title scale to the field scale, so it cannot outrank the
       *  field label above it. */
      option: {},
      inset: {},
    },
  },
  defaultVariants: {
    variant: "default",
  },
  compoundVariants: [
    {
      theme: "brutal",
      variant: "default",
      class: {
        root: ["border-2 border-line-strong bg-layer-panel", "shadow-raft-md"],
        header: "border-b-2 border-line-strong p-4",
        content: "p-4",
        footer: "border-t-2 border-line-strong bg-layer-inset px-4 py-3",
      },
    },
    {
      theme: "brutal",
      variant: "inset",
      class: {
        root: ["border-2 border-line-strong bg-layer-panel px-2", "shadow-raft-md"],
        header: "px-4 py-3",
        content: "-mx-2 border-y-2 border-line-strong bg-layer-panel px-6 py-4",
        footer: "px-4 py-3",
      },
    },
    {
      theme: "brutal",
      variant: "option",
      class: {
        // Input's own chrome, so the two read as siblings.
        root: ["border-2 border-line-strong bg-layer-panel", "shadow-raft-sm"],
        // gap-x-3.5 (14px), not the base gap-x-4 (16px): the gap between a
        // leading control and its title should match the card's own left inset
        // — 2px border + 12px padding — so the option reads as one row on a
        // single rhythm rather than a control sitting apart from its label
        // (@cindyz, 2026-09-03).
        header: "gap-x-3.5 p-3",
        content: "px-3 pb-3",
        title: ["font-heading text-sm leading-5 font-bold"],
        description: ["font-sans text-xs leading-4"],
      },
    },
    {
      theme: "elegant",
      variant: "default",
      class: {
        root: [
          "rounded-lg border-[0.5px] border-line-muted bg-layer-panel",
          "shadow-raft-xs dark:border-transparent",
        ],
        header: "p-5 has-[+[data-slot=card-content]]:pb-0",
        content: "p-5",
        footer: [
          "border-t border-line-hairline bg-layer-inset px-5 py-3.5",
          "dark:border-transparent dark:bg-transparent",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "inset",
      class: {
        root: [
          "rounded-lg border-[0.5px] border-line-muted bg-layer-card p-[2px]",
          "shadow-raft-xs dark:border-transparent",
        ],
        header: "px-5 py-3.5",
        content: [
          "overflow-clip rounded-[5.5px] border-[0.5px] border-line-hairline bg-layer-panel p-5",
          "dark:border-transparent dark:shadow-[inset_0_1px_0_oklch(1_0_0/0.04),0_0_0_1px_oklch(0_0_0/0.35)]",
        ],
        footer: "px-5 py-3",
      },
    },
    {
      theme: "elegant",
      variant: "option",
      class: {
        // Input's elegant chrome: hairline border, rounded, no lift.
        root: ["rounded-md border border-line-field bg-layer-panel", "shadow-none"],
        // Same 14px as brutal. Elegant's own inset is 13px (1px border + 12px
        // padding), so the gap is 1px wider than the inset here rather than
        // exactly equal — matching the requested 14 rather than drifting the
        // two themes apart.
        header: "gap-x-3.5 p-3",
        content: "px-3 pb-3",
        title: ["font-sans text-sm leading-5 font-semibold"],
        description: ["font-sans text-xs leading-4"],
      },
    },
    {
      theme: "raft",
      variant: "default",
      class: {
        root: ["rounded-container border border-line-muted bg-layer-card", "shadow-none"],
        header: "p-4 has-[+[data-slot=card-content]]:pb-0",
        content: "p-4",
        footer: "border-t border-line-muted px-4 py-3",
      },
    },
    {
      theme: "raft",
      variant: "inset",
      class: {
        root: ["rounded-container border border-line-muted bg-layer-card", "shadow-none"],
        header: "px-4 py-3",
        content: "border-t border-line-muted p-4 first:border-t-0",
        footer: "border-t border-line-muted px-4 py-3",
      },
    },
    {
      theme: "raft",
      variant: "option",
      class: {
        root: ["rounded-control border-[1.5px] border-line-field bg-layer-card", "shadow-none"],
        header: "gap-x-3 p-3",
        content: "px-3 pb-3",
        title: ["font-sans text-callout font-semibold"],
        description: ["font-sans text-footnote text-foreground-muted"],
      },
    },
  ],
});
