import { tv } from "../../lib/tv";

export const composer = tv({
  slots: {
    root: ["flex w-full flex-col gap-2 border-2 p-2"],
    input: [
      "min-h-5 max-h-32 w-full resize-none bg-transparent text-sm leading-5 outline-none md:min-h-10",
    ],
    toolbar: ["flex items-center justify-between gap-3"],
    actions: ["flex items-center gap-2"],
    meta: ["flex items-center gap-4"],
    iconButton: [],
    submit: [
      "inline-flex size-7 shrink-0 items-center justify-center",
      "border-2 font-sans font-bold leading-none outline-none",
      "transition-all duration-100",
      "active:translate-x-[1px] active:translate-y-[1px]",
      "disabled:pointer-events-none disabled:opacity-30 disabled:transform-none",
      "[&_svg]:size-3.5 [&_svg]:shrink-0",
    ],
    attachments: ["flex flex-wrap gap-2"],
    attachment: ["group/composer-attachment relative"],
    attachmentImage: ["size-16 border-2 object-cover"],
    attachmentFile: [
      "flex h-16 w-32 items-center gap-2 border-2 px-2",
      "[&_svg]:size-4 [&_svg]:shrink-0",
    ],
    attachmentBody: ["block min-w-0"],
    attachmentTitle: ["block truncate text-xs font-bold"],
    attachmentMeta: ["block truncate text-[10px]"],
    attachmentOverlay: [
      "absolute inset-0 z-10 flex flex-col items-center justify-center border-2 px-1",
      "text-center text-[10px] font-bold",
    ],
    attachmentProgress: ["absolute bottom-0 left-0 h-1 w-full"],
    attachmentProgressFill: ["h-full"],
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
        submit: [
          "border-black bg-brutal-pink text-black shadow-brutal-sm",
          "hover:-translate-y-px hover:shadow-brutal",
          "active:shadow-xs",
          "disabled:shadow-brutal-sm",
          "[&>span]:hidden",
        ],
        attachmentImage: "border-black",
        attachmentFile: "border-black bg-white [&_svg]:text-black/70",
        attachmentTitle: "text-black",
        attachmentMeta: "text-black/50",
        attachmentProgress: "bg-black/15",
        attachmentProgressFill: "bg-brutal-pink",
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
        submit: [
          "size-auto h-auto w-auto gap-1.5 rounded-md border-0 px-3 py-[6.75px]",
          "bg-accent-400 text-sm font-medium text-white",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.12),0_0_0_1px_var(--accent-400)]",
          "hover:bg-accent-hover",
          "active:translate-x-0 active:translate-y-0 active:scale-[0.985]",
          "[&_svg]:size-4",
        ],
        attachmentImage: "rounded-md border-line-subtle",
        attachmentFile:
          "h-[54px] w-36 gap-3 rounded-md border-0 bg-layer-panel pr-2.5 pl-1.5 ring-1 ring-ink-10 [&_svg]:text-foreground-icon",
        attachmentTitle: "font-medium text-foreground-strong",
        attachmentMeta: "text-foreground-placeholder",
        attachmentProgress: "bg-ink-6",
        attachmentProgressFill: "bg-accent-400",
        attachmentRemove: "bg-foreground-strong text-foreground-inverse",
        dropOverlay: [
          "-inset-1 rounded-lg border-accent-400/70 bg-accent-100/60",
          "bg-[radial-gradient(ellipse_at_center,oklch(0_0_0/0.045)_0%,oklch(0_0_0/0.02)_55%,oklch(0_0_0/0.008)_100%)]",
        ],
        dropOverlayLabel:
          "flex flex-col items-center gap-2 border-0 p-0 text-center text-base font-medium text-foreground-strong",
      },
    },
    attachmentTone: {
      uploading: {},
      failed: {
        attachmentOverlay: "leading-3",
      },
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      attachmentTone: "uploading",
      class: { attachmentOverlay: "border-black bg-white/85 text-black" },
    },
    {
      theme: "brutal",
      attachmentTone: "failed",
      class: { attachmentOverlay: "border-black bg-brutal-orange/90 text-black" },
    },
    {
      theme: "elegant",
      attachmentTone: "uploading",
      class: {
        attachmentOverlay:
          "rounded-md border-line-subtle bg-layer-popover/90 text-foreground-muted",
      },
    },
    {
      theme: "elegant",
      attachmentTone: "failed",
      class: {
        attachmentOverlay: "rounded-md border-danger-base/30 bg-danger-lighter/95 text-danger-base",
      },
    },
  ],
});
