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
import type { RefObject } from "react";
import { useRef } from "react";
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";

const PREVIEW_CONTENT_CLASS =
  "!relative !top-auto !left-auto !z-0 !w-full !translate-x-0 !translate-y-0";
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
            <ConfirmActionAlertDialogParts />
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
