import { tv } from "../../lib/tv";

export const panel = tv({
  slots: {
    root: ["[--panel-footer-clearance:10rem]", "text-foreground-strong"],
    header: ["[@media(max-height:600px)]:h-12"],
    body: ["relative min-h-0 flex-1 overflow-hidden"],
    scrollViewport: [
      "h-full min-h-0 overflow-y-auto overscroll-contain",
      "[overflow-anchor:auto] [-webkit-overflow-scrolling:touch]",
    ],
    scrollContent: ["min-h-full"],
    section: ["border-t border-ink-10 px-5 py-4"],
    footer: [
      "relative flex shrink-0 items-center px-3 max-md:px-1.5 pt-3",
      "pb-[calc(env(safe-area-inset-bottom)+0.75rem)] max-md:pb-[calc(env(safe-area-inset-bottom)+0.375rem)]",
    ],
  },
  variants: {
    theme: {
      brutal: {},
      elegant: {
        scrollContent: "md:pb-[var(--panel-footer-clearance)]",
        footer: [
          "z-40 md:absolute md:inset-x-0 md:bottom-0",
          "max-md:px-2.5 md:px-7 max-md:pt-0 md:pt-0",
          "max-md:pb-[calc(env(safe-area-inset-bottom)+0.625rem)] md:pb-3",
          "border-t-0 bg-transparent",
          "before:pointer-events-none before:absolute before:inset-x-0 before:bottom-0 before:z-0 before:h-36",
          "before:bg-[linear-gradient(to_bottom,transparent,var(--layer-panel))] before:backdrop-blur-[4px]",
          "dark:before:bg-[linear-gradient(to_bottom,transparent,oklch(0_0_0_/_0.16))] dark:before:backdrop-blur-[2px]",
          "before:[mask-image:linear-gradient(to_top,black_50%,transparent),linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]",
          "before:[-webkit-mask-image:linear-gradient(to_top,black_50%,transparent),linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]",
          "before:[mask-composite:intersect] before:[-webkit-mask-composite:source-in]",
          "before:content-[''] [&>*]:relative [&>*]:z-10",
        ],
      },
    },
  },
});
