import { DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "raft-ui/wip";
import { Button, Text } from "raft-ui";
import { Monitor } from "lucide-react";

// @docs-source-strip-start
import type { RefObject } from "react";
import { useRef } from "react";
import { Dialog } from "raft-ui/wip";
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";

const PREVIEW_CONTENT_CLASS =
  "!relative !top-auto !left-auto !z-0 !w-full !max-w-lg !translate-x-0 !translate-y-0";
// @docs-source-strip-end

function OnboardingDialogParts() {
  return (
    <>
      <DialogHeader>
        <div className="grid gap-1">
          <Text.Mono size="meta" className="uppercase text-foreground-muted">
            Meet Slock
          </Text.Mono>
          <DialogTitle>Add a computer</DialogTitle>
        </div>
      </DialogHeader>
      <DialogBody className="grid gap-5">
        <div className="flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center border border-line-strong bg-primary-400 text-foreground-strong">
            <Monitor className="size-4" />
          </div>
          <div className="grid gap-2">
            <Text.Sans size="body" variant="placeholder">
              Your agents need somewhere to run. Connect a computer and they&apos;ll come online
              there.
            </Text.Sans>
            <Text.Sans size="caption" variant="placeholder">
              Need an agent runtime installed — Codex, Claude Code, or Cursor.
            </Text.Sans>
          </div>
        </div>
      </DialogBody>
      <DialogFooter className="grid grid-cols-[minmax(0,1fr)_auto] items-center">
        <label className="inline-flex min-w-0 select-none items-center gap-1.5">
          <span className="inline-flex size-4 border border-line-strong bg-layer-panel" />
          <Text.Sans size="caption" variant="placeholder" className="truncate font-medium">
            Don&apos;t remind me again
          </Text.Sans>
        </label>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline">Skip</Button>
          <Button variant="accent">
            <Monitor />
            Add Computer
          </Button>
        </div>
      </DialogFooter>
    </>
  );
}

export function OnboardingDialogContent() {
  return (
    <DialogContent className="max-w-lg">
      <OnboardingDialogParts />
    </DialogContent>
  );
}

// @docs-source-strip-start
export function OnboardingDialogComposition({ className }: { className?: string }) {
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
            <OnboardingDialogParts />
          </DialogContent>
        </Dialog>
      </div>
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
