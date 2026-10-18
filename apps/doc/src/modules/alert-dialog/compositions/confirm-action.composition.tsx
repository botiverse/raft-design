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
} from "raft-ui";

// @docs-source-strip-start
import { CompositionModalPreview } from "#/components/composition-preview.tsx";

// @docs-source-strip-end

function ConfirmActionAlertDialogParts() {
  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete Task</AlertDialogTitle>
        <AlertDialogClose />
      </AlertDialogHeader>
      <AlertDialogBody>
        <p className="m-0 text-sm leading-5 text-foreground/60">
          Delete task <strong className="font-bold text-foreground">#42</strong>{" "}
          <strong className="font-bold text-foreground">"Review dialog migration"</strong>? This
          cannot be undone.
        </p>
      </AlertDialogBody>
      <AlertDialogFooter>
        <AlertDialogCancel size="md">Cancel</AlertDialogCancel>
        <AlertDialogAction variant="danger" size="md">
          Delete Task
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  );
}

export function ConfirmActionAlertDialogContent() {
  return (
    <AlertDialogContent>
      <ConfirmActionAlertDialogParts />
    </AlertDialogContent>
  );
}

// @docs-source-strip-start
export function ConfirmActionAlertDialogComposition({ className }: { className?: string }) {
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
            <ConfirmActionAlertDialogParts />
          </AlertDialogContent>
        </AlertDialog>
      )}
    </CompositionModalPreview>
  );
}
// @docs-source-strip-end
