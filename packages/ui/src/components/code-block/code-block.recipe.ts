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
      "gap-2 border-b border-line-hairline pr-[calc(var(--control-embedded-inset)-1px)] pl-3",
      "font-mono text-mono-meta text-foreground-hint",
    ],
    title: ["min-w-0 flex-1 truncate font-mono", "text-mono-meta"],
    actions: [
      "ml-auto flex items-center gap-1",
      "[[data-slot=code-block-body]>&]:col-start-2 [[data-slot=code-block-body]>&]:row-start-1",
      "[[data-slot=code-block-body]>&]:z-10 [[data-slot=code-block-body]>&]:ml-3",
      "[[data-slot=code-block-body]>&]:my-[calc(var(--control-embedded-inset)-0.5rem-1px)] [[data-slot=code-block-body]>&]:mr-[calc(var(--control-embedded-inset)-0.75rem-1px)]",
    ],
    corner: [
      "pointer-events-none absolute z-20 size-1",
      "data-[y=top]:top-0 data-[y=bottom]:bottom-0",
      "data-[x=left]:left-0 data-[x=right]:right-0",
      "hidden",
    ],
    body: [
      "relative grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start *:col-start-1",
      "p-4 font-mono [&_pre]:overflow-x-auto",
      "[&_pre]:outline-none [&_pre]:focus-visible:keyboard:inset-ring-2 [&_pre]:focus-visible:keyboard:inset-ring-foreground",
      "px-3 py-2 text-mono-code text-foreground",
      "[&_pre_span]:text-(--shiki-light,currentColor)",
      "dark:[&_pre_span]:text-(--shiki-dark,currentColor)",
    ],
    action: [
      "inline-flex shrink-0 items-center justify-center",
      "transition-[color,background-color,opacity]",
      "focus-visible:outline-none",
      "size-8 rounded-chip text-foreground",
      "hover:bg-fill-medium active:bg-fill-medium",
      "focus-visible:ring-0 focus-visible:shadow-focus",
      "[&_svg:not([class*='size-'])]:size-4.5",
    ],
  },
});
