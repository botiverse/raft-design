import { ThemeProvider, type Theme, type ThemeMode } from "raft-ui";

type PlaygroundThemePreset = {
  label: string;
  family: Theme;
  mode: ThemeMode;
};

const PRESETS: readonly PlaygroundThemePreset[] = [
  { label: "brutal", family: "brutal", mode: "light" },
  { label: "elegant", family: "elegant", mode: "light" },
  { label: "elegant-dark", family: "elegant", mode: "dark" },
];

const segment = "h-6 rounded-[3px] px-2 text-[11px] leading-none transition duration-200 ease-out";
const active = "font-medium text-foreground-strong";
const idle = "font-medium text-foreground-placeholder hover:text-foreground-muted";

export function PlaygroundToolbar({
  theme,
  mode,
  onThemeChange,
}: {
  theme: Theme;
  mode: ThemeMode;
  onThemeChange: (theme: Theme, options?: { mode?: ThemeMode }) => void;
}) {
  return (
    <ThemeProvider theme="elegant" mode="light" syncDom={false}>
      <div
        data-theme="elegant"
        className="light fixed top-[env(safe-area-inset-top,0px)] left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-b-xl border border-t-0 border-line-subtle bg-layer-panel px-2 py-1 shadow-md md:top-0"
        style={{ colorScheme: "light" }}
      >
        <fieldset aria-label="Playground theme" className="inline-flex items-center gap-0.5">
          {PRESETS.map((preset) => {
            const isActive = theme === preset.family && mode === preset.mode;

            return (
              <button
                key={preset.label}
                type="button"
                aria-pressed={isActive}
                className={`${segment} ${isActive ? active : idle}`}
                onClick={() => onThemeChange(preset.family, { mode: preset.mode })}
              >
                {preset.label}
              </button>
            );
          })}
        </fieldset>
      </div>
    </ThemeProvider>
  );
}
