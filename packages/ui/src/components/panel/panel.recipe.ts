import { tv } from "../../lib/tv";

export const panel = tv({
  slots: {
    root: ["[--panel-footer-clearance:10rem]", "text-foreground"],
    header: ["[@media(max-height:600px)]:h-12"],
    body: ["relative min-h-0 flex-1 overflow-hidden"],
    scrollViewport: [
      "h-full min-h-0 overflow-y-auto overscroll-contain",
      "[overflow-anchor:auto] [-webkit-overflow-scrolling:touch]",
    ],
    scrollContent: ["min-h-full"],
    scrollbar: [
      "z-50 me-1.5 flex w-3 justify-center py-1 opacity-0 transition-opacity duration-150",
      "pointer-events-none",
      "data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-0",
    ],
    scrollbarThumb: ["w-1.5 rounded-full"],
    footer: [
      "relative flex shrink-0 items-center px-3 max-md:px-1.5 pt-3",
      "pb-[calc(env(safe-area-inset-bottom)+0.75rem)] max-md:pb-[calc(env(safe-area-inset-bottom)+6px)]",
    ],
  },
  variants: {
    theme: {
      brutal: {
        scrollbarThumb: "bg-black/35 hover:bg-black/55",
      },
      elegant: {
        scrollContent: "pb-[var(--panel-footer-clearance)]",
        scrollbarThumb: "bg-foreground-muted/35 hover:bg-foreground-muted/55",
        footer: [
          "absolute inset-x-0 bottom-0 z-40",
          "max-md:px-2.5 md:px-7 max-md:pt-3 md:pt-0",
          "max-md:pb-[calc(env(safe-area-inset-bottom)+0.625rem)] md:pb-3",
          "border-t-0 bg-transparent",
          "before:pointer-events-none before:absolute before:inset-x-0 before:bottom-0 before:z-0 before:h-36",
          "before:bg-[linear-gradient(to_bottom,transparent,var(--layer-panel))] before:backdrop-blur-[4px]",
          "before:[mask-image:linear-gradient(to_top,black_50%,transparent)] before:[-webkit-mask-image:linear-gradient(to_top,black_50%,transparent)]",
          "before:content-[''] [&>*]:relative [&>*]:z-10",
        ],
      },
    },
  },
});
