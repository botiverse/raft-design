import {
  Banner,
  BannerDescription,
  Button,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldLabel,
  InlineCode,
  Input,
} from "raft-ui";
import { X } from "lucide-react";

// @docs-source-strip-start
import type { RefObject } from "react";
import { useRef } from "react";
import { Dialog } from "raft-ui";
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";

const PREVIEW_CONTENT_CLASS =
  "!relative !top-auto !left-auto !z-0 !w-full !max-w-sm !translate-x-0 !translate-y-0";
// @docs-source-strip-end

function DeleteServerDialogParts() {
  return (
    <>
      <DialogHeader className="mb-1 flex-row items-start justify-between gap-3">
        <DialogTitle>Delete Server</DialogTitle>
        <DialogClose render={<Button variant="outline" size="icon-sm" aria-label="Close" />}>
          <X />
        </DialogClose>
      </DialogHeader>
      <DialogBody className="grid gap-4">
        <Banner status="destructive" size="md">
          <BannerDescription>
            This will permanently delete Raft and all its data (agents, channels, messages). This
            cannot be undone.
          </BannerDescription>
        </Banner>
        <Field>
          <FieldLabel htmlFor="dialog-delete-server">
            Type <InlineCode>raft</InlineCode> to confirm:
          </FieldLabel>
          <Input
            id="dialog-delete-server"
            placeholder="raft"
            className="font-mono"
            suppressPasswordManager
          />
        </Field>
      </DialogBody>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" size="sm" />}>Cancel</DialogClose>
        <Button variant="danger" size="sm">
          Delete Server
        </Button>
      </DialogFooter>
    </>
  );
}

export function DeleteServerDialogContent() {
  return (
    <DialogContent className="max-w-sm">
      <DeleteServerDialogParts />
    </DialogContent>
  );
}

// @docs-source-strip-start
export function DeleteServerDialogComposition({ className }: { className?: string }) {
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <SourceComparisonPreview className={className}>
      <div ref={portalRef} className="relative min-w-0 w-full max-w-full max-w-sm">
        <Dialog open modal={false}>
          <DialogContent
            overlay={false}
            initialFocus={false}
            finalFocus={false}
            portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
            className={PREVIEW_CONTENT_CLASS}
          >
            <DeleteServerDialogParts />
          </DialogContent>
        </Dialog>
      </div>
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
