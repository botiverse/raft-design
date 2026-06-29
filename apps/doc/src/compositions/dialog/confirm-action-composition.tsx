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
import { Dialog } from "raft-ui";
import { SourceComparisonModalPreview } from "../source-comparison-preview.tsx";

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
  return (
    <SourceComparisonModalPreview className={className} contentClassName="!max-w-sm">
      {({ portalProps, contentClassName }) => (
        <Dialog open modal={false}>
          <DialogContent
            overlay={false}
            initialFocus={false}
            finalFocus={false}
            portalProps={portalProps}
            className={contentClassName}
          >
            <ConfirmActionDialogParts />
          </DialogContent>
        </Dialog>
      )}
    </SourceComparisonModalPreview>
  );
}
// @docs-source-strip-end
