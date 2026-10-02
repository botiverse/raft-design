import { Check, Monitor, Moon, Palette, Settings, Sun } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  SegmentedControl,
  SegmentedControlItem,
  SegmentedControlLabel,
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

function FamilySwatch({ family, className }: { family: Theme; className: string }) {
  return (
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
    // The whole card — including its selected ring — follows the theme it
    // offers rather than the site's. The provider supplies the family context
    // (which recipe classes to use) and the card element itself carries
    // `data-theme` + the mode class, so the tokens for its own border, colours
    // and swatch resolve from the card outward. @Josh measured the earlier
    // shape: with the theme layer inside a wrapper, the ring lived outside the
    // scope and every card drew the site's highlight.
    <ThemeProvider theme={option.value} mode={mode} syncDom={false}>
      <Card
        variant="option"
        render={
          <button
            type="button"
            role="radio"
            aria-checked={current}
            data-theme={option.value}
            className={mode === "light" ? "light" : "dark"}
            style={{ colorScheme: mode }}
            onClick={() => preview.setFamily(scope, option.value)}
          />
        }
        className={`flex min-w-0 flex-col gap-3 p-2 ${current ? "border-primary-400" : ""} ${focusClassName}`}
      >
        <FamilySwatch
          family={option.value}
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
    </ThemeProvider>
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
  const preview = usePreviewTheme();

  return (
    <Dialog {...props}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            aria-label="Settings"
            title="Settings"
            className="size-8 p-0"
          />
        }
      >
        <Settings aria-hidden />
      </DialogTrigger>
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
                <SegmentedControl
                  aria-label="Color mode"
                  value={preview.mode}
                  onValueChange={preview.setMode}
                  className="w-fit pt-1"
                >
                  {MODE_OPTIONS.map((option) => (
                    <SegmentedControlItem key={option.value} value={option.value}>
                      <option.Icon aria-hidden />
                      <SegmentedControlLabel>{option.label}</SegmentedControlLabel>
                    </SegmentedControlItem>
                  ))}
                </SegmentedControl>
              </section>

              <section className="space-y-2">
                <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
                  Light appearance
                  {preview.resolvedMode === "light" ? (
                    <Badge appearance="soft" variant="primary">
                      Current
                    </Badge>
                  ) : null}
                </h3>
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
                <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
                  Dark appearance
                  {preview.resolvedMode === "dark" ? (
                    <Badge appearance="soft" variant="primary">
                      Current
                    </Badge>
                  ) : null}
                </h3>
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
