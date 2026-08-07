import { tv } from "../../lib/tv";

export const activityInboxSidebar = tv({
  slots: {
    sidebar: ["w-48 shrink-0", "max-md:hidden", "md:flex"],
    sidebarBody: [],
    sidebarContent: ["p-3"],
    sidebarHeading: ["mb-1 mt-5 flex items-center gap-2 px-2"],
    sidebarHeadingLabel: ["flex-1 text-[10px] uppercase"],
    navigationItem: [
      "flex w-full items-center gap-2 border-2 px-2.5 py-2 text-left",
      "transition-colors disabled:pointer-events-none disabled:opacity-50",
      "[&_svg]:shrink-0",
    ],
    navigationLabel: ["min-w-0 flex-1 truncate"],
    navigationCount: ["shrink-0"],
  },
  variants: {
    theme: {
      brutal: {
        sidebar: ["border-r-2 border-black"],
        sidebarBody: ["bg-white"],
        sidebarHeadingLabel: ["font-black tracking-widest text-black/40"],
        navigationItem: [
          "border-transparent text-xs font-bold text-black",
          "hover:border-black/30 hover:bg-black/5",
          "data-active:border-black data-active:bg-primary-400 data-active:shadow-raft-sm",
        ],
        navigationCount: ["font-mono text-black/45"],
      },
      elegant: {
        sidebar: ["w-56", "dark:bg-layer-canvas-muted"],
        sidebarHeadingLabel: ["font-medium tracking-wider text-foreground-placeholder"],
        navigationItem: [
          "rounded-md border-transparent text-[13px] font-medium text-foreground-muted",
          "hover:border-transparent hover:bg-fill-strong/80 hover:text-foreground-strong",
          "dark:hover:bg-ink-6",
          "data-active:border-transparent data-active:bg-layer-panel data-active:text-foreground",
          "data-[active]:shadow-sm data-active:ring-1 data-active:ring-line-muted/45",
          "dark:data-active:bg-layer-card dark:data-active:ring-transparent",
          "outline-none focus-visible:ring-1 focus-visible:ring-primary-400 dark:focus-visible:ring-2 dark:focus-visible:ring-primary-400/60",
        ],
        navigationCount: ["text-xs tabular-nums text-foreground-icon"],
      },
    },
  },
});
