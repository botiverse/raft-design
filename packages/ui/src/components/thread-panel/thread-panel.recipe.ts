import { tv } from "../../lib/tv";

export const threadPanel = tv({
  slots: {
    root: ["isolate flex h-full min-h-0 w-full flex-col"],
    header: ["flex h-[var(--shell-header-height,62px)] shrink-0 items-center gap-3 px-5"],
    content: ["flex min-h-0 min-w-0 flex-1 flex-col"],
    title: ["m-0 min-w-0 flex-1 truncate", "text-base font-bold"],
    titleMeta: ["font-normal"],
    actions: ["flex shrink-0 items-center gap-1.5"],
    search: [
      "relative z-20 flex shrink-0 items-center gap-1.5 px-5 py-2",
      "[&>[data-slot=input-group]]:min-w-0 [&>[data-slot=input-group]]:flex-1",
    ],
    searchTrailing: ["ml-auto flex shrink-0 items-center gap-1.5"],
    searchCount: ["shrink-0 whitespace-nowrap font-mono text-xs tabular-nums"],
    originalMessage: ["relative shrink-0"],
    replyCount: ["mb-1 border-b pb-2 text-center font-mono text-xs"],
    footer: ["text-xs"],
  },
  variants: {
    theme: {
      brutal: {
        root: "bg-white font-sans text-black",
        header: "border-b-2 border-black bg-white",
        content: "bg-white",
        title: "text-black",
        titleMeta: "text-black/50",
        search: "border-b-2 border-black bg-white",
        searchCount: "text-black/50",
        originalMessage: [
          "bg-white border-b-2 border-black",
          "[&_[data-slot=message-item]]:bg-white",
        ],
        replyCount: "border-black/10 text-black/40",
        footer: "border-t-2 border-black bg-white text-black/50",
      },
      elegant: {
        root: "bg-transparent font-sans text-foreground",
        header: [
          "relative isolate h-auto min-h-[var(--shell-header-height,56px)] max-lg:z-10 [@media(max-height:600px)]:h-auto",
          "border-b-0 bg-layer-page",
          "max-lg:gap-2 max-lg:px-[14px] max-md:h-[var(--shell-header-height,56px)]",
          "max-lg:border-b max-lg:border-line-subtle",
          "max-lg:before:pointer-events-none max-lg:before:absolute max-lg:before:inset-x-0 max-lg:before:top-0 max-lg:before:-bottom-3 max-lg:before:z-0",
          "max-lg:before:bg-[linear-gradient(to_bottom,var(--layer-page),transparent)] max-lg:before:backdrop-blur-sm",
          "max-lg:before:[mask-image:linear-gradient(to_bottom,black_50%,transparent)] max-lg:before:[-webkit-mask-image:linear-gradient(to_bottom,black_50%,transparent)]",
          "max-lg:before:content-[''] max-lg:[&>*]:relative max-lg:[&>*]:z-10",
        ],
        content: [
          "relative overflow-clip",
          "bg-layer-panel md:shadow-xl",
          "[&_[data-slot=message-item]]:px-5 [&_[data-slot=message-item]]:max-lg:px-[14px]",
        ],
        title: [
          "font-heading text-[17px] font-medium leading-tight tracking-tight tabular-nums",
          "text-foreground-muted",
        ],
        titleMeta: "text-foreground-muted",
        search: ["max-lg:px-[14px]", "border-b border-line-subtle bg-transparent"],
        searchTrailing: [
          "[&>[data-slot=thread-panel-actions]]:gap-0.5",
          "[&_[data-slot=panel-action]]:px-1.5 [&_[data-slot=panel-action]]:py-1.5",
          "[&_[data-slot=panel-action]>svg]:size-3.5",
        ],
        searchCount: "text-foreground-muted",
        originalMessage: [
          "bg-transparent",
          "border-b border-line-subtle",
          "[&_[data-slot=message-item]]:bg-transparent",
        ],
        replyCount: "border-line-muted text-foreground-muted",
        footer: ["px-5 max-lg:px-[14px] md:px-5 max-md:px-[14px]", "text-foreground-muted"],
      },
    },
  },
});
