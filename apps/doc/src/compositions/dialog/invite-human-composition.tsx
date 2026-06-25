import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "raft-ui/wip";
import { cn } from "raft-ui/cn";
import {
  Button,
  Field,
  FieldDescription,
  FieldLabel,
  InlineCode,
  Input,
  Separator,
  useThemeFamily,
} from "raft-ui";
import { Copy, Link2, Mail, Plus } from "lucide-react";

// @docs-source-strip-start
import type { RefObject } from "react";
import { useRef } from "react";
import { Dialog } from "raft-ui/wip";
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";

const PREVIEW_CONTENT_CLASS =
  "!relative !top-auto !left-auto !z-0 !w-full !max-w-[calc(24rem+48px)] !translate-x-0 !translate-y-0";
// @docs-source-strip-end

function JoinLinkCode() {
  const theme = useThemeFamily();

  return (
    <InlineCode
      className={cn(
        "w-0 min-w-full truncate px-3 py-2 text-foreground-strong",
        theme === "brutal"
          ? "rounded-none border-2 border-line-strong bg-layer-panel shadow-sm"
          : "rounded bg-layer-muted shadow-none",
      )}
    >
      http://localhost:5173/join/slk_invite_8k2
    </InlineCode>
  );
}

function InviteHumanDialogParts() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Invite Human</DialogTitle>
        <DialogClose />
      </DialogHeader>
      <DialogBody className="grid gap-4">
        <Field>
          <FieldLabel>Join link</FieldLabel>
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
            <JoinLinkCode />
            <Button
              type="button"
              variant="ghost"
              size="icon-md"
              aria-label="Copy join link"
              className="self-stretch shrink-0"
            >
              <Copy />
            </Button>
          </div>
          <FieldDescription className="inline-flex items-center gap-1">
            <Link2 className="size-3" />
            Anyone with this link can join this server.
          </FieldDescription>
        </Field>
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 py-3">
          <Separator />
          <span className="font-mono text-xs font-medium text-foreground-muted">OR</span>
          <Separator />
        </div>
        <Field>
          <FieldLabel htmlFor="dialog-invite-email-1">Emails</FieldLabel>
          <div className="grid gap-2">
            <Input id="dialog-invite-email-1" type="email" placeholder="teammate@example.com" />
            <Input type="email" placeholder="optional" />
            <Input type="email" placeholder="optional" />
            <Button type="button" variant="outline" className="w-full">
              <Plus />
              Invite more
            </Button>
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
    <DialogContent className="max-w-[calc(24rem+48px)]">
      <InviteHumanDialogParts />
    </DialogContent>
  );
}

// @docs-source-strip-start
export function InviteHumanDialogComposition({ className }: { className?: string }) {
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <SourceComparisonPreview className={className}>
      <div ref={portalRef} className="relative min-w-0 w-full max-w-[calc(24rem+48px)]">
        <Dialog open modal={false}>
          <DialogContent
            overlay={false}
            initialFocus={false}
            finalFocus={false}
            portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
            className={PREVIEW_CONTENT_CLASS}
          >
            <InviteHumanDialogParts />
          </DialogContent>
        </Dialog>
      </div>
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
