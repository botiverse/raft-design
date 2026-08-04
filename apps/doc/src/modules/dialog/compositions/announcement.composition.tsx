import {
  Button,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Status,
  useThemeFamily,
} from "raft-ui";
import { ChevronLeft, ChevronRight, Megaphone } from "lucide-react";
import { cn } from "raft-ui/cn";

// @docs-source-strip-start
import { Dialog } from "raft-ui";
import { SourceComparisonModalPreview } from "#/components/source-comparison-preview.tsx";

// @docs-source-strip-end

function AnnouncementDialogParts() {
  const theme = useThemeFamily();
  const isBrutal = theme === "brutal";

  return (
    <>
      <DialogHeader
        className={cn(
          "bg-primary-400 px-5 py-3",
          isBrutal ? "border-b-2 border-line-strong" : "border-b border-line-muted",
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className={cn(
              "inline-flex size-6 shrink-0 items-center justify-center text-black",
              isBrutal ? "border-2 border-line-strong" : "rounded",
              isBrutal ? "bg-layer-panel" : "bg-primary-200",
            )}
          >
            <Megaphone className="size-3.5" />
          </span>
          <DialogTitle className="truncate text-primary-950">Workspace Update</DialogTitle>
        </div>
        <DialogClose className={isBrutal ? undefined : "text-primary-950 hover:text-primary-950"} />
      </DialogHeader>
      <DialogBody
        className={cn(
          "grid max-h-[min(60vh,24rem)] gap-3 overflow-y-auto px-6 text-sm leading-6",
          isBrutal ? "py-5" : "py-[38px]",
        )}
      >
        <h3 className="m-0 text-base font-bold uppercase text-foreground">New migration queue</h3>
        <p className="m-0 text-foreground-muted">
          Review newly ready components and compare them against their source scenes before
          migration.
        </p>
        <ul className="m-0 list-disc pl-5 text-foreground-muted">
          <li>Dialog scenes now have a dedicated comparison page.</li>
          <li>Composition code is shown under each case.</li>
        </ul>
      </DialogBody>
      <DialogFooter
        className={cn(
          "justify-between px-5 py-3",
          isBrutal ? "border-t-2 border-line-strong" : "border-t border-line-muted",
        )}
      >
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 3 }).map((_, index) => {
            const isCurrentPage = index === 1;

            return (
              <Status
                key={index}
                aria-hidden="true"
                size="sm"
                variant={isCurrentPage ? "primary" : "default"}
                className={cn(
                  isBrutal && {
                    "[--status-color:var(--foreground)]": isCurrentPage,
                    "[--status-color:var(--layer-panel)]": !isCurrentPage,
                  },
                  !isBrutal && !isCurrentPage && "opacity-40",
                )}
              />
            );
          })}
          <span className="ml-2 font-mono text-xs text-foreground-muted">2 / 3</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="md" className="gap-1">
            <ChevronLeft data-icon="inline-start" />
            Back
          </Button>
          <Button variant="accent" size="md" className="gap-1">
            Next
            <ChevronRight data-icon="inline-end" />
          </Button>
        </div>
      </DialogFooter>
    </>
  );
}

export function AnnouncementDialogContent() {
  return (
    <DialogContent className="w-full max-w-xl p-0">
      <AnnouncementDialogParts />
    </DialogContent>
  );
}

// @docs-source-strip-start
export function AnnouncementDialogComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonModalPreview
      className={cn("px-0 py-0", className)}
      contentClassName="w-full max-w-xl p-0"
      portalClassName="p-0"
      backdrop={false}
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
            <AnnouncementDialogParts />
          </DialogContent>
        </Dialog>
      )}
    </SourceComparisonModalPreview>
  );
}
// @docs-source-strip-end
