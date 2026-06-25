import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "raft-ui/wip";
import { Button, Status } from "raft-ui";
import { ChevronLeft, ChevronRight } from "lucide-react";

// @docs-source-strip-start
import type { RefObject } from "react";
import { useRef } from "react";
import { Dialog } from "raft-ui/wip";
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";

const PREVIEW_CONTENT_CLASS =
  "!relative !top-auto !left-auto !z-0 !w-full !max-w-xl !translate-x-0 !translate-y-0 !p-0";
// @docs-source-strip-end

function AnnouncementDialogParts() {
  return (
    <>
      <DialogHeader className="border-b-2 border-line-strong bg-primary-400 px-5 py-3">
        <DialogTitle>Workspace Update</DialogTitle>
        <DialogClose />
      </DialogHeader>
      <DialogBody className="grid max-h-[18rem] gap-3 overflow-y-auto px-6 py-5 text-sm leading-6">
        <h3 className="m-0 text-base font-bold uppercase text-foreground-strong">
          New migration queue
        </h3>
        <p className="m-0 text-foreground-muted">
          Review newly ready components and compare them against their source scenes before
          migration.
        </p>
        <ul className="m-0 list-disc pl-5 text-foreground-muted">
          <li>Dialog scenes now have a dedicated comparison page.</li>
          <li>Composition code is shown under each case.</li>
        </ul>
      </DialogBody>
      <DialogFooter className="justify-between border-t-2 border-line-strong px-5 py-3">
        <div className="flex items-center gap-1.5">
          <Status variant="default" size="xs" />
          <Status variant="primary" size="xs" />
          <span className="ml-2 font-mono text-xs text-foreground-muted">2 / 3</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <ChevronLeft />
            Back
          </Button>
          <Button variant="primary" size="sm">
            Next
            <ChevronRight />
          </Button>
        </div>
      </DialogFooter>
    </>
  );
}

export function AnnouncementDialogContent() {
  return (
    <DialogContent className="max-w-xl p-0">
      <AnnouncementDialogParts />
    </DialogContent>
  );
}

// @docs-source-strip-start
export function AnnouncementDialogComposition({ className }: { className?: string }) {
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <SourceComparisonPreview className={className}>
      <div ref={portalRef} className="relative min-w-0 w-full max-w-full max-w-xl">
        <Dialog open modal={false}>
          <DialogContent
            overlay={false}
            initialFocus={false}
            finalFocus={false}
            portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
            className={PREVIEW_CONTENT_CLASS}
          >
            <AnnouncementDialogParts />
          </DialogContent>
        </Dialog>
      </div>
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
