import { tv } from "../../lib/tv";

export const sidebarMenuRecipe = tv({
  slots: {
    sidebarMenu: ["flex min-w-0 flex-1 items-center"],
    sidebarMenuIcon: [
      "flex size-3 shrink-0 items-center justify-center",
      "[&_svg]:size-3 [&_svg]:shrink-0",
      "[&_svg]:[vector-effect:non-scaling-stroke] [&_svg_*]:[vector-effect:non-scaling-stroke]",
    ],
    sidebarMenuTitle: ["min-w-0 truncate"],
    sidebarMenuAside: ["flex shrink-0 items-center gap-1"],
    sidebarMenuCount: [],
  },
  variants: {
    theme: {
      brutal: {
        sidebarMenu: [
          "h-6 gap-1 text-xs font-bold tracking-widest uppercase",
          "text-black transition-colors hover:text-black/70",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[black]",
        ],
        sidebarMenuIcon: ["[&_svg]:stroke-[1.5px]", "[&_svg_*]:stroke-[1.5px]"],
        sidebarMenuCount: ["font-mono normal-case tracking-normal text-black/40"],
      },
      elegant: {
        sidebarMenu: [
          "h-8 w-full justify-between gap-1.5 rounded-md px-(--sidebar-row-inset-x,6px)",
          "text-xs leading-none font-normal normal-case tracking-normal",
          "text-foreground-muted",
          "hover:bg-fill-strong/80 hover:text-foreground",
          "dark:hover:bg-ink-6",
          "active:text-foreground",
        ],
        sidebarMenuIcon: ["text-foreground-icon", "[&_svg]:stroke-[1px] [&_svg_*]:stroke-[1px]"],
        sidebarMenuAside: "ml-auto",
        sidebarMenuCount:
          "shrink-0 font-sans text-xs font-medium leading-none normal-nums text-foreground-icon",
      },
      raft: {
        sidebarMenu: [
          "h-auto gap-1.5 rounded-sticker",
          "font-sans text-footnote font-bold normal-case tracking-normal text-foreground-hint",
          "hover:text-foreground aria-[current=page]:text-foreground",
          "outline-none focus-visible:shadow-raft-focus",
        ],
        sidebarMenuIcon: ["size-3.5 [&_svg]:size-3.5 [&_svg]:stroke-2 [&_svg_*]:stroke-2"],
        sidebarMenuCount: "font-mono text-mono-meta font-normal tabular-nums text-foreground-hint",
      },
    },
  },
});
