import { tv } from "../../lib/tv";

export const composerDropOverlay = tv({
  slots: {
    dropOverlay: ["absolute inset-0 z-30 flex items-center justify-center border-2"],
    dropOverlayLabel: ["inline-flex items-center gap-1.5 border-2 px-3 py-1.5 text-sm font-bold"],
  },
  variants: {
    theme: {
      brutal: {
        dropOverlay: "border-dashed border-brutal-pink bg-brutal-pink/15",
        dropOverlayLabel: "border-black bg-white text-black shadow-brutal-sm",
      },
      elegant: {
        dropOverlay: [
          "-inset-1 rounded-lg border-accent-400/70 bg-accent-100/60",
          "bg-[radial-gradient(ellipse_at_center,oklch(0_0_0/0.045)_0%,oklch(0_0_0/0.02)_55%,oklch(0_0_0/0.008)_100%)]",
        ],
        dropOverlayLabel:
          "flex flex-col items-center gap-2 border-0 p-0 text-center text-base font-medium text-foreground-strong",
      },
    },
  },
});
