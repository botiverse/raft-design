import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";

export const messageItem = tv({
  slots: {
    root: [
      "group/message relative flex h-fit min-h-[3rem] gap-3",
      // The toolbar/continuation-time affordances key off variables the root
      // sets on itself for hover / focus-within / an open popup; the old
      // group-has-* variants styled descendants off an ancestor :has() —
      // a whole-page recalc trap (#133).
      "hover:[--mi-toolbar-opacity:1] hover:[--mi-toolbar-pe:auto] focus-within:[--mi-toolbar-opacity:1] focus-within:[--mi-toolbar-pe:auto]",
      "has-data-popup-open:[--mi-toolbar-opacity:1] has-data-popup-open:[--mi-toolbar-pe:auto]",
    ],
    gutter: ["relative w-9 shrink-0 self-stretch"],
    avatarSlot: ["relative w-9 shrink-0 self-start"],
    continuationTime: ["absolute right-0 top-1 select-none tabular-nums"],
    content: ["min-w-0 flex-1"],
    header: ["flex min-w-0 overflow-hidden pr-24"],
    sender: ["min-w-0 shrink-0 truncate", "data-[slot=message-item-sender-button]:cursor-pointer"],
    senderBadges: ["inline-flex shrink-0 items-center gap-1"],
    meta: ["min-w-0 truncate"],
    time: ["shrink-0 whitespace-nowrap"],
    inlineStatus: ["shrink-0"],
    body: ["wrap-break-word select-text", "**:select-text"],
    searchMatch: ["bg-primary/70 text-inherit [font:inherit]", "dark:bg-primary/30"],
    embedded: ["mt-1.5 min-w-0"],
    attachments: ["mt-1 space-y-2"],
    footer: ["mt-1.5 flex flex-wrap items-center gap-1.5"],
    toolbar: [
      "absolute z-20 flex items-center overflow-hidden",
      "opacity-(--mi-toolbar-opacity,0)",
      "[pointer-events:var(--mi-toolbar-pe,none)]",
    ],
    toolbarButton: ["inline-flex shrink-0 items-center justify-center", "[&_svg]:shrink-0"],
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "mx-3 mb-1 mt-1.5 border-2 border-transparent px-1.5 py-1",
          "hover:border-line-strong hover:bg-layer-panel",
          "data-popup-open:border-line-strong data-popup-open:bg-layer-panel",
          "has-data-popup-open:border-line-strong has-data-popup-open:bg-layer-panel",
          "hover:[--mi-ct-color:color-mix(in_oklab,var(--color-black)_40%,transparent)]",
          "has-data-popup-open:[--mi-ct-color:color-mix(in_oklab,var(--color-black)_40%,transparent)]",
          "has-data-[slot=message-item-search-match]:border-line-strong",
          "has-data-[slot=message-item-search-match]:bg-brutal-cyan/25",
          "has-data-[slot=message-item-search-match]:shadow-raft-md",
          "has-data-[slot=message-item-search-match]:hover:bg-brutal-cyan/25",
        ],
        continuationTime: "font-mono text-[10px] leading-none text-(--mi-ct-color,transparent)",
        // Body + pre-body chips (e.g. AttachmentCommentRefChip) inherit from content.
        // Live Slock applies the same appearance size class to the chip and the body.
        content: "text-sm",
        header: "items-center gap-2",
        sender: [
          "text-sm font-bold text-black",
          "data-[slot=message-item-sender-button]:hover:underline data-[slot=message-item-sender-button]:hover:decoration-2 data-[slot=message-item-sender-button]:hover:underline-offset-2",
        ],
        meta: "font-mono text-xs text-black/40",
        time: "font-mono text-xs text-black/40",
        inlineStatus: "text-[10px] font-bold text-black/40",
        // Live Slock body is appearance `text-sm` only (Tailwind default leading-5).
        body: "text-sm text-black",
        // Narrow tier mirrors the elegant block: the row shrinks its avatar
        // slot with its text (an app whose avatars resize by theme would read
        // as a bug); the square + black-frame form stays brutal's signature.
        gutter: "max-md:w-8",
        avatarSlot: "max-md:w-8 max-md:[&_[data-slot=avatar][data-size=md]]:size-6",
        toolbar: ["-top-3.5 right-2", "border-2 border-line-strong bg-white shadow-raft-sm"],
        toolbarButton: [
          "size-6",
          "text-black/50 hover:bg-primary/30 hover:text-black",
          "data-popup-open:bg-primary/30 data-popup-open:text-black",
          "data-active:text-brutal-orange data-active:hover:text-brutal-orange",
          "[&_svg]:size-[13px]",
        ],
      },
      elegant: {
        root: [
          "border border-transparent max-md:gap-2 px-7 pt-3.5 pb-3 max-md:px-4 max-md:pt-2 max-md:pb-1.5",
          "has-[+[data-compact=true]]:pb-0.5 max-md:has-[+[data-compact=true]]:pb-0",
          "hover:bg-ink-2 data-popup-open:bg-ink-2 has-data-popup-open:bg-ink-2",
          "hover:[--mi-ct-color:color-mix(in_oklab,var(--foreground-muted)_60%,transparent)]",
          "has-data-popup-open:[--mi-ct-color:color-mix(in_oklab,var(--foreground-muted)_60%,transparent)]",
          "has-data-[slot=message-item-search-match]:border-transparent",
          "has-data-[slot=message-item-search-match]:bg-info/10",
          "has-data-[slot=message-item-search-match]:shadow-none",
          "has-data-[slot=message-item-search-match]:hover:bg-info/10",
          "has-data-[slot=message-item-search-match]:ring-[0.5px]",
          "has-data-[slot=message-item-search-match]:ring-inset",
          "has-data-[slot=message-item-search-match]:ring-info/50",
        ],
        gutter: "max-md:w-8",
        avatarSlot: [
          "[&_[data-slot=avatar][data-size=md]]:size-9 [&_[data-slot=avatar][data-size=md]]:border-0",
          "[&_[data-slot=avatar][data-size=md]>[data-slot=avatar-badge]]:-right-px [&_[data-slot=avatar][data-size=md]>[data-slot=avatar-badge]]:-bottom-px",
          "max-md:w-8 max-md:[&_[data-slot=avatar][data-size=md]]:size-6",
        ],
        continuationTime: [
          "top-0 pt-1.5",
          "font-sans text-xs leading-none",
          "text-(--mi-ct-color,transparent)",
        ],
        // Pre-body chips inherit body type size from content (same as brutal).
        content: "text-sm leading-5.25 tracking-[-0.01em]",
        header: "items-baseline gap-1.5",
        sender: [
          "text-sm font-medium leading-none text-foreground-muted",
          "data-[slot=message-item-sender-button]:hover:underline data-[slot=message-item-sender-button]:hover:decoration-2 data-[slot=message-item-sender-button]:hover:underline-offset-2",
        ],
        meta: "font-sans text-xs leading-none text-foreground-muted/70",
        time: "font-sans text-xs leading-none tabular-nums text-foreground-muted/70",
        inlineStatus: "font-sans text-[11px] font-medium leading-none text-foreground-muted",
        body: [
          "mt-1.5 mb-1.5 max-md:mt-1 max-md:mb-1",
          "text-sm leading-5.25 tracking-[-0.01em] text-foreground-muted",
          "group-data-[compact=true]/message:mt-0 group-data-[compact=true]/message:mb-0",
        ],
        toolbar: [
          "top-1 right-[29px]",
          "gap-0.5 rounded-lg px-1 py-0.5",
          "border-[0.5px] border-line-muted bg-layer-panel shadow-raft-xs",
          "dark:border-transparent",
        ],
        toolbarButton: [
          "size-7 rounded-md border border-transparent bg-transparent p-0",
          "text-foreground-icon hover:bg-fill-muted hover:text-foreground-strong",
          "data-popup-open:bg-fill-muted data-popup-open:text-foreground-strong",
          "focus-visible:ring-[0.5px] focus-visible:ring-primary-500",
          "data-active:text-primary-400 data-active:hover:text-primary-400",
          "[&_svg]:size-3.5",
        ],
        footer: "mt-2.5 max-md:mt-1.5",
      },
    },
    compact: {
      true: {},
    },
  },
  compoundVariants: [
    { theme: "brutal", compact: true, class: { root: "mt-0 min-h-0 py-1" } },
    {
      theme: "elegant",
      compact: true,
      class: { root: "mt-0 min-h-0 pt-1.5 pb-1.5 max-md:pt-1.5 max-md:pb-1.5" },
    },
  ],
});

export type MessageItemVariantProps = VariantProps<typeof messageItem>;
