import { useState } from "react";
import { RadioGroup, RadioGroupItem, useTheme } from "@raft/ui";
import { cn } from "@raft/ui/cn";

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

const brutalResetModeCardClassName = cn(
  "flex w-full cursor-pointer items-start gap-2 border-2 border-black/30 bg-white p-4 text-left",
  "hover:bg-brutal-cyan/10",
  "has-[[data-slot=radio-group-item][data-checked]]:border-black has-[[data-slot=radio-group-item][data-checked]]:bg-brutal-cyan/20 has-[[data-slot=radio-group-item][data-checked]]:shadow-brutal-sm",
  "has-[[data-slot=radio-group-item]:focus-visible]:ring-2 has-[[data-slot=radio-group-item]:focus-visible]:ring-line-focus has-[[data-slot=radio-group-item]:focus-visible]:ring-offset-2 has-[[data-slot=radio-group-item]:focus-visible]:ring-offset-background",
  "has-[[data-slot=radio-group-item][data-disabled]]:cursor-not-allowed",
  "has-[[data-slot=radio-group-item][data-disabled]]:border-line-muted has-[[data-slot=radio-group-item][data-disabled]]:bg-layer-muted has-[[data-slot=radio-group-item][data-disabled]]:text-foreground-disabled has-[[data-slot=radio-group-item][data-disabled]]:shadow-none has-[[data-slot=radio-group-item][data-disabled]]:hover:bg-layer-muted",
  "has-[[data-slot=radio-group-item][data-checked][data-disabled]]:bg-layer-muted",
);

const elegantResetModeCardClassName = cn(
  "flex w-full cursor-pointer items-start gap-2.5 rounded-md bg-layer-panel p-3.5 text-left",
  "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.05),0_1px_1.5px_-1px_oklch(0_0_0_/_0.035),0_0_0_1px_var(--line-subtle)]",
  "hover:bg-foreground/[0.04]",
  "has-[[data-slot=radio-group-item][data-checked]]:bg-foreground/[0.04]",
  "has-[[data-slot=radio-group-item][data-checked]]:shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.05),0_1px_1.5px_-1px_oklch(0_0_0_/_0.05),0_0_0_1px_oklch(0_0_0_/_0.14)]",
  "has-[[data-slot=radio-group-item]:focus-visible]:ring-2 has-[[data-slot=radio-group-item]:focus-visible]:ring-line-focus has-[[data-slot=radio-group-item]:focus-visible]:ring-offset-2 has-[[data-slot=radio-group-item]:focus-visible]:ring-offset-background",
  "has-[[data-slot=radio-group-item][data-disabled]]:cursor-not-allowed",
  "has-[[data-slot=radio-group-item][data-disabled]]:bg-layer-muted has-[[data-slot=radio-group-item][data-disabled]]:text-foreground-disabled has-[[data-slot=radio-group-item][data-disabled]]:shadow-[0_0_0_1px_var(--line-subtle)]",
);

export function RadioGroupResetModeRestoredComposition({
  value,
  onValueChange,
  disabled = false,
}: RadioGroupResetModeRestoredCompositionProps) {
  const [selectedValue, setSelectedValue] = useState(value ?? "restart");
  const currentValue = value ?? selectedValue;
  const theme = useTheme();
  const isElegant = theme === "elegant";

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
        <label
          key={option.value}
          className={isElegant ? elegantResetModeCardClassName : brutalResetModeCardClassName}
        >
          <RadioGroupItem value={option.value} appearance="none" />
          <span className="grid min-w-0 gap-1">
            <span
              className={cn(
                "text-foreground-strong",
                isElegant
                  ? "text-[13px] font-medium tracking-[-0.005em]"
                  : "text-sm font-bold leading-none",
              )}
            >
              {option.label}
            </span>
            <span className="text-xs leading-5 text-foreground-muted">{option.description}</span>
          </span>
        </label>
      ))}
    </RadioGroup>
  );
}
