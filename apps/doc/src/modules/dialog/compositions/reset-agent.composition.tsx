import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Banner,
  BannerDescription,
  Button,
  RadioGroup,
  RadioGroupItem,
  Text,
  useThemeFamily,
} from "raft-ui";
import { cn } from "raft-ui/cn";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useState, type ReactNode } from "react";

// @docs-source-strip-start
import { Dialog } from "raft-ui";
import { CompositionModalPreview } from "#/components/composition-preview.tsx";

// @docs-source-strip-end

type ResetModeTone = "restart" | "session" | "full";

function ResetModeOptions({
  value,
  onValueChange,
}: {
  value: ResetModeTone;
  onValueChange: (value: ResetModeTone) => void;
}) {
  return (
    <RadioGroup<ResetModeTone>
      value={value}
      onValueChange={onValueChange}
      ariaLabel="Restart mode"
      className="grid gap-3"
    >
      <ResetModeOption value="restart" tone="restart">
        <ResetModeTitle>Restart</ResetModeTitle>
        <ResetModeDescription>
          Stop and restart the agent process. Keeps the runtime session and workspace files.
        </ResetModeDescription>
      </ResetModeOption>
      <ResetModeOption value="session" tone="session">
        <ResetModeTitle>Reset Session & Restart</ResetModeTitle>
        <ResetModeDescription>
          Clear the runtime session and restart. Workspace files (MEMORY.md, notes/) are preserved.
        </ResetModeDescription>
      </ResetModeOption>
      <ResetModeOption value="full" tone="full">
        <ResetModeTitle>Full Reset & Restart</ResetModeTitle>
        <ResetModeDescription>
          Clear the runtime session, delete all workspace files, and restart from scratch.
        </ResetModeDescription>
      </ResetModeOption>
    </RadioGroup>
  );
}

function ResetModeOption({
  value,
  tone,
  children,
}: {
  value: ResetModeTone;
  tone: ResetModeTone;
  children: ReactNode;
}) {
  const theme = useThemeFamily();
  const isBrutal = theme === "brutal";

  return (
    <label
      className={cn(
        "cursor-pointer transition-colors",
        "has-[[data-slot=radio-group-item]:focus-visible]:ring-2 has-[[data-slot=radio-group-item]:focus-visible]:ring-line-strong has-[[data-slot=radio-group-item]:focus-visible]:ring-offset-2 has-[[data-slot=radio-group-item]:focus-visible]:ring-offset-layer-page",
        isBrutal
          ? [
              "block border-2 border-line-muted bg-layer-panel p-4",
              "has-[[data-checked]]:border-line-strong",
              "has-[[data-checked]]:shadow-raft-sm",
              resetModeSelectedClassName(tone),
            ]
          : [
              "group/reset-option flex w-full items-start gap-2.5 rounded-md bg-layer-panel p-3.5 text-left",
              "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.05),0_1px_1.5px_-1px_oklch(0_0_0_/_0.035),0_0_0_1px_var(--line-muted)]",
              "hover:bg-foreground-strong/[0.04]",
              "has-[[data-checked]]:bg-foreground-strong/[0.04]",
              "has-[[data-checked]]:shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.05),0_1px_1.5px_-1px_oklch(0_0_0_/_0.05),0_0_0_1px_var(--line-field-hover)]",
            ],
      )}
    >
      <RadioGroupItem value={value} appearance="none" />
      <span className="grid min-w-0 gap-1">{children}</span>
    </label>
  );
}

function resetModeSelectedClassName(tone: ResetModeTone) {
  if (tone === "restart") {
    return "has-[[data-checked]]:bg-[oklch(0.783_0.135_219.2_/_0.2)]";
  }

  if (tone === "session") {
    return "has-[[data-checked]]:bg-[oklch(0.785_0.123_50.11_/_0.2)]";
  }

  return "has-[[data-checked]]:bg-[oklch(0.711_0.168_28.04_/_0.2)]";
}

function ResetModeTitle({ children }: { children: ReactNode }) {
  const theme = useThemeFamily();
  const isBrutal = theme === "brutal";

  return (
    <Text.Sans
      size="small"
      className={cn("font-medium text-foreground", isBrutal && "font-bold uppercase text-black")}
    >
      {children}
    </Text.Sans>
  );
}

function ResetModeDescription({ children }: { children: ReactNode }) {
  const theme = useThemeFamily();
  const isBrutal = theme === "brutal";

  return (
    <Text.Sans size="caption" className={cn("text-foreground-muted", isBrutal && "text-black/60")}>
      {children}
    </Text.Sans>
  );
}

function ResetWarning() {
  return (
    <Banner status="warning" size="sm" className="font-bold">
      <AlertTriangle />
      <BannerDescription>
        This will permanently delete all workspace files including MEMORY.md and notes/.
        <br />
        This cannot be undone.
      </BannerDescription>
    </Banner>
  );
}

function ResetActionButton({ mode }: { mode: ResetModeTone }) {
  if (mode === "restart") {
    return (
      <Button variant="default">
        <RotateCcw data-icon="inline-start" />
        Restart
      </Button>
    );
  }

  if (mode === "session") {
    return (
      <Button variant="warning">
        <RotateCcw data-icon="inline-start" />
        Reset Session & Restart
      </Button>
    );
  }

  return (
    <Button variant="danger">
      <RotateCcw data-icon="inline-start" />
      Full Reset & Restart
    </Button>
  );
}

function ResetAgentDialogParts() {
  const [mode, setMode] = useState<ResetModeTone>("full");

  return (
    <>
      <DialogHeader>
        <DialogTitle>Restart Atlas</DialogTitle>
        <DialogClose />
      </DialogHeader>
      <DialogBody>
        <div className="grid gap-3">
          <ResetModeOptions value={mode} onValueChange={setMode} />
          {mode === "full" ? <ResetWarning /> : null}
        </div>
      </DialogBody>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <ResetActionButton mode={mode} />
      </DialogFooter>
    </>
  );
}

export function ResetAgentDialogContent() {
  return (
    <DialogContent>
      <ResetAgentDialogParts />
    </DialogContent>
  );
}

// @docs-source-strip-start
export function ResetAgentDialogComposition({ className }: { className?: string }) {
  return (
    <CompositionModalPreview
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
            <ResetAgentDialogParts />
          </DialogContent>
        </Dialog>
      )}
    </CompositionModalPreview>
  );
}
// @docs-source-strip-end
