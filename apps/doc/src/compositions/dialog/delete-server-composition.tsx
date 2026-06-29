import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "raft-ui";
import { Banner, BannerDescription, Button, Field, FieldLabel, InlineCode, Input } from "raft-ui";

// @docs-source-strip-start
import { Dialog } from "raft-ui";
import { SourceComparisonModalPreview } from "../source-comparison-preview.tsx";

// @docs-source-strip-end

function DeleteServerDialogParts() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Delete Server</DialogTitle>
        <DialogClose />
      </DialogHeader>
      <DialogBody className="grid gap-4">
        <Banner status="destructive" size="md">
          <BannerDescription>
            This will permanently delete Raft and all its data (agents, channels, messages). This
            cannot be undone.
          </BannerDescription>
        </Banner>
        <Field>
          <FieldLabel htmlFor="dialog-delete-server">
            Type <InlineCode>raft</InlineCode> to confirm:
          </FieldLabel>
          <Input
            id="dialog-delete-server"
            placeholder="raft"
            className="font-mono"
            suppressPasswordManager
          />
        </Field>
      </DialogBody>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" size="sm" />}>Cancel</DialogClose>
        <Button variant="danger" size="sm">
          Delete Server
        </Button>
      </DialogFooter>
    </>
  );
}

export function DeleteServerDialogContent() {
  return (
    <DialogContent className="max-w-sm">
      <DeleteServerDialogParts />
    </DialogContent>
  );
}

// @docs-source-strip-start
export function DeleteServerDialogComposition({ className }: { className?: string }) {
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
            <DeleteServerDialogParts />
          </DialogContent>
        </Dialog>
      )}
    </SourceComparisonModalPreview>
  );
}
// @docs-source-strip-end
