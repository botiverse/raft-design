import {
  DialogBody,
  DialogClose,
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
  DialogCommit,
  DialogSheetBack,
  DialogSheetContent,
} from "@botiverse/raft-ui";
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
        {/* On a phone a later step starts the head with Back instead of ×. */}
        {step === 2 ? <DialogSheetBack onClick={back} /> : null}
        <DialogTitle>Connect computer</DialogTitle>
        <DialogClose />
      </DialogHeader>
      {step === 1 ? (
        <DialogBody className="grid gap-4">
          <p className="m-0">Step 1 of 2: name the computer.</p>
          <Field>
            <FieldLabel htmlFor="dialog-sheet-computer-name">Name</FieldLabel>
            <Input id="dialog-sheet-computer-name" defaultValue="Studio Mac" aria-required />
          </Field>
        </DialogBody>
      ) : (
        <DialogBody className="grid gap-4">
          <p className="m-0">Step 2 of 2: run this command on the computer.</p>
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
