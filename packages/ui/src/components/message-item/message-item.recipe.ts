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
    // The right-side reserve keeps header text clear of the hover toolbar.
    // Narrow hosts (the Thread panel sits ~300px wide inside a wide window)
    // shrink it locally with `--mi-hdr-pr`; 6rem stays the default.
    header: ["flex min-w-0 overflow-hidden pr-(--mi-hdr-pr,6rem)"],
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
          // No horizontal margin: the app shell outside the row supplies the
          // 12px inset (task #44 keep-12 alignment, 2026-10-09); with the row's
          // 6px padding + 2px border the avatar and text sit at 20 from the
          // panel edge in every theme and at every width.
          "mb-1 mt-1.5 border-2 border-transparent px-1.5 py-1",
          // After a system note the row absorbs the rest of the seam so the
          // note keeps a 12/12 rhythm here too (gzj's review).
          "data-follows-system:mt-[5px]",
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
        avatarSlot: [
          // Option B at 32 via the shared variable (lg raises it to 34); the
          // slot centers its wrapper — centering the image inside that
          // wrapper did nothing (Josh's pixel check, 2026-10-11). The +3
          // shift meets brutal's natural-leading name line and is a variable:
          // the sm tier drops it (the smaller name line would overshoot).
          "max-md:w-8 max-md:[&_[data-slot=avatar][data-size=md]]:size-(--mi-avatar-narrow,1.75rem)",
          "flex justify-center",
          "[&_[data-slot=avatar][data-size=md]]:size-(--mi-avatar,2rem)",
          "[&_[data-slot=avatar][data-size=md]]:mt-(--mi-avatar-shift,3px)",
        ],
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
          // 7px + the 1px transparent border = the 8px the alignment needs;
          // with the app shell's 12px inset the avatar and text lines land at
          // 20 / 68 (keep-12 rule, 2026-10-09).
          "border border-transparent max-md:gap-2 px-[7px] pt-[17px] pb-3 max-md:pt-[13px] max-md:pb-1.5",
          // The marker is explicit: the app renders each message inside its own
          // wrapper, so the old sibling has(+[data-compact]) could never match.
          // Two values ride it: a row followed by a continuation collapses to
          // pb-0.5 (group interiors read 12), while a row followed by a new
          // group keeps pb-1.5 (group breaks read 24).
          "data-[followed-by=compact]:pb-0.5 data-[followed-by=group]:pb-1.5",
          // A message right after a system note cancels the rest of the note's
          // 12/12 rhythm (the note itself keeps its 4px lead; see
          // system-message.recipe.ts).
          "data-follows-system:pt-[12px]",
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
          // Option B (2026-10-11): the image reads at 32, horizontally centered
          // in the unchanged 36 slot — the text line and the header icon stay
          // on the 68 line, and the shorter avatar column stops propping up
          // the sm-tier first row.
          "flex justify-center",
          "[&_[data-slot=avatar][data-size=md]]:size-(--mi-avatar,2rem) [&_[data-slot=avatar][data-size=md]]:border-0",
          "[&_[data-slot=avatar][data-size=md]>[data-slot=avatar-badge]]:-right-px [&_[data-slot=avatar][data-size=md]>[data-slot=avatar-badge]]:-bottom-px",
          "max-md:w-8 max-md:[&_[data-slot=avatar][data-size=md]]:size-(--mi-avatar-narrow,1.75rem)",
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
          "text-sm font-semibold leading-none text-foreground-muted",
          "data-[slot=message-item-sender-button]:hover:underline data-[slot=message-item-sender-button]:hover:decoration-2 data-[slot=message-item-sender-button]:hover:underline-offset-2",
        ],
        meta: "font-sans text-xs leading-none text-foreground-hint",
        time: "font-sans text-xs leading-none tabular-nums text-foreground-hint",
        inlineStatus: "font-sans text-[11px] font-medium leading-none text-foreground-hint",
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
      raft: {
        root: [
          "min-h-0 px-2 py-2",
          "hover:bg-fill-pressed data-popup-open:bg-fill-pressed has-data-popup-open:bg-fill-pressed",
          "hover:[--mi-ct-color:var(--foreground-hint)] has-data-popup-open:[--mi-ct-color:var(--foreground-hint)]",
          "has-data-[slot=message-item-search-match]:bg-info-soft has-data-[slot=message-item-search-match]:hover:bg-info-soft",
          "has-[[data-slot=message-multi-select-checkbox][data-checked]]:bg-info-soft",
          "has-[[data-slot=message-multi-select-checkbox][data-checked]]:hover:bg-info-soft",
        ],
        gutter: "w-[35px]",
        avatarSlot: [
          "flex w-[35px] justify-center",
          "[&_[data-slot=avatar][data-size=md]]:size-(--mi-avatar,35px)",
        ],
        continuationTime: ["top-1 font-mono text-mono-meta", "text-(--mi-ct-color,transparent)"],
        content: "text-body text-foreground",
        header: "mb-px items-center gap-1.5 pr-0",
        sender: [
          "text-subhead font-bold text-foreground",
          "data-[slot=message-item-sender-button]:hover:underline data-[slot=message-item-sender-button]:hover:decoration-[1.5px] data-[slot=message-item-sender-button]:hover:underline-offset-[3px]",
          "rounded-[2px] outline-none focus-visible:shadow-raft-focus",
        ],
        meta: "text-caption text-foreground-hint",
        time: [
          "ml-auto font-mono text-mono-meta tabular-nums text-foreground-hint",
          "opacity-[calc(1-var(--mi-toolbar-opacity,0))]",
        ],
        inlineStatus: "text-caption text-foreground-hint",
        body: ["text-body text-foreground", "selection:bg-primary-soft"],
        searchMatch: [
          "rounded-sticker px-[3px] font-bold!",
          "bg-primary text-sticker-ink shadow-[inset_0_0_0_1.5px_var(--sticker-ink)]",
          "dark:bg-primary",
        ],
        embedded: "mt-2",
        attachments: "mt-2",
        toolbar: [
          "top-[-18px] right-3 gap-0.5 overflow-visible rounded-control p-[3px]",
          "bg-layer-popover ring-1 ring-line-seam shadow-raft-float",
        ],
        toolbarButton: [
          "size-8 rounded-control border-0 bg-transparent p-0",
          "text-foreground-icon hover:bg-fill-pressed active:bg-fill-pressed",
          "data-popup-open:bg-fill-pressed data-active:text-foreground",
          "outline-none focus-visible:shadow-raft-focus",
          "[&_svg]:size-[18px]",
        ],
      },
    },
    compact: {
      true: {},
    },
  },
  compoundVariants: [
    { theme: "raft", compact: true, class: { root: "pt-0" } },
    { theme: "brutal", compact: true, class: { root: "mt-0 min-h-0 py-1" } },
    {
      theme: "elegant",
      compact: true,
      class: { root: "mt-0 min-h-0 pt-1.5 pb-1.5 max-md:pt-1.5 max-md:pb-1.5" },
    },
  ],
});

export type MessageItemVariantProps = VariantProps<typeof messageItem>;
