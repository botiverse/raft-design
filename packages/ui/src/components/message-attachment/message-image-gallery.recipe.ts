import { tv } from "../../lib/tv";

export const messageImageGallery = tv({
  slots: {
    root: "max-w-[min(352px,calc(100vw-112px))] md:max-w-[448px]",
    item: "group/img relative overflow-hidden text-left",
    media: "block h-full w-full",
    overlay: "absolute inset-0 flex items-center justify-center",
    preview: "absolute inset-0",
    action: [
      "absolute right-1 bottom-1 z-10 hidden size-6 items-center justify-center",
      "focus:flex",
      "group-hover/img:flex",
      "[&_svg]:size-3",
    ],
  },
  variants: {
    theme: {
      brutal: {
        root: "space-y-2",
        item: [
          "border-2 border-black bg-brutal-cream/60 hover:brightness-95",
          "has-[[data-slot=message-image-gallery-overlay]]:opacity-70 has-[[data-slot=message-image-gallery-overlay]]:hover:brightness-100",
        ],
        preview:
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-black",
        action:
          "border border-black bg-white/80 text-black/50 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
      },
      elegant: {
        root: "space-y-2",
        item: [
          "rounded-md bg-fill-muted shadow-raft-xs",
          "transition-shadow duration-150 hover:shadow-raft-sm",
          "has-[[data-slot=message-image-gallery-overlay]]:opacity-70",
        ],
        preview:
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-line-strong",
        action: [
          "rounded-full border-0 bg-white/75 text-foreground-muted shadow-none backdrop-blur-md",
          "transition-[background-color,color,opacity,box-shadow,transform] duration-150",
          "hover:bg-white/85 hover:text-foreground active:scale-[0.97]",
          "outline outline-[1px] outline-offset-2 outline-transparent focus-visible:outline-foreground",
        ],
      },
    },
  },
});
