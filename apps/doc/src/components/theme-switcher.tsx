import type { Theme } from "@slock/ui";
import { usePreviewTheme, type PreviewMode } from "#/components/preview-theme.tsx";

const FAMILIES: readonly Theme[] = ["brutal", "elegant"];
const MODES: readonly PreviewMode[] = ["light", "dark", "system"];

const segment = "rounded-sm px-2.5 py-1 text-xs font-medium capitalize transition-colors";
const active = "bg-foreground-strong text-foreground-inverse";
const idle = "text-foreground-muted hover:bg-layer-muted hover:text-foreground-strong";

/** Docs control: switches the isolated component preview theme. */
export function ThemeSwitcher() {
  const { family, setFamily, mode, setMode } = usePreviewTheme();

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Group label="Family">
        {FAMILIES.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={family === value}
            className={`${segment} ${family === value ? active : idle}`}
            onClick={() => setFamily(value)}
          >
            {value}
          </button>
        ))}
      </Group>

      <Group label="Mode">
        {MODES.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={mode === value}
            className={`${segment} ${mode === value ? active : idle}`}
            onClick={() => setMode(value)}
          >
            {value}
          </button>
        ))}
      </Group>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-semibold text-foreground-placeholder">{label}</span>
      <fieldset
        aria-label={label}
        className="flex min-w-0 items-center gap-0.5 rounded-md border border-line-subtle bg-layer-panel p-0.5"
      >
        {children}
      </fieldset>
    </div>
  );
}
