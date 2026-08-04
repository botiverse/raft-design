import { RadioGroup, RadioGroupItem } from "raft-ui";

// @docs-source-strip-start
import { useState } from "react";
// @docs-source-strip-end

const RESET_MODE_OPTIONS = [
  {
    value: "restart",
    label: "Restart",
    description: "Stop and restart the agent process. Runtime session and files stay intact.",
  },
  {
    value: "session",
    label: "Reset session",
    description: "Clear the runtime session and restart. Workspace files are preserved.",
  },
  {
    value: "full",
    label: "Full reset",
    description: "Clear the runtime session, delete workspace files, and restart from scratch.",
  },
] as const;

export function RadioGroupResetModeContent({
  value,
  onValueChange,
  disabled = false,
}: {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <RadioGroup
      ariaLabel="Restart mode"
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      className="w-[22rem] max-w-full"
    >
      {RESET_MODE_OPTIONS.map((option) => (
        <label key={option.value} className="flex cursor-pointer items-start gap-2 text-left">
          <RadioGroupItem value={option.value} className="mt-0.5" />
          <span className="grid min-w-0 gap-1">
            <span className="text-sm font-medium text-foreground">{option.label}</span>
            <span className="text-xs leading-5 text-foreground-muted">{option.description}</span>
          </span>
        </label>
      ))}
    </RadioGroup>
  );
}

// @docs-source-strip-start
// Docs shell only: adds the uncontrolled fallback the docs route drives.
// Use RadioGroupResetModeContent above for real usage.
export function RadioGroupResetModeComposition({
  value,
  onValueChange,
  disabled = false,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}) {
  const [selectedValue, setSelectedValue] = useState(value ?? "restart");

  function handleValueChange(nextValue: string) {
    if (value === undefined) {
      setSelectedValue(nextValue);
    }
    onValueChange?.(nextValue);
  }

  return (
    <RadioGroupResetModeContent
      value={value ?? selectedValue}
      onValueChange={handleValueChange}
      disabled={disabled}
    />
  );
}
// @docs-source-strip-end
