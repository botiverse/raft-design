import { tv } from "../../lib/tv";

export const chatSidebarSection = tv({
  slots: {
    sidebarSection: ["px-2"],
    sidebarList: [],
    sidebarSectionHeader: [
      "mt-3 mb-1 flex h-6 items-center justify-between px-2",
      "group/section-header",
    ],
    sidebarSectionButton: [
      "flex h-6 min-w-0 flex-1 items-center gap-1",
      "text-xs font-bold tracking-widest uppercase",
      "[&_svg]:transition-transform [&[data-panel-open]_svg]:rotate-90",
    ],
    sidebarSectionTitle: ["min-w-0 truncate"],
    sidebarSectionCount: ["font-mono normal-case tracking-normal"],
    sidebarSectionIndicator: [
      "inline-flex min-w-[18px] shrink-0 items-center justify-center",
      "group-has-[[data-panel-open]]/section-header:hidden",
      "group-has-[[data-popup-open]]/section-header:hidden",
      "group-hover/section-header:hidden",
    ],
    sidebarSectionTrailing: ["relative flex min-w-[18px] shrink-0 items-center justify-end"],
    sidebarSectionActions: [
      "flex shrink-0 items-center gap-1",
      "pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 opacity-0",
      "max-md:static max-md:pointer-events-auto max-md:translate-y-0 max-md:opacity-100",
      "md:group-hover/section-header:pointer-events-auto md:group-hover/section-header:opacity-100",
      "md:focus-within:pointer-events-auto md:focus-within:opacity-100",
      "md:has-[[data-popup-open]]:pointer-events-auto md:has-[[data-popup-open]]:opacity-100",
    ],
    sidebarSectionAction: [
      "flex size-6 items-center justify-center p-0",
      "[&>svg]:shrink-0 [&>svg:not([class*='size-'])]:size-3.5",
    ],
  },
  variants: {
    theme: {
      brutal: {
        sidebarSection: "px-0",
        sidebarSectionButton: [
          "text-black transition-colors hover:text-black/70",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:[outline-color:black]",
        ],
        sidebarSectionCount: "text-[12px] font-medium text-black/70",
        sidebarSectionAction: [
          "font-sans font-bold text-black/70",
          "transition-colors duration-100",
          "hover:bg-black/5 hover:text-black active:bg-black/10",
          "focus:outline-none focus-visible:bg-black/5 focus-visible:text-black focus-visible:outline-none",
        ],
      },
      elegant: {
        sidebarSection: "px-0",
        sidebarSectionHeader: [
          "relative -mx-[var(--sidebar-row-inset-x,6px)] mt-4 mb-0 flex h-8 w-[calc(100%+12px)] items-center justify-between rounded-md px-0",
          "group/section-header",
          "hover:bg-layer-strong/80",
        ],
        sidebarSectionButton: [
          "h-8 w-full justify-start gap-1.5 rounded-md px-[var(--sidebar-row-inset-x,6px)] text-[12px] font-medium leading-none normal-case tracking-normal",
          "text-foreground-icon",
          "hover:text-foreground",
          "[&>svg]:opacity-55",
        ],
        sidebarSectionCount:
          "shrink-0 font-sans text-[12px] font-medium leading-none normal-nums text-foreground-icon",
        sidebarSectionTrailing: "pr-[var(--sidebar-row-inset-x,6px)]",
        sidebarSectionActions: "right-[var(--sidebar-row-inset-x,6px)]",
        sidebarSectionAction: [
          "shrink-0",
          "text-foreground-icon hover:text-foreground",
          "hover:!bg-transparent active:!bg-transparent",
          "hover:before:!bg-transparent active:before:!bg-transparent",
          "focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0",
        ],
      },
    },
  },
});
