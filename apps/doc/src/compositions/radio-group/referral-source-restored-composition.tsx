import { useState } from "react";
import { RadioGroup, RadioGroupItem, useTheme } from "@raft/ui";
import { cn } from "@raft/ui/cn";
import { Check } from "lucide-react";

const REFERRAL_OPTIONS = [
  { value: "twitter_x", label: "Twitter / X" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "friend_colleague", label: "A friend or colleague" },
  { value: "search", label: "Search" },
  { value: "hn_reddit", label: "Hacker News / Reddit" },
  { value: "podcast_blog_newsletter", label: "Podcast / blog / newsletter" },
  { value: "other", label: "Other" },
] as const;

type RadioGroupReferralSourceRestoredCompositionProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
};

const brutalReferralRowClassName = cn(
  "flex w-full cursor-pointer items-center justify-between gap-3 border-2 border-black bg-white px-3 py-2 text-left text-sm font-bold text-black",
  "hover:bg-brutal-yellow/30",
  "has-[[data-slot=radio-group-item][data-checked]]:bg-brutal-yellow has-[[data-slot=radio-group-item][data-checked]]:shadow-brutal-sm",
  "has-[[data-slot=radio-group-item][data-disabled]]:cursor-not-allowed",
  "has-[[data-slot=radio-group-item][data-disabled]]:border-line-muted has-[[data-slot=radio-group-item][data-disabled]]:bg-layer-muted has-[[data-slot=radio-group-item][data-disabled]]:text-foreground-disabled has-[[data-slot=radio-group-item][data-disabled]]:hover:bg-layer-muted",
  "has-[[data-slot=radio-group-item][data-checked][data-disabled]]:bg-layer-muted has-[[data-slot=radio-group-item][data-checked][data-disabled]]:shadow-none",
);

const elegantReferralRowClassName = cn(
  "flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-sm bg-layer-panel px-3 py-2 text-[13px] font-medium leading-5 tracking-[-0.005em] text-foreground-muted",
  "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.05),0_1px_1.5px_-1px_oklch(0_0_0_/_0.035),0_0_0_1px_var(--line-subtle)]",
  "hover:bg-foreground/[0.04]",
  "has-[[data-slot=radio-group-item][data-checked]]:bg-foreground/[0.04] has-[[data-slot=radio-group-item][data-checked]]:text-foreground-strong",
  "has-[[data-slot=radio-group-item][data-checked]]:shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.05),0_1px_1.5px_-1px_oklch(0_0_0_/_0.05),0_0_0_1px_oklch(0_0_0_/_0.14)]",
  "has-[[data-slot=radio-group-item][data-disabled]]:cursor-not-allowed",
  "has-[[data-slot=radio-group-item][data-disabled]]:bg-layer-muted has-[[data-slot=radio-group-item][data-disabled]]:text-foreground-disabled has-[[data-slot=radio-group-item][data-disabled]]:shadow-[0_0_0_1px_var(--line-subtle)]",
);

export function RadioGroupReferralSourceRestoredComposition({
  value,
  onValueChange,
  disabled = false,
}: RadioGroupReferralSourceRestoredCompositionProps) {
  const [selectedValue, setSelectedValue] = useState(value ?? "twitter_x");
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
      ariaLabel="Where did you hear about us?"
      value={currentValue}
      onValueChange={handleValueChange}
      disabled={disabled}
      className={cn("w-64", !isElegant && "[&>label]:font-bold")}
    >
      {REFERRAL_OPTIONS.map((option) => (
        <label
          key={option.value}
          className={isElegant ? elegantReferralRowClassName : brutalReferralRowClassName}
        >
          <RadioGroupItem value={option.value} appearance="none" />
          <span className={cn("min-w-0 truncate", isElegant ? "font-medium" : "font-bold")}>
            {option.label}
          </span>
          <Check
            aria-hidden
            className={cn(
              "shrink-0 opacity-0",
              isElegant ? "size-3 text-foreground-strong" : "size-3.5",
              option.value === currentValue && "opacity-100",
            )}
          />
        </label>
      ))}
    </RadioGroup>
  );
}
