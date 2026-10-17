import { tv } from "../../lib/tv";

export const messageVideoPreview = tv({
  slots: {
    root: [
      "group/video relative aspect-video w-full max-w-[min(448px,calc(100vw-112px))] overflow-hidden",
      "bg-black text-left",
    ],
    media: "block size-full  bg-black object-contain",
    fallback: "flex size-full  items-center justify-center bg-black text-white",
    failureContent: "flex max-w-[256px] flex-col items-center px-4 text-center text-xs",
    failureIcon: "[&_svg]:size-6",
    failureTitle: [],
    failureAction: [
      "inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-white/75 [font:inherit]",
      "hover:text-white",
      "outline outline-1 outline-offset-2 outline-transparent focus-visible:outline-white",
      "[&_svg]:size-[13px]",
    ],
    action: [
      "absolute right-1.5 top-1.5 flex size-6 items-center justify-center",
      "border border-black bg-white/80 text-black/60 hover:bg-white hover:text-black",
      "transition-colors duration-150",
      "outline outline-[1px] outline-offset-2 outline-transparent focus-visible:outline-foreground",
      "disabled:cursor-default [&_svg]:size-3 [&_svg]:shrink-0",
    ],
  },
  variants: {
    theme: {
      brutal: {
        root: "border-2 border-black",
        action: "rounded-none",
        failureContent: "gap-2 font-bold",
        failureIcon: "[&_svg]:stroke-2",
      },
      elegant: {
        root: "rounded-lg border border-line-muted shadow-raft-xs dark:border-transparent",
        action: [
          "rounded-full border-0 bg-white/75 text-foreground-muted shadow-none backdrop-blur-md",
          "dark:text-[oklch(0.36_0.006_106.42)] dark:hover:text-[oklch(0.21_0.006_106.42)]",
          "transition-[background-color,color,opacity,box-shadow,transform] duration-150",
          "hover:bg-white/85 hover:text-foreground active:scale-[0.97]",
          "outline outline-[1px] outline-offset-2 outline-transparent focus-visible:outline-foreground",
        ],
        failureContent: "gap-3",
        failureIcon: "[&_svg]:stroke-[1.5]",
        failureTitle: "font-medium",
      },
      raft: {
        root: "max-w-[min(360px,calc(100vw-112px))] rounded-container border border-line-muted bg-clip-padding",
        action: [
          "top-2 right-2 size-8 rounded-control border-[1.5px] border-line-strong",
          "bg-layer-card text-foreground hover:bg-layer-card hover:text-foreground hover:press-overlay active:press-overlay",
          "outline-none focus-visible:shadow-raft-focus",
          "disabled:border-line-muted disabled:bg-fill-muted disabled:bg-none disabled:text-foreground-disabled",
          "[&_svg]:size-4",
        ],
        failureContent: "gap-2 font-sans text-caption font-semibold",
        failureIcon: "[&_svg]:size-6 [&_svg]:stroke-2",
      },
    },
  },
});
