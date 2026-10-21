import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  DialogBody,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Field,
  FieldLabel,
  Input,
  Textarea,
} from "@botiverse/raft-ui";
import { DialogCommit, DialogSheetContent } from "@botiverse/raft-ui/wip";
import type { ReactNode } from "react";

// @docs-source-strip-start
import { useMemo, useRef } from "react";
import type { RefObject } from "react";
import { Dialog } from "@botiverse/raft-ui";
import { CompositionModalPreview } from "#/components/composition-preview.tsx";

// @docs-source-strip-end

function EditProfileDialogParts({ children }: { children?: ReactNode }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogClose />
      </DialogHeader>
      <DialogBody className="grid gap-4">
        <Field>
          <FieldLabel htmlFor="dialog-sheet-profile-name" required>
            Display name
          </FieldLabel>
          <Input id="dialog-sheet-profile-name" defaultValue="Atlas Research" />
        </Field>
        <Field>
          <FieldLabel htmlFor="dialog-sheet-profile-about" optional>
            About
          </FieldLabel>
          <Textarea
            id="dialog-sheet-profile-about"
            defaultValue="Reads papers so the team doesn't have to."
            className="min-h-20"
          />
        </Field>
        {children}
      </DialogBody>
      <DialogFooter>
        <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
        <DialogCommit variant="primary">Save</DialogCommit>
      </DialogFooter>
    </>
  );
}

function DiscardChangesParts() {
  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Discard changes?</AlertDialogTitle>
      </AlertDialogHeader>
      <AlertDialogBody>
        <AlertDialogDescription>Your edits to the profile will be lost.</AlertDialogDescription>
      </AlertDialogBody>
      <AlertDialogFooter>
        <AlertDialogCancel>Keep Editing</AlertDialogCancel>
        <AlertDialogAction variant="danger">Discard</AlertDialogAction>
      </AlertDialogFooter>
    </>
  );
}

export function SheetStackedDialogContent() {
  return (
    <DialogSheetContent>
      <EditProfileDialogParts>
        {/* Opened from inside the sheet: it draws its own, lighter scrim. */}
        <AlertDialog open>
          <AlertDialogContent>
            <DiscardChangesParts />
          </AlertDialogContent>
        </AlertDialog>
      </EditProfileDialogParts>
    </DialogSheetContent>
  );
}

// @docs-source-strip-start
// The phone view draws the scrim; on the page the preview draws its own.
const previewOverlay = { className: "md:hidden" };
const previewContentClassName = "relative top-auto left-auto z-0 w-full translate-none";

export function SheetStackedDialogComposition({ className }: { className?: string }) {
  const confirmRef = useRef<HTMLDivElement>(null);
  const confirmPortal = useMemo(
    () => ({ container: confirmRef as RefObject<HTMLElement | null>, className: "contents" }),
    [],
  );
  return (
    <div className="relative w-full">
      <CompositionModalPreview
        className={className}
        contentClassName="max-w-md max-md:z-50"
        minHeightClassName="min-h-[28rem]"
      >
        {({ portalProps, contentClassName }) => (
          <Dialog open modal={false}>
            <DialogSheetContent
              overlay={previewOverlay}
              initialFocus={false}
              finalFocus={false}
              portalProps={portalProps}
              className={contentClassName}
            >
              <EditProfileDialogParts>
                <AlertDialog open modal={false}>
                  <AlertDialogContent
                    overlay={false}
                    initialFocus={false}
                    finalFocus={false}
                    portalProps={confirmPortal}
                    className={`${previewContentClassName} max-w-sm`}
                  >
                    <DiscardChangesParts />
                  </AlertDialogContent>
                </AlertDialog>
              </EditProfileDialogParts>
            </DialogSheetContent>
          </Dialog>
        )}
      </CompositionModalPreview>
      <div
        ref={confirmRef}
        className="absolute inset-0 z-60 flex items-center justify-center bg-layer-backdrop-nested p-6 max-md:fixed"
      />
    </div>
  );
}
// @docs-source-strip-end
