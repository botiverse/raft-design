import { searchHit } from "../../lib/search-hit";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";

export const messageItem = tv({
  slots: {
    root: [
      "group/message relative flex h-fit gap-3",
      // The toolbar/continuation-time affordances key off variables the root
      // sets on itself for hover / focus-within / an open popup; the old
      // group-has-* variants styled descendants off an ancestor :has() —
      // a whole-page recalc trap (#386).
      "hover:[--mi-toolbar-opacity:1] hover:[--mi-toolbar-pe:auto] focus-within:[--mi-toolbar-opacity:1] focus-within:[--mi-toolbar-pe:auto]",
      "has-data-popup-open:[--mi-toolbar-opacity:1] has-data-popup-open:[--mi-toolbar-pe:auto]",
      "min-h-0 px-2 py-2",
      "hover:bg-fill-pressed data-popup-open:bg-fill-pressed has-data-popup-open:bg-fill-pressed",
      "hover:[--mi-ct-color:var(--foreground-hint)] has-data-popup-open:[--mi-ct-color:var(--foreground-hint)]",
      "has-data-[slot=message-item-search-match]:bg-info-soft has-data-[slot=message-item-search-match]:hover:bg-info-soft",
      "has-[[data-slot=message-multi-select-checkbox][data-checked]]:bg-info-soft",
      "has-[[data-slot=message-multi-select-checkbox][data-checked]]:hover:bg-info-soft",
    ],
    gutter: ["relative shrink-0 self-stretch", "w-[35px]"],
    avatarSlot: [
      "relative shrink-0 self-start",
      "flex w-[35px] justify-center",
      "[&_[data-slot=avatar][data-size=md]]:size-(--mi-avatar,35px)",
    ],
    continuationTime: [
      "absolute right-0 select-none whitespace-nowrap tabular-nums",
      "top-1 font-mono text-mono-meta",
      "text-(--mi-ct-color,transparent)",
    ],
    content: ["min-w-0 flex-1", "text-body text-foreground"],
    // No right-side reserve: the hover toolbar rides the message's top edge
    // and takes the time's place (the time fades out while it shows), so the
    // header keeps its full width.
    header: "mb-px flex min-w-0 items-center gap-1.5 overflow-hidden",
    sender: [
      "min-w-0 shrink-0 truncate",
      "data-[slot=message-item-sender-button]:cursor-pointer",
      "text-subhead font-bold text-foreground",
      "data-[slot=message-item-sender-button]:hover:underline data-[slot=message-item-sender-button]:hover:decoration-[1.5px] data-[slot=message-item-sender-button]:hover:underline-offset-[3px]",
      "rounded-[2px] outline-none focus-visible:shadow-focus",
    ],
    senderBadges: ["inline-flex shrink-0 items-center gap-1"],
    meta: ["min-w-0 truncate", "text-caption text-foreground-hint"],
    time: [
      "shrink-0 whitespace-nowrap",
      "ml-auto font-mono text-mono-meta tabular-nums text-foreground-hint",
      "opacity-[calc(1-var(--mi-toolbar-opacity,0))]",
    ],
    inlineStatus: ["shrink-0", "text-caption text-foreground-hint"],
    body: [
      "wrap-break-word select-text",
      "**:select-text",
      "text-body text-foreground",
      "selection:bg-brand-soft",
    ],
    searchMatch: searchHit,
    embedded: ["min-w-0", "mt-2"],
    attachments: ["stack-y-2", "mt-2"],
    footer: ["mt-1.5 flex flex-wrap items-center gap-1.5"],
    toolbar: [
      "absolute z-20 flex items-center",
      "opacity-(--mi-toolbar-opacity,0)",
      "[pointer-events:var(--mi-toolbar-pe,none)]",
      "top-[-16px] right-3 gap-0.5 overflow-visible rounded-control p-0.5",
      "bg-layer-popover ring-1 ring-line-seam ring-inset shadow-float",
    ],
    toolbarButton: [
      "inline-flex shrink-0 items-center justify-center",
      "[&_svg]:shrink-0",
      "size-7 rounded-control border-0 bg-transparent p-0",
      "text-foreground-muted hover:bg-fill-pressed active:bg-fill-pressed",
      "data-popup-open:bg-fill-pressed data-active:text-foreground",
      "outline-none focus-visible:shadow-focus",
      "[&_svg]:size-4",
    ],
  },
  variants: {
    compact: {
      true: { root: ["pt-0"] },
    },
  },
});

export type MessageItemVariantProps = VariantProps<typeof messageItem>;
