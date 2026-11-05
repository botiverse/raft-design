import { tv } from "../../lib/tv";

// Raft DS › Page structure › The web top bar.
//
// Height: a frame item with the header air above and below (34 + 2 x 5 = 44
// with a mouse, 36 + 2 x 6 = 48 on a touch screen), on the frame with a seam
// under it.
//
// Three grid columns. The two sides are equal fractions and carry their own
// insets, so the center column sits on the window's center line whatever the
// sides hold and however differently the two ends are inset. A side never
// shrinks below its content (a fraction's minimum is its content), so at a
// narrow width the center first moves away from a side that needs more than
// half the room, then narrows, down to its 160px minimum, when the two sides
// leave less than its width; it never covers a side.
//
// Start: lined up with the rail's items, which the rail centers in its width
// less its seam (6px with a mouse, 8px on a touch screen; the short window's
// rail as the rail does), after the start frame inset.
//
// End: the column margin (16px with a mouse, 20px on a touch screen) after the
// end frame inset, and a last icon button pulled outward by its icon inset, so
// its icon box, not the button, ends on the margin (lib/head-edges.ts).
//
// The frame insets are the window's own controls on a desktop shell; the web
// sets none, so they read 0.
export const webTopBar = tv({
  slots: {
    root: [
      "grid grid-cols-[1fr_auto_1fr] items-center",
      "h-[calc(var(--frame-item-height)+2*var(--header-air))] shrink-0",
      "border-b border-line-seam",
      "bg-layer-frame text-foreground-on-frame frame-decor-top",
    ],
    start: [
      "flex items-center justify-start pe-2",
      "ps-[calc(var(--raft-frame-inset-start,0px)+(var(--rail-width)-1px-var(--rail-item))/2)]",
      "[@media(max-height:600px)]:ps-[calc(var(--raft-frame-inset-start,0px)+(var(--rail-width-short)-1px-var(--rail-item-short))/2)]",
    ],
    center: ["flex min-w-40 items-center justify-center"],
    end: [
      "flex items-center justify-end ps-2",
      "pe-[calc(var(--raft-frame-inset-end,0px)+var(--column-margin))]",
      "[&>[data-icon-inset]:nth-last-child(1_of_:not([data-base-ui-focus-guard],[aria-owns]))]:-me-icon-inset",
    ],
  },
});
