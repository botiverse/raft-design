import { DialogBody, DialogContent, DialogFooter, DialogTitle } from "raft-ui";
import { Button, Checkbox, Field, FieldItem, FieldLabel, Text, useThemeFamily } from "raft-ui";
import { cn } from "raft-ui/cn";
import { Monitor } from "lucide-react";

// @docs-source-strip-start
import { Dialog } from "raft-ui";
import { SourceComparisonModalPreview } from "../source-comparison-preview.tsx";

// @docs-source-strip-end

function OnboardingDialogParts() {
  const theme = useThemeFamily();
  const isBrutal = theme === "brutal";
  const isElegant = theme === "elegant";

  return (
    <>
      <DialogBody className={cn("grid gap-4", isBrutal && "pt-3 pb-4", isElegant && "py-7")}>
        <Text.Mono
          size="meta"
          className={cn("uppercase text-foreground-muted", isBrutal && "text-black/50")}
        >
          Meet RAFT
        </Text.Mono>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center border border-line-strong bg-primary-400 text-foreground-strong",
              isBrutal && "size-7 border-2 border-black bg-[oklch(0.883_0.162_91.89)] text-black",
              isElegant &&
                "rounded-md border-transparent bg-[oklch(0.97_0.07_91.89)] text-[oklch(0.56_0.12_83)]",
            )}
          >
            <Monitor className={cn("size-4", isBrutal && "size-[17px]")} />
          </div>
          <DialogTitle
            className={cn(
              "text-foreground-strong",
              isBrutal && "font-sans text-xl font-bold uppercase text-black",
              isElegant && "text-lg font-semibold",
            )}
          >
            Add a computer
          </DialogTitle>
        </div>
        <div className="grid gap-2">
          <Text.Sans size="body" variant="placeholder" className="text-pretty text-black">
            Your agents need somewhere to run. Connect a computer and they&apos;ll come online
            there.
          </Text.Sans>
          <Text.Sans
            size="caption"
            variant="placeholder"
            className={cn("text-pretty", isBrutal && "text-black/60")}
          >
            Need an agent runtime installed — Codex, Claude Code, or Cursor.
          </Text.Sans>
        </div>
      </DialogBody>
      <DialogFooter className="grid grid-cols-[minmax(0,1fr)_auto] items-center">
        <Field className="min-w-0">
          <FieldItem className="min-w-0 items-center">
            <Checkbox id="dialog-onboarding-reminder" size="sm" />
            <FieldLabel
              htmlFor="dialog-onboarding-reminder"
              id="dialog-onboarding-reminder-label"
              size="sm"
              className={cn(
                "min-w-0 truncate font-medium text-foreground-muted",
                isBrutal && "text-black/60",
              )}
            >
              Don&apos;t remind me again
            </FieldLabel>
          </FieldItem>
        </Field>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline">Skip</Button>
          <Button variant="primary">
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
    <DialogContent className="max-w-lg">
      <OnboardingDialogParts />
    </DialogContent>
  );
}

// @docs-source-strip-start
export function OnboardingDialogComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonModalPreview
      className={className}
      contentClassName="!max-w-lg"
      portalClassName="!px-0"
      backdrop={false}
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
            <OnboardingDialogParts />
          </DialogContent>
        </Dialog>
      )}
    </SourceComparisonModalPreview>
  );
}
// @docs-source-strip-end
