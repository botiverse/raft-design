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
  type Theme,
  type ThemeMode,
} from "raft-ui";

import { PreviewThemeScope } from "#/components/preview-theme.tsx";

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
      <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
        <div className="flex flex-col gap-3">
          <Text.Sans size="large" className="font-semibold">
            Dialog Scroll + Layer Preview
          </Text.Sans>
          <Text.Sans size="caption" variant="placeholder">
            Interactive test surface for scroll overflow and nested layer axis.
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Section title="Scroll — short content">
            <ShortDialog />
          </Section>
          <Section title="Scroll — tall content">
            <TallDialog />
          </Section>
          <Section title="Scroll — extra tall">
            <ExtraTallDialog />
          </Section>
          <Section title="Custom layout (no header)">
            <CustomLayoutDialog />
          </Section>
          <Section title="Nested — two layers" className="sm:col-span-2">
            <NestedDialog />
          </Section>
        </div>
      </div>
    </PreviewThemeScope>
  );
}

function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "flex flex-col gap-2 rounded-md border border-line-muted bg-layer-panel p-4",
        "in-data-[theme=brutal]:rounded-none in-data-[theme=brutal]:border-2 in-data-[theme=brutal]:border-line-strong",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Text.Sans size="caption" className="font-medium text-foreground-muted">
        {title}
      </Text.Sans>
      {children}
    </div>
  );
}

function ShortDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Short Content</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <DialogBody className="grid gap-3">
          <DialogDescription>This dialog has minimal content. No scroll needed.</DialogDescription>
          <Field>
            <FieldLabel htmlFor="short-name">Name</FieldLabel>
            <Input id="short-name" placeholder="e.g. Alice" />
          </Field>
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button variant="accent">Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TallDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tall Content</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <DialogBody className="grid gap-4">
          <DialogDescription>
            This dialog has enough content to overflow the viewport. The body should scroll while
            the header and footer stay fixed.
          </DialogDescription>
          {Array.from({ length: 8 }, (_, i) => (
            <Field key={i}>
              <FieldLabel htmlFor={`tall-field-${i}`}>Field {i + 1}</FieldLabel>
              <Input id={`tall-field-${i}`} placeholder={`Value ${i + 1}`} />
            </Field>
          ))}
          <Field>
            <FieldLabel htmlFor="tall-notes">Notes</FieldLabel>
            <Textarea id="tall-notes" className="min-h-32" placeholder="Additional notes..." />
          </Field>
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button variant="accent">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ExtraTallDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Extra Tall Content</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <DialogBody className="grid gap-4">
          <DialogDescription>
            20 fields. Tests the extreme case where content far exceeds viewport height.
          </DialogDescription>
          {Array.from({ length: 20 }, (_, i) => (
            <Field key={i}>
              <FieldLabel htmlFor={`xtall-field-${i}`}>Field {i + 1}</FieldLabel>
              <Input id={`xtall-field-${i}`} placeholder={`Value ${i + 1}`} />
            </Field>
          ))}
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button variant="accent">Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CustomLayoutDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>Open</DialogTrigger>
      <DialogContent>
        <DialogBody className="grid gap-4 py-6">
          <Text.Sans size="large" className="font-semibold text-foreground">
            Custom Layout
          </Text.Sans>
          <Text.Sans size="body" variant="placeholder">
            This dialog uses only DialogBody — no header or footer. The entire content area scrolls
            when it overflows.
          </Text.Sans>
          {Array.from({ length: 12 }, (_, i) => (
            <Field key={i}>
              <FieldLabel htmlFor={`custom-field-${i}`}>Item {i + 1}</FieldLabel>
              <Input id={`custom-field-${i}`} placeholder={`Value ${i + 1}`} />
            </Field>
          ))}
          <div className="flex justify-end gap-3 pt-2">
            <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

function NestedDialog() {
  const [innerOpen, setInnerOpen] = useState(false);

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
            This is the base-layer dialog. Click below to open a second dialog on top at layer 1.
            The inner overlay and content should appear above this one.
          </DialogDescription>
          {Array.from({ length: 6 }, (_, i) => (
            <Field key={i}>
              <FieldLabel htmlFor={`nested-outer-${i}`}>Outer field {i + 1}</FieldLabel>
              <Input id={`nested-outer-${i}`} placeholder={`Outer ${i + 1}`} />
            </Field>
          ))}
          <Dialog open={innerOpen} onOpenChange={setInnerOpen}>
            <DialogTrigger render={<Button variant="accent" />}>Open inner (layer 1)</DialogTrigger>
            <DialogContent layer={1} className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Inner Dialog (Layer 1)</DialogTitle>
                <DialogClose />
              </DialogHeader>
              <DialogBody className="grid gap-3">
                <DialogDescription>
                  This dialog sits at z-60 above the outer z-50 dialog and its overlay. Tall content
                  here should also scroll independently.
                </DialogDescription>
                {Array.from({ length: 10 }, (_, i) => (
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

function getTheme(value: unknown): Theme {
  return value === "brutal" || value === "elegant" ? value : "elegant";
}

function getMode(value: unknown): ThemeMode {
  return value === "dark" || value === "light" ? value : "light";
}
