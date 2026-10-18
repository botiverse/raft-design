import { tv } from "../../lib/tv";

export const sidebarSectionRecipe = tv({
  slots: {
    sidebarSection: ["group/section", "px-0"],
    sidebarList: [],
    sidebarSectionEmpty: ["px-2 py-1.5", "font-sans text-footnote", "text-foreground-hint"],
    sidebarSectionHeader: [
      "flex items-center justify-between",
      "group/section-header",
      "mt-0 mb-0 h-auto gap-2 px-2 pt-4 pb-1.5",
    ],
    sidebarSectionDisclosure: [
      "flex min-w-0 flex-1 items-center",
      "**:data-[slot=sidebar-section-chevron]:transition-transform",
      "[&[data-panel-open]_[data-slot=sidebar-section-chevron]]:rotate-90",
      "h-auto gap-1.5 rounded-sticker border-0",
      "font-sans text-footnote font-bold normal-case tracking-normal text-foreground-hint",
      "outline-none focus-visible:shadow-raft-focus",
      "**:data-[slot=sidebar-section-chevron]:size-3.5 **:data-[slot=sidebar-section-chevron]:stroke-2",
    ],
    sidebarSectionTitle: ["min-w-0 truncate"],
    sidebarSectionCount: ["font-mono text-mono-meta font-normal tabular-nums text-foreground-hint"],
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
    // 28px tall in a 16px header line: it overhangs the line instead of
    // making the header taller.
    sidebarSectionControl: [
      "flex h-7 w-auto min-w-7 shrink-0 items-center justify-center p-0 -my-1.5",
      "[&>svg]:shrink-0 [&>svg:not([class*='size-'])]:size-4",
    ],
  },
});
