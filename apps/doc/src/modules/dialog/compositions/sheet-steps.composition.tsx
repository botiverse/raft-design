import {
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  CopyableCode,
  CopyableCodeAction,
  CopyableCodeRoot,
  Field,
  FieldLabel,
  Input,
} from "@botiverse/raft-ui";
import { DialogCommit, DialogSheetContent } from "@botiverse/raft-ui/wip";
import { useCallback, useState } from "react";

// @docs-source-strip-start
import { Dialog } from "@botiverse/raft-ui";
import { CompositionModalPreview } from "#/components/composition-preview.tsx";

// @docs-source-strip-end

const CONNECT_COMMAND = "npx @botiverse/raft-daemon@latest --name studio-mac";

function ConnectComputerDialogParts() {
  const [step, setStep] = useState<1 | 2>(1);
  const next = useCallback(() => setStep(2), []);
  const back = useCallback(() => setStep(1), []);
  return (
    <>
      <DialogHeader>
        <DialogTitle>Connect Computer</DialogTitle>
        <DialogClose />
      </DialogHeader>
      {step === 1 ? (
        <DialogBody className="grid gap-4">
          <DialogDescription>Step 1 of 2: name the computer.</DialogDescription>
          <Field>
            <FieldLabel htmlFor="dialog-sheet-computer-name" required>
              Name
            </FieldLabel>
            <Input id="dialog-sheet-computer-name" defaultValue="Studio Mac" />
          </Field>
        </DialogBody>
      ) : (
        <DialogBody className="grid gap-4">
          <DialogDescription>Step 2 of 2: run this command on the computer.</DialogDescription>
          <CopyableCodeRoot>
            <CopyableCode truncate>{CONNECT_COMMAND}</CopyableCode>
            <CopyableCodeAction aria-label="Copy command" />
          </CopyableCodeRoot>
        </DialogBody>
      )}
      <DialogFooter>
        {step === 1 ? (
          <>
            <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
            <DialogCommit variant="primary" onClick={next}>
              Next
            </DialogCommit>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={back}>
              Back
            </Button>
            <DialogClose render={<DialogCommit variant="primary" />}>Done</DialogClose>
          </>
        )}
      </DialogFooter>
    </>
  );
}

export function SheetStepsDialogContent() {
  return (
    <DialogSheetContent>
      <ConnectComputerDialogParts />
    </DialogSheetContent>
  );
}

// @docs-source-strip-start
// The phone view draws the scrim; on the page the preview draws its own.
const previewOverlay = { className: "md:hidden" };

export function SheetStepsDialogComposition({ className }: { className?: string }) {
  return (
    <CompositionModalPreview className={className} contentClassName="max-w-md max-md:z-50">
      {({ portalProps, contentClassName }) => (
        <Dialog open modal={false}>
          <DialogSheetContent
            overlay={previewOverlay}
            initialFocus={false}
            finalFocus={false}
            portalProps={portalProps}
            className={contentClassName}
          >
            <ConnectComputerDialogParts />
          </DialogSheetContent>
        </Dialog>
      )}
    </CompositionModalPreview>
  );
}
// @docs-source-strip-end
