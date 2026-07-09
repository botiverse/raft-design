import { Link } from "@tanstack/react-router";
import { ArrowLeft, Monitor, Smartphone } from "lucide-react";
import type { Theme } from "raft-ui";

type PlaygroundThemeState = { family: Theme; mode: "light" | "dark" };
type PlaygroundPresentation = "desktop" | "mobile";

type PlaygroundThemePreset = {
  label: string;
  value: PlaygroundThemeState;
};

const PRESETS: readonly PlaygroundThemePreset[] = [
  { label: "Brutal", value: { family: "brutal", mode: "light" } },
  { label: "Elegant", value: { family: "elegant", mode: "light" } },
  { label: "Elegant dark", value: { family: "elegant", mode: "dark" } },
];

const segment = "h-6 rounded-[3px] px-2 text-[11px] leading-none transition duration-200 ease-out";
const active = "font-medium text-foreground-strong";
const idle = "font-medium text-foreground-placeholder hover:text-foreground-muted";
const iconButton =
  "flex size-6 items-center justify-center rounded-[3px] transition duration-200 ease-out";
const separator = "h-4 w-px bg-line-subtle";

export function PlaygroundToolbar({
  theme,
  onThemeChange,
  presentation,
  onPresentationChange,
}: {
  theme: PlaygroundThemeState;
  onThemeChange: (theme: PlaygroundThemeState) => void;
  presentation: PlaygroundPresentation;
  onPresentationChange: (presentation: PlaygroundPresentation) => void;
}) {
  return (
    <div className="fixed right-4 bottom-4 z-50 flex items-center gap-1 rounded-full border border-line-subtle bg-layer-panel px-2 py-1 shadow-md">
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

      <div className={separator} aria-hidden />

      <button
        type="button"
        aria-label="Desktop presentation"
        aria-pressed={presentation === "desktop"}
        className={`${iconButton} ${presentation === "desktop" ? active : idle}`}
        onClick={() => onPresentationChange("desktop")}
      >
        <Monitor className="size-3.5" />
      </button>
      <button
        type="button"
        aria-label="Mobile presentation"
        aria-pressed={presentation === "mobile"}
        className={`${iconButton} ${presentation === "mobile" ? active : idle}`}
        onClick={() => onPresentationChange("mobile")}
      >
        <Smartphone className="size-3.5" />
      </button>

      <div className={separator} aria-hidden />

      <Link to="/" className={`${segment} ${idle} inline-flex items-center gap-1`}>
        <ArrowLeft className="size-3.5" />
        Docs
      </Link>
    </div>
  );
}
