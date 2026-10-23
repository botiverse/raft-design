import {
  Button,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  TextLink,
} from "@botiverse/raft-ui";

// @docs-source-strip-start
import { Dialog } from "@botiverse/raft-ui";
import { CompositionModalPreview } from "#/components/composition-preview.tsx";

// @docs-source-strip-end

function FooterLinkDialogParts() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Turn On Auto-Archive</DialogTitle>
        <DialogClose />
      </DialogHeader>
      <DialogBody>
        <DialogDescription>
          Channels with no messages for 30 days move to the archive. Anyone can bring one back.
        </DialogDescription>
      </DialogBody>
      <DialogFooter>
        <TextLink render={<a href="#how-archiving-works" />}>How Archiving Works</TextLink>
        <DialogClose render={<Button variant="ghost" size="lg" />}>Cancel</DialogClose>
        <Button variant="primary" size="lg">
          Turn On
        </Button>
      </DialogFooter>
    </>
  );
}

export function FooterLinkDialogContent() {
  return (
    <DialogContent size="lg">
      <FooterLinkDialogParts />
    </DialogContent>
  );
}

// @docs-source-strip-start
export function FooterLinkDialogComposition({ className }: { className?: string }) {
  return (
    <CompositionModalPreview className={className}>
      {({ portalProps, contentClassName }) => (
        <Dialog open modal={false}>
          <DialogContent
            size="lg"
            overlay={false}
            initialFocus={false}
            finalFocus={false}
            portalProps={portalProps}
            className={contentClassName}
          >
            <FooterLinkDialogParts />
          </DialogContent>
        </Dialog>
      )}
    </CompositionModalPreview>
  );
}
// @docs-source-strip-end
