import { tv } from "../../lib/tv";

export const composer = tv({
  slots: {
    root: ["flex w-full flex-col gap-2 border-2 p-2"],
    input: [
      "min-h-5 max-h-32 w-full resize-none bg-transparent text-base leading-5 outline-none md:min-h-10 md:text-sm",
    ],
    toolbar: ["flex items-center justify-between gap-3"],
    actions: ["flex items-center gap-2"],
    meta: ["flex items-center gap-4"],
    iconButton: [],
    attachments: ["flex flex-wrap gap-2"],
    attachment: ["group/composer-attachment relative"],
    attachmentFile: [
      "relative flex h-16 w-32 items-start gap-2 border-2 px-2 pt-2",
      "[&_svg]:size-4 [&_svg]:shrink-0",
    ],
    attachmentImage: [
      "relative block size-16 shrink-0",
      "[&_[data-slot=file-preview]]:size-full [&_[data-slot=file-preview-media]]:size-full",
    ],
    attachmentBody: ["block min-w-0"],
    attachmentTitle: ["block translate-y-0.5 truncate text-xs font-bold"],
    attachmentMeta: ["absolute right-2 bottom-2 truncate text-[10px]"],
    attachmentUploadingOverlay: [
      "absolute inset-0 z-10 flex flex-col items-center justify-center px-1",
      "text-center text-[10px] font-bold leading-3",
    ],
    attachmentUploadProgressBar: [
      "absolute bottom-0 left-0 z-20 h-1 w-full overflow-hidden bg-black/15",
    ],
    attachmentUploadProgressBarIndicator: ["block h-full bg-accent-400"],
    attachmentFailedOverlay: [
      "absolute inset-0 z-10 flex flex-col items-center justify-center border-2 px-1",
      "text-center text-[10px] font-bold leading-3",
    ],
    attachmentRemove: [
      "absolute -top-1.5 -right-1.5 z-20 flex size-4 items-center justify-center rounded-full",
      "opacity-0 transition-opacity group-hover/composer-attachment:opacity-100",
      "[@media(hover:none)]:h-6 [@media(hover:none)]:w-6 [@media(hover:none)]:opacity-100",
      "[&_svg]:size-2.5 [&_svg]:shrink-0",
    ],
    dropOverlay: ["absolute inset-0 z-30 flex items-center justify-center border-2"],
    dropOverlayLabel: ["inline-flex items-center gap-1.5 border-2 px-3 py-1.5 text-sm font-bold"],
  },
  variants: {
    theme: {
      brutal: {
        root: "border-black bg-white shadow-brutal-sm focus-within:shadow-brutal",
        input: "font-sans text-black placeholder:text-black/35",
        iconButton: [
          "border-black bg-white text-black shadow-brutal-sm",
          "hover:-translate-y-px hover:border-black hover:bg-white hover:shadow-brutal",
          "active:translate-x-[1px] active:translate-y-[1px] active:shadow-xs",
        ],
        attachmentFile: "border-black bg-white [&_svg]:text-black/70",
        attachmentTitle: "text-black",
        attachmentMeta: "text-black/50",
        attachmentUploadingOverlay: "bg-white/85 text-black",
        attachmentFailedOverlay: "border-black bg-brutal-orange/90 text-black",
        attachmentRemove: "bg-black text-white",
        dropOverlay: "border-dashed border-brutal-pink bg-brutal-pink/15",
        dropOverlayLabel: "border-black bg-white text-black shadow-brutal-sm",
      },
      elegant: {
        root: [
          "overflow-hidden rounded-lg border-0 p-0",
          "bg-layer-panel",
          "shadow-lg max-md:shadow-sm ring-1 ring-ink-2 max-md:ring-ink-6 focus-within:ring-ink-10",
        ],
        input: [
          "min-h-16 px-3 pt-3 md:min-h-20 md:px-4 md:pt-4",
          "font-sans text-foreground",
          "placeholder:text-foreground-placeholder",
        ],
        toolbar: "translate-y-1 gap-2 px-2.5 pt-1 pb-2.5 md:px-3 md:pb-3",
        actions: "gap-1.5",
        attachments: "justify-center pt-0.5",
        iconButton: [
          "p-[7px]",
          "text-foreground-icon",
          "hover:bg-layer-strong/80 hover:text-foreground",
          "active:bg-layer-strong/80 active:text-foreground",
        ],
        attachmentFile:
          "h-16 w-32 gap-3 overflow-hidden rounded-md border-0 bg-layer-panel pt-1.5 pr-2.5 pl-1.5 ring-1 ring-ink-10 [&_svg]:text-foreground-icon [&>[data-slot=file-preview]]:self-center [&>[data-slot=file-preview]]:-translate-y-[3px]",
        attachmentTitle: "font-medium text-foreground-strong",
        attachmentMeta: "right-2.5 bottom-1.5 text-foreground-placeholder",
        attachmentUploadProgressBar: "rounded-b-md",
        attachmentUploadingOverlay: "rounded-md bg-white/85 text-foreground",
        attachmentFailedOverlay: "rounded-md border-0 bg-danger-lighter text-danger-base",
        attachmentRemove: "bg-foreground-strong text-foreground-inverse",
        dropOverlay: [
          "-inset-1 rounded-lg border-accent-400/70 bg-accent-100/60",
          "bg-[radial-gradient(ellipse_at_center,oklch(0_0_0/0.045)_0%,oklch(0_0_0/0.02)_55%,oklch(0_0_0/0.008)_100%)]",
        ],
        dropOverlayLabel:
          "flex flex-col items-center gap-2 border-0 p-0 text-center text-base font-medium text-foreground-strong",
      },
    },
  },
});
