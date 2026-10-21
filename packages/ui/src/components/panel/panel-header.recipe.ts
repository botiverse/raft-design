import { controlIconInset, headEdges } from "../../lib/head-edges";
import { tv } from "../../lib/tv";

/**
 * Where a head's edge controls sit, shared by every head (panel, section,
 * drawer, thread): see lib/head-edges.ts. Both sides pad by the content
 * margin, 20px on a desktop and 16px on a phone, so a filled thing (a sticker,
 * a pill, a filled Button) puts its shape on it, and the first and last
 * frameless icon button are pulled out by their icon inset so their icon box
 * lands on it: 20px on a desktop and on a touch screen with the desktop
 * layout, 16px on a phone, mirrored at the two ends.
 */
export const panelHeadEdges = headEdges;

/**
 * A head's trailing actions, 2px apart (4px on a desktop). The group declares
 * its PanelActions' icon inset, so the head pulls the group, not its last
 * button: an action hidden at some width (a thread's Close below 1024px) then
 * leaves the next one on the edge.
 */
export const panelHeadActions = [
  "flex shrink-0 items-center gap-0.5 md:pointer-fine:gap-1",
  controlIconInset,
];

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
        "max-md:**:data-[slot=panel-action]:hover:bg-fill-frame-medium max-md:**:data-[slot=panel-action]:active:bg-fill-frame-medium",
      ],
    },
  ],
});
