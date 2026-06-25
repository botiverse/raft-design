import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "raft-ui/wip";
import { Banner, BannerDescription, Button } from "raft-ui";
import { X } from "lucide-react";

// @docs-source-strip-start
import type { RefObject } from "react";
import { useRef } from "react";
import { Dialog } from "raft-ui/wip";
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";

const PREVIEW_CONTENT_CLASS =
  "!relative !top-auto !left-auto !z-0 !w-full !max-w-sm !translate-x-0 !translate-y-0";
// @docs-source-strip-end

function ConfirmActionDialogParts() {
  return (
    <>
      <DialogHeader className="mb-1 flex-row items-start justify-between gap-3">
        <DialogTitle>Delete Task</DialogTitle>
        <DialogClose render={<Button variant="outline" size="icon-sm" aria-label="Close" />}>
          <X />
        </DialogClose>
      </DialogHeader>
      <DialogBody>
        <Banner status="destructive" size="md">
          <BannerDescription>
            Delete task #42 "Review dialog migration"? This cannot be undone.
          </BannerDescription>
        </Banner>
      </DialogBody>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" size="sm" />}>Cancel</DialogClose>
        <Button variant="danger" size="sm">
          Delete Task
        </Button>
      </DialogFooter>
    </>
  );
}

export function ConfirmActionDialogContent() {
  return (
    <DialogContent className="max-w-sm">
      <ConfirmActionDialogParts />
    </DialogContent>
  );
}

// @docs-source-strip-start
export function ConfirmActionDialogComposition({ className }: { className?: string }) {
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <SourceComparisonPreview className={className}>
      <div ref={portalRef} className="relative min-w-0 w-full max-w-full max-w-sm">
        <Dialog open modal={false}>
          <DialogContent
            overlay={false}
            initialFocus={false}
            finalFocus={false}
            portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
            className={PREVIEW_CONTENT_CLASS}
          >
            <ConfirmActionDialogParts />
          </DialogContent>
        </Dialog>
      </div>
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
