import { tv } from "../../lib/tv";

export const files = tv({
  slots: {
    panel: ["flex min-h-0 flex-1 flex-col"],
    viewport: ["min-h-0 flex-1 overflow-y-auto"],
    list: ["flex flex-col gap-2 px-5 py-3"],
    row: [
      "group/file-row flex w-full min-w-0 items-start gap-3 border-2 px-3 py-3",
      "transition-colors",
    ],
    rowOpen: [
      "flex min-w-0 flex-1 items-stretch gap-3 text-left",
      "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2",
    ],
    thumbnail: [
      "flex size-14 shrink-0 items-center justify-center overflow-hidden border-2",
      "[&_svg]:size-4.5 [&_svg]:shrink-0",
      "has-[[data-slot=file-preview]]:size-10",
      "has-[[data-slot=file-preview]]:overflow-visible has-[[data-slot=file-preview]]:border-0 has-[[data-slot=file-preview]]:bg-transparent",
    ],
    image: [
      "block h-full w-full bg-white",
      "data-[fit=contain]:object-contain data-[fit=cover]:object-cover",
    ],
    content: ["flex min-w-0 flex-1 flex-col"],
    name: ["block truncate text-sm font-bold"],
    meta: ["mt-auto flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs"],
    metaItem: ["inline-flex items-center gap-1 [&_svg]:size-3 [&_svg]:shrink-0"],
    actions: ["flex shrink-0 self-center items-center gap-1.5"],
  },
  variants: {
    theme: {
      brutal: {
        panel: "bg-white",
        row: ["border-black/30 bg-white", "hover:border-black hover:shadow-sm"],
        rowOpen: "focus-visible:outline-black",
        thumbnail: "border-black bg-white text-black",
        name: "text-black",
        meta: "text-black/50",
      },
      elegant: {
        panel: "bg-layer-panel",
        list: ["gap-2.5 px-5 py-4"],
        row: [
          "rounded-lg border-[0.5px] border-line-muted bg-layer-panel px-3 py-3 shadow-xs",
          "hover:bg-[color-mix(in_oklch,var(--ink)_1%,var(--layer-panel))]",
        ],
        rowOpen: [
          "focus-visible:outline-transparent",
          "focus-visible:ring-2 focus-visible:ring-primary-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-layer-panel",
        ],
        thumbnail: ["rounded-md border border-line-muted bg-layer-muted", "text-foreground-icon"],
        image: "bg-layer-panel",
        name: ["font-sans font-medium text-foreground"],
        meta: ["font-sans text-foreground-placeholder"],
      },
    },
  },
});
