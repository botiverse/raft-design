import { tv } from "../../lib/tv";

export const sidebarSectionRecipe = tv({
  slots: {
    sidebarSection: ["group/section", "px-0"],
    sidebarList: ["flex flex-col gap-0.5 py-2"],
    sidebarSectionEmpty: ["px-5 py-2", "font-sans text-footnote", "text-foreground-hint"],
    sidebarSectionHeader: [
      "flex items-center justify-between",
      "group/section-header",
      "my-0  h-auto gap-2 px-5 pt-4 pb-0",
    ],
    sidebarSectionDisclosure: [
      "flex min-w-0 flex-1 items-center",
      "**:data-[slot=sidebar-section-chevron]:transition-transform",
      "[&[data-panel-open]_[data-slot=sidebar-section-chevron]]:rotate-90",
      "h-auto gap-1.5 rounded-sticker border-0",
      "font-sans text-footnote font-bold normal-case tracking-normal text-foreground-hint",
      "outline-none focus-visible:shadow-focus",
      "**:data-[slot=sidebar-section-chevron]:size-3.5 **:data-[slot=sidebar-section-chevron]:stroke-2",
    ],
    sidebarSectionTitle: ["min-w-0 truncate"],
    sidebarSectionCount: ["font-mono text-mono-meta font-normal tabular-nums text-foreground-hint"],
    sidebarSectionAttention: [
      "inline-flex min-w-4.5 shrink-0 items-center justify-center",
      // Two of these used to style descendants off an ancestor's `:has()`.
      // That shape makes Chromium fall back to recalculating the whole page on
      // unrelated mutations (measured on the app: ~55ms per text-node change in
      // a 300-message channel, see #386). They now key off render-time data
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
      // Shown at rest where there is no hover (a touch screen, a tablet at any
      // width), on hover with a mouse: decided by the input, not the width
      // (design/patterns/responsive.md#touch-screens).
      "not-pointer-fine:static not-pointer-fine:pointer-events-auto not-pointer-fine:translate-y-0 not-pointer-fine:opacity-100",
      "pointer-fine:group-hover/section-header:pointer-events-auto pointer-fine:group-hover/section-header:opacity-100",
      "pointer-fine:focus-within:pointer-events-auto pointer-fine:focus-within:opacity-100",
      "pointer-fine:has-data-popup-open:pointer-events-auto pointer-fine:has-data-popup-open:opacity-100",
    ],
    // 28px tall in a 16px header line: it overhangs the line instead of
    // making the header taller.
    sidebarSectionControl: [
      "flex h-7 w-auto min-w-7 shrink-0 items-center justify-center p-0 -my-1.5",
      "[&>svg]:shrink-0 [&>svg:not([class*='size-'])]:size-4",
    ],
  },
});
