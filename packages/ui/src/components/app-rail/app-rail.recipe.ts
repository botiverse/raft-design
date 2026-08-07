import { tv } from "../../lib/tv";

export const appRail = tv({
  slots: {
    root: ["flex h-full w-full flex-col items-center select-none"],
    header: ["relative flex w-full shrink-0 items-center justify-center"],
    nav: ["flex w-full flex-1 flex-col items-center gap-1.5 py-2"],
    footer: ["flex w-full shrink-0 flex-col items-center justify-center gap-1.5"],
    item: [
      "relative inline-flex shrink-0 items-center justify-center",
      "outline-none",
      "disabled:pointer-events-none disabled:opacity-45",
      "[&_svg]:size-4.5 [&_svg]:shrink-0",
    ],
    itemIcon: ["relative inline-flex items-center justify-center"],
    itemAttentionMask: [
      "pointer-events-none absolute inset-0",
      "[&_svg]:size-full [&_svg]:shrink-0",
    ],
    itemLabel: ["sr-only"],
    itemBadge: [
      "absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center",
      "px-1 text-[10px] font-bold leading-4",
    ],
    itemIndicator: ["pointer-events-none absolute -right-1 top-[-2px]"],
  },
  variants: {
    theme: {
      brutal: {
        root: "w-16 bg-primary text-foreground-strong md:[@media(max-height:600px)]:w-[50px]",
        header:
          "h-[var(--shell-header-height,62px)] border-b-2 border-black [@media(max-height:600px)]:h-12",
        footer: "h-auto pb-2 [@media(max-height:600px)]:pb-1",
        item: [
          "size-10 border-2 border-transparent text-foreground-strong",
          "transition-colors",
          "hover:border-black hover:bg-white",
          "data-[selected=true]:border-black data-[selected=true]:bg-white data-[selected=true]:shadow-raft-sm",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-black",
          "md:[@media(max-height:600px)]:size-9",
        ],
        itemBadge: "border-2 border-black bg-brutal-pink text-black",
        itemAttentionMask: "hidden",
      },
      elegant: {
        root: "w-14 bg-layer-canvas-muted",
        header: "h-[var(--shell-header-height,56px)] border-b-0",
        nav: ["px-2 pt-4 pb-2"],
        footer: ["h-auto gap-1.5 px-2 pb-2", "[&>[data-slot=app-rail-item]]:text-foreground-muted"],
        item: [
          "size-auto min-w-9 p-3 rounded-md border border-transparent",
          "text-[13px] text-foreground-icon [&_svg]:size-4",
          "hover:bg-fill-strong/80 hover:text-foreground-strong",
          "active:bg-fill-strong/80 active:text-foreground-strong",
          "dark:hover:bg-ink-6 dark:active:bg-ink-6",
          "data-[selected=true]:border-transparent data-[selected=true]:bg-fill-strong",
          "dark:data-[selected=true]:bg-layer-card",
          "data-[selected=true]:text-foreground-muted data-[selected=true]:shadow-none",
          "dark:data-[selected=true]:text-foreground-strong dark:data-[selected=true]:shadow-raft-sm",
          "focus-visible:ring-[0.5px] focus-visible:ring-primary-500",
        ],
        itemBadge: [
          "rounded-full border-0 bg-primary-400 text-primary-950",
          "px-1 font-mono text-[10px] font-[450] leading-none tabular-nums normal-case tracking-normal",
          "ring-2 ring-layer-canvas-muted",
        ],
        itemAttentionMask: [
          "text-[oklch(73.4%_0.149_89.2)] drop-shadow-[0_0_1px_oklch(88.3%_0.162_91.9/0.82)]",
          "[mask-image:radial-gradient(circle_at_96%_12%,black_0%,black_24%,oklch(0_0_0/0.82)_38%,oklch(0_0_0/0.38)_58%,transparent_74%)]",
          "[-webkit-mask-image:radial-gradient(circle_at_96%_12%,black_0%,black_24%,oklch(0_0_0/0.82)_38%,oklch(0_0_0/0.38)_58%,transparent_74%)]",
        ],
        itemIndicator:
          "data-[variant=primary]:[background-color:color-mix(in_srgb-linear,var(--color-primary-400)_86%,var(--ink))]",
      },
    },
  },
});
