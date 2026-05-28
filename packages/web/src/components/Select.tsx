import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import SelectionPopover from "./ui/SelectionPopover";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  disabled?: boolean;
  hideSelectedOption?: boolean;
  hiddenOptionValues?: string[];
}

export default function Select({
  value,
  onChange,
  options,
  className = "",
  disabled = false,
  hideSelectedOption = false,
  hiddenOptionValues = [],
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const hiddenValues = new Set(hiddenOptionValues);
  const visibleOptions = hideSelectedOption
    ? options.filter((option) => option.value !== value && !hiddenValues.has(option.value))
    : options.filter((option) => !hiddenValues.has(option.value));

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`flex w-full items-center justify-between gap-2 border-2 border-black p-2 text-sm shadow-brutal-sm focus:outline-none ${
          disabled ? "bg-gray-100 text-black/50 cursor-not-allowed" : "bg-white"
        }`}
      >
        <span className="truncate text-left">
          {selected?.label || "Select…"}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <SelectionPopover
          title="Options"
          showHeader={false}
          className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden border-2 border-black bg-white shadow-brutal"
          options={visibleOptions.map((opt) => ({
            key: opt.value,
            checked: opt.value === value,
            label: opt.label,
            disabled: opt.disabled,
            onClick: () => {
              onChange(opt.value);
              setOpen(false);
            },
            reserveLeadingSlot: true,
          }))}
        />
      )}
    </div>
  );
}
