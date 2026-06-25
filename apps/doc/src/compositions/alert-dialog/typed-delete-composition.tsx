import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "raft-ui/wip";
import { Banner, BannerDescription, Field, FieldLabel, InlineCode, Input } from "raft-ui";

// @docs-source-strip-start
import type { RefObject } from "react";
import { useRef } from "react";
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";

const PREVIEW_CONTENT_CLASS = "!relative !top-auto !left-auto !z-0 !translate-x-0 !translate-y-0";
// @docs-source-strip-end

function TypedDeleteAlertDialogParts() {
  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete Server</AlertDialogTitle>
      </AlertDialogHeader>
      <AlertDialogBody className="grid gap-4">
        <Banner status="destructive" size="md">
          <BannerDescription>
            This will permanently delete Raft and all its data (agents, channels, messages). This
            cannot be undone.
          </BannerDescription>
        </Banner>
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
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction variant="danger" size="sm">
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
      <div ref={portalRef} className="relative min-w-0 w-full max-w-sm">
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
