import { tv } from "../../lib/tv";

export const appRail = tv({
  slots: {
    root: [
      "flex h-full w-full flex-col items-center select-none",
      "max-md:h-auto max-md:items-stretch",
    ],
    header: ["relative flex w-full shrink-0 items-center justify-center"],
    nav: [
      "flex w-full flex-1 flex-col items-center gap-1.5 py-2",
      "max-md:grid max-md:flex-none max-md:grid-flow-col max-md:auto-cols-fr max-md:items-stretch max-md:gap-0 max-md:py-0",
    ],
    footer: ["flex w-full shrink-0 flex-col items-center justify-center gap-1.5"],
    item: [
      "relative inline-flex shrink-0 items-center justify-center",
      "max-md:size-auto max-md:min-w-0 max-md:flex-col max-md:gap-0.5 max-md:px-0 max-md:py-2",
      "max-md:text-[10px] max-md:tracking-wider",
      "outline-none",
      "disabled:pointer-events-none disabled:opacity-45",
      "[&_svg]:size-[18px] [&_svg]:shrink-0",
    ],
    itemIcon: ["relative inline-flex items-center justify-center"],
    itemAttentionMask: [
      "pointer-events-none absolute inset-0",
      "[&_svg]:size-full [&_svg]:shrink-0",
    ],
    itemLabel: ["sr-only", "max-md:not-sr-only max-md:min-w-0 max-md:truncate"],
    itemBadge: [
      "absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center",
      "px-1 text-[10px] font-bold leading-4",
    ],
    itemIndicator: ["pointer-events-none absolute -right-1 -top-1"],
  },
  variants: {
    theme: {
      brutal: {
        header:
          "h-[var(--shell-header-height,62px)] border-b-2 border-black [@media(max-height:600px)]:h-12",
        nav: [
          "max-md:border-t-2 max-md:border-black max-md:bg-white",
          "max-md:pb-[min(env(safe-area-inset-bottom,0px),34px)] max-md:text-black",
        ],
        footer: "h-auto pb-2 [@media(max-height:600px)]:pb-1",
        item: [
          "size-10 border-2 border-transparent text-foreground",
          "transition-colors",
          "hover:border-black hover:bg-white",
          "data-[selected=true]:border-black data-[selected=true]:bg-white data-[selected=true]:shadow-brutal-sm",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-black",
          "md:[@media(max-height:600px)]:size-9",
          "max-md:rounded-none max-md:border-0 max-md:border-r-2 max-md:border-line-strong max-md:text-black max-md:last:border-r-0",
          "max-md:hover:border-line-strong max-md:hover:bg-ink-2 max-md:active:bg-ink-5",
          "max-md:data-[selected=true]:border-line-strong max-md:data-[selected=true]:bg-primary-400 max-md:data-[selected=true]:shadow-none",
        ],
        itemLabel: "max-md:font-medium",
        itemBadge: "border-2 border-black bg-brutal-pink text-black",
        itemAttentionMask: "hidden",
      },
      elegant: {
        header: "h-[var(--shell-header-height,3.5rem)] border-b-0",
        nav: [
          "px-2 pt-4 pb-2",
          "max-md:gap-1 max-md:bg-layer-panel",
          "max-md:px-1 max-md:pt-1 max-md:pb-[max(0.25rem,min(env(safe-area-inset-bottom,0px),34px))]",
          "max-md:shadow-sm max-md:ring-[0.5px] max-md:ring-line-subtle max-md:ring-inset",
        ],
        footer: ["h-auto gap-1.5 px-2 pb-2", "[&>[data-slot=app-rail-item]]:text-foreground-muted"],
        item: [
          "size-auto min-w-9 p-3 rounded-md border border-transparent",
          "text-[13px] text-foreground-icon [&_svg]:size-4",
          "hover:bg-layer-strong/80 hover:text-foreground",
          "active:bg-layer-strong/80 active:text-foreground",
          "data-[selected=true]:border-transparent data-[selected=true]:bg-layer-strong",
          "data-[selected=true]:text-foreground-muted data-[selected=true]:shadow-none",
          "focus-visible:ring-[0.5px] focus-visible:ring-primary-500",
          "max-md:min-w-0 max-md:gap-1 max-md:rounded-md max-md:border-0 max-md:px-0 max-md:py-1.5",
          "max-md:text-[10px] max-md:tracking-normal max-md:text-foreground-placeholder max-md:[&_svg]:size-[18px]",
          "max-md:hover:bg-[color-mix(in_oklch,var(--layer-muted)_55%,var(--layer-panel))] max-md:active:bg-layer-strong",
          "max-md:data-[selected=true]:bg-transparent max-md:data-[selected=true]:text-primary-900",
          "max-md:data-[selected=true]:hover:bg-transparent max-md:data-[selected=true]:active:bg-transparent",
        ],
        itemLabel: "max-md:font-medium max-md:leading-none",
        itemBadge: [
          "rounded-full border-0 bg-primary-400 text-primary-950",
          "px-1 font-mono text-[10px] font-[450] leading-none tabular-nums normal-case tracking-normal",
          "ring-2 ring-layer-page",
        ],
        itemAttentionMask: [
          "text-[oklch(73.4%_0.149_89.2)] drop-shadow-[0_0_1px_oklch(88.3%_0.162_91.9/0.82)]",
          "[mask-image:radial-gradient(circle_at_96%_12%,black_0%,black_24%,oklch(0_0_0/0.82)_38%,oklch(0_0_0/0.38)_58%,transparent_74%)]",
          "[-webkit-mask-image:radial-gradient(circle_at_96%_12%,black_0%,black_24%,oklch(0_0_0/0.82)_38%,oklch(0_0_0/0.38)_58%,transparent_74%)]",
        ],
      },
    },
  },
});
