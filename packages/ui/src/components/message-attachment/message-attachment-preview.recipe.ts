import { tv, type VariantProps } from "../../lib/tv";

export const messageAttachmentPreview = tv({
  slots: {
    root: ["relative h-full w-full"],
    externalLinksLoading: ["absolute inset-0 z-10 flex items-center justify-center"],
    externalLinksLoadingPanel: ["flex items-center"],
    externalLinkHotspots: ["pointer-events-none absolute inset-0 z-10 overflow-hidden"],
    externalLinkHotspot: ["pointer-events-auto absolute bg-transparent outline-none"],
    externalLinkFallback: ["absolute inset-x-3 bottom-3 z-40 flex items-center"],
    externalLinkFallbackDismiss: [
      "flex size-7 shrink-0 items-center justify-center",
      "[&_svg]:size-3.5 [&_svg]:shrink-0",
    ],
    audioPreview: ["flex h-full w-full items-center justify-center"],
    audioPreviewCard: ["w-full max-w-xl"],
    audioPreviewHeader: ["flex items-center"],
    audioPreviewIcon: [
      "flex size-10 shrink-0 items-center justify-center",
      "[&_svg]:size-5 [&_svg]:shrink-0",
    ],
    audioPreviewMeta: ["min-w-0"],
    audioPreviewTitle: ["truncate"],
    audioPreviewLabel: [],
    audioPreviewMedia: ["block w-full"],
  },
  variants: {
    theme: {
      brutal: {
        externalLinksLoading: "bg-[oklch(1_0_0_/_0.75)]",
        externalLinksLoadingPanel:
          "gap-2 border-2 border-black bg-white px-3 py-2 text-xs font-bold text-black shadow-sm",
        externalLinkHotspot:
          "focus-visible:border-2 focus-visible:border-black focus-visible:bg-white/20",
        externalLinkFallback: "gap-2 border-2 border-black bg-white p-2 shadow-md",
        externalLinkFallbackDismiss: "border border-black bg-white hover:bg-black/5",
        audioPreview: "bg-brutal-cream p-4",
        audioPreviewCard: "border-2 border-black bg-white p-4 shadow-md",
        audioPreviewHeader: "mb-3 gap-3",
        audioPreviewIcon: "border-2 border-black bg-soft-signal text-black",
        audioPreviewTitle: "text-sm font-bold text-black",
        audioPreviewLabel: "text-xs font-bold text-black/50",
      },
      elegant: {
        externalLinksLoading: "bg-layer-panel/85 backdrop-blur-[1px]",
        externalLinksLoadingPanel: [
          "gap-2 rounded-md border border-line-subtle bg-layer-popover px-3 py-2 shadow-md",
          "text-xs font-medium text-foreground-muted",
        ],
        externalLinkHotspot: [
          "focus-visible:border focus-visible:border-primary-500 focus-visible:bg-primary-500/10",
        ],
        externalLinkFallback: [
          "gap-2 rounded-md border border-line-subtle bg-layer-popover p-2 shadow-md",
        ],
        externalLinkFallbackDismiss: [
          "rounded-md border border-line-subtle bg-layer-muted",
          "transition-colors hover:bg-ink-2 active:bg-ink-8",
        ],
        audioPreview: "bg-ink-2 p-5 sm:p-6",
        audioPreviewCard: "rounded-lg border border-line-subtle bg-layer-panel p-4 shadow-md",
        audioPreviewHeader: "mb-3 gap-3",
        audioPreviewIcon: [
          "rounded-md border border-line-subtle bg-layer-muted text-foreground-icon",
        ],
        audioPreviewTitle: "text-sm font-medium text-foreground-strong",
        audioPreviewLabel: "text-xs font-medium text-foreground-muted",
      },
    },
  },
});

export type MessageAttachmentPreviewVariantProps = VariantProps<typeof messageAttachmentPreview>;
