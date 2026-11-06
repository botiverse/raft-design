import {
  Button,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldLabel,
  InlineCode,
  Input,
} from "@botiverse/raft-ui";

// @docs-source-strip-start
import { Dialog } from "@botiverse/raft-ui";
import { CompositionModalPreview } from "#/components/composition-preview.tsx";

// @docs-source-strip-end

function TypedDeleteDialogParts() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Delete server</DialogTitle>
        <DialogClose />
      </DialogHeader>
      <DialogBody className="grid gap-5">
        <p className="m-0 text-sm/5  text-foreground/60">
          This will permanently delete <strong className="font-bold text-foreground">Raft</strong>{" "}
          and all its data (agents, channels, messages). This cannot be undone.
        </p>
        <Field>
          <FieldLabel htmlFor="dialog-delete-server">
            Type <InlineCode>raft</InlineCode> to confirm:
          </FieldLabel>
          <Input
            id="dialog-delete-server"
            placeholder="raft"
            className="font-mono"
            suppressPasswordManager
            aria-required
          />
        </Field>
      </DialogBody>
      <DialogFooter>
        <DialogClose render={<Button variant="ghost" size="md" />}>Cancel</DialogClose>
        <Button variant="danger" size="md">
          Delete server
        </Button>
      </DialogFooter>
    </>
  );
}

export function TypedDeleteDialogContent() {
  return (
    <DialogContent size="sm">
      <TypedDeleteDialogParts />
    </DialogContent>
  );
}

// @docs-source-strip-start
export function TypedDeleteDialogComposition({ className }: { className?: string }) {
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
            size="sm"
          >
            <TypedDeleteDialogParts />
          </DialogContent>
        </Dialog>
      )}
    </CompositionModalPreview>
  );
}
// @docs-source-strip-end
