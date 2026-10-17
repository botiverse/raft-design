import { useCallback } from "react";
import type { ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
} from "raft-ui";
import type { Theme, ThemeMode } from "raft-ui";

import { usePreviewTheme, useResolvedPreviewMode } from "#/components/preview-theme.tsx";

const THEME_PRESETS = [
  { value: "brutal", label: "Brutal", theme: "brutal", mode: "light" },
  { value: "elegant-light", label: "Elegant", theme: "elegant", mode: "light" },
  { value: "elegant-dark", label: "Elegant dark", theme: "elegant", mode: "dark" },
  { value: "raft-light", label: "Raft", theme: "raft", mode: "light" },
  { value: "raft-dark", label: "Raft dark", theme: "raft", mode: "dark" },
] as const satisfies readonly {
  value: string;
  label: string;
  theme: Theme;
  mode: ThemeMode;
}[];

type PlaygroundThemeValue = (typeof THEME_PRESETS)[number]["value"];

export function getThemeValue(theme: Theme, mode: "light" | "dark"): PlaygroundThemeValue {
  if (theme === "brutal") return "brutal";
  if (theme === "raft") return mode === "dark" ? "raft-dark" : "raft-light";
  return mode === "dark" ? "elegant-dark" : "elegant-light";
}

export function PlaygroundThemeSelect({
  children,
  side,
}: {
  children: ReactNode;
  side: "right" | "top";
}) {
  const { theme, setTheme } = usePreviewTheme();
  const resolvedMode = useResolvedPreviewMode();
  const value = getThemeValue(theme, resolvedMode);
  const handleValueChange = useCallback(
    (nextValue: PlaygroundThemeValue | null) => {
      const preset = THEME_PRESETS.find((candidate) => candidate.value === nextValue);
      if (preset) setTheme(preset.theme, { mode: preset.mode });
    },
    [setTheme],
  );

  return (
    <Select<PlaygroundThemeValue>
      value={value}
      items={THEME_PRESETS}
      onValueChange={handleValueChange}
    >
      {children}
      <SelectContent side={side} align="end" className="min-w-40">
        <SelectList>
          {THEME_PRESETS.map((preset) => (
            <SelectItem key={preset.value} value={preset.value}>
              <SelectItemText>{preset.label}</SelectItemText>
              <SelectItemIndicator />
            </SelectItem>
          ))}
        </SelectList>
      </SelectContent>
    </Select>
  );
}
