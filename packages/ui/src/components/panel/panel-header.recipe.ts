import { tv } from "../../lib/tv";

/**
 * `header` and `sectionHeader` share one bar treatment, expressed through
 * `compoundSlots`. The elegant mobile grid is the shared default header layout,
 * not a conversation-only one: columns are [leading control][icon][content][actions],
 * and `headerContent`, `headerIcon`, and `actions` place themselves into it.
 * Conversation headers, the tasks section header, and the browse rail all rely on it;
 * `profile-panel` opts out with `max-md:flex`.
 */
export const panelHeader = tv({
  slots: {
    header: [],
    sectionHeader: [],
    headerIcon: ["flex size-9 shrink-0 items-center justify-center", "border-2"],
    headerContent: ["min-w-0 flex-1"],
    // The header content mirrors icon/meta presence into variables these parts
    // read, instead of styling them (descendants) off a self-`:has()`; see the
    // theme blocks (#133).
    heading: ["flex min-w-0 items-center gap-2", "col-start-(--ph-text-col,auto)"],
    title: ["truncate text-base font-bold leading-tight", "col-start-(--ph-text-col,auto)"],
    meta: [
      "min-w-0 truncate font-mono text-xs",
      "col-start-(--ph-meta-col,auto)",
      "col-end-(--ph-meta-end,auto)",
    ],
    status: [
      "inline-flex shrink-0 items-center gap-1",
      "px-1.5 py-1 text-[11px] font-bold uppercase leading-none",
      "[&_svg]:size-[11px] [&_svg]:shrink-0",
    ],
    activity: [
      "inline-flex shrink-0 items-center gap-1.5",
      "text-xs leading-none",
      "[&_svg]:size-[11px] [&_svg]:shrink-0",
    ],
    actions: ["flex shrink-0 items-center gap-1.5 max-md:gap-0.5"],
  },
  variants: {
    theme: {
      brutal: {
        headerIcon:
          "border-black bg-primary text-black row-start-(--ph-icon-row-start,auto) row-end-(--ph-icon-row-end,auto)",
        headerContent: [
          "flex flex-col",
          "has-[>[data-slot=panel-header-icon]]:grid has-[>[data-slot=panel-header-icon]]:grid-cols-[auto_minmax(0,1fr)]",
          "has-[>[data-slot=panel-header-icon]]:items-center has-[>[data-slot=panel-header-icon]]:gap-x-3",
          // Child placement is mirrored into variables the parts read; styling
          // descendants off a self-:has() would be a whole-page recalc trap
          // (#133).
          "has-[>[data-slot=panel-meta]]:[--ph-icon-row-start:span_2] has-[>[data-slot=panel-meta]]:[--ph-icon-row-end:span_2]",
          "has-[>[data-slot=panel-header-icon]]:[--ph-text-col:2]",
          "has-[>[data-slot=panel-header-icon]]:[--ph-meta-col:2]",
        ],
        title: "text-black",
        meta: "text-black/50",
        status: "border-2 border-black bg-brutal-orange/25 text-black",
        activity: "text-black",
        actions: ["max-md:gap-1.5", "[&_[data-slot=tabs-list]]:gap-0"],
      },
      elegant: {
        actions: [
          "max-md:col-start-4 max-md:row-start-1 max-md:self-center",
          "[&_[data-slot=tabs-list]]:gap-2",
        ],
        headerIcon: [
          // Chip ladder (cindyz 2026-10-10, #737): fill-muted read 1.04:1
          // against the canvas-muted header — physically invisible; fill-strong
          // is the visible-but-restrained step. Avatar slots declare
          // data-icon-kind="avatar" and drop the chip entirely.
          "size-9 rounded-md border-0 bg-fill-strong",
          "data-[icon-kind=avatar]:bg-transparent",
          "text-foreground-icon",
          "max-md:[grid-column-start:var(--ph-icon-col,2)]",
          "max-md:[grid-row-start:var(--ph-icon-row-start,1)] max-md:[grid-row-end:var(--ph-icon-row-end,auto)]",
          "max-md:self-center",
          "md:[align-self:var(--ph-icon-self,auto)]",
        ],
        headerContent: [
          "flex flex-col md:flex-row md:items-center md:gap-2",
          "md:has-[>[data-slot=panel-meta]]:items-baseline",
          "max-md:col-start-1 max-md:row-start-1 max-md:min-w-0 max-md:gap-1 max-md:self-center",
          "max-md:has-[>[data-slot=panel-header-icon]]:grid max-md:has-[>[data-slot=panel-header-icon]]:grid-cols-[auto_minmax(0,1fr)]",
          "max-md:has-[>[data-slot=panel-header-icon]]:items-center max-md:has-[>[data-slot=panel-header-icon]]:gap-x-2",
          // See the brutal block above: child placement is mirrored into
          // variables the parts read (#133).
          "max-md:has-[>[data-slot=panel-meta]]:[--ph-icon-row-start:span_2] max-md:has-[>[data-slot=panel-meta]]:[--ph-icon-row-end:span_2]",
          "max-md:has-[>[data-slot=panel-header-icon]]:[--ph-text-col:2]",
          "max-md:has-[>[data-slot=panel-header-icon]]:[--ph-meta-col:1]",
          "max-md:has-[>[data-slot=panel-header-icon]]:[--ph-meta-end:span_2]",
          "max-md:has-[>[data-slot=panel-header-icon]]:[--ph-icon-col:1]",
          "max-md:has-[>[data-slot=panel-header-icon]]:col-start-2 max-md:has-[>[data-slot=panel-header-icon]]:col-span-2",
          "max-md:has-[>[data-slot=panel-header-icon]]:self-center",
          "md:has-[>[data-slot=panel-header-icon]]:[--ph-icon-self:center]",
        ],
        title: [
          "font-heading text-[17px] font-medium leading-tight tracking-tight tabular-nums",
          "text-foreground-muted",
        ],
        // Desktop puts the name and the description on one row. The name is
        // what identifies the panel, so it keeps its full width (up to the
        // row) and the description only takes what is left, truncating or
        // collapsing to nothing first.
        heading: "md:max-w-full md:shrink-0",
        meta: [
          "font-sans leading-none text-foreground-placeholder max-md:leading-tight",
          "md:flex-1 md:basis-0",
        ],
        status: [
          "border-0 bg-transparent p-0",
          "text-foreground-placeholder",
          "[&_svg]:size-[13px]",
        ],
        activity: ["text-foreground-placeholder", "[&_svg]:size-[13px]"],
      },
    },
    size: {
      sm: {},
      md: { meta: "text-sm" },
    },
  },
  compoundSlots: [
    { slots: ["header", "sectionHeader"], class: "max-md:sticky max-md:top-0 max-md:z-30" },
    {
      slots: ["header", "sectionHeader"],
      class: "flex h-(--shell-header-height,62px) shrink-0 items-center gap-2",
    },
    {
      slots: ["header", "sectionHeader"],
      theme: "brutal",
      class: "gap-3 border-b-2 border-black bg-white px-5",
    },
    {
      slots: ["header", "sectionHeader"],
      theme: "elegant",
      class: [
        "relative isolate h-auto min-h-(--shell-header-height,56px) max-md:z-10 [@media(max-height:600px)]:h-auto",
        "border-b-0 bg-transparent max-md:bg-layer-canvas-muted",
        "max-md:grid max-md:grid-cols-[auto_auto_minmax(0,1fr)_auto]",
        "max-md:h-[var(--shell-header-height,56px)] max-md:items-center",
        "px-0 max-md:pl-5 max-md:pr-3.5 md:pl-5 md:pr-5 md:gap-3",
        "max-md:[&>button+[data-slot=panel-header-content]]:col-start-2",
        "max-md:[&>a+[data-slot=panel-header-content]]:col-start-2",
      ],
    },
    {
      slots: ["sectionHeader"],
      theme: "brutal",
      class: [
        "max-md:before:hidden",
        "max-md:bg-primary-400",
        "[@media(max-height:600px)]:h-(--shell-header-height,62px)",
        "max-md:[&>[data-slot=panel-header-icon]]:hidden",
        "md:[&>[data-slot=panel-header-icon]]:size-10",
        "md:[&>[data-slot=panel-header-icon]]:bg-primary-400",
        "max-md:[&>[data-slot=panel-actions]]:gap-2.5",
      ],
    },
    { slots: ["sectionHeader"], theme: "elegant", class: "max-md:before:hidden" },
  ],
});
