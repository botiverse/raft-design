import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "raft-ui/wip";
import { Banner, BannerDescription, Button } from "raft-ui";
import { Copy, Terminal } from "lucide-react";

// @docs-source-strip-start
import type { RefObject } from "react";
import { useRef } from "react";
import { Dialog } from "raft-ui/wip";
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";

const PREVIEW_CONTENT_CLASS =
  "!relative !top-auto !left-auto !z-0 !w-full !max-w-lg !translate-x-0 !translate-y-0";
// @docs-source-strip-end

function AddMachineDialogParts() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Connect Computer</DialogTitle>
        <DialogClose />
      </DialogHeader>
      <DialogBody className="grid gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground-strong">
          <Terminal className="size-4" />
          Run this command on your computer to connect:
        </div>
        <div className="grid gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <pre className="min-w-0 flex-1 overflow-x-auto border-2 border-line-strong bg-black p-3 font-mono text-xs leading-5 text-[oklch(0.88_0.18_132)]">
              <code>
                npx @slock-ai/daemon@latest --server-url https://app.slock.dev --api-key sk_live...
              </code>
            </pre>
            <Button variant="outline" size="icon-sm" aria-label="Copy daemon command">
              <Copy />
            </Button>
          </div>
        </div>
        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold uppercase text-foreground-muted">
              Computer
            </span>
            <span className="rounded-full bg-primary-400 px-2 py-0.5 text-[10px] font-bold text-primary-950">
              WIP
            </span>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <pre className="min-w-0 flex-1 overflow-x-auto border-2 border-line-strong bg-black p-3 font-mono text-xs leading-5 text-[oklch(0.88_0.18_132)]">
              <code>npx @slock-ai/computer setup --server raft --api-key sk_live...</code>
            </pre>
            <Button variant="outline" size="icon-sm" aria-label="Copy computer command">
              <Copy />
            </Button>
          </div>
        </div>
        <Banner status="info" size="sm">
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
