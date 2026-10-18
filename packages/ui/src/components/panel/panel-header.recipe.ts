import { tv } from "../../lib/tv";

/**
 * Where a head's edge controls sit, shared by every head (panel, section,
 * drawer, thread). Phone: a filled thing (a sticker, a pill) puts its shape
 * on 16. A ghost button has no shape, so its empty 44px box overhangs, and
 * the two edge buttons mirror each other: the last action (6px padding,
 * `panelHeadActions`' -3px) and a leading Back (16px padding, -13px) both sit
 * 3px from their edge. Their 22px icon frames are then 14px in and every
 * glyph's centre 25px in, whatever the glyph (an arrow, a gear, a narrow ⋮);
 * aligning ink instead would move each button by its glyph's own side
 * bearing. A Button straight in the head (ghost ones are PanelActions) is a
 * filled control, so its shape ends on the content edge: 20 / 16.
 */
export const panelHeadEdges = [
  "pr-3 pl-5 max-md:pr-1.5 max-md:pl-4",
  "max-md:[&>[data-slot=panel-action]:first-child]:-ml-[13px]",
  "[&>[data-slot=button]:last-child]:mr-2 max-md:[&>[data-slot=button]:last-child]:mr-2.5",
];

/**
 * A head's trailing actions. The last glyph ends on the head's edge: 20px on
 * desktop (12px of padding, 1px here, the 32px button's 7px glyph inset); on
 * a phone 14px in (44px buttons, 11px inset), mirroring a leading Back.
 */
export const panelHeadActions = "flex shrink-0 items-center gap-0.5 mr-[-3px] md:mr-px md:gap-1";

/**
 * `header` and `sectionHeader` share one bar, expressed through
 * `compoundSlots`: a 56px row (the shell header height) with a seam under it.
 * On a phone the section head sits on the frame.
 */
export const panelHeader = tv({
  slots: {
    header: [],
    sectionHeader: [],
    headerIcon: [
      "flex size-[27px] shrink-0 items-center justify-center",
      "rounded-sticker border-[1.5px] border-sticker-ink bg-brand text-sticker-ink ring-[1.5px] ring-sticker-edge",
      "not-data-[icon-kind=avatar]:[&_svg]:size-3.5 not-data-[icon-kind=avatar]:[&_svg]:stroke-2",
      "data-[icon-kind=avatar]:size-auto data-[icon-kind=avatar]:border-transparent data-[icon-kind=avatar]:bg-transparent",
    ],
    headerContent: "flex min-w-0 flex-1 flex-col justify-center",
    heading: "flex min-w-0 items-center gap-2",
    title: "truncate font-sans text-headline font-bold text-foreground",
    meta: "min-w-0 truncate font-sans text-caption text-foreground-hint",
    status: [
      "inline-flex shrink-0 items-center gap-1 border-0 bg-transparent p-0",
      "font-sans text-caption font-medium normal-case text-foreground-hint",
      "[&_svg]:size-3.5 [&_svg]:shrink-0",
    ],
    activity: [
      "inline-flex shrink-0 items-center gap-1.5",
      "font-sans text-caption text-foreground-hint",
      "[&_svg]:size-3.5 [&_svg]:shrink-0",
    ],
    actions: panelHeadActions,
  },
  variants: {
    size: {
      sm: {},
      md: { meta: ["text-footnote"] },
    },
  },
  compoundSlots: [
    {
      slots: ["header", "sectionHeader"],
      class: [
        "flex h-(--shell-header-height,56px) shrink-0 items-center gap-3 max-md:gap-2",
        panelHeadEdges,
        "border-b border-line-seam bg-layer-canvas text-foreground",
        "max-md:sticky max-md:top-0 max-md:z-30",
      ],
    },
    {
      slots: ["sectionHeader"],
      class: [
        "max-md:bg-layer-frame max-md:text-foreground-on-frame",
        "max-md:[&>[data-slot=panel-header-icon]]:hidden",
        "max-md:**:data-[slot=panel-title]:text-foreground-on-frame",
        "max-md:**:data-[slot=panel-meta]:text-foreground-on-frame-muted",
        "max-md:**:data-[slot=panel-action]:text-foreground-on-frame",
        "max-md:**:data-[slot=panel-action]:hover:bg-fill-frame-pressed max-md:**:data-[slot=panel-action]:active:bg-fill-frame-pressed",
      ],
    },
  ],
});
