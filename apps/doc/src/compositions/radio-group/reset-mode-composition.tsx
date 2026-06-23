import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@raft/ui";

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

type RadioGroupResetModeCompositionProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
};

export function RadioGroupResetModeComposition({
  value,
  onValueChange,
  disabled = false,
}: RadioGroupResetModeCompositionProps) {
  const [selectedValue, setSelectedValue] = useState(value ?? "restart");
  const currentValue = value ?? selectedValue;

  function handleValueChange(nextValue: string) {
    if (value === undefined) {
      setSelectedValue(nextValue);
    }
    onValueChange?.(nextValue);
  }

  return (
    <RadioGroup
      ariaLabel="Restart mode"
      value={currentValue}
      onValueChange={handleValueChange}
      disabled={disabled}
      className="w-[22rem] max-w-full"
    >
      {RESET_MODE_OPTIONS.map((option) => (
        <label key={option.value} className="flex cursor-pointer items-start gap-2 text-left">
          <RadioGroupItem value={option.value} className="mt-0.5" />
          <span className="grid min-w-0 gap-1">
            <span className="text-sm font-medium text-foreground-strong">{option.label}</span>
            <span className="text-xs leading-5 text-foreground-muted">{option.description}</span>
          </span>
        </label>
      ))}
    </RadioGroup>
  );
}
