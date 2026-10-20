import { tv } from "../../lib/tv";

export const messageVideoPreview = tv({
  slots: {
    root: [
      "group/video relative aspect-video w-full overflow-hidden",
      "bg-black text-left",
      "max-w-[min(360px,calc(100vw-112px))] rounded-container border border-line-hairline bg-clip-padding",
    ],
    media: "block size-full  bg-black object-contain",
    fallback: "flex size-full  items-center justify-center bg-black text-white",
    failureContent: [
      "flex max-w-[256px] flex-col items-center px-4 text-center",
      "gap-2 font-sans text-caption font-semibold",
    ],
    failureIcon: ["[&_svg]:size-6 [&_svg]:stroke-2"],
    failureTitle: [],
    failureAction: [
      "inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-white/75 [font:inherit]",
      "decoration-[1.5px] underline-offset-[3px] hover:text-white hover:underline",
      "outline-1 outline-offset-2 outline-transparent focus-visible:outline-white",
      "[&_svg]:size-[13px]",
    ],
    action: [
      "absolute flex items-center justify-center",
      "transition-colors duration-150",
      "outline-[1px] outline-offset-2 outline-transparent focus-visible:outline-foreground",
      "disabled:cursor-default [&_svg]:shrink-0",
      "top-2 right-2 size-8 rounded-control border-[1.5px] border-line-strong",
      "bg-layer-card text-foreground hover:bg-layer-card hover:text-foreground hover:press-overlay active:press-overlay",
      "outline-none focus-visible:shadow-focus",
      "disabled:border-line-hairline disabled:bg-fill-muted disabled:bg-none disabled:text-foreground-disabled",
      "[&_svg]:size-4",
    ],
  },
});
