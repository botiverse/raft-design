import {
  Button,
  TextLink,
  CopyableCode,
  CopyableCodeAction,
  CopyableCodeRoot,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Text,
} from "@botiverse/raft-ui";

// @docs-source-strip-start
import { Dialog } from "@botiverse/raft-ui";
import { CompositionModalPreview } from "#/components/composition-preview.tsx";

// @docs-source-strip-end

function ServerSetupStepParts() {
  return (
    <>
      <DialogHeader>
        <Text.Mono size="meta">Set up your server</Text.Mono>
        <DialogTitle>Start your computer</DialogTitle>
        <DialogDescription>
          Your computer is already set up — it just isn&apos;t running. Start it and setup continues
          on its own.
        </DialogDescription>
      </DialogHeader>
      <DialogBody className="grid gap-3">
        <Text.Sans size="small">
          This computer is set up on /launch but isn&apos;t connected right now. Run this on the
          machine to bring it back:
        </Text.Sans>
        <CopyableCodeRoot>
          <CopyableCode>raft-computer start</CopyableCode>
          <CopyableCodeAction aria-label="Copy raft-computer start" />
        </CopyableCodeRoot>
      </DialogBody>
      <DialogFooter className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-footnote">
          <TextLink disabled>Switch Server</TextLink>
          <TextLink disabled>Server Settings</TextLink>
        </div>
        <Button variant="accent" size="lg" disabled>
          Next
        </Button>
      </DialogFooter>
    </>
  );
}

export function ServerSetupStepContent() {
  return (
    <DialogContent className="max-w-[720px]">
      <ServerSetupStepParts />
    </DialogContent>
  );
}

// @docs-source-strip-start
export function ServerSetupStepComposition({ className }: { className?: string }) {
  return (
    <CompositionModalPreview
      className={className}
      contentClassName="max-w-[720px]"
      portalClassName="px-0"
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
          >
            <ServerSetupStepParts />
          </DialogContent>
        </Dialog>
      )}
    </CompositionModalPreview>
  );
}
// @docs-source-strip-end
