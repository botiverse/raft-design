import { tv } from "../../lib/tv";

export const tasksPanel = tv({
  slots: {
    root: ["flex min-h-0 min-w-0 flex-1 flex-col bg-layer-panel"],
    toolbar: [
      "flex shrink-0 flex-wrap items-center justify-between gap-[8px]",
      "px-[16px] py-[12px]",
    ],
    toolbarGroup: ["flex flex-wrap items-stretch gap-[8px]", "[&>[data-slot=button]]:h-auto"],
    toolbarLabel: [
      "inline-flex items-center text-[12px] leading-[16px]",
      "[&_svg]:size-[14px] [&_svg]:shrink-0 [&>svg:last-child]:!size-[12px]",
    ],
    viewport: [
      "min-h-0 flex-1 overflow-auto overscroll-contain p-[16px]",
      "[padding-bottom:env(safe-area-inset-bottom)]",
    ],
    empty: ["flex h-full flex-col items-center justify-center"],
  },
  variants: {
    theme: {
      brutal: {
        toolbar: ["border-b-2 border-line-strong bg-layer-panel"],
        toolbarLabel: [
          "gap-[8px] border-2 border-line-subtle bg-layer-panel px-[12px] py-[6px]",
          "font-heading font-bold text-foreground/70",
        ],
        viewport: ["bg-layer-panel"],
      },
      elegant: {
        toolbar: ["border-b border-line-subtle bg-layer-panel"],
        toolbarLabel: [
          "gap-[6px] rounded-[4px] border border-transparent bg-transparent px-[10px] py-[7px]",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.05),0_0_0_1px_var(--line-subtle)]",
          "font-sans font-medium text-foreground-muted",
        ],
        viewport: ["bg-layer-panel"],
      },
    },
  },
});
