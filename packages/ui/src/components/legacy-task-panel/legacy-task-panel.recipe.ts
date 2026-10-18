import { tv } from "../../lib/tv";

export const legacyTaskPanel = tv({
  slots: {
    frame: [
      "size-full min-h-[512px]  max-w-md overflow-hidden",
      "rounded-container border border-line-seam bg-layer-canvas shadow-none",
    ],
    icon: [
      "flex shrink-0 items-center justify-center",
      "size-[27px] rounded-sticker bg-fill-muted text-foreground-muted",
      "[&_svg]:size-3.5",
    ],
    title: ["flex flex-col items-start gap-0.5 overflow-visible whitespace-normal"],
    body: ["space-y-4 overflow-y-auto px-5 py-4"],
    status: ["flex flex-wrap items-center gap-2"],
    section: [
      "p-4",
      "space-y-3 rounded-container border border-line-hairline bg-layer-card shadow-none",
    ],
    field: [],
    fieldLabel: ["mb-0.5 font-sans text-footnote font-medium text-foreground-hint"],
    fieldTitle: ["m-0 wrap-break-word", "text-body font-semibold text-foreground"],
    fieldText: ["m-0 whitespace-pre-wrap wrap-break-word", "text-subhead text-foreground-muted"],
    meta: [
      "p-4 text-sm",
      "space-y-0 rounded-container border border-line-hairline bg-layer-card px-4 py-2 shadow-none",
    ],
    metaRow: ["flex justify-between gap-3", "min-h-8 items-center"],
    metaLabel: ["font-sans text-footnote font-medium text-foreground-hint"],
    metaValue: ["text-right", "text-callout text-foreground"],
  },
  variants: {
    framed: {
      true: {},
      false: {},
    },
  },
});
