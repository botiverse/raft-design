import type { Theme } from "@raft/ui";
import { usePreviewTheme, type PreviewMode } from "#/components/preview-theme.tsx";

type PreviewThemePreset = {
  label: string;
  family: Theme;
  mode: PreviewMode;
  select: (theme: ReturnType<typeof usePreviewTheme>) => void;
};

const PRESETS: readonly PreviewThemePreset[] = [
  {
    label: "Brutal",
    family: "brutal",
    mode: "light",
    select: (theme) => theme.setBrutal(),
  },
  {
    label: "Elegant",
    family: "elegant",
    mode: "light",
    select: (theme) => theme.setElegantLight(),
  },
  {
    label: "Elegant dark",
    family: "elegant",
    mode: "dark",
    select: (theme) => theme.setElegantDark(),
  },
];

const segment = "h-6 rounded-[3px] px-2 text-[11px] leading-none transition duration-200 ease-out";
const active = "font-medium text-foreground-strong";
const idle = "font-medium text-foreground-placeholder hover:text-foreground-muted";

/** Docs control: switches the isolated component preview theme. */
export function ThemeSwitcher() {
  const theme = usePreviewTheme();

  return (
    <fieldset aria-label="Preview theme" className="inline-flex items-center gap-0.5">
      {PRESETS.map((preset) => {
        const isActive = theme.theme === preset.family && theme.mode === preset.mode;

        return (
          <button
            key={`${preset.family}-${preset.mode}`}
            type="button"
            aria-pressed={isActive}
            className={`${segment} ${isActive ? active : idle}`}
            onClick={() => preset.select(theme)}
          >
            {preset.label}
          </button>
        );
      })}
    </fieldset>
  );
}
