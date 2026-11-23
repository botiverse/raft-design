import {
  helperText,
  Button,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@botiverse/raft-ui";
import { DialogFooterNote } from "@botiverse/raft-ui/wip";

// @docs-source-strip-start
import { Dialog } from "@botiverse/raft-ui";
import { CompositionModalPreview } from "#/components/composition-preview.tsx";
import { vcase } from "#/lib/vcase.ts";

export const meta = vcase({ id: "ui.dialog.footer-note" });
// @docs-source-strip-end

function FooterNoteDialogParts() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Add 3 members?</DialogTitle>
        <DialogClose />
      </DialogHeader>
      <DialogBody>
        <DialogDescription>
          {helperText("Mina, Oscar and Lagoon get access to every public channel in Acme.", {
            why: "audience",
            about: "member",
          })}
        </DialogDescription>
      </DialogBody>
      <DialogFooter>
        <DialogFooterNote>
          {helperText("You'll be billed $8 for each new member.", {
            why: "consequence",
            about: "billing",
          })}
        </DialogFooterNote>
        <DialogClose render={<Button variant="ghost" size="lg" />}>Cancel</DialogClose>
        <Button variant="primary" size="lg">
          Add members
        </Button>
      </DialogFooter>
    </>
  );
}

export function FooterNoteDialogContent() {
  return (
    <DialogContent size="lg">
      <FooterNoteDialogParts />
    </DialogContent>
  );
}

// @docs-source-strip-start
export function FooterNoteDialogComposition({ className }: { className?: string }) {
  return (
    <CompositionModalPreview className={className}>
      {({ portalProps, contentClassName }) => (
        <Dialog open modal={false}>
          <DialogContent
            size="lg"
            overlay={false}
            initialFocus={false}
            finalFocus={false}
            portalProps={portalProps}
            className={contentClassName}
          >
            <FooterNoteDialogParts />
          </DialogContent>
        </Dialog>
      )}
    </CompositionModalPreview>
  );
}
// @docs-source-strip-end
