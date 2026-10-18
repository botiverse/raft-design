import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@botiverse/raft-ui";
import { Field, FieldLabel, InlineCode, Input } from "@botiverse/raft-ui";

// @docs-source-strip-start
import { CompositionModalPreview } from "#/components/composition-preview.tsx";

// @docs-source-strip-end

function TypedDeleteAlertDialogParts() {
  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete Server</AlertDialogTitle>
        <AlertDialogClose />
      </AlertDialogHeader>
      <AlertDialogBody className="grid gap-5">
        <p className="m-0 text-sm leading-5 text-foreground/60">
          This will permanently delete <strong className="font-bold text-foreground">Raft</strong>{" "}
          and all its data (agents, channels, messages). This cannot be undone.
        </p>
        <Field>
          <FieldLabel htmlFor="alert-dialog-delete-server">
            Type <InlineCode>raft</InlineCode> to confirm:
          </FieldLabel>
          <Input
            id="alert-dialog-delete-server"
            placeholder="raft"
            className="font-mono"
            suppressPasswordManager
          />
        </Field>
      </AlertDialogBody>
      <AlertDialogFooter>
        <AlertDialogCancel size="md">Cancel</AlertDialogCancel>
        <AlertDialogAction variant="danger" size="md">
          Delete Server
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  );
}

export function TypedDeleteAlertDialogContent() {
  return (
    <AlertDialogContent>
      <TypedDeleteAlertDialogParts />
    </AlertDialogContent>
  );
}

// @docs-source-strip-start
export function TypedDeleteAlertDialogComposition({ className }: { className?: string }) {
  return (
    <CompositionModalPreview className={className}>
      {({ portalProps, contentClassName }) => (
        <AlertDialog open modal={false}>
          <AlertDialogContent
            overlay={false}
            initialFocus={false}
            finalFocus={false}
            portalProps={portalProps}
            className={contentClassName}
          >
            <TypedDeleteAlertDialogParts />
          </AlertDialogContent>
        </AlertDialog>
      )}
    </CompositionModalPreview>
  );
}
// @docs-source-strip-end
