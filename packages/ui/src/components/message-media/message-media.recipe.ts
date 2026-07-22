import { tv, type VariantProps } from "../../lib/tv";

export const messageMedia = tv({
  slots: {
    gallery: ["max-w-[min(22rem,calc(100vw-7rem))] space-y-2 md:max-w-[28rem]"],
    galleryRow: ["grid gap-2"],
    galleryItem: [
      "group/img relative overflow-hidden border-2 border-line-strong text-left",
      "hover:brightness-95",
      "has-[[data-slot=message-image-gallery-overlay]]:opacity-70 has-[[data-slot=message-image-gallery-overlay]]:hover:brightness-100",
    ],
    galleryMedia: ["block h-full w-full"],
    galleryOverlay: ["absolute inset-0 flex items-center justify-center"],
    galleryPreview: [
      "absolute inset-0",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-line-strong",
    ],
    galleryAction: [
      "absolute right-1 bottom-1 z-10 hidden size-6 items-center justify-center",
      "border border-line-strong focus:flex focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-strong",
      "group-hover/img:flex",
      "[&_svg]:size-3",
    ],
    video: [
      "group/video relative w-full max-w-[min(28rem,calc(100vw-7rem))] overflow-hidden",
      "border-2 border-line-strong bg-black text-left",
    ],
    videoFrame: ["relative aspect-video w-full bg-black"],
    videoMedia: ["block h-full w-full bg-black object-contain"],
    videoFallback: ["flex h-full w-full items-center justify-center bg-black text-white"],
    videoAction: [
      "absolute right-1.5 top-1.5 flex size-6 items-center justify-center",
      "border border-line-strong bg-white/80 text-black/60",
      "hover:bg-white hover:text-black",
      "[&_svg]:size-3",
    ],
  },
  variants: {
    rowLayout: {
      single: { galleryRow: "grid-cols-1" },
      pair: { galleryRow: "grid-cols-2" },
      triple: { galleryRow: "grid-cols-2 md:grid-cols-3" },
    },
    itemSize: {
      single: {
        galleryItem: "inline-block w-fit max-w-[26rem] justify-self-start",
      },
      regular: { galleryItem: "h-32 sm:h-36" },
      dense: { galleryItem: "h-28 sm:h-32" },
    },
    mediaGeometry: {
      single: { galleryMedia: "object-contain" },
      normal: { galleryMedia: "object-cover" },
      wide: { galleryMedia: "object-contain" },
      tall: { galleryMedia: "object-contain" },
    },
    mediaFit: {
      contain: { galleryMedia: "object-contain" },
      cover: { galleryMedia: "object-cover" },
    },
    theme: {
      brutal: {
        galleryItem: "bg-brutal-cream/60",
        galleryPreview: "focus-visible:outline-black",
        galleryAction: "bg-white/80 text-black/50 hover:text-black focus-visible:outline-black",
      },
      elegant: {
        galleryItem: "rounded-lg border-line-subtle bg-layer-muted",
        galleryAction: [
          "rounded-md border-line-subtle bg-layer-popover/90 text-foreground-icon",
          "hover:text-foreground",
        ],
      },
    },
  },
});

export type MessageMediaVariantProps = VariantProps<typeof messageMedia>;
