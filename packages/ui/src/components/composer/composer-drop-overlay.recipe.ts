import { tv } from "../../lib/tv";

export const composerDropOverlay = tv({
  slots: {
    dropOverlay: ["absolute inset-0 z-30 flex items-center justify-center border-2"],
    dropOverlayLabel: [
      "flex flex-col items-center gap-4 border-0 p-0",
      "text-center text-base font-medium text-foreground-inverse",
    ],
  },
  variants: {
    theme: {
      brutal: {
        dropOverlay: "border-dashed border-black bg-[oklch(0_0_0/0.4)]",
      },
      elegant: {
        dropOverlay: ["rounded-none border-0 bg-[oklch(0_0_0/0.4)] backdrop-blur-[2px]"],
      },
    },
  },
});
