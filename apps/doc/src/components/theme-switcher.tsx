import { useSyncExternalStore } from "react";
import { useTheme as useMode } from "next-themes";
import type { Theme } from "@slock-ui/ui";
import { useFamily } from "#/components/use-family.ts";

const FAMILIES: readonly Theme[] = ["brutal", "elegant"];
const MODES = ["light", "dark", "system"] as const;

const segment = "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors";
const active = "bg-gray-900 text-white";
const idle = "text-gray-600 hover:bg-gray-100";

/** Docs control: switches the family (data-theme on <html>) and the mode (next-themes). */
export function ThemeSwitcher() {
  const { family, setFamily } = useFamily();
  const { theme: mode, setTheme: setMode } = useMode();
  // next-themes has no resolved mode during SSR; gate the active highlight on a
  // client-only flag so server and first client render match (no useEffect).
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

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
            aria-pressed={mounted && mode === value}
            className={`${segment} ${mounted && mode === value ? active : idle}`}
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
      <span className="text-xs font-semibold text-gray-400">{label}</span>
      <fieldset
        aria-label={label}
        className="flex min-w-0 items-center gap-0.5 rounded-lg border border-gray-200 p-0.5"
      >
        {children}
      </fieldset>
    </div>
  );
}
