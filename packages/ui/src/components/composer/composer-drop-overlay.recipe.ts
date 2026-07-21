import { tv } from "../../lib/tv";

export const composerDropOverlay = tv({
  slots: {
    dropOverlay: ["absolute inset-0 z-30 flex items-center justify-center border-2"],
    dropOverlayLabel: [
      "flex flex-col items-center gap-4 border-0 p-0",
      "text-center text-base font-medium text-foreground-inverse",
    ],
    dropOverlayIcon: ["bg-layer-panel p-2 shadow-md ring-1 ring-line-subtle"],
  },
  variants: {
    theme: {
      brutal: {
        dropOverlay: "border-dashed border-black bg-[oklch(0_0_0/0.4)]",
        dropOverlayIcon: "rounded-none",
      },
      elegant: {
        // Match ComposerRoot attachments chrome (`before:-inset-1` + `rounded-xl`).
        // Overlay is typically a sibling of the root inside a relative wrapper.
        dropOverlay: ["-inset-1 rounded-xl border-0 bg-[oklch(0_0_0/0.4)]"],
        dropOverlayIcon: "rounded-md",
      },
    },
  },
});
