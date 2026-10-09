import { tv } from "../../lib/tv";

export const sidebarSectionRecipe = tv({
  slots: {
    sidebarSection: ["group/section"],
    sidebarList: [],
    sidebarSectionEmpty: [],
    sidebarSectionHeader: ["flex items-center justify-between", "group/section-header"],
    sidebarSectionDisclosure: [
      "flex min-w-0 flex-1 items-center",
      "**:data-[slot=sidebar-section-chevron]:transition-transform",
      "[&[data-panel-open]_[data-slot=sidebar-section-chevron]]:rotate-90",
    ],
    sidebarSectionTitle: ["min-w-0 truncate"],
    sidebarSectionCount: [],
    sidebarSectionAttention: [
      "inline-flex min-w-4.5 shrink-0 items-center justify-center",
      // Two of these used to style descendants off an ancestor's `:has()`.
      // That shape makes Chromium fall back to recalculating the whole page on
      // unrelated mutations (measured on the app: ~55ms per text-node change in
      // a 300-message channel, see #133). They now key off render-time data
      // attributes instead: the root carries `data-open` from Base UI
      // Collapsible, and a header that hosts a popup mirrors `data-popup-open`
      // onto itself while it is open.
      "group-data-open/section:hidden",
      "group-data-popup-open/section-header:hidden",
      "group-hover/section-header:hidden",
    ],
    sidebarSectionTrailing: ["relative flex min-w-4.5 shrink-0 items-center justify-end"],
    sidebarSectionControls: [
      "flex shrink-0 items-center gap-1",
      "pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 opacity-0",
      "max-md:static max-md:pointer-events-auto max-md:translate-y-0 max-md:opacity-100",
      "md:group-hover/section-header:pointer-events-auto md:group-hover/section-header:opacity-100",
      "md:focus-within:pointer-events-auto md:focus-within:opacity-100",
      "md:has-[[data-popup-open]]:pointer-events-auto md:has-[[data-popup-open]]:opacity-100",
    ],
    sidebarSectionControl: [
      "flex size-6 items-center justify-center p-0",
      "[&>svg]:shrink-0 [&>svg:not([class*='size-'])]:size-3.5",
    ],
  },
  variants: {
    theme: {
      brutal: {
        sidebarSection: "px-0",
        sidebarSectionHeader: "mt-3 mb-1 h-6 px-2",
        sidebarSectionEmpty: ["px-2", "font-sans text-xs leading-snug", "text-black/50"],
        sidebarSectionDisclosure: [
          "h-6 gap-1.5 border-2 border-transparent text-xs font-bold tracking-widest uppercase",
          "text-black transition-colors hover:text-black/70",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[black]",
        ],
        sidebarSectionCount: [
          "font-mono text-xs font-medium normal-case tracking-normal text-black/70",
        ],
        sidebarSectionControl: [
          "font-sans font-bold text-black/70",
          "transition-colors duration-100",
          "hover:bg-black/5 hover:text-black active:bg-black/10",
          "focus:outline-none focus-visible:bg-black/5 focus-visible:text-black focus-visible:outline-none",
        ],
      },
      elegant: {
        sidebarSection: "px-0",
        sidebarSectionEmpty: [
          "px-(--sidebar-row-inset-x,6px)",
          "text-xs leading-snug",
          "text-foreground-icon",
        ],
        sidebarSectionHeader: [
          "relative -mx-(--sidebar-row-inset-x,6px) mt-4 mb-0 h-8 w-[calc(100%+12px)] rounded-md px-0",
          "hover:bg-fill-strong/80",
          "dark:hover:bg-ink-6",
        ],
        sidebarSectionDisclosure: [
          "h-8 w-full justify-start gap-1.5 rounded-md border border-transparent px-(--sidebar-row-inset-x,6px) text-xs font-medium leading-none normal-case tracking-normal",
          "text-foreground-icon",
          "hover:text-foreground-strong",
          "**:data-[slot=sidebar-section-chevron]:opacity-55",
        ],
        sidebarSectionCount:
          "shrink-0 font-sans text-xs font-medium leading-none normal-nums text-foreground-icon",
        sidebarSectionTrailing: "pr-(--sidebar-row-inset-x,6px)",
        sidebarSectionControls: "right-(--sidebar-row-inset-x,6px)",
        sidebarSectionControl: ["shrink-0", "text-foreground-icon hover:text-foreground-strong"],
      },
    },
  },
});
