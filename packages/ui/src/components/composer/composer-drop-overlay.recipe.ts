import { tv } from "../../lib/tv";

export const composerDropOverlay = tv({
  slots: {
    dropOverlay: ["absolute inset-0 z-30 flex items-center justify-center border-2"],
    dropOverlayLabel: [
      "flex flex-col items-center gap-4 border-0 p-0",
      "text-center font-medium text-foreground-inverse",
    ],
    dropOverlayIconCluster: ["relative flex items-center justify-center"],
    dropOverlayIcon: ["bg-layer-panel shadow-md ring-1 ring-line-subtle"],
  },
  variants: {
    theme: {
      brutal: {
        dropOverlay: "border-dashed border-black bg-[oklch(0_0_0/0.65)]",
        dropOverlayLabel: "text-sm",
        dropOverlayIconCluster: "h-9 w-18",
        dropOverlayIcon: ["rounded-none p-1.5", "[&_svg]:size-3.5"],
      },
      elegant: {
        // Match ComposerRoot attachments chrome (`before:-inset-1` + `rounded-xl`).
        // Overlay is typically a sibling of the root inside a relative wrapper.
        dropOverlay: ["-inset-1 rounded-xl border-0 bg-[oklch(0_0_0/0.4)]"],
        dropOverlayLabel: "text-base",
        dropOverlayIconCluster: "h-10 w-22",
        dropOverlayIcon: ["rounded-md p-2", "[&_svg]:size-4"],
      },
    },
  },
});
