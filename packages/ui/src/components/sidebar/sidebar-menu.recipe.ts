import { tv } from "../../lib/tv";

export const sidebarMenuRecipe = tv({
  slots: {
    sidebarMenu: [
      "flex min-w-0 flex-1 items-center",
      "h-auto gap-1.5 rounded-sticker",
      "font-sans text-footnote font-bold normal-case tracking-normal text-foreground-hint",
      "hover:text-foreground aria-[current=page]:text-foreground",
      "outline-none focus-visible:shadow-raft-focus",
    ],
    sidebarMenuIcon: [
      "flex shrink-0 items-center justify-center",
      "[&_svg]:shrink-0",
      "[&_svg]:[vector-effect:non-scaling-stroke] [&_svg_*]:[vector-effect:non-scaling-stroke]",
      "size-3.5 [&_svg]:size-3.5 [&_svg]:stroke-2 [&_svg_*]:stroke-2",
    ],
    sidebarMenuTitle: ["min-w-0 truncate"],
    sidebarMenuAside: ["flex shrink-0 items-center gap-1"],
    sidebarMenuCount: ["font-mono text-mono-meta font-normal tabular-nums text-foreground-hint"],
  },
});
