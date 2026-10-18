import { useCallback, useState } from "react";
import { RadioGroup, RadioGroupItem } from "raft-ui";
import { tv } from "tailwind-variants/lite";

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

type RadioGroupResetModeRestoredCompositionProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
};

const resetModeOption = tv({
  slots: {
    card: [
      "flex w-full cursor-pointer items-start text-left",
      "has-[[data-slot=radio-group-item]:focus-visible]:ring-2 has-[[data-slot=radio-group-item]:focus-visible]:ring-line-strong has-[[data-slot=radio-group-item]:focus-visible]:ring-offset-2 has-[[data-slot=radio-group-item]:focus-visible]:ring-offset-layer-canvas-muted",
      "has-[[data-slot=radio-group-item][data-disabled]]:cursor-not-allowed",
      "gap-3 rounded-container border border-line-muted bg-layer-card p-4",
      "hover:press-overlay",
      "has-[[data-slot=radio-group-item][data-checked]]:border-line-seam has-[[data-slot=radio-group-item][data-checked]]:bg-info-soft",
      "has-[[data-slot=radio-group-item][data-disabled]]:border-line-muted has-[[data-slot=radio-group-item][data-disabled]]:bg-fill-muted has-[[data-slot=radio-group-item][data-disabled]]:text-foreground-disabled has-[[data-slot=radio-group-item][data-disabled]]:hover:bg-none",
      "has-[[data-slot=radio-group-item][data-checked][data-disabled]]:border-line-muted has-[[data-slot=radio-group-item][data-checked][data-disabled]]:bg-fill-muted",
    ],
    label: ["text-foreground", "text-subhead font-semibold"],
  },
});

export function RadioGroupResetModeRestoredComposition({
  value,
  onValueChange,
  disabled = false,
}: RadioGroupResetModeRestoredCompositionProps) {
  const [selectedValue, setSelectedValue] = useState(value ?? "restart");
  const currentValue = value ?? selectedValue;
  const styles = resetModeOption();

  const handleValueChange = useCallback(
    (nextValue: string) => {
      if (value === undefined) {
        setSelectedValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [onValueChange, value],
  );

  return (
    <RadioGroup
      aria-label="Restart mode"
      value={currentValue}
      onValueChange={handleValueChange}
      disabled={disabled}
      className="w-[22rem] max-w-full"
    >
      {RESET_MODE_OPTIONS.map((option) => (
        <label key={option.value} className={styles.card()}>
          <RadioGroupItem value={option.value} appearance="none" />
          <span className="grid min-w-0 gap-1">
            <span className={styles.label()}>{option.label}</span>
            <span className="text-xs leading-5 text-foreground-muted">{option.description}</span>
          </span>
        </label>
      ))}
    </RadioGroup>
  );
}
