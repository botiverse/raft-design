import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "raft-ui/wip";
import { Button, Field, FieldDescription, FieldLabel, InlineCode, Input } from "raft-ui";
import { Copy, Mail, X } from "lucide-react";

// @docs-source-strip-start
import type { RefObject } from "react";
import { useRef } from "react";
import { Dialog } from "raft-ui/wip";

const PREVIEW_CONTENT_CLASS =
  "!relative !top-auto !left-auto !z-0 !max-w-sm !translate-x-0 !translate-y-0 !p-6";
// @docs-source-strip-end

function InviteHumanDialogParts() {
  return (
    <>
      <DialogHeader className="mb-1 flex-row items-start justify-between gap-3">
        <DialogTitle>Invite Human</DialogTitle>
        <DialogClose render={<Button variant="outline" size="icon-sm" aria-label="Close" />}>
          <X />
        </DialogClose>
      </DialogHeader>
      <DialogBody className="grid gap-4">
        <Field>
          <FieldLabel>Join link</FieldLabel>
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
            <InlineCode className="w-0 min-w-full truncate py-2">
              http://localhost:5173/join/slk_invite_8k2
            </InlineCode>
            <Button
              type="button"
              variant="default"
              size="icon-sm"
              aria-label="Copy join link"
              className="shrink-0"
            >
              <Copy />
            </Button>
          </div>
          <FieldDescription>Anyone with this link can join this server.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="dialog-invite-email-1">Emails</FieldLabel>
          <div className="grid gap-2">
            <Input id="dialog-invite-email-1" type="email" placeholder="teammate@example.com" />
            <Input type="email" placeholder="optional" />
            <Input type="email" placeholder="optional" />
          </div>
        </Field>
      </DialogBody>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <Button variant="accent">
          <Mail />
          Send invites
        </Button>
      </DialogFooter>
    </>
  );
}

export function InviteHumanDialogContent() {
  return (
    <DialogContent className="max-w-sm">
      <InviteHumanDialogParts />
    </DialogContent>
  );
}

// @docs-source-strip-start
export function InviteHumanDialogComposition({ className }: { className?: string }) {
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={[
        "flex h-full min-h-28 w-full min-w-0 items-center justify-center px-3 py-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div ref={portalRef} className="relative flex min-w-0 w-full max-w-sm justify-center">
        <Dialog open modal={false}>
          <DialogContent
            overlay={false}
            initialFocus={false}
            finalFocus={false}
            portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
            className={PREVIEW_CONTENT_CLASS}
            style={{ width: "384px" }}
          >
            <InviteHumanDialogParts />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
// @docs-source-strip-end
