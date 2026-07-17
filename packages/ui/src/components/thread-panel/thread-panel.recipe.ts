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
      "relative z-20 flex shrink-0 items-center gap-1.5 px-2 py-2",
      "[&>[data-slot=input-group]]:min-w-0 [&>[data-slot=input-group]]:flex-1",
    ],
    searchCount: ["w-20 shrink-0 text-center font-mono text-xs"],
    originalMessage: [
      "relative shrink-0",
      "[&[data-slot=thread-panel-original-message]]:px-3",
      "[&[data-slot=thread-panel-original-message]]:py-1",
    ],
    replyCount: ["mb-1 border-b pb-2 text-center font-mono text-xs"],
    footer: ["text-xs"],
  },
  variants: {
    theme: {
      brutal: {
        root: "bg-white font-sans text-black",
        header: [
          "border-b-2 border-black bg-white",
          "max-md:h-[var(--shell-header-height-with-safe-area)] max-md:pt-[env(safe-area-inset-top,0px)]",
        ],
        content: "bg-white",
        title: "text-black",
        titleMeta: "text-black/50",
        search: "border-b-2 border-black bg-white",
        searchCount: "text-black/50",
        originalMessage: [
          "bg-white",
          "[&[data-slot=thread-panel-original-message]]:border-b-2",
          "[&[data-slot=thread-panel-original-message]]:border-black",
          "[&[data-slot=message-item]]:m-0 [&[data-slot=message-item]]:px-5 [&[data-slot=message-item]]:py-3.5",
          "[&[data-slot=message-item]]:border-transparent [&[data-slot=message-item]]:border-b-2 [&[data-slot=message-item]]:border-b-black",
        ],
        replyCount: "border-black/10 text-black/40",
        footer: "border-t-2 border-black bg-white text-black/50",
      },
      elegant: {
        root: "bg-transparent font-sans text-foreground",
        header: [
          "relative isolate h-auto min-h-[var(--shell-header-height,56px)] max-lg:z-10 [@media(max-height:600px)]:h-auto",
          "border-b-0 bg-layer-page",
          "max-lg:gap-2 max-lg:px-[14px] max-md:h-[var(--shell-header-height-with-safe-area)] max-md:pt-[env(safe-area-inset-top,0px)]",
          "max-lg:border-b max-lg:border-line-subtle",
          "max-lg:before:pointer-events-none max-lg:before:absolute max-lg:before:inset-x-0 max-lg:before:top-0 max-lg:before:-bottom-3 max-lg:before:z-0",
          "max-lg:before:bg-[linear-gradient(to_bottom,var(--layer-page),transparent)] max-lg:before:backdrop-blur-sm",
          "max-lg:before:[mask-image:linear-gradient(to_bottom,black_50%,transparent)] max-lg:before:[-webkit-mask-image:linear-gradient(to_bottom,black_50%,transparent)]",
          "max-lg:before:content-[''] max-lg:[&>*]:relative max-lg:[&>*]:z-10",
        ],
        content: ["relative overflow-clip", "bg-layer-panel shadow-xl"],
        title: [
          "font-heading text-[17px] font-medium leading-tight tracking-tight tabular-nums",
          "text-foreground-muted",
          "max-lg:leading-none",
        ],
        titleMeta: "text-foreground-muted",
        search: [
          "border-b border-line-subtle bg-transparent",
          "[&>[data-slot=thread-panel-actions]]:gap-0.5",
        ],
        searchCount: "text-foreground-muted",
        originalMessage: [
          "bg-transparent after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-line-subtle after:content-['']",
          "[&[data-slot=thread-panel-original-message]]:border-b",
          "[&[data-slot=thread-panel-original-message]]:border-line-subtle",
          "[&[data-slot=message-item]]:border-transparent [&[data-slot=message-item]]:border-b [&[data-slot=message-item]]:border-b-line-subtle",
          "[&[data-slot=message-item]]:px-10 [&[data-slot=message-item]]:pt-[18px] [&[data-slot=message-item]]:pb-5",
        ],
        replyCount: "border-line-muted text-foreground-muted",
        footer: "text-foreground-muted",
      },
    },
    mobileScroll: {
      panel: {},
      page: {
        root: ["max-md:h-auto max-md:min-h-dvh max-md:flex-none max-md:overflow-visible"],
        content: ["max-md:h-auto max-md:min-h-0 max-md:flex-none max-md:overflow-visible"],
        header: ["max-md:sticky max-md:top-0 max-md:z-30"],
      },
    },
  },
  defaultVariants: {
    mobileScroll: "panel",
  },
});
