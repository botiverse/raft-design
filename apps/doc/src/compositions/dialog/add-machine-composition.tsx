import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "raft-ui";
import { Banner, BannerDescription, Button, CopyableCode, Status } from "raft-ui";
import { Terminal } from "lucide-react";

// @docs-source-strip-start
import type { RefObject } from "react";
import { useRef } from "react";
import { Dialog } from "raft-ui";
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";

const PREVIEW_CONTENT_CLASS =
  "!relative !top-auto !left-auto !z-0 !w-full !max-w-lg !translate-x-0 !translate-y-0";
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
        <div className="mb-6 flex items-center gap-2 text-sm font-medium text-foreground-strong">
          <Terminal className="size-4" />
          Run this command on your computer to connect:
        </div>
        <CopyableCode.Root className="mb-7">
          <CopyableCode.Code truncate>{CONNECT_COMMAND}</CopyableCode.Code>
          <CopyableCode.Action ariaLabel="Copy daemon command" />
        </CopyableCode.Root>
        <Banner status="warning" size="md" className="mb-5">
          <Status variant="warning" size="sm" pulse />
          <BannerDescription>Waiting for computer to connect...</BannerDescription>
        </Banner>
      </DialogBody>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <Button variant="primary" disabled>
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
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <SourceComparisonPreview className={className}>
      <div ref={portalRef} className="relative min-w-0 w-full max-w-full max-w-lg">
        <Dialog open modal={false}>
          <DialogContent
            overlay={false}
            initialFocus={false}
            finalFocus={false}
            portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
            className={PREVIEW_CONTENT_CLASS}
          >
            <AddMachineDialogParts />
          </DialogContent>
        </Dialog>
      </div>
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
