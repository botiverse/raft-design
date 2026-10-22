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
  Dialog,
  DialogBody,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  Field,
  FieldLabel,
  Input,
  Textarea,
} from "@botiverse/raft-ui";
import type { DialogProps } from "@botiverse/raft-ui";
import { DialogCommit, DialogSheetContent } from "@botiverse/raft-ui/wip";
import { useCallback, useState } from "react";
import type { ReactNode } from "react";

// @docs-source-strip-start
import { useMemo, useRef } from "react";
import type { RefObject } from "react";
import { CompositionModalPreview } from "#/components/composition-preview.tsx";

// @docs-source-strip-end

function EditProfileDialogParts({
  onEdit,
  children,
}: {
  onEdit?: () => void;
  children?: ReactNode;
}) {
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
          <Input id="dialog-sheet-profile-name" defaultValue="Atlas Research" onChange={onEdit} />
        </Field>
        <Field>
          <FieldLabel htmlFor="dialog-sheet-profile-about" optional>
            About
          </FieldLabel>
          <Textarea
            id="dialog-sheet-profile-about"
            defaultValue="Reads papers so the team doesn't have to."
            className="min-h-20"
            onChange={onEdit}
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

function DiscardChangesParts({ onDiscard }: { onDiscard?: () => void }) {
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
        <AlertDialogAction variant="danger" onClick={onDiscard}>
          Discard
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  );
}

// × and Esc ask before closing once something has been typed: the close is
// cancelled and the confirm opens from inside the sheet, on its own lighter
// scrim.
export function SheetStackedDialogContent() {
  const [open, setOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleOpenChange = useCallback<NonNullable<DialogProps["onOpenChange"]>>(
    (next, details) => {
      if (!next && dirty) {
        details.cancel();
        setConfirmOpen(true);
        return;
      }
      setOpen(next);
      if (!next) setDirty(false);
    },
    [dirty],
  );
  const markDirty = useCallback(() => setDirty(true), []);
  const discard = useCallback(() => {
    setConfirmOpen(false);
    setDirty(false);
    setOpen(false);
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" />}>Edit Profile</DialogTrigger>
      <DialogSheetContent>
        <EditProfileDialogParts onEdit={markDirty}>
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogContent>
              <DiscardChangesParts onDiscard={discard} />
            </AlertDialogContent>
          </AlertDialog>
        </EditProfileDialogParts>
      </DialogSheetContent>
    </Dialog>
  );
}

// @docs-source-strip-start
// The canvas shows the moment after × with edits: the confirm over the sheet.
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
