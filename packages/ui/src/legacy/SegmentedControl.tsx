import type { ReactNode } from "react";

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: ReactNode;
  count?: number;
  icon?: ReactNode;
  testId?: string;
}

export interface SegmentedControlProps<T extends string> {
  value: T;
  options: SegmentedControlOption<T>[];
  onChange: (value: T) => void;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
}

export default function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  disabled = false,
  className = "",
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      className={`inline-flex max-w-full flex-wrap items-center gap-1 ${
        disabled ? "opacity-50" : ""
      } ${className}`}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            data-testid={option.testId}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`flex h-7 min-w-0 shrink-0 items-center gap-1 border-2 border-black px-2 text-xs font-bold transition-colors ${
              disabled ? "cursor-not-allowed" : ""
            } ${
              active
                ? "bg-brutal-yellow text-black shadow-raft-sm"
                : disabled
                  ? "bg-white text-black"
                  : "bg-white text-black hover:bg-brutal-yellow/30"
            }`}
          >
            {option.icon}
            <span className="truncate">{option.label}</span>
            {typeof option.count === "number" && option.count > 0 ? (
              <span
                className={`font-mono text-[10px] leading-none ${
                  active ? "text-black/60" : "text-black/40"
                }`}
              >
                {option.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
