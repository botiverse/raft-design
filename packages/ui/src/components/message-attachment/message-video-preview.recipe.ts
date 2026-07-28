import { tv } from "../../lib/tv";

export const messageVideoPreview = tv({
  slots: {
    root: [
      "group/video relative aspect-video w-full max-w-[min(448px,calc(100vw-112px))] overflow-hidden",
      "bg-black text-left",
    ],
    media: "block h-full w-full bg-black object-contain",
    fallback: "flex h-full w-full items-center justify-center bg-black text-white",
    failureContent: "flex max-w-[256px] flex-col items-center px-4 text-center text-xs",
    failureIcon: "[&_svg]:size-6",
    failureTitle: [],
    failureAction: ["inline-flex items-center gap-1 text-white/75", "[&_svg]:size-[13px]"],
    action: [
      "absolute right-1.5 top-1.5 flex size-6 items-center justify-center",
      "border border-black bg-white/80 text-black/60 hover:bg-white hover:text-black",
      "transition-colors duration-150",
      "outline outline-[1px] outline-offset-2 outline-transparent focus-visible:outline-foreground-strong",
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
        root: "rounded-lg border border-line-subtle shadow-xs",
        action: [
          "rounded-full border-0 bg-white/75 text-foreground-muted shadow-none backdrop-blur-md",
          "transition-[background-color,color,opacity,box-shadow,transform] duration-150",
          "hover:bg-white/85 hover:text-foreground-strong active:scale-[0.97]",
          "outline outline-[1px] outline-offset-2 outline-transparent focus-visible:outline-foreground-strong",
        ],
        failureContent: "gap-3",
        failureIcon: "[&_svg]:stroke-[1.5]",
        failureTitle: "font-medium",
      },
    },
  },
});
