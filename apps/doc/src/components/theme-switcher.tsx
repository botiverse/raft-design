import { SegmentedControl, SegmentedControlItem, SegmentedControlLabel } from "raft-ui";
import { usePreviewTheme } from "#/components/preview-theme.tsx";

const MODES = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const;

/** Docs control: switches the preview between light and dark. */
export function ThemeSwitcher({ className }: { className?: string }) {
  const { resolvedMode, setMode } = usePreviewTheme();

  return (
    <SegmentedControl
      aria-label="Color mode"
      value={resolvedMode}
      onValueChange={setMode}
      className={className}
    >
      {MODES.map((option) => (
        <SegmentedControlItem key={option.value} value={option.value}>
          <SegmentedControlLabel>{option.label}</SegmentedControlLabel>
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  );
}
