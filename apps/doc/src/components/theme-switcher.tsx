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

const MODE_OPTIONS = [
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
  { key: "system", label: "System" },
] as const satisfies readonly { key: PreviewMode; label: string }[];

/**
 * Docs control: the visitor's color mode, pinned to the bottom of the sidebar.
 * `system` is the default, so a first-time visitor gets their local preference
 * instead of a choice we made for them.
 *
 * Brutal has no dark form (foundation.css only gives `elegant` the `.light` /
 * `.dark` / `prefers-color-scheme` blocks), so on brutal the two dark choices
 * are disabled with a line of explanation instead of silently doing nothing.
 */
export function ModeSwitcher() {
  const theme = usePreviewTheme();
  const brutalOnlyLight = theme.theme === "brutal";
  const mode: PreviewMode = brutalOnlyLight ? "light" : theme.mode;

  return (
    <div className="flex flex-col gap-2">
      <SegmentedControl
        aria-label="Color mode"
        value={mode}
        onValueChange={(value) => {
          if (value === mode) return;
          theme.setTheme(theme.theme, { mode: value });
        }}
      >
        {MODE_OPTIONS.map((option) => (
          <SegmentedControlItem
            key={option.key}
            value={option.key}
            disabled={brutalOnlyLight && option.key !== "light"}
          >
            <SegmentedControlLabel>{option.label}</SegmentedControlLabel>
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
      {brutalOnlyLight ? (
        <p className="px-1 text-[11px] leading-snug text-foreground-muted">
          Brutal only has a light form. Switch to Elegant for dark.
        </p>
      ) : null}
    </div>
  );
}
