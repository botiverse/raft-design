import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Text,
  useThemeFamily,
} from "raft-ui";
import { cn } from "raft-ui/cn";
import { X } from "lucide-react";

// @docs-source-strip-start
import { Dialog } from "raft-ui";
import { SourceComparisonModalPreview } from "#/components/source-comparison-preview.tsx";

// @docs-source-strip-end

function AgreementDialogParts() {
  const theme = useThemeFamily();
  const isBrutal = theme === "brutal";
  const isElegant = theme === "elegant";
  const actionButtonSize = isBrutal ? "md" : "sm";

  return (
    <>
      <DialogHeader className={cn(isBrutal && "items-start")}>
        <div className="grid gap-0.5">
          <DialogTitle className={cn(isBrutal && "font-sans normal-case leading-tight")}>
            Community Guidelines
          </DialogTitle>
          <Text.Sans
            size="caption"
            variant="placeholder"
            className={cn(isBrutal && "text-black/50")}
          >
            Version 3
          </Text.Sans>
        </div>
        <DialogClose size="icon-sm" className={cn(isBrutal && "p-1")}>
          <X className={cn("size-4", isBrutal && "size-[18px]")} />
        </DialogClose>
      </DialogHeader>
      <DialogBody className={cn("grid gap-3", isBrutal && "py-6 font-normal", isElegant && "py-7")}>
        <p className="m-0 text-sm">Before joining, review the workspace rules.</p>
        <div
          className={cn(
            "max-h-[50vh] overflow-y-auto border border-line-subtle bg-layer-panel p-4 text-sm",
            isBrutal && "border-2 border-line-strong bg-white",
            isElegant && "max-h-none overflow-visible border-0 bg-transparent p-0",
          )}
        >
          <ul className="m-0 list-disc space-y-1 pl-5 whitespace-pre-wrap break-words">
            <li>Keep sensitive customer data out of public channels.</li>
            <li>Use design-system components for shared product surfaces.</li>
            <li>Report unsafe automation or missing audit context immediately.</li>
          </ul>
        </div>
      </DialogBody>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" size={actionButtonSize} />}>
          Cancel
        </DialogClose>
        <Button variant="primary" size={actionButtonSize}>
          Agree & Continue
        </Button>
      </DialogFooter>
    </>
  );
}

export function AgreementDialogContent() {
  const theme = useThemeFamily();

  return (
    <DialogContent className={cn("max-w-lg", theme === "brutal" && "p-5")}>
      <AgreementDialogParts />
    </DialogContent>
  );
}

// @docs-source-strip-start
export function AgreementDialogComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonModalPreview
      className={className}
      contentClassName="max-w-lg data-[theme=brutal]:p-5"
      placementPaddingClassName="px-0 py-6"
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
            <AgreementDialogParts />
          </DialogContent>
        </Dialog>
      )}
    </SourceComparisonModalPreview>
  );
}
// @docs-source-strip-end
