import { tv } from "../../lib/tv";

export const chatMainPanel = tv({
  slots: {
    root: ["flex h-full min-h-0 min-w-0 flex-1 flex-col", "text-foreground"],
    header: ["flex h-[62px] shrink-0 items-center gap-3 px-5", "[@media(max-height:600px)]:h-12"],
    headerIcon: [
      "flex size-9 shrink-0 items-center justify-center",
      "border-2",
      "[&_svg]:size-[18px] [&_svg]:shrink-0",
    ],
    titleBlock: ["min-w-0 flex-1"],
    title: ["truncate text-base font-bold leading-tight"],
    subtitle: ["truncate font-mono text-xs"],
    actions: ["flex shrink-0 items-center gap-1.5"],
    tabs: ["shrink-0"],
    jumpToLatest: [
      "absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5",
      "px-3 py-1.5 font-sans text-xs font-bold outline-none",
      "transition-all duration-100",
      "active:translate-x-[1px] active:translate-y-[1px]",
      "[&_svg]:size-3 [&_svg]:shrink-0",
    ],
    body: ["relative min-h-0 flex-1 overflow-hidden"],
    timeline: [
      "relative h-full overflow-y-auto overscroll-contain",
      "[overflow-anchor:auto] [-webkit-overflow-scrolling:touch]",
    ],
    messageList: ["flex min-h-full flex-col"],
    footer: [
      "relative flex shrink-0 items-center px-3 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]",
    ],
    composer: ["flex w-full flex-col gap-2 border-2 p-2"],
    composerInput: [
      "min-h-5 max-h-32 w-full resize-none bg-transparent text-base leading-5 outline-none md:min-h-10 md:text-sm",
    ],
    composerToolbar: ["flex items-center justify-between gap-3"],
    composerActions: ["flex items-center gap-2"],
    composerMeta: ["flex items-center gap-3"],
    composerIconButton: [
      "inline-flex shrink-0 items-center justify-center",
      "border-2 p-1 font-sans font-bold leading-none outline-none",
      "transition-all duration-100",
      "active:translate-x-[1px] active:translate-y-[1px]",
      "[&_svg]:size-3.5 [&_svg]:shrink-0",
    ],
    composerSubmit: [
      "inline-flex size-7 shrink-0 items-center justify-center",
      "border-2 font-sans font-bold leading-none outline-none",
      "transition-all duration-100",
      "active:translate-x-[1px] active:translate-y-[1px]",
      "disabled:pointer-events-none disabled:opacity-30 disabled:transform-none",
      "[&_svg]:size-3.5 [&_svg]:shrink-0",
    ],
    composerAttachments: ["flex flex-wrap gap-2"],
    composerAttachment: ["group/composer-attachment relative"],
    composerAttachmentImage: ["size-16 border-2 object-cover"],
    composerAttachmentFile: [
      "flex h-16 w-32 items-center gap-2 border-2 px-2",
      "[&_svg]:size-4 [&_svg]:shrink-0",
    ],
    composerAttachmentBody: ["block min-w-0"],
    composerAttachmentTitle: ["block truncate text-xs font-bold"],
    composerAttachmentMeta: ["block truncate text-[10px]"],
    composerAttachmentOverlay: [
      "absolute inset-0 z-10 flex flex-col items-center justify-center border-2 px-1",
      "text-center text-[10px] font-bold",
    ],
    composerAttachmentProgress: ["absolute bottom-0 left-0 h-1 w-full"],
    composerAttachmentProgressFill: ["h-full"],
    composerAttachmentRemove: [
      "absolute -top-1.5 -right-1.5 z-20 flex size-4 items-center justify-center rounded-full",
      "opacity-0 transition-opacity group-hover/composer-attachment:opacity-100",
      "[@media(hover:none)]:h-6 [@media(hover:none)]:w-6 [@media(hover:none)]:opacity-100",
      "[&_svg]:size-2.5 [&_svg]:shrink-0",
    ],
    composerDropOverlay: [
      "absolute inset-0 z-30 flex items-center justify-center border-2 border-dashed",
    ],
    composerDropOverlayLabel: ["border-2 px-3 py-1.5 text-sm font-bold"],
  },
  variants: {
    theme: {
      brutal: {
        root: "bg-white font-sans text-black",
        header: "border-b-2 border-black bg-white",
        headerIcon: "border-black bg-soft-signal text-black",
        title: "text-black",
        subtitle: "text-black/50",
        tabs: "border-b-2 border-black bg-white",
        jumpToLatest: [
          "border-2 border-black bg-white text-black shadow-brutal-sm",
          "hover:-translate-y-px hover:shadow-brutal",
          "active:shadow-[var(--shadow-brutal-active)]",
        ],
        body: "bg-white",
        timeline: "bg-white",
        footer: "border-t-2 border-black bg-white",
        composer: "border-black bg-white shadow-brutal-sm focus-within:shadow-brutal",
        composerInput: "font-sans text-black placeholder:text-black/35",
        composerIconButton: [
          "border-black bg-white text-black shadow-brutal-sm",
          "hover:-translate-y-px hover:bg-white hover:shadow-brutal",
          "active:shadow-[var(--shadow-brutal-active)]",
        ],
        composerSubmit: [
          "border-black bg-brutal-pink text-black shadow-brutal-sm",
          "hover:-translate-y-px hover:shadow-brutal",
          "active:shadow-[var(--shadow-brutal-active)]",
          "disabled:shadow-brutal-sm",
        ],
        composerAttachmentImage: "border-black",
        composerAttachmentFile: "border-black bg-white [&_svg]:text-black/70",
        composerAttachmentTitle: "text-black",
        composerAttachmentMeta: "text-black/50",
        composerAttachmentProgress: "bg-black/15",
        composerAttachmentProgressFill: "bg-brutal-pink",
        composerAttachmentRemove: "bg-black text-white",
        composerDropOverlay: "border-brutal-pink bg-brutal-pink/15",
        composerDropOverlayLabel: "border-black bg-white text-black shadow-brutal-sm",
      },
      elegant: {
        root: "bg-layer-panel font-sans text-foreground",
        header: "border-b border-line-subtle bg-layer-panel",
        headerIcon: "rounded-md border-line-subtle bg-layer-muted text-foreground-strong",
        title: "text-foreground-strong",
        subtitle: "text-foreground-muted",
        tabs: "border-b border-line-subtle bg-layer-panel",
        jumpToLatest: [
          "rounded-md border border-line-subtle bg-layer-panel text-foreground-strong shadow-sm",
          "hover:bg-layer-muted",
        ],
        body: "bg-layer-panel",
        timeline: "bg-layer-panel",
        footer: "border-t border-line-subtle bg-layer-panel",
        composer: "rounded-md border-line-subtle bg-layer-panel shadow-xs",
        composerInput: "font-sans text-foreground-strong placeholder:text-foreground-placeholder",
        composerIconButton: [
          "rounded-md border-line-subtle bg-layer-panel text-foreground-strong shadow-xs",
          "hover:bg-layer-muted",
        ],
        composerSubmit: [
          "rounded-md border-line-subtle bg-accent-400 text-accent-950 shadow-xs",
          "hover:bg-accent-500",
        ],
        composerAttachmentImage: "rounded-md border-line-subtle",
        composerAttachmentFile:
          "rounded-md border-line-subtle bg-layer-panel [&_svg]:text-foreground-muted",
        composerAttachmentTitle: "text-foreground-strong",
        composerAttachmentMeta: "text-foreground-muted",
        composerAttachmentProgress: "bg-line-muted",
        composerAttachmentProgressFill: "bg-accent-400",
        composerAttachmentRemove: "bg-foreground-strong text-white",
        composerDropOverlay: "rounded-md border-accent-400 bg-accent-400/15",
        composerDropOverlayLabel:
          "rounded-md border-line-subtle bg-layer-panel text-foreground-strong shadow-sm",
      },
    },
    attachmentTone: {
      uploading: {},
      failed: {
        composerAttachmentOverlay: "leading-3",
      },
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      attachmentTone: "uploading",
      class: { composerAttachmentOverlay: "border-black bg-white/85 text-black" },
    },
    {
      theme: "brutal",
      attachmentTone: "failed",
      class: { composerAttachmentOverlay: "border-black bg-brutal-orange/90 text-black" },
    },
    {
      theme: "elegant",
      attachmentTone: "uploading",
      class: {
        composerAttachmentOverlay:
          "rounded-md border-line-subtle bg-layer-panel/85 text-foreground-strong",
      },
    },
    {
      theme: "elegant",
      attachmentTone: "failed",
      class: {
        composerAttachmentOverlay:
          "rounded-md border-line-subtle bg-warning-light text-foreground-strong",
      },
    },
  ],
});
