import { tv } from "../../lib/tv";

export const legacyTaskPanel = tv({
  slots: {
    frame: ["h-full min-h-[512px] w-full max-w-md overflow-hidden"],
    icon: ["flex size-9 shrink-0 items-center justify-center"],
    title: ["flex flex-col items-start gap-0.5 overflow-visible whitespace-normal"],
    body: ["space-y-4 overflow-y-auto px-5 py-4"],
    status: ["flex flex-wrap items-center gap-2"],
    section: ["p-4"],
    field: [],
    fieldLabel: ["mb-1 font-mono text-xs"],
    fieldTitle: ["m-0 text-lg break-words"],
    fieldText: ["m-0 text-sm whitespace-pre-wrap break-words"],
    meta: ["space-y-2 p-4 text-sm"],
    metaRow: ["flex items-start justify-between gap-3"],
    metaLabel: ["font-mono"],
    metaValue: ["text-right"],
  },
  variants: {
    theme: {
      brutal: {
        frame: ["border-2 border-black shadow-md"],
        icon: ["border-2 border-black bg-primary text-black"],
        section: ["space-y-3 border-2 border-black bg-white shadow-md"],
        fieldLabel: ["text-black/40"],
        fieldTitle: ["font-bold text-black"],
        fieldText: ["text-black/80"],
        meta: ["border-2 border-black bg-white shadow-md"],
        metaLabel: ["text-black/50"],
        metaValue: ["text-black"],
      },
      elegant: {
        frame: ["rounded-xl border border-line-muted shadow-sm"],
        icon: ["rounded-md border-[0.5px] border-line-muted bg-white text-foreground-icon"],
        section: ["space-y-3 rounded-lg border-[0.5px] border-line-muted bg-white shadow-xs"],
        fieldLabel: ["text-foreground-muted"],
        fieldTitle: ["font-heading font-medium text-foreground"],
        fieldText: ["text-foreground/80"],
        meta: ["rounded-lg border-[0.5px] border-line-muted bg-white shadow-xs"],
        metaLabel: ["text-xs text-foreground-placeholder"],
        metaValue: ["text-foreground"],
      },
    },
    framed: {
      true: {},
      false: {},
    },
  },
});
