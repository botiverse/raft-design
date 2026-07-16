import { ThemeProvider, type Theme, type ThemeMode } from "raft-ui";
import { cn } from "raft-ui/cn";
import { Smartphone } from "lucide-react";

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
  mobile,
  onThemeChange,
  onMobileChange,
}: {
  theme: Theme;
  mode: ThemeMode;
  mobile: boolean;
  onThemeChange: (theme: Theme, options?: { mode?: ThemeMode }) => void;
  onMobileChange: (mobile: boolean) => void;
}) {
  return (
    <ThemeProvider theme="elegant" mode="light" syncDom={false}>
      <div
        data-theme="elegant"
        className="light fixed top-[env(safe-area-inset-top,0px)] left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-b-xl border border-t-0 border-line-subtle bg-layer-panel px-2 py-1 shadow-md md:top-0"
        style={{ colorScheme: "light" }}
      >
        <fieldset
          aria-label="Playground theme"
          className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap"
        >
          {PRESETS.map((preset) => {
            const isActive = theme === preset.family && mode === preset.mode;

            return (
              <button
                key={preset.label}
                type="button"
                aria-pressed={isActive}
                className={cn(segment, isActive ? active : idle)}
                onClick={() => onThemeChange(preset.family, { mode: preset.mode })}
              >
                {preset.label}
              </button>
            );
          })}
        </fieldset>
        <span aria-hidden className="mx-0.5 h-4 w-px bg-line-subtle max-md:hidden" />
        <button
          type="button"
          aria-label="Toggle mobile preview"
          aria-pressed={mobile}
          className={cn(
            "inline-flex size-6 items-center justify-center rounded-[3px] transition duration-200 ease-out max-md:hidden",
            mobile
              ? "bg-ink-8 text-foreground-strong"
              : "text-foreground-placeholder hover:bg-ink-4 hover:text-foreground-muted",
          )}
          onClick={() => onMobileChange(!mobile)}
        >
          <Smartphone aria-hidden className="size-3.5" />
        </button>
      </div>
    </ThemeProvider>
  );
}
