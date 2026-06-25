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
import { Field, FieldLabel, InlineCode, Input } from "raft-ui";

// @docs-source-strip-start
import type { RefObject } from "react";
import { useRef } from "react";
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";

const PREVIEW_CONTENT_CLASS =
  "!relative !top-auto !left-auto !z-0 !w-full !translate-x-0 !translate-y-0";
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
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <SourceComparisonPreview className={className}>
      <div ref={portalRef} className="relative min-w-0 w-full max-w-[408px]">
        <AlertDialog open modal={false}>
          <AlertDialogContent
            overlay={false}
            initialFocus={false}
            finalFocus={false}
            portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
            className={PREVIEW_CONTENT_CLASS}
          >
            <TypedDeleteAlertDialogParts />
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
