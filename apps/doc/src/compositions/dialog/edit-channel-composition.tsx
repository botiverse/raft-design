import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "raft-ui/wip";
import { Button, Field, FieldDescription, FieldLabel, Input, Separator, Textarea } from "raft-ui";
import { EyeOff, X } from "lucide-react";

// @docs-source-strip-start
import type { RefObject } from "react";
import { useRef } from "react";
import { Dialog } from "raft-ui/wip";
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";

const PREVIEW_CONTENT_CLASS =
  "!relative !top-auto !left-auto !z-0 !w-full !max-w-md !translate-x-0 !translate-y-0";
// @docs-source-strip-end

function EditChannelDialogParts() {
  return (
    <>
      <DialogHeader className="mb-1 flex-row items-start justify-between gap-3">
        <DialogTitle>Edit Channel</DialogTitle>
        <DialogClose render={<Button variant="outline" size="icon-sm" aria-label="Close" />}>
          <X />
        </DialogClose>
      </DialogHeader>
      <DialogBody className="grid gap-4">
        <Field>
          <FieldLabel htmlFor="dialog-channel-name" required>
            Name
          </FieldLabel>
          <Input id="dialog-channel-name" defaultValue="all" disabled />
          <FieldDescription>The #all channel cannot be renamed</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="dialog-channel-description" optional>
            Description
          </FieldLabel>
          <Textarea
            id="dialog-channel-description"
            defaultValue="General channel for all members"
            className="min-h-20"
          />
        </Field>
      </DialogBody>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <Button variant="accent">Save Changes</Button>
      </DialogFooter>
      <div className="grid gap-5">
        <Separator />
        <Button variant="warning" className="w-full">
          <EyeOff />
          Hide #all
        </Button>
      </div>
    </>
  );
}

export function EditChannelDialogContent() {
  return (
    <DialogContent>
      <EditChannelDialogParts />
    </DialogContent>
  );
}

// @docs-source-strip-start
export function EditChannelDialogComposition({ className }: { className?: string }) {
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
            <EditChannelDialogParts />
          </DialogContent>
        </Dialog>
      </div>
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
