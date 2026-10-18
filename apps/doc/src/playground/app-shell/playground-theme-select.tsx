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

import { usePreviewTheme } from "#/components/preview-theme.tsx";

const MODE_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const;

type PlaygroundModeValue = (typeof MODE_OPTIONS)[number]["value"];

export function PlaygroundThemeSelect({
  children,
  side,
}: {
  children: ReactNode;
  side: "right" | "top";
}) {
  const { resolvedMode, setMode } = usePreviewTheme();
  const handleValueChange = useCallback(
    (nextValue: PlaygroundModeValue | null) => {
      if (nextValue) setMode(nextValue);
    },
    [setMode],
  );

  return (
    <Select<PlaygroundModeValue>
      value={resolvedMode}
      items={MODE_OPTIONS}
      onValueChange={handleValueChange}
    >
      {children}
      <SelectContent side={side} align="end" className="min-w-40">
        <SelectList>
          {MODE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <SelectItemText>{option.label}</SelectItemText>
              <SelectItemIndicator />
            </SelectItem>
          ))}
        </SelectList>
      </SelectContent>
    </Select>
  );
}
