import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "raft-ui/wip";
import { Banner, BannerDescription, Button, RadioGroup, RadioGroupItem, Text } from "raft-ui";
import { RotateCcw } from "lucide-react";

// @docs-source-strip-start
import type { RefObject } from "react";
import { useRef } from "react";
import { Dialog } from "raft-ui/wip";
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";

const PREVIEW_CONTENT_CLASS =
  "!relative !top-auto !left-auto !z-0 !w-full !max-w-md !translate-x-0 !translate-y-0";
// @docs-source-strip-end

const resetOptions = [
  {
    value: "soft",
    label: "Restart Session",
    description: "Keep files and notes, then restart the runtime.",
  },
  {
    value: "full",
    label: "Full Reset & Restart",
    description: "Clear the runtime session, delete files, and restart from scratch.",
  },
];

function ResetAgentDialogParts() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Restart Atlas</DialogTitle>
        <DialogClose />
      </DialogHeader>
      <DialogBody className="grid gap-4">
        <RadioGroup defaultValue="soft" ariaLabel="Restart mode" className="grid gap-3">
          {resetOptions.map((option) => (
            <label
              key={option.value}
              className="grid cursor-pointer grid-cols-[auto_1fr] gap-3 border border-line-subtle bg-layer-panel p-3 has-[[data-checked]]:border-line-strong has-[[data-checked]]:bg-danger/10"
            >
              <RadioGroupItem value={option.value} />
              <span className="grid gap-1">
                <Text.Sans size="small" className="font-medium">
                  {option.label}
                </Text.Sans>
                <Text.Sans size="caption" variant="placeholder">
                  {option.description}
                </Text.Sans>
              </span>
            </label>
          ))}
        </RadioGroup>
        <Banner status="warning" size="sm">
          <BannerDescription>
            Full reset permanently deletes workspace files. This cannot be undone.
          </BannerDescription>
        </Banner>
      </DialogBody>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <Button variant="danger">
          <RotateCcw />
          Full Reset & Restart
        </Button>
      </DialogFooter>
    </>
  );
}

export function ResetAgentDialogContent() {
  return (
    <DialogContent>
      <ResetAgentDialogParts />
    </DialogContent>
  );
}

// @docs-source-strip-start
export function ResetAgentDialogComposition({ className }: { className?: string }) {
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <SourceComparisonPreview className={className}>
      <div ref={portalRef} className="relative min-w-0 w-full max-w-full max-w-md">
        <Dialog open modal={false}>
          <DialogContent
            overlay={false}
            initialFocus={false}
            finalFocus={false}
            portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
            className={PREVIEW_CONTENT_CLASS}
          >
            <ResetAgentDialogParts />
          </DialogContent>
        </Dialog>
      </div>
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
