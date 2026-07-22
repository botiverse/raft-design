import { tv, type VariantProps } from "../../lib/tv";

export const messageAttachmentPreview = tv({
  slots: {
    root: ["relative h-full w-full"],
    externalLinksLoading: [
      "absolute inset-0 z-10 flex items-center justify-center",
      "bg-[oklch(1_0_0_/_0.75)]",
    ],
    externalLinksLoadingPanel: [
      "flex items-center gap-2 px-3 py-2",
      "border-2 border-line-strong bg-layer-panel text-xs font-bold shadow-sm",
    ],
    externalLinkHotspots: ["pointer-events-none absolute inset-0 z-10 overflow-hidden"],
    externalLinkHotspot: [
      "pointer-events-auto absolute bg-transparent outline-none",
      "focus-visible:border-2 focus-visible:border-line-strong focus-visible:bg-[oklch(1_0_0_/_0.2)]",
    ],
    externalLinkFallback: [
      "absolute inset-x-3 bottom-3 z-40 flex items-center gap-2 p-2",
      "border-2 border-line-strong bg-layer-panel shadow-md",
    ],
    externalLinkFallbackDismiss: [
      "flex size-7 shrink-0 items-center justify-center",
      "border border-line-strong bg-layer-panel",
      "hover:bg-ink-4",
      "[&_svg]:size-3.5 [&_svg]:shrink-0",
    ],
    audioPreview: ["flex h-full w-full items-center justify-center p-4"],
    audioPreviewCard: ["w-full max-w-xl border-2 border-line-strong bg-layer-panel p-4 shadow-md"],
    audioPreviewHeader: ["mb-3 flex items-center gap-3"],
    audioPreviewIcon: [
      "flex size-10 shrink-0 items-center justify-center",
      "border-2 border-line-strong bg-soft-signal",
      "[&_svg]:size-5 [&_svg]:shrink-0",
    ],
    audioPreviewMeta: ["min-w-0"],
    audioPreviewTitle: ["truncate text-sm font-bold"],
    audioPreviewLabel: ["text-xs font-bold"],
    audioPreviewMedia: ["block w-full"],
  },
  variants: {
    theme: {
      brutal: {
        externalLinksLoadingPanel: "border-black bg-white text-black shadow-sm",
        externalLinkHotspot: "focus-visible:border-black focus-visible:bg-white/20",
        externalLinkFallback: "border-black bg-white shadow-md",
        externalLinkFallbackDismiss: "border-black bg-white hover:bg-black/5",
        audioPreview: "bg-brutal-cream",
        audioPreviewCard: "border-black bg-white shadow-md",
        audioPreviewIcon: "border-black bg-soft-signal text-black",
        audioPreviewTitle: "text-black",
        audioPreviewLabel: "text-black/50",
      },
      elegant: {
        externalLinksLoading: "bg-layer-panel/75",
        externalLinksLoadingPanel: [
          "rounded-md border border-line-subtle bg-layer-popover shadow-sm",
          "text-foreground-muted",
        ],
        externalLinkHotspot: ["focus-visible:border-primary-500 focus-visible:bg-primary-500/10"],
        externalLinkFallback: ["rounded-md border border-line-subtle bg-layer-popover shadow-lg"],
        externalLinkFallbackDismiss: [
          "rounded-md border-line-subtle bg-layer-muted",
          "hover:bg-layer-strong",
        ],
        audioPreview: "bg-layer-muted",
        audioPreviewCard: "rounded-lg border-line-subtle bg-layer-panel shadow-sm",
        audioPreviewIcon: ["rounded-md border-line-subtle bg-layer-muted text-foreground-icon"],
        audioPreviewTitle: "font-medium text-foreground-strong",
        audioPreviewLabel: "font-medium text-foreground-muted",
      },
    },
  },
});

export type MessageAttachmentPreviewVariantProps = VariantProps<typeof messageAttachmentPreview>;
