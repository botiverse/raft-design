import { tv } from "../../lib/tv";

export const codeBlock = tv({
  slots: {
    root: [
      "group/code-block relative my-2 min-w-0",
      "[--code-block-header-height:--spacing(10)]",
      "overflow-clip px-0 pb-0",
      "rounded-container border border-line-hairline bg-layer-code text-foreground",
    ],
    header: [
      "flex h-(--code-block-header-height) items-center",
      "gap-2 border-b border-line-hairline pr-1 pl-3",
      "font-mono text-mono-meta text-foreground-hint",
    ],
    title: ["min-w-0 flex-1 truncate font-mono", "text-mono-meta"],
    actions: [
      "ml-auto flex items-center gap-2",
      "[[data-slot=code-block-body]>&]:absolute [[data-slot=code-block-body]>&]:top-2",
      "[[data-slot=code-block-body]>&]:right-2 [[data-slot=code-block-body]>&]:z-10",
    ],
    corner: [
      "pointer-events-none absolute z-20 size-1",
      "data-[y=top]:top-0 data-[y=bottom]:bottom-0",
      "data-[x=left]:left-0 data-[x=right]:right-0",
      "hidden",
    ],
    body: [
      "relative min-w-0 overflow-x-auto p-4 font-mono",
      "px-3 py-2 text-mono-code text-foreground",
      "[&_pre_span]:text-(--shiki-light,currentColor)",
      "dark:[&_pre_span]:text-(--shiki-dark,currentColor)",
    ],
    action: [
      "inline-flex shrink-0 items-center justify-center",
      "transition-[color,background-color,opacity]",
      "focus-visible:outline-none",
      "size-8 rounded-control text-foreground",
      "hover:bg-fill-pressed active:bg-fill-pressed",
      "focus-visible:ring-0 focus-visible:shadow-focus",
      "[&_svg:not([class*='size-'])]:size-4.5",
    ],
  },
});
