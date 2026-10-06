import {
  AnnouncementDialog,
  AnnouncementDialogAction,
  AnnouncementDialogBody,
  AnnouncementDialogClose,
  AnnouncementDialogContent as AnnouncementDialogContentFrame,
  AnnouncementDialogFooter,
  AnnouncementDialogHeader,
  AnnouncementDialogLabel,
  AnnouncementDialogPicture,
  AnnouncementDialogSecondaryAction,
  AnnouncementDialogText,
  AnnouncementDialogTitle,
} from "raft-ui/wip";
import { useCallback, useState } from "react";
import { cn } from "raft-ui/cn";
import { Button } from "raft-ui";

// @docs-source-strip-start
import { CompositionModalPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

function AnnouncementDialogParts() {
  const [result, setResult] = useState<string | null>(null);
  const acknowledge = useCallback(() => setResult("Update acknowledged"), []);
  const openForm = useCallback(() => setResult("The caller opens its channel form"), []);
  return (
    <>
      <AnnouncementDialogBody>
        <AnnouncementDialogHeader>
          <AnnouncementDialogLabel>What's new</AnnouncementDialogLabel>
          <AnnouncementDialogClose aria-label="Close update" />
        </AnnouncementDialogHeader>
        <AnnouncementDialogTitle>Work together across workspaces</AnnouncementDialogTitle>
        <AnnouncementDialogPicture>
          <svg viewBox="0 0 400 176" role="img" aria-label="Two workspaces joined by a channel">
            <rect x="45" y="40" width="110" height="96" fill="currentColor" opacity="0.12" />
            <rect x="245" y="40" width="110" height="96" fill="currentColor" opacity="0.12" />
            <path d="M155 88H245" stroke="currentColor" strokeWidth="4" />
          </svg>
        </AnnouncementDialogPicture>
        <AnnouncementDialogText>
          <p>
            Invite another workspace to a shared channel and keep your conversation in one place.
          </p>
          {result && <p role="status">{result}</p>}
        </AnnouncementDialogText>
      </AnnouncementDialogBody>
      <AnnouncementDialogFooter>
        <AnnouncementDialogSecondaryAction onClick={acknowledge}>
          Got it
        </AnnouncementDialogSecondaryAction>
        <AnnouncementDialogAction onClick={openForm}>Create joint channel</AnnouncementDialogAction>
      </AnnouncementDialogFooter>
    </>
  );
}

export function AnnouncementDialogContent() {
  return (
    <AnnouncementDialogContentFrame>
      <AnnouncementDialogParts />
    </AnnouncementDialogContentFrame>
  );
}

// @docs-source-strip-start
export function AnnouncementDialogComposition({ className }: { className?: string }) {
  const [open, setOpen] = useState(true);
  const reopen = useCallback(() => setOpen(true), []);
  return (
    <CompositionModalPreview
      className={cn("px-0 py-0", className)}
      contentClassName="w-full max-w-xl"
      portalClassName="p-0"
      backdrop={false}
    >
      {({ portalProps, contentClassName }) =>
        open ? (
          <AnnouncementDialog open={open} onOpenChange={setOpen} modal={false}>
            <AnnouncementDialogContentFrame
              overlay={false}
              initialFocus={false}
              finalFocus={false}
              portalProps={portalProps}
              className={contentClassName}
            >
              <AnnouncementDialogParts />
            </AnnouncementDialogContentFrame>
          </AnnouncementDialog>
        ) : (
          <Button onClick={reopen}>Reopen announcement</Button>
        )
      }
    </CompositionModalPreview>
  );
}
// @docs-source-strip-end
