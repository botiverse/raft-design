import type { Theme } from "@slock/ui";
import { usePreviewTheme, type PreviewMode } from "#/components/preview-theme.tsx";

type PreviewThemePreset = {
  label: string;
  family: Theme;
  mode: PreviewMode;
};

const PRESETS: readonly PreviewThemePreset[] = [
  { label: "Brutal", family: "brutal", mode: "light" },
  { label: "Elegant", family: "elegant", mode: "light" },
  { label: "Elegant dark", family: "elegant", mode: "dark" },
];

const segment = "h-6 rounded-[3px] px-2 text-[11px] leading-none transition duration-200 ease-out";
const active = "font-medium text-foreground-strong";
const idle = "font-medium text-foreground-placeholder hover:text-foreground-muted";

/** Docs control: switches the isolated component preview theme. */
export function ThemeSwitcher() {
  const { family, setFamily, mode, setMode } = usePreviewTheme();

  return (
    <fieldset aria-label="Preview theme" className="inline-flex items-center gap-0.5">
      {PRESETS.map((preset) => {
        const isActive = family === preset.family && mode === preset.mode;

        return (
          <button
            key={`${preset.family}-${preset.mode}`}
            type="button"
            aria-pressed={isActive}
            className={`${segment} ${isActive ? active : idle}`}
            onClick={() => {
              setFamily(preset.family);
              setMode(preset.mode);
            }}
          >
            {preset.label}
          </button>
        );
      })}
    </fieldset>
  );
}
