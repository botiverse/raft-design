import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldLabel,
  Input,
  Text,
  Textarea,
  useThemeFamily,
  type Theme,
  type ThemeMode,
} from "raft-ui";
import { cn } from "raft-ui/cn";
import { Monitor } from "lucide-react";

import { PreviewThemeScope } from "#/components/preview-theme.tsx";

type CloseBehavior = "esc-only" | "both" | "none";

export const Route = createFileRoute("/iframe/dialog-scroll-layer")({
  staticData: { standalone: true },
  validateSearch: (search) => ({
    theme: getTheme(search.theme),
    mode: getMode(search.mode),
  }),
  component: DialogScrollLayerPreview,
});

function DialogScrollLayerPreview() {
  const search = Route.useSearch();
  const [theme, setTheme] = useState<Theme>(search.theme);
  const [mode, setMode] = useState<ThemeMode>(search.mode);

  return (
    <PreviewThemeScope
      family={theme}
      mode={mode}
      className="min-h-screen bg-layer-base text-foreground-strong"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
        <div className="flex flex-col gap-1">
          <Text.Sans size="large" className="font-semibold">
            Dialog Scroll + Layer Preview
          </Text.Sans>
          <Text.Sans size="caption" variant="placeholder">
            Four axes: close behavior, content height, content shape, layer.
          </Text.Sans>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(["elegant", "brutal"] as const).map((t) => (
            <Button
              key={t}
              variant={theme === t && mode === "light" ? "accent" : "outline"}
              size="sm"
              onClick={() => {
                setTheme(t);
                setMode("light");
              }}
            >
              {t === "elegant" ? "Elegant" : "Brutal"}
            </Button>
          ))}
          <Button
            variant={theme === "elegant" && mode === "dark" ? "accent" : "outline"}
            size="sm"
            onClick={() => {
              setTheme("elegant");
              setMode("dark");
            }}
          >
            Elegant dark
          </Button>
        </div>

        <div className="grid gap-6">
          <AxisSection title="① Close behavior">
            <div className="grid gap-3 sm:grid-cols-3">
              <Card label="Esc only (default)" sublabel="disablePointerDismissal">
                <CloseBehaviorDialog behavior="esc-only" />
              </Card>
              <Card label="Both Esc + outside" sublabel="no extra props">
                <CloseBehaviorDialog behavior="both" />
              </Card>
              <Card label="Neither" sublabel="onboarding gate">
                <CloseBehaviorDialog behavior="none" />
              </Card>
            </div>
          </AxisSection>

          <AxisSection title="② Content height (draggable)">
            <AdjustableHeightDialog />
          </AxisSection>

          <AxisSection title="③ Content shape">
            <div className="grid gap-3 sm:grid-cols-2">
              <Card label="Standard card" sublabel="header + body + footer (14 callsites)">
                <StandardCardDialog />
              </Card>
              <Card label="Custom layout" sublabel="full-bleed, no default padding (14 callsites)">
                <CustomLayoutDialog />
              </Card>
            </div>
          </AxisSection>

          <AxisSection title="④ Layer — nested two-layer">
            <Card label="Outer (z-50) → Inner (z-60)" sublabel="layer={0} + layer={1}">
              <NestedDialog />
            </Card>
          </AxisSection>

          <AxisSection title="Worst-case combo: nested + custom + extra tall">
            <Card
              label='"两层叠 + 上层自定义整块 + 内容超高"'
              sublabel="onboarding gate at layer 1 with overflow"
            >
              <WorstCaseCombo />
            </Card>
          </AxisSection>
        </div>
      </div>
    </PreviewThemeScope>
  );
}

function AxisSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <Text.Sans size="body" className="font-semibold text-foreground">
        {title}
      </Text.Sans>
      {children}
    </div>
  );
}

function Card({
  label,
  sublabel,
  children,
}: {
  label: string;
  sublabel: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-md border border-line-muted bg-layer-panel p-4",
        "in-data-[theme=brutal]:rounded-none in-data-[theme=brutal]:border-2 in-data-[theme=brutal]:border-line-strong",
      )}
    >
      <div className="flex flex-col gap-0.5">
        <Text.Sans size="caption" className="font-medium text-foreground">
          {label}
        </Text.Sans>
        <Text.Sans size="caption" variant="placeholder" className="font-mono text-[11px]">
          {sublabel}
        </Text.Sans>
      </div>
      {children}
    </div>
  );
}

