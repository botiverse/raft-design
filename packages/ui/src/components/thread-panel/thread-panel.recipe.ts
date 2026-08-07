import { tv } from "../../lib/tv";

export const threadPanel = tv({
  slots: {
    root: ["isolate flex h-full min-h-0 w-full flex-col", "dark:bg-layer-card"],
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
    replySummary: ["px-3 pt-2"],
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
          "bg-white px-2.5 border-b-2 border-black",
          "[&_[data-message-item]]:bg-white",
        ],
        replyCount: "border-black/10 text-black/40",
        footer: "border-t-2 border-black bg-white text-black/50",
      },
      elegant: {
        root: [
          "relative bg-transparent font-sans text-foreground-strong",
          "dark:md:shadow-[-4px_0_8px_-5px_oklch(0_0_0_/_0.55),0_16px_32px_-8px_oklch(0_0_0_/_0.45)]",
        ],
        header: [
          "relative isolate h-auto min-h-[var(--shell-header-height,56px)] max-lg:z-10 [@media(max-height:600px)]:h-auto",
          "bg-layer-page",
          "max-lg:gap-2 max-lg:pl-5 max-lg:pr-3.5 max-md:h-[var(--shell-header-height,56px)]",
          "max-lg:before:pointer-events-none max-lg:before:absolute max-lg:before:inset-x-0 max-lg:before:top-0 max-lg:before:-bottom-3 max-lg:before:z-0",
          "max-lg:before:bg-[linear-gradient(to_bottom,var(--layer-page),transparent)] max-lg:before:backdrop-blur-sm",
          "max-lg:before:[mask-image:linear-gradient(to_bottom,black_50%,transparent)] max-lg:before:[-webkit-mask-image:linear-gradient(to_bottom,black_50%,transparent)]",
          "max-lg:before:content-[''] max-lg:[&>*]:relative max-lg:[&>*]:z-10",
        ],
        content: [
          "relative overflow-clip",
          "bg-layer-panel",
          "dark:bg-transparent dark:lg:shadow-[inset_0_1px_0_oklch(0.985_0.004_106.42_/_0.07),inset_0_0_0_1px_oklch(0.985_0.004_106.42_/_0.03)]",
          "[&_[data-message-item]]:px-[18px] [&_[data-message-item]]:max-lg:px-3",
        ],
        title: [
          "font-heading text-[17px] font-medium leading-tight tracking-tight tabular-nums",
          "text-foreground-muted",
        ],
        titleMeta: "text-foreground-muted",
        search: ["max-lg:pl-5 max-lg:pr-3.5", "border-b border-line-muted bg-layer-page"],
        searchTrailing: [
          "[&>[data-slot=thread-panel-actions]]:gap-0.5",
          "[&_[data-slot=panel-action]]:px-1.5 [&_[data-slot=panel-action]]:py-1.5",
          "[&_[data-slot=panel-action]>svg]:size-3.5",
        ],
        searchCount: "text-foreground-muted",
        originalMessage: [
          "bg-transparent",
          "border-b border-line-muted",
          "[&_[data-message-item]]:bg-transparent",
        ],
        replySummary: "px-5 max-lg:px-3.5",
        replyCount: "border-line-hairline text-foreground-muted",
        footer: ["px-5 max-lg:px-3.5 md:px-5 max-md:px-3.5", "text-foreground-muted"],
      },
    },
  },
});
