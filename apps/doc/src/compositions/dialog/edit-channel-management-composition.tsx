import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "raft-ui/wip";
import { Button, Field, FieldLabel, Input, Separator, Textarea } from "raft-ui";
import { Archive, Lock, Trash2 } from "lucide-react";

// @docs-source-strip-start
import type { RefObject } from "react";
import { useRef } from "react";
import { Dialog } from "raft-ui/wip";
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";

const PREVIEW_CONTENT_CLASS =
  "!relative !top-auto !left-auto !z-0 !w-full !max-w-md !translate-x-0 !translate-y-0";
// @docs-source-strip-end

function EditChannelManagementDialogParts() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Channel</DialogTitle>
        <DialogClose />
      </DialogHeader>
      <DialogBody className="grid gap-4">
        <Field>
          <FieldLabel htmlFor="dialog-managed-channel-name" required>
            Name
          </FieldLabel>
          <Input id="dialog-managed-channel-name" defaultValue="onboarding-willxiang" />
        </Field>
        <Field>
          <FieldLabel htmlFor="dialog-managed-channel-description" optional>
            Description
          </FieldLabel>
          <Textarea
            id="dialog-managed-channel-description"
            defaultValue="Owner onboarding workspace (system-managed)."
            className="min-h-20"
          />
        </Field>
        <div className="grid gap-3 pb-3">
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 py-3">
            <Separator />
            <span className="font-mono text-xs font-medium text-foreground-muted">Actions</span>
            <Separator />
          </div>
          <Button variant="warning" className="w-full">
            <Lock />
            Make Private
          </Button>
          <Button variant="warning" className="w-full">
            <Archive />
            Archive Channel
          </Button>
          <Button variant="danger" className="w-full">
            <Trash2 />
            Delete Channel
          </Button>
        </div>
      </DialogBody>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <Button variant="accent">Save Changes</Button>
      </DialogFooter>
    </>
  );
}

export function EditChannelManagementDialogContent() {
  return (
    <DialogContent>
      <EditChannelManagementDialogParts />
    </DialogContent>
  );
}

// @docs-source-strip-start
export function EditChannelManagementDialogComposition({ className }: { className?: string }) {
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
            <EditChannelManagementDialogParts />
          </DialogContent>
        </Dialog>
      </div>
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
