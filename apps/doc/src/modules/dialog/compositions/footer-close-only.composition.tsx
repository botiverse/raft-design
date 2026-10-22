import {
  Button,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@botiverse/raft-ui";

// @docs-source-strip-start
import { Dialog } from "@botiverse/raft-ui";
import { CompositionModalPreview } from "#/components/composition-preview.tsx";

// @docs-source-strip-end

function FooterCloseOnlyDialogParts() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Export Started</DialogTitle>
        <DialogClose />
      </DialogHeader>
      <DialogBody>
        <DialogDescription>
          We'll email a link to the archive when it's ready. Large workspaces can take an hour.
        </DialogDescription>
      </DialogBody>
      <DialogFooter>
        <DialogClose render={<Button variant="primary" size="lg" />}>Got It</DialogClose>
      </DialogFooter>
    </>
  );
}

export function FooterCloseOnlyDialogContent() {
  return (
    <DialogContent>
      <FooterCloseOnlyDialogParts />
    </DialogContent>
  );
}

// @docs-source-strip-start
export function FooterCloseOnlyDialogComposition({ className }: { className?: string }) {
  return (
    <CompositionModalPreview className={className}>
      {({ portalProps, contentClassName }) => (
        <Dialog open modal={false}>
          <DialogContent
            overlay={false}
            initialFocus={false}
            finalFocus={false}
            portalProps={portalProps}
            className={contentClassName}
          >
            <FooterCloseOnlyDialogParts />
          </DialogContent>
        </Dialog>
      )}
    </CompositionModalPreview>
  );
}
// @docs-source-strip-end
