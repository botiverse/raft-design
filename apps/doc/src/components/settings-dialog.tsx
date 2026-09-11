import { Check, Monitor, Moon, Palette, Settings, Sun } from "lucide-react";
import {
  Card,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  SidebarItem,
  SidebarItemIcon,
  SidebarItemTitle,
  ThemeProvider,
} from "raft-ui";
import type { LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";
import type { Theme } from "raft-ui";

import { usePreviewTheme } from "./preview-theme.tsx";
import type { PreviewFamilyScope, PreviewMode } from "./preview-theme.tsx";

/** Same focus idiom as the sidebar rows. */
const focusClassName = "outline-none focus-visible:ring-[0.5px] focus-visible:ring-primary-500";

const MODE_OPTIONS = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
] as const satisfies readonly { value: PreviewMode; label: string; Icon: LucideIcon }[];

type FamilyOption = {
  value: Theme;
  label: string;
  /** Decorative chrome for the preview swatch; families do not share radii. */
  swatchRadius: string;
  swatchBorder: string;
};

const LIGHT_FAMILIES = [
  { value: "brutal", label: "Brutal", swatchRadius: "rounded-none", swatchBorder: "border-2" },
  { value: "elegant", label: "Elegant", swatchRadius: "rounded-lg", swatchBorder: "border" },
] as const satisfies readonly FamilyOption[];

/** Brutal has no dark form (foundation.css gives only elegant the mode blocks). */
const DARK_FAMILIES = [
  { value: "elegant", label: "Elegant", swatchRadius: "rounded-lg", swatchBorder: "border" },
] as const satisfies readonly FamilyOption[];

function FamilySwatch({
  family,
  mode,
  className,
}: {
  family: Theme;
  mode: "light" | "dark";
  className: string;
}) {
  return (
    // Nested provider: the swatch paints with that family's own tokens, so the
    // card shows the real thing rather than a hand-coloured imitation.
    <ThemeProvider theme={family} mode={mode} syncDom={false}>
      <div
        aria-hidden
        className={`flex h-14 w-full items-stretch gap-1.5 border-line-strong bg-layer-panel p-2 ${className}`}
      >
        <span
          className={`w-1/4 bg-fill-muted ${family === "brutal" ? "rounded-none" : "rounded-sm"}`}
        />
        <span className="flex flex-1 flex-col justify-center gap-1.5">
          <span
            className={`h-1.5 w-3/4 bg-fill-strong ${family === "brutal" ? "rounded-none" : "rounded-full"}`}
          />
          <span
            className={`h-1.5 w-1/2 bg-fill-muted ${family === "brutal" ? "rounded-none" : "rounded-full"}`}
          />
        </span>
        <span
          className={`size-2 shrink-0 self-center bg-primary-400 ${family === "brutal" ? "rounded-none" : "rounded-full"}`}
        />
      </div>
    </ThemeProvider>
  );
}

function ModeCard({ option }: { option: { value: PreviewMode; label: string; Icon: LucideIcon } }) {
  const preview = usePreviewTheme();
  const current = preview.mode === option.value;

  return (
    <Card
      variant="option"
      render={
        <button
          type="button"
          role="radio"
          aria-checked={current}
          onClick={() => preview.setMode(option.value)}
        />
      }
      className={`flex flex-col items-center gap-2 px-3 py-4 ${current ? "border-primary-400" : ""} ${focusClassName}`}
    >
      <option.Icon aria-hidden className="size-4 text-foreground-icon" />
      <span className="text-sm text-foreground">{option.label}</span>
    </Card>
  );
}

function FamilyCard({
  scope,
  option,
  mode,
}: {
  scope: PreviewFamilyScope;
  option: FamilyOption;
  mode: "light" | "dark";
}) {
  const preview = usePreviewTheme();
  const current = preview[scope] === option.value;

  return (
    <Card
      variant="option"
      render={
        <button
          type="button"
          role="radio"
          aria-checked={current}
          onClick={() => preview.setFamily(scope, option.value)}
        />
      }
      className={`flex flex-col gap-3 p-2 ${current ? "border-primary-400" : ""} ${focusClassName}`}
    >
      <FamilySwatch
        family={option.value}
        mode={mode}
        className={`${option.swatchRadius} ${option.swatchBorder}`}
      />
      <span className="flex w-full items-center justify-between gap-2 px-1">
        <span className="text-sm text-foreground">{option.label}</span>
        {current ? (
          <Check
            aria-hidden
            data-slot="settings-dialog-current"
            className="size-3.5 text-primary-400"
          />
        ) : null}
      </span>
    </Card>
  );
}

/**
 * Docs control: one place for appearance — the gear at the bottom of the
 * sidebar opens this dialog (structure after the reference Artea posted, model
 * after the product's `Settings -> Appearance`: a color mode plus a separate
 * family per mode, so `system` keeps both. Brutal only has a light form, which
 * is why the dark side lists elegant alone rather than a dead control).
 */
export function SettingsDialog(props: ComponentProps<typeof Dialog>) {
  return (
    <Dialog {...props}>
      <DialogTrigger
        render={
          <SidebarItem className="w-full">
            <SidebarItemIcon aria-hidden>
              <Settings />
            </SidebarItemIcon>
            <SidebarItemTitle>Settings</SidebarItemTitle>
          </SidebarItem>
        }
      />
      <DialogContent size="lg" className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <DialogBody>
          <div className="flex gap-6">
            <div className="flex w-36 shrink-0 flex-col gap-1">
              <SidebarItem active className="w-full">
                <SidebarItemIcon aria-hidden>
                  <Palette />
                </SidebarItemIcon>
                <SidebarItemTitle>Appearance</SidebarItemTitle>
              </SidebarItem>
            </div>

            <div className="min-w-0 flex-1 space-y-6">
              <section className="space-y-2">
                <h3 className="text-sm font-medium text-foreground">Color mode</h3>
                <p className="text-xs text-foreground-muted">
                  System follows your device while keeping separate Light and Dark theme choices.
                </p>
                <div
                  role="radiogroup"
                  aria-label="Color mode"
                  className="grid grid-cols-3 gap-3 pt-1"
                >
                  {MODE_OPTIONS.map((option) => (
                    <ModeCard key={option.value} option={option} />
                  ))}
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-medium text-foreground">Light appearance</h3>
                <div
                  role="radiogroup"
                  aria-label="Light appearance"
                  className="grid grid-cols-2 gap-3 pt-1"
                >
                  {LIGHT_FAMILIES.map((option) => (
                    <FamilyCard key={option.value} scope="light" option={option} mode="light" />
                  ))}
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-medium text-foreground">Dark appearance</h3>
                <div
                  role="radiogroup"
                  aria-label="Dark appearance"
                  className="grid grid-cols-2 gap-3 pt-1"
                >
                  {DARK_FAMILIES.map((option) => (
                    <FamilyCard key={option.value} scope="dark" option={option} mode="dark" />
                  ))}
                </div>
              </section>
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
