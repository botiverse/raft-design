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
] as const satisfies readonly {
  value: string;
  label: string;
  theme: Theme;
  mode: ThemeMode;
}[];

type PlaygroundThemeValue = (typeof THEME_PRESETS)[number]["value"];

function getThemeValue(theme: Theme, mode: "light" | "dark"): PlaygroundThemeValue {
  if (theme === "brutal") return "brutal";
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

  return (
    <Select<PlaygroundThemeValue>
      value={value}
      items={THEME_PRESETS}
      onValueChange={(nextValue) => {
        const preset = THEME_PRESETS.find((candidate) => candidate.value === nextValue);
        if (preset) setTheme(preset.theme, { mode: preset.mode });
      }}
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
