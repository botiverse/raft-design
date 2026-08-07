import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  useThemeFamily,
} from "raft-ui";
import { cn } from "raft-ui/cn";
import { Download } from "lucide-react";

// @docs-source-strip-start
import { Dialog } from "raft-ui";
import { CompositionModalPreview } from "#/components/composition-preview.tsx";

// @docs-source-strip-end

function AttachmentPreviewDialogParts() {
  const theme = useThemeFamily();
  const isBrutal = theme === "brutal";

  return (
    <>
      <DialogHeader
        className={cn(
          "min-w-0",
          isBrutal && "h-14 border-b-2 border-line-strong bg-white px-4 py-0",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <DialogTitle
            className={cn(
              "min-w-0 flex-1 truncate",
              isBrutal && "font-sans text-sm font-medium normal-case text-black",
            )}
          >
            diagram-export.html
          </DialogTitle>
          <span
            className={cn(
              "shrink-0 rounded-full border border-line-muted bg-fill-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-foreground-muted",
              isBrutal && "border-black/20 bg-black/5 text-black/60",
            )}
          >
            HTML preview
          </span>
        </div>
        <Button type="button" variant="outline" size="icon-xs" aria-label="Download attachment">
          <Download />
        </Button>
        <DialogClose size="icon-xs" />
      </DialogHeader>
      <DialogBody className={cn("min-h-0 bg-layer-panel p-0", isBrutal && "bg-white")}>
        <div
          className={cn(
            "grid min-h-72 place-items-center bg-fill-muted",
            isBrutal && "bg-white p-4",
          )}
        >
          <div
            className={cn(
              "grid size-full min-h-56  place-items-center border border-line-muted bg-layer-panel text-sm text-foreground-muted",
              isBrutal &&
                "border-2 border-line-strong bg-white font-mono text-xs text-black/50 shadow-raft-sm",
            )}
          >
            Sandboxed HTML preview
          </div>
        </div>
      </DialogBody>
    </>
  );
}

export function AttachmentPreviewDialogContent() {
  return (
    <DialogContent className="max-w-3xl overflow-hidden p-0">
      <AttachmentPreviewDialogParts />
    </DialogContent>
  );
}

// @docs-source-strip-start
export function AttachmentPreviewDialogComposition({ className }: { className?: string }) {
  return (
    <CompositionModalPreview
      className={className}
      contentClassName="max-w-3xl overflow-hidden p-0"
      minHeightClassName="min-h-96"
    >
      {({ portalProps, contentClassName }) => (
        <Dialog open modal={false}>
          <DialogContent
            overlay={false}
            initialFocus={false}
            finalFocus={false}
            portalProps={portalProps}
            className={contentClassName}
          >
            <AttachmentPreviewDialogParts />
          </DialogContent>
        </Dialog>
      )}
    </CompositionModalPreview>
  );
}
// @docs-source-strip-end
