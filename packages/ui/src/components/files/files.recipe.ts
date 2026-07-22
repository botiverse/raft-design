import { tv } from "../../lib/tv";

export const files = tv({
  slots: {
    panel: ["flex min-h-0 flex-1 flex-col"],
    viewport: ["min-h-0 flex-1 overflow-y-auto"],
    list: ["flex flex-col gap-2 p-3"],
    row: [
      "group/file-row flex w-full min-w-0 items-start gap-3 border-2 px-4 py-3",
      "transition-colors",
    ],
    rowOpen: [
      "flex min-w-0 flex-1 items-start gap-3 text-left",
      "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2",
    ],
    visual: [
      "flex size-14 shrink-0 items-center justify-center overflow-hidden border-2",
      "[&_svg]:size-[18px] [&_svg]:shrink-0",
    ],
    image: [
      "block h-full w-full bg-white",
      "data-[fit=contain]:object-contain data-[fit=cover]:object-cover",
    ],
    content: ["min-w-0 flex-1"],
    name: ["block truncate text-sm font-bold"],
    meta: ["mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs"],
    metaItem: ["inline-flex items-center gap-1 [&_svg]:size-3 [&_svg]:shrink-0"],
    actions: ["flex shrink-0 self-center items-center gap-1.5"],
    action: [
      "inline-flex size-7 items-center justify-center border-2 p-0 outline-none",
      "transition-all duration-100",
      "[&_svg]:size-3.5 [&_svg]:shrink-0",
    ],
    loading: ["flex h-full items-center justify-center font-mono text-sm"],
    error: ["flex h-full items-center justify-center text-sm font-bold"],
    loadMore: ["flex justify-center p-4"],
    loadMoreStatus: ["font-mono text-xs"],
    loadMoreAction: [
      "inline-flex items-center justify-center border-2 px-4 py-1.5 text-xs font-bold outline-none",
      "transition-all duration-100",
    ],
  },
  variants: {
    theme: {
      brutal: {
        panel: "bg-white",
        row: ["border-black/30 bg-white", "hover:border-black hover:shadow-sm"],
        rowOpen: "focus-visible:outline-black",
        visual: "border-black bg-white text-black",
        name: "text-black",
        meta: "text-black/50",
        action: [
          "border-black bg-white text-black shadow-sm",
          "hover:-translate-y-px hover:shadow-md",
          "active:translate-x-px active:translate-y-px active:shadow-xs",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
          "disabled:pointer-events-none disabled:transform-none disabled:opacity-40 disabled:shadow-sm",
        ],
        loading: "text-black/40",
        error: "text-danger-base",
        loadMoreStatus: "text-black/45",
        loadMoreAction: [
          "border-black bg-white text-black shadow-sm",
          "hover:-translate-y-px hover:shadow-md",
          "active:translate-x-px active:translate-y-px active:shadow-xs",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
          "disabled:pointer-events-none disabled:transform-none disabled:opacity-40 disabled:shadow-sm",
        ],
      },
      elegant: {},
    },
  },
});
