import { Monitor, Moon, Palette, Settings, Sun } from "lucide-react";
import {
  Button,
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
} from "raft-ui";
import type { LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { usePreviewTheme } from "./preview-theme.tsx";
import type { PreviewMode } from "./preview-theme.tsx";

const MODE_OPTIONS = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
] as const satisfies readonly { value: PreviewMode; label: string; Icon: LucideIcon }[];

/**
 * Docs control: one place for appearance — the gear at the bottom of the
 * sidebar opens this dialog (structure after the reference Artea posted, model
 * after the product's `Settings -> Appearance`: a color mode).
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
                <p className="text-xs text-foreground-muted">System follows your device.</p>
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
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
