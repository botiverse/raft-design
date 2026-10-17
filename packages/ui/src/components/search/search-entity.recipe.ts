import { tv } from "../../lib/tv";

export const searchEntity = tv({
  slots: {
    entity: ["flex min-w-0 w-full items-center gap-3 p-3 text-left transition-colors"],
    entityLeading: ["relative flex shrink-0"],
    entityIcon: ["flex size-8 items-center justify-center overflow-hidden"],
    entityActivity: ["absolute -right-0.5 -bottom-0.5 inline-block size-2.5 shrink-0 rounded-full"],
    entityContent: ["min-w-0 flex-1"],
    entityHeader: ["flex min-w-0 items-center gap-2"],
    entityTitle: ["truncate text-sm"],
    entityDescription: ["block truncate text-xs"],
  },
  variants: {
    theme: {
      brutal: {
        entity: [
          "border-2 border-black/30 bg-white",
          "hover:border-black hover:shadow-raft-sm active:border-black active:shadow-raft-sm",
          "data-[selected=true]:border-black data-[selected=true]:shadow-raft-sm",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-black",
        ],
        entityIcon: ["border-2 border-black bg-white text-black"],
        entityActivity: ["border border-black bg-brutal-lime"],
        entityTitle: ["font-bold text-black data-muted:text-black/45"],
        entityDescription: ["text-black/50 data-muted:text-black/30"],
      },
      elegant: {
        entity: [
          "rounded-lg border-[0.5px] border-line-muted bg-layer-panel shadow-raft-xs",
          "transition-[background-color,border-color] duration-150",
          "hover:bg-[color-mix(in_oklch,var(--ink)_1%,var(--layer-panel))]",
          "data-[selected=true]:border-transparent data-[selected=true]:ring-1 data-[selected=true]:ring-primary-400 data-[selected=true]:ring-offset-2 data-[selected=true]:ring-offset-layer-canvas-muted",
          "dark:data-[selected=true]:ring-2",
          "outline-none focus-visible:ring-1 focus-visible:ring-primary-400",
          "dark:border-transparent",
          "dark:focus-visible:ring-2 dark:focus-visible:ring-primary-400/60 dark:focus-visible:ring-offset-0",
        ],
        entityIcon: ["rounded-md bg-fill-muted text-foreground-icon"],
        entityActivity: ["border border-layer-panel bg-brutal-lime dark:bg-success"],
        entityTitle: ["font-medium text-foreground-strong data-muted:text-foreground-disabled"],
        entityDescription: ["text-foreground-muted/70 data-muted:text-foreground-disabled"],
      },
      raft: {
        entity: [
          "relative rounded-none border-0 bg-transparent px-4 py-3 text-foreground shadow-none",
          "max-md:min-h-16",
          "not-first:before:absolute not-first:before:top-0 not-first:before:right-0 not-first:before:left-[55px] not-first:before:border-t not-first:before:border-line-muted",
          "hover:bg-fill-pressed active:bg-fill-pressed",
          "disabled:cursor-default disabled:hover:bg-transparent disabled:active:bg-transparent",
          "data-[selected=true]:bg-primary-soft data-[selected=true]:hover:bg-primary-soft",
          "outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--foreground)]",
        ],
        entityIcon: [
          "size-[27px] rounded-sticker bg-fill-muted text-foreground-muted",
          "[&_svg]:size-3.5",
        ],
        entityActivity: [
          "right-[-3px] bottom-[-3px] size-[9px] rounded-[2px]",
          "border-[1.5px] border-sticker-ink bg-presence-online",
          "shadow-[0_0_0_2px_var(--layer-panel)]",
        ],
        entityContent: ["flex flex-col gap-0.5"],
        entityTitle: [
          "font-sans text-body font-semibold text-foreground",
          "data-muted:text-foreground-hint",
        ],
        entityDescription: [
          "text-callout text-foreground-muted",
          "data-muted:text-foreground-hint",
        ],
      },
    },
  },
});
