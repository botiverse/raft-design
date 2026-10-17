import { tv } from "../../lib/tv";

export const composerAttachment = tv({
  slots: {
    attachments: [
      "flex flex-wrap gap-2",
      // Scroll / sortable roots own the item flex row — avoid nesting flex + DnD a11y siblings.
      "has-data-[slot=composer-attachments-scroll-area]:relative",
      "has-data-[slot=composer-attachments-scroll-area]:block",
      "has-[[data-slot=composer-attachments-scroll-area]]:min-w-0",
      "has-data-[slot=sortable-composer-attachments-list]:block",
      "has-[[data-slot=sortable-composer-attachments-list]]:min-w-0",
    ],
    attachmentsScrollArea: ["relative w-full min-w-0"],
    attachmentsViewport: [
      "flex flex-nowrap gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain py-1.5",
      "scrollbar-none [&::-webkit-scrollbar]:hidden",
      "**:data-[slot=composer-attachment]:shrink-0",
    ],
    attachmentsNav: ["absolute top-1/2 z-30 -translate-y-1/2"],
    attachment: ["group/composer-attachment relative"],
    attachmentFile: [
      "relative flex h-16 w-44 gap-2 border-2 px-2",
      "[&_svg]:size-4 [&_svg]:shrink-0",
    ],
    attachmentImage: [
      "relative block size-16 shrink-0 overflow-hidden",
      "**:data-[slot=file-preview]:size-full **:data-[slot=file-preview-media]:size-full",
      "**:data-[slot=file-preview-media]:border-0 **:data-[slot=file-preview-media]:bg-transparent",
      "**:data-[slot=file-preview-media]:shadow-none **:data-[slot=file-preview-media]:ring-0",
    ],
    attachmentBody: ["block min-w-0 flex-1"],
    attachmentTitle: ["block truncate text-xs font-bold"],
    attachmentMeta: ["block w-full truncate text-right text-[10px]"],
    attachmentUploadingOverlay: [
      "absolute inset-0 z-10 flex flex-col items-center justify-center px-1",
      "text-center text-[10px] font-bold leading-3",
    ],
    attachmentUploadProgressBar: [
      "absolute bottom-0 left-0 z-20 h-1 w-full overflow-hidden bg-black/15 dark:bg-ink-16",
    ],
    attachmentUploadProgressBarIndicator: ["block h-full"],
    attachmentFailedOverlay: [
      "absolute inset-0 z-10 flex flex-col items-center justify-center px-1",
      "[border-width:var(--ca-overlay-border,2px)]",
      "text-center text-[10px] font-bold leading-3",
    ],
    attachmentRemove: [
      "absolute -top-1.5 -right-1.5 z-20 flex size-4 items-center justify-center rounded-full",
      "opacity-0 transition-opacity group-hover/composer-attachment:opacity-100",
      "[@media(hover:none)]:h-6 [@media(hover:none)]:w-6 [@media(hover:none)]:opacity-100",
      "[&_svg]:size-2.5 [&_svg]:shrink-0",
    ],
  },
  variants: {
    side: {
      prev: {
        attachmentsNav: "left-1.5",
      },
      next: {
        attachmentsNav: "right-1.5",
      },
    },
    theme: {
      brutal: {
        attachmentsViewport: "pe-1.5",
        attachmentsNav: [
          "shadow-raft-sm",
          "hover:-translate-y-1/2 hover:shadow-raft-sm",
          "active:not-data-[haspopup]:translate-x-0 active:not-data-haspopup:-translate-y-1/2 active:shadow-raft-sm",
        ],
        attachment: [
          "has-[[data-slot=composer-attachment-image]]:size-16",
          "has-data-[slot=composer-attachment-image]:border-2",
          "has-data-[slot=composer-attachment-image]:border-black",
          // Mirrors “has an image part” into a variable the failed overlay
          // reads, instead of styling a descendant from an ancestor :has()
          // (a whole-page recalc trap, #133).
          "has-data-[slot=composer-attachment-image]:[--ca-overlay-border:0px]",
        ],
        attachmentFile: "items-center border-black bg-white [&_svg]:text-black/70",
        attachmentImage: "size-full image-transparency-bg",
        attachmentBody: "flex h-[46px] flex-col justify-between",
        attachmentTitle: "mt-1 leading-none text-black",
        attachmentMeta: "leading-none text-black/50",
        attachmentUploadingOverlay: "bg-white/85 text-black",
        attachmentUploadProgressBarIndicator: "bg-brutal-pink",
        attachmentFailedOverlay: "border-black bg-brutal-orange/90 text-black",
        attachmentRemove: "bg-black text-white outline-2 outline-solid outline-white",
      },
      elegant: {
        attachments: ["pt-0.5", "has-[[data-slot=composer-attachments-scroll-area]]:-mx-1"],
        attachmentsViewport: "px-1",
        attachmentsNav: "rounded-full shadow-raft-md",
        attachment: "[--ca-overlay-border:0px]",
        attachmentFile: [
          "items-start gap-3 overflow-hidden rounded-md border-0 bg-layer-panel pt-1.5 pr-2.5 pl-1.5",
          "ring-1 ring-ink-10 [&_svg]:text-foreground-icon",
          "*:data-[slot=file-preview]:self-center *:data-[slot=file-preview]:translate-y-[-3px]",
        ],
        attachmentImage: "rounded-md ring-1 ring-ink-10",
        attachmentTitle: "translate-y-0.5 font-medium text-foreground",
        attachmentMeta: "absolute right-2.5 bottom-1.5 text-foreground-placeholder",
        attachmentUploadProgressBar: "rounded-b-md",
        attachmentUploadProgressBarIndicator: "bg-accent-400",
        attachmentUploadingOverlay:
          "rounded-md bg-white/85 text-foreground-strong dark:bg-layer-canvas-muted/80",
        attachmentFailedOverlay:
          "rounded-md bg-white/85 text-danger dark:bg-layer-canvas-muted/80 dark:text-danger-strong",
        attachmentRemove:
          "bg-foreground text-foreground-inverse outline-2 outline-solid outline-layer-panel",
      },
      raft: {
        attachments: [
          "pt-1.5 pe-1.5",
          "has-[[data-slot=composer-attachments-scroll-area]]:p-0",
          "has-[[data-slot=sortable-composer-attachments-list]]:pt-0",
        ],
        attachmentsViewport: "pe-1.5",
        attachmentsNav: ["size-8 shadow-none", "[&_svg:not([class*='size-'])]:size-4.5"],
        attachment: "[--ca-overlay-border:1px]",
        attachmentFile: [
          "items-center gap-2.5 rounded-control border border-line-muted bg-fill-muted px-2",
          "text-foreground [&_svg]:text-foreground-icon",
        ],
        attachmentImage: "rounded-control border border-line-muted bg-fill-muted",
        attachmentBody: "flex flex-col justify-center gap-0.5",
        attachmentTitle: "font-sans text-footnote font-semibold text-foreground",
        attachmentMeta: "text-left font-mono text-mono-meta text-foreground-hint",
        attachmentUploadingOverlay: [
          "rounded-control bg-layer-card/80",
          "font-mono text-mono-meta font-bold text-foreground",
        ],
        attachmentUploadProgressBar: [
          "right-1.5 bottom-1.5 left-1.5 w-auto rounded-[2px]",
          "bg-layer-card dark:bg-layer-card",
        ],
        attachmentUploadProgressBarIndicator: "rounded-[inherit] bg-info",
        attachmentFailedOverlay: [
          "rounded-control border-danger-strong bg-layer-card/90",
          "font-sans text-caption font-semibold text-danger-strong",
        ],
        attachmentRemove: [
          "-top-1.5 -right-1.5 size-5 rounded-sticker border-[1.5px] border-line-strong",
          "bg-layer-card text-foreground opacity-100",
          "hover:press-overlay active:press-overlay",
          "outline-none focus-visible:shadow-raft-focus",
          "disabled:cursor-not-allowed disabled:border-line-muted disabled:bg-fill-muted disabled:text-foreground-disabled",
          "after:absolute after:-inset-3 after:content-['']",
          "[@media(hover:none)]:size-5",
          "[&_svg]:size-3",
        ],
      },
    },
  },
});
