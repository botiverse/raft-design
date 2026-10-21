import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Text,
} from "@botiverse/raft-ui";
import { X } from "lucide-react";

// @docs-source-strip-start
import { Dialog } from "@botiverse/raft-ui";
import { CompositionModalPreview } from "#/components/composition-preview.tsx";

// @docs-source-strip-end

function AgreementDialogParts() {
  return (
    <>
      <DialogHeader>
        <div className="grid gap-0.5">
          <DialogTitle>Community Guidelines</DialogTitle>
          <Text.Sans size="caption" variant="placeholder">
            Version 3
          </Text.Sans>
        </div>
        <DialogClose size="icon-sm">
          <X className="size-4" />
        </DialogClose>
      </DialogHeader>
      <DialogBody className="grid gap-3">
        <p className="m-0 text-sm">Before joining, review the workspace rules.</p>
        <div className="max-h-[50vh] overflow-y-auto border border-line-hairline bg-layer-canvas p-4 text-sm">
          <ul className="m-0 list-disc stack-y-1 pl-5 whitespace-pre-wrap wrap-break-word">
            <li>Keep sensitive customer data out of public channels.</li>
            <li>Use design-system components for shared product surfaces.</li>
            <li>Report unsafe automation or missing audit context immediately.</li>
          </ul>
        </div>
      </DialogBody>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" size="sm" />}>Cancel</DialogClose>
        <Button variant="accent" size="sm">
          Agree & Continue
        </Button>
      </DialogFooter>
    </>
  );
}

export function AgreementDialogContent() {
  return (
    <DialogContent size="lg">
      <AgreementDialogParts />
    </DialogContent>
  );
}

// @docs-source-strip-start
export function AgreementDialogComposition({ className }: { className?: string }) {
  return (
    <CompositionModalPreview
      className={className}
      placementPaddingClassName="px-0 py-6"
      backdrop={false}
    >
      {({ portalProps, contentClassName }) => (
        <Dialog open modal={false}>
          <DialogContent
            overlay={false}
            initialFocus={false}
            finalFocus={false}
            portalProps={portalProps}
            className={contentClassName}
            size="lg"
          >
            <AgreementDialogParts />
          </DialogContent>
        </Dialog>
      )}
    </CompositionModalPreview>
  );
}
// @docs-source-strip-end
