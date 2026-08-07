import { tv } from "tailwind-variants/lite";

export const docsCodeBlock = tv({
  slots: {
    frame: [
      "flex h-full min-h-0 min-w-0 flex-col overflow-clip rounded-none bg-white",
      "shadow-[0_0_0_0.5px_oklch(0_0_0_/_0.22)]",
      "dark:bg-layer-card dark:shadow-[inset_0_1px_0_oklch(1_0_0_/_0.04),0_0_0_1px_oklch(0_0_0_/_0.35)]",
    ],
    inner: "relative flex min-h-0 min-w-0 flex-1 flex-col",
    rail: [
      "pointer-events-none absolute inset-y-0 w-0",
      "border-[oklch(0_0_0_/_0.12)] dark:border-ink-10",
    ],
    section: "flex min-w-0 items-stretch",
    gutter: [
      "flex w-6 shrink-0 justify-end self-stretch",
      "bg-[oklch(0.988_0.002_106.42)] dark:bg-layer-card",
    ],
    sectionInner: "flex min-h-0 min-w-0 flex-1 flex-col",
    headerBar: "flex min-w-0 flex-1 items-center gap-3 bg-white py-1.5 dark:bg-transparent",
    bodyRow: "flex min-h-0 min-w-0 flex-1 bg-white pt-3 pb-3 dark:bg-transparent",
    bodyContent: "min-w-0 flex-1 overflow-hidden",
    path: ["min-w-0 flex-1 truncate font-mono text-xs leading-snug", "text-foreground-muted"],
    lineNumbers: [
      "w-full select-none pt-3 pb-3 font-mono text-sm leading-relaxed",
      "text-[oklch(0.72_0.006_106.42)] dark:text-[oklch(0.48_0.006_106.42)]",
    ],
    lineNumber: "text-right tabular-nums",
    copyButton: [
      "shrink-0 pr-0 !leading-snug text-foreground-muted",
      "hover:bg-transparent hover:text-foreground hover:before:bg-transparent",
    ],
    collapseButton: [
      "min-w-[4.625rem] shrink-0 gap-1 pr-0 !leading-snug text-foreground-muted",
      "hover:bg-transparent hover:text-foreground hover:before:bg-transparent",
      "[&[data-panel-open]_svg]:rotate-180",
    ],
  },
  variants: {
    railSide: {
      left: { rail: "left-6 border-l border-dashed" },
      right: { rail: "right-6 border-r border-dashed" },
    },
    sectionKind: {
      header: { section: "shrink-0 border-b border-[oklch(0_0_0_/_0.06)] dark:border-ink-8" },
      body: { section: "min-h-0 flex-1" },
    },
    showLineNumbers: {
      true: { gutter: "w-10", bodyContent: "pr-10 pl-2.5" },
      false: { bodyContent: "pr-6 pl-2.5" },
    },
  },
});
