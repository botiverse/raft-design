import type { Theme } from "raft-ui";

type PlaygroundThemeState = { family: Theme; mode: "light" | "dark" };

type PlaygroundThemePreset = {
  label: string;
  value: PlaygroundThemeState;
};

const PRESETS: readonly PlaygroundThemePreset[] = [
  { label: "brutal", value: { family: "brutal", mode: "light" } },
  { label: "elegant", value: { family: "elegant", mode: "light" } },
  { label: "elegant-dark", value: { family: "elegant", mode: "dark" } },
];

const segment = "h-6 rounded-[3px] px-2 text-[11px] leading-none transition duration-200 ease-out";
const active = "font-medium text-foreground-strong";
const idle = "font-medium text-foreground-placeholder hover:text-foreground-muted";

export function PlaygroundToolbar({
  theme,
  onThemeChange,
}: {
  theme: PlaygroundThemeState;
  onThemeChange: (theme: PlaygroundThemeState) => void;
}) {
  return (
    <div className="fixed top-0 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-b-xl border border-t-0 border-line-subtle bg-layer-panel px-2 py-1 shadow-md">
      <fieldset aria-label="Playground theme" className="inline-flex items-center gap-0.5">
        {PRESETS.map((preset) => {
          const isActive = theme.family === preset.value.family && theme.mode === preset.value.mode;

          return (
            <button
              key={preset.label}
              type="button"
              aria-pressed={isActive}
              className={`${segment} ${isActive ? active : idle}`}
              onClick={() => onThemeChange(preset.value)}
            >
              {preset.label}
            </button>
          );
        })}
      </fieldset>
    </div>
  );
}
