import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
  Button,
  Checkbox,
  Field,
  FieldItem,
  FieldLabel,
  Text,
} from "@botiverse/raft-ui";
import { Monitor } from "lucide-react";

// @docs-source-strip-start
import { Dialog } from "@botiverse/raft-ui";
import { CompositionModalPreview } from "#/components/composition-preview.tsx";

// @docs-source-strip-end

function OnboardingDialogParts() {
  return (
    <>
      <DialogBody className="grid gap-4">
        <Text.Mono size="meta" className="uppercase text-foreground-muted">
          Meet RAFT
        </Text.Mono>
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center border border-line-strong bg-brand-400 text-foreground">
            <Monitor className="size-4" />
          </div>
          <DialogTitle className="text-foreground">Add a computer</DialogTitle>
        </div>
        <div className="grid gap-2">
          <Text.Sans size="body" variant="placeholder" className="text-pretty text-foreground">
            Your agents need somewhere to run. Connect a computer and they&apos;ll come online
            there.
          </Text.Sans>
          <Text.Sans size="caption" variant="placeholder" className="text-pretty">
            Need an agent runtime installed — Codex, Claude Code, or Cursor.
          </Text.Sans>
        </div>
      </DialogBody>
      <DialogFooter className="grid grid-cols-[minmax(0,1fr)_auto] items-center">
        <Field className="min-w-0">
          <FieldItem size="sm" className="min-w-0">
            <Checkbox id="dialog-onboarding-reminder" />
            <FieldLabel
              htmlFor="dialog-onboarding-reminder"
              id="dialog-onboarding-reminder-label"
              size="sm"
              className="min-w-0 truncate font-medium text-foreground-muted"
            >
              Don&apos;t remind me again
            </FieldLabel>
          </FieldItem>
        </Field>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline">Skip</Button>
          <Button variant="accent">
            <Monitor data-icon="inline-start" />
            Add Computer
          </Button>
        </div>
      </DialogFooter>
    </>
  );
}

export function OnboardingDialogContent() {
  return (
    <DialogContent>
      <OnboardingDialogParts />
    </DialogContent>
  );
}

// @docs-source-strip-start
export function OnboardingDialogComposition({ className }: { className?: string }) {
  return (
    <CompositionModalPreview className={className} portalClassName="px-0" backdrop={false}>
      {({ portalProps, contentClassName }) => (
        <Dialog open modal={false}>
          <DialogContent
            overlay={false}
            initialFocus={false}
            finalFocus={false}
            portalProps={portalProps}
            className={contentClassName}
          >
            <OnboardingDialogParts />
          </DialogContent>
        </Dialog>
      )}
    </CompositionModalPreview>
  );
}
// @docs-source-strip-end