function CloseBehaviorDialog({ behavior }: { behavior: CloseBehavior }) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (next: boolean, details: { reason: string }) => {
    if (
      behavior === "none" &&
      (details.reason === "escape-key" || details.reason === "outside-press")
    ) {
      return;
    }
    if (behavior === "esc-only" && details.reason === "outside-press") {
      return;
    }
    setOpen(next);
  };

  const label =
    behavior === "esc-only"
      ? "Esc closes, outside does not"
      : behavior === "both"
        ? "Both Esc + outside close"
        : "Neither Esc nor outside — only ✕ button";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close Behavior</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <DialogBody className="grid gap-3">
          <DialogDescription>{label}</DialogDescription>
          <Text.Sans size="caption" variant="placeholder">
            Try pressing Esc, clicking outside, or clicking the ✕ button.
          </Text.Sans>
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AdjustableHeightDialog() {
  const [fieldCount, setFieldCount] = useState(8);

  return (
    <Card
      label="Drag to adjust"
      sublabel={`${fieldCount} fields — bug appears when content > viewport`}
    >
      <div className="flex items-center gap-3">
        <Text.Sans size="caption" className="shrink-0 font-mono text-foreground-muted">
          1
        </Text.Sans>
        <input
          type="range"
          min={1}
          max={30}
          value={fieldCount}
          onChange={(e) => setFieldCount(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer accent-primary"
        />
        <Text.Sans size="caption" className="shrink-0 font-mono text-foreground-muted">
          30
        </Text.Sans>
      </div>
      <Dialog>
        <DialogTrigger render={<Button variant="outline" size="sm" />}>
          Open ({fieldCount} fields)
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjustable Height</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody className="grid gap-4">
            <DialogDescription>
              {fieldCount} fields. Scroll the body when content exceeds the viewport — header and
              footer stay fixed.
            </DialogDescription>
            {Array.from({ length: fieldCount }, (_, i) => (
              <Field key={i}>
                <FieldLabel htmlFor={`adj-field-${i}`}>Field {i + 1}</FieldLabel>
                <Input id={`adj-field-${i}`} placeholder={`Value ${i + 1}`} />
              </Field>
            ))}
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="accent">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function StandardCardDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Channel</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <DialogBody className="grid gap-4">
          <DialogDescription>
            Standard card with title row, scrollable body, and action footer.
          </DialogDescription>
          {Array.from({ length: 6 }, (_, i) => (
            <Field key={i}>
              <FieldLabel htmlFor={`std-field-${i}`}>Field {i + 1}</FieldLabel>
              <Input id={`std-field-${i}`} placeholder={`Value ${i + 1}`} />
            </Field>
          ))}
          <Field>
            <FieldLabel htmlFor="std-notes">Notes</FieldLabel>
            <Textarea id="std-notes" className="min-h-24" placeholder="Additional notes..." />
          </Field>
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button variant="accent">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CustomLayoutDialog() {
  const theme = useThemeFamily();
  const isBrutal = theme === "brutal";
  const isElegant = theme === "elegant";

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>Open</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogBody className={cn("grid gap-4", isBrutal && "pt-3 pb-4", isElegant && "py-7")}>
          <Text.Mono
            size="meta"
            className={cn("uppercase text-foreground-muted", isBrutal && "text-black/50")}
          >
            Custom layout
          </Text.Mono>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center border border-line-strong bg-primary-400 text-foreground",
                isBrutal && "size-7 border-2 border-black bg-[oklch(0.883_0.162_91.89)] text-black",
                isElegant && "rounded-md border-transparent bg-primary-soft text-primary-strong",
              )}
            >
              <Monitor className={cn("size-4", isBrutal && "size-[17px]")} />
            </div>
            <DialogTitle
              className={cn(
                "text-foreground",
                isBrutal && "font-sans text-xl font-bold uppercase text-black",
                isElegant && "text-lg font-semibold",
              )}
            >
              Full-bleed content
            </DialogTitle>
          </div>
          <Text.Sans size="body" variant="placeholder">
            No default header/footer chrome. This is the onboarding/announcement pattern — the
            consumer owns the entire layout.
          </Text.Sans>
          {Array.from({ length: 8 }, (_, i) => (
            <Field key={i}>
              <FieldLabel htmlFor={`custom-field-${i}`}>Step {i + 1}</FieldLabel>
              <Input id={`custom-field-${i}`} placeholder={`Detail ${i + 1}`} />
            </Field>
          ))}
          <div className="flex items-center justify-end gap-3 pt-2">
            <DialogClose render={<Button variant="outline" />}>Skip</DialogClose>
            <Button variant="accent">Continue</Button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

function NestedDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        Open outer (layer 0)
      </DialogTrigger>
      <DialogContent layer={0}>
        <DialogHeader>
          <DialogTitle>Outer Dialog (Layer 0)</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <DialogBody className="grid gap-4">
          <DialogDescription>
            Base-layer dialog at z-50. Open the inner dialog to see layer 1 (z-60) stack above.
          </DialogDescription>
          {Array.from({ length: 4 }, (_, i) => (
            <Field key={i}>
              <FieldLabel htmlFor={`nested-outer-${i}`}>Outer field {i + 1}</FieldLabel>
              <Input id={`nested-outer-${i}`} placeholder={`Outer ${i + 1}`} />
            </Field>
          ))}
          <Dialog>
            <DialogTrigger render={<Button variant="accent" />}>Open inner (layer 1)</DialogTrigger>
            <DialogContent layer={1} className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Inner Dialog (Layer 1)</DialogTitle>
                <DialogClose />
              </DialogHeader>
              <DialogBody className="grid gap-3">
                <DialogDescription>
                  z-60 above the outer dialog and its overlay. Tall content scrolls independently.
                </DialogDescription>
                {Array.from({ length: 8 }, (_, i) => (
                  <Field key={i}>
                    <FieldLabel htmlFor={`nested-inner-${i}`}>Inner field {i + 1}</FieldLabel>
                    <Input id={`nested-inner-${i}`} placeholder={`Inner ${i + 1}`} />
                  </Field>
                ))}
              </DialogBody>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
                <Button variant="accent">Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button variant="accent">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function WorstCaseCombo() {
  const [outerOpen, setOuterOpen] = useState(false);
  const [innerOpen, setInnerOpen] = useState(false);
  const theme = useThemeFamily();
  const isBrutal = theme === "brutal";
  const isElegant = theme === "elegant";

  return (
    <Dialog open={outerOpen} onOpenChange={setOuterOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>Open combo</DialogTrigger>
      <DialogContent layer={0}>
        <DialogHeader>
          <DialogTitle>Agent Details (Layer 0)</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <DialogBody className="grid gap-4">
          <DialogDescription>
            Base dialog. The onboarding gate at layer 1 overlays this with a custom full-bleed
            layout + overflowing content.
          </DialogDescription>
          {Array.from({ length: 4 }, (_, i) => (
            <Field key={i}>
              <FieldLabel htmlFor={`combo-outer-${i}`}>Config {i + 1}</FieldLabel>
              <Input id={`combo-outer-${i}`} placeholder={`Value ${i + 1}`} />
            </Field>
          ))}
          <Dialog
            open={innerOpen}
            onOpenChange={(next, details) => {
              if (
                !next &&
                (details.reason === "escape-key" || details.reason === "outside-press")
              ) {
                return;
              }
              setInnerOpen(next);
            }}
          >
            <DialogTrigger render={<Button variant="accent" />}>
              Open onboarding gate (layer 1)
            </DialogTrigger>
            <DialogContent layer={1} className="max-w-lg">
              <DialogBody
                className={cn("grid gap-4", isBrutal && "pt-3 pb-4", isElegant && "py-7")}
              >
                <Text.Mono
                  size="meta"
                  className={cn("uppercase text-foreground-muted", isBrutal && "text-black/50")}
                >
                  Onboarding
                </Text.Mono>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center border border-line-strong bg-primary-400 text-foreground",
                      isBrutal &&
                        "size-7 border-2 border-black bg-[oklch(0.883_0.162_91.89)] text-black",
                      isElegant &&
                        "rounded-md border-transparent bg-primary-soft text-primary-strong",
                    )}
                  >
                    <Monitor className={cn("size-4", isBrutal && "size-[17px]")} />
                  </div>
                  <DialogTitle
                    className={cn(
                      "text-foreground",
                      isBrutal && "font-sans text-xl font-bold uppercase text-black",
                      isElegant && "text-lg font-semibold",
                    )}
                  >
                    Complete setup
                  </DialogTitle>
                </div>
                <Text.Sans size="body" variant="placeholder">
                  Custom full-bleed layout at layer 1 with non-dismissible close behavior (Esc and
                  outside click blocked). Only the button below closes this.
                </Text.Sans>
                {Array.from({ length: 15 }, (_, i) => (
                  <Field key={i}>
                    <FieldLabel htmlFor={`combo-inner-${i}`}>Setup step {i + 1}</FieldLabel>
                    <Input id={`combo-inner-${i}`} placeholder={`Step ${i + 1}`} />
                  </Field>
                ))}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => setInnerOpen(false)}>
                    Skip
                  </Button>
                  <Button variant="accent" onClick={() => setInnerOpen(false)}>
                    Complete
                  </Button>
                </div>
              </DialogBody>
            </DialogContent>
          </Dialog>
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button variant="accent">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getTheme(value: unknown): Theme {
  return value === "brutal" || value === "elegant" ? value : "elegant";
}

function getMode(value: unknown): ThemeMode {
  return value === "dark" || value === "light" ? value : "light";
}
