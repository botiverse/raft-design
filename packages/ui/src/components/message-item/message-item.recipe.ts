import { searchHit } from "../../lib/search-hit";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";

const sender = [
  "min-w-0 truncate",
  "text-subhead font-bold text-foreground",
  "rounded-[2px] outline-none focus-visible:shadow-focus",
];

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
      // The highlight sits 4px above and below the text on every row. The
      // 8px between groups is a transparent top border the highlight doesn't
      // paint (bg-clip-padding); a continuation row has none, so it sits
      // under the row it continues.
      "min-h-0 px-2 py-1 border-t-8 border-transparent bg-clip-padding",
      // task #1309 (artea): the hover highlight is a rounded frame, not a
      // square slab — the reply surface inside it keeps radius-container
      // (10px) and the frame derives: inner + the 8px row padding that
      // separates them (shape.md §Nested corners). Radius is invisible until
      // the highlight paints on hover.
      "rounded-[calc(var(--radius-container)+8px)]",
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
      "top-[calc((var(--text-body--line-height)-var(--text-mono-meta--line-height))/2)]",
      "font-mono text-mono-meta",
      "text-(--mi-ct-color,transparent)",
    ],
    content: ["min-w-0 flex-1", "text-body text-foreground"],
    // With a mouse, the header ends where the hover toolbar begins, so the
    // toolbar never covers the name or the time. A product with more toolbar
    // buttons sets --mi-toolbar-reserve to the toolbar's width plus its inset.
    header: [
      "mb-px flex min-w-0 items-center gap-1.5 overflow-hidden",
      "pointer-fine:pe-(--mi-toolbar-reserve,6.5rem)",
    ],
    // The role grows into what is left after the name and badges (it has no
    // basis of its own), so it gives way first; the name shrinks only once
    // the role is gone. Badges never shrink.
    senderGroup: [
      "flex min-w-0 items-center gap-1.5 overflow-hidden",
      "*:data-[slot=message-item-meta]:basis-0 *:data-[slot=message-item-meta]:grow",
    ],
    sender,
    // Its own slot, not a data-slot selector: a Tooltip trigger or another
    // render wrapper replaces data-slot, and the hover underline went with it.
    senderButton: [
      ...sender,
      "cursor-pointer",
      "decoration-[1.5px] underline-offset-[3px] hover:underline",
    ],
    senderBadges: ["inline-flex shrink-0 items-center gap-1"],
    meta: ["min-w-0 truncate", "text-caption text-foreground-hint"],
    time: [
      "shrink-0 whitespace-nowrap",
      "font-mono text-mono-meta tabular-nums text-foreground-hint",
    ],
    inlineStatus: ["shrink-0", "text-caption text-foreground-hint"],
    edited: ["ms-1 whitespace-nowrap", "text-caption text-foreground-hint"],
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
      "top-[-16px] right-3 gap-0.5 overflow-visible rounded-container p-0.5",
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
      true: { root: ["border-t-0"] },
    },
  },
});

export type MessageItemVariantProps = VariantProps<typeof messageItem>;
