import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Banner,
  BannerDescription,
  Button,
  CopyableCode,
  CopyableCodeAction,
  CopyableCodeRoot,
  Status,
} from "@botiverse/raft-ui";
import { Terminal } from "lucide-react";

// @docs-source-strip-start
import { Dialog } from "@botiverse/raft-ui";
import { CompositionModalPreview } from "#/components/composition-preview.tsx";

// @docs-source-strip-end

const CONNECT_COMMAND =
  "npx @botiverse/raft-daemon@latest --server-url https://api.raft.build --api-key sk_machine_0000000000000000000000000000000000000000000000000000000000000000 # Zolplay";

function AddMachineDialogParts() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Connect Computer</DialogTitle>
        <DialogClose />
      </DialogHeader>
      <DialogBody>
        <div className="mb-6 flex items-center gap-2 text-sm font-medium text-foreground">
          <Terminal className="size-4" />
          Run this command on your computer to connect:
        </div>
        <CopyableCodeRoot className="mb-7">
          <CopyableCode truncate>{CONNECT_COMMAND}</CopyableCode>
          <CopyableCodeAction aria-label="Copy daemon command" />
        </CopyableCodeRoot>
        <Banner status="warning" size="md" className="mb-5">
          <Status variant="warning" size="sm" />
          <BannerDescription>Waiting for computer to connect...</BannerDescription>
        </Banner>
      </DialogBody>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <Button variant="accent" disabled>
          Done
        </Button>
      </DialogFooter>
    </>
  );
}

export function AddMachineDialogContent() {
  return (
    <DialogContent className="max-w-lg">
      <AddMachineDialogParts />
    </DialogContent>
  );
}

// @docs-source-strip-start
export function AddMachineDialogComposition({ className }: { className?: string }) {
  return (
    <CompositionModalPreview className={className} contentClassName="max-w-lg">
      {({ portalProps, contentClassName }) => (
        <Dialog open modal={false}>
          <DialogContent
            overlay={false}
            initialFocus={false}
            finalFocus={false}
            portalProps={portalProps}
            className={contentClassName}
          >
            <AddMachineDialogParts />
          </DialogContent>
        </Dialog>
      )}
    </CompositionModalPreview>
  );
}
// @docs-source-strip-end
