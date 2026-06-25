import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Banner,
  BannerDescription,
} from "raft-ui";

// @docs-source-strip-start
import type { RefObject } from "react";
import { useRef } from "react";
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";

const PREVIEW_CONTENT_CLASS = "!relative !top-auto !left-auto !z-0 !translate-x-0 !translate-y-0";
// @docs-source-strip-end

function ConfirmActionAlertDialogParts() {
  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete Task</AlertDialogTitle>
      </AlertDialogHeader>
      <AlertDialogBody>
        <Banner status="destructive" size="md">
          <BannerDescription>
            Delete task #42 "Review dialog migration"? This cannot be undone.
          </BannerDescription>
        </Banner>
      </AlertDialogBody>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction variant="danger" size="sm">
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
      <div ref={portalRef} className="relative min-w-0 w-full max-w-sm">
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
