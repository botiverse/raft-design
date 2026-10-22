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
      // While the toolbar shows, the header fades out its end under it
      // (header, below): the toolbar's width (measured onto the row by
      // MessageItemToolbar) plus the 4px it sits inside the header's end
      // (right-3 against the row's px-2) and a 4px gap, after a 12px fade.
      // Without a toolbar on the row the width is unset, the gradient is
      // invalid, and the header has no mask.
      "hover:[--mi-header-mask:linear-gradient(to_left,transparent_calc(var(--mi-toolbar-width)+8px),black_calc(var(--mi-toolbar-width)+20px))]",
      "focus-within:[--mi-header-mask:linear-gradient(to_left,transparent_calc(var(--mi-toolbar-width)+8px),black_calc(var(--mi-toolbar-width)+20px))]",
      "has-data-popup-open:[--mi-header-mask:linear-gradient(to_left,transparent_calc(var(--mi-toolbar-width)+8px),black_calc(var(--mi-toolbar-width)+20px))]",
      // The highlight sits a row inset (4px) above and below the text on
      // every row. The rest of the message step that opens a turn (8px) is a
      // transparent top border the highlight doesn't paint (bg-clip-padding),
      // so two turns sit 16px apart, text to text; a continuation row has
      // none, so it sits under the row it continues
      // (design/foundations/spacing.md#timeline-rhythm).
      "min-h-0 px-2 py-timeline-row border-t-(length:--spacing-timeline-turn) border-transparent bg-clip-padding",
      "hover:[--mi-ct-color:var(--foreground-hint)] has-data-popup-open:[--mi-ct-color:var(--foreground-hint)]",
      // The highlight is --mi-row-fill, set here once per state and painted
      // as the background, so parts that paint the row's surface around
      // themselves (the delegated face's ring) read the same value. Read off
      // the root, not through group-has-*: see no-ancestor-has.test.ts.
      // At rest the fill is the located highlight: transparent unless the row
      // is located (styles.css animates --located-fill), so every mark below
      // wins over it, and hover doesn't replace it while it lasts.
      "bg-(--mi-row-fill) [--mi-row-fill:var(--located-fill)]",
      "not-data-located:hover:[--mi-row-fill:var(--fill-subtle)]",
      // An open menu marks its message with the same subtle tier as a hover:
      // on a phone it is the only sign of which message the menu acts on
      // (states.md#hover-and-press).
      "data-popup-open:[--mi-row-fill:var(--fill-subtle)] has-data-popup-open:[--mi-row-fill:var(--fill-subtle)]",
      "has-data-[slot=message-item-search-match]:[--mi-row-fill:var(--info-soft)] has-data-[slot=message-item-search-match]:hover:[--mi-row-fill:var(--info-soft)]",
      "has-[[data-slot=message-multi-select-checkbox][data-checked]]:[--mi-row-fill:var(--info-soft)]",
      "has-[[data-slot=message-multi-select-checkbox][data-checked]]:hover:[--mi-row-fill:var(--info-soft)]",
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
    // The header keeps no room for the hover toolbar: it takes the full
    // width at rest and on hover, so hovering never reflows the line. Where
    // the line is long enough to reach the corner, its end fades out under
    // the toolbar while the toolbar shows (stdrc, 2026-10-22): the toolbar's
    // card reaches only part of the line's height, so covering alone left
    // half-cut letters below and beside it.
    //
    // With a "sent by" label the owner keeps at least 3rem (or its whole
    // name, if shorter): its basis is 3rem, capped at its own width, it grows
    // into what is free and never shrinks. When even that doesn't fit (a
    // narrow thread), the label gives way instead: plain words wrap onto as
    // many lines as they need, aligned on the first line's baseline.
    //
    // The name, the notes and the time stand on the name's baseline, not on
    // the centre of their boxes: they are three sizes in two faces, and
    // centring the boxes lifts the smaller notes off the line by up to 1px.
    // Space Mono and Space Grotesk share a cap height (0.7em), so on one
    // baseline the time's digits stand as tall as the role's capitals.
    header: [
      "mb-px flex min-w-0 items-baseline gap-1.5 overflow-hidden",
      "mask-(--mi-header-mask,none)",
      "has-data-[slot=message-item-delegated-by]:[--mi-owner-basis:3rem] has-data-[slot=message-item-delegated-by]:[--mi-owner-flex:1_0]",
    ],
    // The role grows into what is left after the name and badges (it has no
    // basis of its own), so it gives way first; the name shrinks only once
    // the role is gone. Badges never shrink.
    senderGroup: [
      "flex min-w-0 items-baseline gap-1.5 overflow-hidden",
      "flex-[var(--mi-owner-flex,0_1)_var(--mi-owner-basis,auto)] max-w-max",
      "*:data-[slot=message-item-meta]:basis-0 *:data-[slot=message-item-meta]:grow",
      // The gap before the role lives inside it (a 6px spacer that is cut off
      // with it), so a role squeezed to nothing leaves no dead gap after the
      // name, and the name gets that space.
      "*:data-[slot=message-item-meta]:-ms-1.5 *:data-[slot=message-item-meta]:before:inline-block *:data-[slot=message-item-meta]:before:w-1.5 *:data-[slot=message-item-meta]:before:content-['']",
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
    // "sent by Friday": one step stronger than the role, so it is seen at a
    // glance. Each run of words is a grid track as wide as its words, and the
    // name's track can shrink to nothing (the name is min-w-0), so the
    // label's min-content is its words alone: min-w-min keeps the box at
    // least that wide, and it never truncates. With a name, the label caps
    // at 45% of the line and only the name truncates (`pre`: the words never
    // wrap). Plain words ("sent by a deleted assistant") have no cap and wrap
    // (`pre-wrap`) once the owner is down to its 3rem. Both keep the
    // product's own spaces around the name, which a grid item would drop.
    delegatedBy: [
      "inline-grid grid-flow-col items-baseline",
      "min-w-min shrink whitespace-pre-wrap",
      "has-data-[slot=message-item-delegated-by-name]:max-w-[45%] has-data-[slot=message-item-delegated-by-name]:whitespace-pre",
      "has-data-[slot=message-item-delegated-by-button]:max-w-[45%] has-data-[slot=message-item-delegated-by-button]:whitespace-pre",
      "text-caption text-foreground-muted",
    ],
    delegatedByName: ["min-w-0 truncate"],
    delegatedByButton: [
      "min-w-0 truncate",
      "cursor-pointer decoration-1 underline-offset-[3px] hover:underline",
      "rounded-[2px] outline-none focus-visible:shadow-focus",
    ],
    // The assistant's face on the owner's avatar: the presence light's corner
    // and overhang (AvatarBadge on md), at 2xs. The ring is the row's surface
    // (--mi-row-fill over the canvas), outside the die-cut edge in dark mode.
    // The same surface backs the face, so a face that isn't opaque (a
    // deleted assistant's, faded) never shows the owner's avatar through it.
    delegatedAvatar: [
      "size-[19px] group-data-[size=md]/avatar:size-[19px]",
      "rounded-sticker outline-none",
      "bg-layer-canvas bg-[linear-gradient(var(--mi-row-fill,transparent),var(--mi-row-fill,transparent))]",
      "data-deleted:*:data-[slot=avatar]:grayscale data-deleted:*:data-[slot=avatar]:opacity-60",
      "shadow-[0_0_0_1.5px_var(--mi-row-fill,transparent),0_0_0_1.5px_var(--layer-canvas)]",
      "dark:shadow-[0_0_0_3px_var(--mi-row-fill,transparent),0_0_0_3px_var(--layer-canvas)]",
    ],
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
      "top-[-18px] right-3 gap-1 overflow-visible rounded-container p-1",
      "bg-layer-popover ring-1 ring-line-seam ring-inset shadow-float",
    ],
    toolbarButton: [
      "inline-flex shrink-0 items-center justify-center",
      "[&_svg]:shrink-0",
      "size-7 rounded-chip border-0 bg-transparent p-0",
      "text-foreground-muted hover:bg-fill-medium active:bg-fill-medium",
      "data-popup-open:bg-fill-medium data-active:text-foreground",
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
