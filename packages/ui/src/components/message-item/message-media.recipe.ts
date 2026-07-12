import { tv } from "../../lib/tv";

export const messageMedia = tv({
  slots: {
    gallery: ["max-w-[min(22rem,calc(100vw-7rem))] space-y-2 md:max-w-[28rem]"],
    galleryRow: ["grid gap-2"],
    galleryItem: [
      "group/img relative overflow-hidden border-2 border-line-strong text-left",
      "hover:brightness-95",
      "has-[[data-slot=message-image-gallery-overlay]]:opacity-70 has-[[data-slot=message-image-gallery-overlay]]:hover:brightness-100",
      "data-[single=true]:inline-block data-[single=true]:w-fit data-[single=true]:max-w-[26rem] data-[single=true]:justify-self-start",
    ],
    galleryMedia: [
      "block h-full w-full",
      "data-[fit=contain]:object-contain data-[fit=cover]:object-cover",
    ],
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
