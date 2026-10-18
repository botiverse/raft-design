import { tv } from "../../lib/tv";

export const composerDropOverlay = tv({
  slots: {
    dropOverlay: [
      "absolute inset-0 z-30 flex items-center justify-center",
      "rounded-container border-[1.5px] border-dashed border-line-seam",
      "bg-layer-card bg-[linear-gradient(var(--info-soft),var(--info-soft))]",
    ],
    dropOverlayLabel: [
      "flex flex-col items-center border-0 p-0",
      "text-center",
      "gap-3 font-sans text-callout font-semibold",
      "text-foreground",
    ],
    dropOverlayIconCluster: ["relative flex items-center justify-center", "h-10 w-22"],
    dropOverlayIcon: [
      "rounded-control p-2",
      "bg-layer-card shadow-none ring-1 ring-line-hairline",
      "[&_svg]:size-4",
    ],
  },
});
