import { tv } from "../../lib/tv";

export const codeBlock = tv({
  slots: {
    root: ["group/code-block relative my-2 min-w-0 px-1 pb-1"],
    header: ["flex h-(--code-block-header-height) items-center gap-3"],
    title: ["min-w-0 flex-1 truncate font-mono"],
    actions: [
      "ml-auto flex items-center gap-2",
      "[[data-slot=code-block-body]>&]:absolute [[data-slot=code-block-body]>&]:top-2",
      "[[data-slot=code-block-body]>&]:right-2 [[data-slot=code-block-body]>&]:z-10",
    ],
    corner: [
      "pointer-events-none absolute z-20 size-1",
      "data-[y=top]:top-0 data-[y=bottom]:bottom-0",
      "data-[x=left]:left-0 data-[x=right]:right-0",
    ],
    body: ["relative min-w-0 overflow-x-auto p-4 font-mono text-sm"],
    action: [
      "inline-flex shrink-0 items-center justify-center",
      "transition-[color,background-color,opacity]",
      "focus-visible:outline-none focus-visible:ring-2",
    ],
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "[--code-block-header-height:--spacing(9)]",
          "px-0 pb-0",
          "border-2 border-line-strong bg-black shadow-raft-sm",
        ],
        header: ["px-3", "text-sm font-bold tracking-wide text-foreground-inverse uppercase"],
        title: ["text-xs before:mr-1.5 before:text-foreground-inverse/45 before:content-['»']"],
        corner: [
          "border-foreground-inverse",
          "data-[y=top]:border-t-2 data-[y=bottom]:border-b-2",
          "data-[x=left]:border-l-2 data-[x=right]:border-r-2",
        ],
        action: [
          "size-6",
          "bg-foreground-inverse/10 text-foreground-inverse/70",
          "hover:bg-foreground-inverse/20 hover:text-foreground-inverse",
          "focus-visible:ring-foreground-inverse/60",
        ],
        body: [
          "bg-black text-[oklch(0.88_0.18_132)]",
          "outline-1 -outline-offset-1 outline-[oklch(0.32_0_0)]",
          "[&_pre_span]:text-(--shiki-dark,currentColor)",
        ],
      },
      elegant: {
        root: [
          "[--code-block-header-height:--spacing(8)]",
          "overflow-clip rounded-none px-3 pb-0",
          "bg-layer-inset ring-[0.5px] ring-ink-20 dark:ring-ink-10",
        ],
        header: [
          "px-2.5",
          "border-x border-b border-dashed border-ink-10 dark:border-ink-16",
          "bg-layer-panel text-sm/5 font-medium text-foreground-muted",
          "dark:bg-transparent",
        ],
        corner: ["hidden"],
        title: ["text-xs"],
        body: [
          "py-3 pr-6 pl-2.5 leading-relaxed",
          "bg-layer-panel text-foreground",
          "dark:bg-[oklch(0.15_0.004_106.42)]",
          "border-x border-dashed border-ink-10 dark:border-ink-16",
          "[&_pre_span]:text-(--shiki-light,currentColor)",
          "dark:[&_pre_span]:text-(--shiki-dark,currentColor)",
        ],
      },
      raft: {
        root: [
          "[--code-block-header-height:--spacing(10)]",
          "overflow-clip px-0 pb-0",
          "rounded-container border border-line-muted bg-layer-code text-foreground",
        ],
        header: [
          "gap-2 border-b border-line-muted pr-1 pl-3",
          "font-mono text-mono-meta text-foreground-hint",
        ],
        title: ["text-mono-meta"],
        corner: ["hidden"],
        action: [
          "size-8 rounded-control text-foreground",
          "hover:bg-fill-pressed active:bg-fill-pressed",
          "focus-visible:ring-0 focus-visible:shadow-raft-focus",
          "[&_svg:not([class*='size-'])]:size-4.5",
        ],
        body: [
          "px-3 py-2 text-mono-code text-foreground",
          "[&_pre_span]:text-(--shiki-light,currentColor)",
          "dark:[&_pre_span]:text-(--shiki-dark,currentColor)",
        ],
      },
    },
  },
});
