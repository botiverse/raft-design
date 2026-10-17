import { tv } from "../../lib/tv";

export const legacyTaskPanel = tv({
  slots: {
    frame: ["size-full min-h-[512px]  max-w-md overflow-hidden"],
    icon: ["flex size-9 shrink-0 items-center justify-center"],
    title: ["flex flex-col items-start gap-0.5 overflow-visible whitespace-normal"],
    body: ["space-y-4 overflow-y-auto px-5 py-4"],
    status: ["flex flex-wrap items-center gap-2"],
    section: ["p-4"],
    field: [],
    fieldLabel: ["mb-1 font-mono text-xs"],
    fieldTitle: ["m-0 text-lg wrap-break-word"],
    fieldText: ["m-0 text-sm whitespace-pre-wrap wrap-break-word"],
    meta: ["space-y-2 p-4 text-sm"],
    metaRow: ["flex items-start justify-between gap-3"],
    metaLabel: ["font-mono"],
    metaValue: ["text-right"],
  },
  variants: {
    theme: {
      brutal: {
        frame: ["border-2 border-black shadow-raft-md"],
        icon: ["border-2 border-black bg-primary text-black"],
        section: ["space-y-3 border-2 border-black bg-white shadow-raft-md"],
        fieldLabel: ["text-black/40"],
        fieldTitle: ["font-bold text-black"],
        fieldText: ["text-black/80"],
        meta: ["border-2 border-black bg-white shadow-raft-md"],
        metaLabel: ["text-black/50"],
        metaValue: ["text-black"],
      },
      elegant: {
        frame: ["rounded-xl border border-line-muted shadow-raft-sm", "dark:border-transparent"],
        icon: ["rounded-md border-[0.5px] border-line-muted bg-layer-panel text-foreground-icon"],
        section: [
          "space-y-3 rounded-lg border-[0.5px] border-line-muted bg-layer-panel shadow-raft-xs",
          "dark:border-transparent",
        ],
        fieldLabel: ["text-foreground-muted"],
        fieldTitle: ["font-heading font-medium text-foreground"],
        fieldText: ["text-foreground/80"],
        meta: [
          "rounded-lg border-[0.5px] border-line-muted bg-layer-panel shadow-raft-xs",
          "dark:border-transparent",
        ],
        metaLabel: ["text-xs text-foreground-placeholder"],
        metaValue: ["text-foreground"],
      },
      raft: {
        frame: ["rounded-container border border-line-seam bg-layer-panel shadow-none"],
        icon: [
          "size-[27px] rounded-sticker bg-fill-muted text-foreground-muted",
          "[&_svg]:size-3.5",
        ],
        section: ["space-y-3 rounded-container border border-line-muted bg-layer-card shadow-none"],
        fieldLabel: ["mb-0.5 font-sans text-footnote font-medium text-foreground-hint"],
        fieldTitle: ["text-body font-semibold text-foreground"],
        fieldText: ["text-subhead text-foreground-muted"],
        meta: [
          "space-y-0 rounded-container border border-line-muted bg-layer-card px-4 py-2 shadow-none",
        ],
        metaRow: ["min-h-8 items-center"],
        metaLabel: ["font-sans text-footnote font-medium text-foreground-hint"],
        metaValue: ["text-callout text-foreground"],
      },
    },
    framed: {
      true: {},
      false: {},
    },
  },
});
