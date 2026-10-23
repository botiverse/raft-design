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
      "pt-1.5 pe-1.5",
      "has-[[data-slot=composer-attachments-scroll-area]]:p-0",
      "has-[[data-slot=sortable-composer-attachments-list]]:pt-0",
    ],
    attachmentsScrollArea: ["relative w-full min-w-0"],
    attachmentsViewport: [
      "flex flex-nowrap gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain py-1.5",
      "scrollbar-none [&::-webkit-scrollbar]:hidden",
      "**:data-[slot=composer-attachment]:shrink-0",
      "pe-1.5",
    ],
    attachmentsNav: [
      "absolute top-1/2 z-30 -translate-y-1/2",
      "size-8 rounded-chip shadow-none",
      "[&_svg:not([class*='size-'])]:size-4.5",
    ],
    attachment: ["group/composer-attachment relative", "[--ca-overlay-border:1px]"],
    attachmentFile: [
      "relative flex h-16 w-44",
      "[&_svg]:size-4 [&_svg]:shrink-0",
      "items-center gap-2.5 rounded-control border border-line-hairline bg-fill-muted px-2",
      "text-foreground [&_svg]:text-foreground-muted",
    ],
    attachmentImage: [
      "relative block size-16 shrink-0 overflow-hidden",
      "**:data-[slot=file-preview]:size-full **:data-[slot=file-preview-media]:size-full",
      "**:data-[slot=file-preview-media]:border-0 **:data-[slot=file-preview-media]:bg-transparent",
      "**:data-[slot=file-preview-media]:shadow-none **:data-[slot=file-preview-media]:ring-0",
      "rounded-control border border-line-hairline bg-fill-muted",
    ],
    attachmentBody: ["min-w-0 flex-1", "flex flex-col justify-center gap-0.5"],
    attachmentTitle: ["block truncate", "font-sans text-footnote font-semibold text-foreground"],
    attachmentMeta: [
      "block w-full truncate",
      "text-left font-mono text-mono-meta text-foreground-hint",
    ],
    attachmentUploadingOverlay: [
      "absolute inset-0 z-10 flex flex-col items-center justify-center px-1",
      "text-center",
      "rounded-control bg-layer-card/80",
      "font-mono text-mono-meta font-bold text-foreground",
    ],
    attachmentUploadProgressBar: [
      "absolute z-20 h-1 overflow-hidden",
      "right-1.5 bottom-1.5 left-1.5 w-auto rounded-[2px]",
      "bg-layer-card",
    ],
    attachmentUploadProgressBarIndicator: ["block h-full", "rounded-[inherit] bg-info"],
    attachmentFailedOverlay: [
      "absolute inset-0 z-10 flex flex-col items-center justify-center px-1",
      "[border-width:var(--ca-overlay-border,2px)]",
      "text-center",
      "rounded-control border-danger-strong bg-layer-card/90",
      "font-sans text-caption font-semibold text-danger-strong",
    ],
    attachmentRemove: [
      "absolute z-20 flex items-center justify-center",
      "transition-opacity group-hover/composer-attachment:opacity-100",
      "[@media(hover:none)]:opacity-100",
      "[&_svg]:shrink-0",
      "-top-1.5 -right-1.5 size-5 rounded-sticker border-[1.5px] border-line-strong",
      "bg-layer-card text-foreground opacity-100",
      "hover:overlay-medium active:overlay-medium",
      "outline-none focus-visible:shadow-focus",
      "disabled:cursor-not-allowed disabled:border-line-hairline disabled:bg-fill-muted disabled:text-foreground-disabled",
      "after:absolute after:-inset-3 after:content-['']",
      "[@media(hover:none)]:size-5",
      "[&_svg]:size-3",
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
  },
});
