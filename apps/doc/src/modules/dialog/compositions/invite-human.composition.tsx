import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "raft-ui";
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
import { Dialog } from "raft-ui";
import { SourceComparisonModalPreview } from "#/components/source-comparison-preview.tsx";

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
        <Separator>OR</Separator>
        <Field>
          <FieldLabel htmlFor="dialog-invite-email-1">Emails</FieldLabel>
          <div className="grid gap-2">
            <Input id="dialog-invite-email-1" type="email" placeholder="teammate@example.com" />
            <Input type="email" placeholder="optional" />
            <Input type="email" placeholder="optional" />
            <Button type="button" variant="outline" className="w-full">
              <Plus data-icon="inline-start" />
              Invite more
            </Button>
          </div>
        </Field>
      </DialogBody>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <Button variant="accent">
          <Mail data-icon="inline-start" />
          Send invites
        </Button>
      </DialogFooter>
    </>
  );
}

export function InviteHumanDialogContent() {
  return (
    <DialogContent className="max-w-md">
      <InviteHumanDialogParts />
    </DialogContent>
  );
}

// @docs-source-strip-start
export function InviteHumanDialogComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonModalPreview
      className={className}
      contentClassName="max-w-md"
      portalClassName="px-0"
    >
      {({ portalProps, contentClassName }) => (
        <Dialog open modal={false}>
          <DialogContent
            overlay={false}
            initialFocus={false}
            finalFocus={false}
            portalProps={portalProps}
            className={contentClassName}
          >
            <InviteHumanDialogParts />
          </DialogContent>
        </Dialog>
      )}
    </SourceComparisonModalPreview>
  );
}
// @docs-source-strip-end
