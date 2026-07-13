import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "raft-ui";
import { Button, Field, FieldDescription, FieldLabel, Input, Separator, Textarea } from "raft-ui";
import { EyeOff } from "lucide-react";

// @docs-source-strip-start
import { Dialog } from "raft-ui";
import { SourceComparisonModalPreview } from "#/components/source-comparison-preview.tsx";

// @docs-source-strip-end

function EditChannelDialogParts() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Channel</DialogTitle>
        <DialogClose />
      </DialogHeader>
      <DialogBody className="grid gap-4">
        <Field>
          <FieldLabel htmlFor="dialog-channel-name" required>
            Name
          </FieldLabel>
          <Input id="dialog-channel-name" defaultValue="all" disabled />
          <FieldDescription>The #all channel cannot be renamed</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="dialog-channel-description" optional>
            Description
          </FieldLabel>
          <Textarea
            id="dialog-channel-description"
            defaultValue="General channel for all members"
            className="min-h-20"
          />
        </Field>
        <div className="grid gap-3 pb-3">
          <Separator>Actions</Separator>
          <Button variant="warning" className="w-full">
            <EyeOff />
            Hide #all
          </Button>
        </div>
      </DialogBody>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <Button variant="accent">Save Changes</Button>
      </DialogFooter>
    </>
  );
}

export function EditChannelDialogContent() {
  return (
    <DialogContent>
      <EditChannelDialogParts />
    </DialogContent>
  );
}

// @docs-source-strip-start
export function EditChannelDialogComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonModalPreview
      className={className}
      contentClassName="!max-w-md"
      portalClassName="!px-0"
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
            <EditChannelDialogParts />
          </DialogContent>
        </Dialog>
      )}
    </SourceComparisonModalPreview>
  );
}
// @docs-source-strip-end
