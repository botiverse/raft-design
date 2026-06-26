import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "raft-ui";
import { Banner, BannerDescription, Button } from "raft-ui";

// @docs-source-strip-start
import type { RefObject } from "react";
import { useRef } from "react";
import { Dialog } from "raft-ui";
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";

const PREVIEW_CONTENT_CLASS =
  "!relative !top-auto !left-auto !z-0 !w-full !max-w-sm !translate-x-0 !translate-y-0";
// @docs-source-strip-end

function ConfirmActionDialogParts() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogClose />
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
