import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "raft-ui";
import { Button, Field, FieldLabel, Input, Separator, Textarea } from "raft-ui";
import { Archive, Lock, Trash2 } from "lucide-react";

// @docs-source-strip-start
import { Dialog } from "raft-ui";
import { SourceComparisonModalPreview } from "#/components/source-comparison-preview.tsx";

// @docs-source-strip-end

function EditChannelManagementDialogParts() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Channel</DialogTitle>
        <DialogClose />
      </DialogHeader>
      <DialogBody className="grid gap-4">
        <Field>
          <FieldLabel htmlFor="dialog-managed-channel-name" required>
            Name
          </FieldLabel>
          <Input id="dialog-managed-channel-name" defaultValue="onboarding-willxiang" />
        </Field>
        <Field>
          <FieldLabel htmlFor="dialog-managed-channel-description" optional>
            Description
          </FieldLabel>
          <Textarea
            id="dialog-managed-channel-description"
            defaultValue="Owner onboarding workspace (system-managed)."
            className="min-h-20"
          />
        </Field>
        <div className="grid gap-3 pb-3">
          <Separator>Actions</Separator>
          <Button variant="warning" className="w-full">
            <Lock />
            Make Private
          </Button>
          <Button variant="warning" className="w-full">
            <Archive />
            Archive Channel
          </Button>
          <Button variant="danger" className="w-full">
            <Trash2 />
            Delete Channel
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

export function EditChannelManagementDialogContent() {
  return (
    <DialogContent>
      <EditChannelManagementDialogParts />
    </DialogContent>
  );
}

// @docs-source-strip-start
export function EditChannelManagementDialogComposition({ className }: { className?: string }) {
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
            <EditChannelManagementDialogParts />
          </DialogContent>
        </Dialog>
      )}
    </SourceComparisonModalPreview>
  );
}
// @docs-source-strip-end
