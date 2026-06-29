import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "raft-ui";
import { Banner, BannerDescription, Button, Text } from "raft-ui";

// @docs-source-strip-start
import { Dialog } from "raft-ui";
import { SourceComparisonModalPreview } from "../source-comparison-preview.tsx";

// @docs-source-strip-end

function AgreementDialogParts() {
  return (
    <>
      <DialogHeader>
        <div className="grid gap-1">
          <DialogTitle>Community Guidelines</DialogTitle>
          <Text.Sans size="caption" variant="placeholder">
            Version 2026.06
          </Text.Sans>
        </div>
        <DialogClose />
      </DialogHeader>
      <DialogBody className="grid gap-4">
        <div className="max-h-56 overflow-y-auto border border-line-subtle bg-layer-panel p-4 text-sm leading-6">
          <p className="m-0 font-medium">Before joining, review the workspace rules.</p>
          <ul className="mb-0 mt-3 grid gap-2 pl-5">
            <li>Keep sensitive customer data out of public channels.</li>
            <li>Use design-system components for shared product surfaces.</li>
            <li>Report unsafe automation or missing audit context immediately.</li>
          </ul>
        </div>
        <Banner status="warning" size="sm">
          <BannerDescription>You need to agree before joining this community.</BannerDescription>
        </Banner>
      </DialogBody>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" size="sm" />}>Cancel</DialogClose>
        <Button variant="primary" size="sm">
          Agree & Continue
        </Button>
      </DialogFooter>
    </>
  );
}

export function AgreementDialogContent() {
  return (
    <DialogContent className="max-w-lg">
      <AgreementDialogParts />
    </DialogContent>
  );
}

// @docs-source-strip-start
export function AgreementDialogComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonModalPreview className={className} contentClassName="!max-w-lg">
      {({ portalProps, contentClassName }) => (
        <Dialog open modal={false}>
          <DialogContent
            overlay={false}
            initialFocus={false}
            finalFocus={false}
            portalProps={portalProps}
            className={contentClassName}
          >
            <AgreementDialogParts />
          </DialogContent>
        </Dialog>
      )}
    </SourceComparisonModalPreview>
  );
}
// @docs-source-strip-end
