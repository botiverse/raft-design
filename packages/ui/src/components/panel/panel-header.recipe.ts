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
    headerIcon: [
      "flex size-9 shrink-0 items-center justify-center",
      "border-2",
      "[&_svg]:size-4.5 [&_svg]:shrink-0",
    ],
    headerContent: ["min-w-0 flex-1"],
    heading: ["flex min-w-0 items-center gap-2"],
    title: ["truncate text-base font-bold leading-tight"],
    meta: ["min-w-0 truncate font-mono text-xs"],
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
        headerIcon: "border-black bg-primary text-black",
        headerContent: [
          "flex flex-col",
          "has-[>[data-slot=panel-header-icon]]:grid has-[>[data-slot=panel-header-icon]]:grid-cols-[auto_minmax(0,1fr)]",
          "has-[>[data-slot=panel-header-icon]]:items-center has-[>[data-slot=panel-header-icon]]:gap-x-3",
          "has-[>[data-slot=panel-meta]]:[&>[data-slot=panel-header-icon]]:row-span-2",
          "has-[>[data-slot=panel-header-icon]]:[&>[data-slot=panel-heading]]:col-start-2",
          "has-[>[data-slot=panel-header-icon]]:[&>[data-slot=panel-title]]:col-start-2",
          "has-[>[data-slot=panel-header-icon]]:[&>[data-slot=panel-meta]]:col-start-2",
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
          "size-auto rounded-none border-0 bg-transparent",
          "text-foreground-muted",
          "[&_svg]:size-3.5 [&_svg]:stroke-[2.5]",
          "max-md:col-start-2 max-md:row-start-1 max-md:self-center",
        ],
        headerContent: [
          "flex flex-col md:flex-row md:items-center md:gap-2",
          "md:has-[>[data-slot=panel-meta]]:items-baseline",
          "max-md:col-start-1 max-md:row-start-1 max-md:min-w-0 max-md:gap-1 max-md:self-center",
          "max-md:has-[>[data-slot=panel-header-icon]]:grid max-md:has-[>[data-slot=panel-header-icon]]:grid-cols-[auto_minmax(0,1fr)]",
          "max-md:has-[>[data-slot=panel-header-icon]]:items-center max-md:has-[>[data-slot=panel-header-icon]]:gap-x-2",
          "max-md:has-[>[data-slot=panel-meta]]:[&>[data-slot=panel-header-icon]]:row-span-2",
          "max-md:has-[>[data-slot=panel-header-icon]]:[&>[data-slot=panel-heading]]:col-start-2",
          "max-md:has-[>[data-slot=panel-header-icon]]:[&>[data-slot=panel-title]]:col-start-2",
          "max-md:has-[>[data-slot=panel-header-icon]]:[&>[data-slot=panel-meta]]:col-span-2",
          "max-md:has-[>[data-slot=panel-header-icon]]:[&>[data-slot=panel-meta]]:col-start-1",
          "max-md:has-[>[data-slot=panel-header-icon]]:col-start-2 max-md:has-[>[data-slot=panel-header-icon]]:col-span-2",
          "max-md:has-[>[data-slot=panel-header-icon]]:self-center",
          "max-md:has-[>[data-slot=panel-header-icon]]:[&>[data-slot=panel-header-icon]]:col-start-1",
          "md:has-[>[data-slot=panel-header-icon]]:[&>[data-slot=panel-header-icon]]:self-center",
        ],
        title: [
          "font-heading text-[17px] font-medium leading-tight tracking-tight tabular-nums",
          "text-foreground-muted",
        ],
        meta: "font-sans leading-none text-foreground-placeholder max-md:leading-tight",
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
      class: "flex h-[var(--shell-header-height,62px)] shrink-0 items-center gap-2",
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
        "relative isolate h-auto min-h-[var(--shell-header-height,56px)] max-md:z-10 [@media(max-height:600px)]:h-auto",
        "border-b-0 bg-transparent max-md:bg-layer-canvas-muted",
        "max-md:grid max-md:grid-cols-[auto_auto_minmax(0,1fr)_auto]",
        "max-md:h-[var(--shell-header-height,56px)] max-md:items-center",
        "px-0 max-md:pl-5 max-md:pr-3.5 md:pl-9 md:pr-5",
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
        "[@media(max-height:600px)]:h-[var(--shell-header-height,62px)]",
        "max-md:[&>[data-slot=panel-header-icon]]:hidden",
        "md:[&>[data-slot=panel-header-icon]]:size-10",
        "md:[&>[data-slot=panel-header-icon]]:bg-primary-400",
        "max-md:[&>[data-slot=panel-actions]]:gap-2.5",
      ],
    },
    { slots: ["sectionHeader"], theme: "elegant", class: "max-md:before:hidden" },
  ],
});
