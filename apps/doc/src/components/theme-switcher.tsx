import { SegmentedControl, SegmentedControlItem, SegmentedControlLabel } from "raft-ui";
import type { Theme } from "raft-ui";
import { usePreviewTheme } from "#/components/preview-theme.tsx";
import type { PreviewMode } from "#/components/preview-theme.tsx";

type PreviewThemePreset = {
  key: string;
  label: string;
  family: Theme;
  mode: PreviewMode;
  select: (theme: ReturnType<typeof usePreviewTheme>) => void;
};

const PRESETS: readonly PreviewThemePreset[] = [
  {
    key: "brutal-light",
    label: "Brutal",
    family: "brutal",
    mode: "light",
    select: (theme) => theme.setTheme("brutal"),
  },
  {
    key: "elegant-light",
    label: "Elegant",
    family: "elegant",
    mode: "light",
    select: (theme) => theme.setTheme("elegant", { mode: "light" }),
  },
  {
    key: "elegant-dark",
    label: "Elegant dark",
    family: "elegant",
    mode: "dark",
    select: (theme) => theme.setTheme("elegant", { mode: "dark" }),
  },
];

/** Docs control: switches the isolated component preview theme. */
export function ThemeSwitcher() {
  const theme = usePreviewTheme();
  const activePreset = PRESETS.find(
    (preset) => theme.theme === preset.family && theme.mode === preset.mode,
  );

  return (
    <SegmentedControl
      aria-label="Preview theme"
      value={activePreset?.key}
      onValueChange={(value) => {
        PRESETS.find((preset) => preset.key === value)?.select(theme);
      }}
    >
      {PRESETS.map((preset) => (
        <SegmentedControlItem key={preset.key} value={preset.key}>
          <SegmentedControlLabel>{preset.label}</SegmentedControlLabel>
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  );
}
