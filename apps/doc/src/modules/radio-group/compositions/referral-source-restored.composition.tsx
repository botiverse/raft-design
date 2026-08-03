import { useState } from "react";
import { RadioGroup, RadioGroupItem, useThemeFamily } from "raft-ui";
import { cn } from "raft-ui/cn";
import { Check } from "lucide-react";
import { tv } from "tailwind-variants/lite";

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

const referralSource = tv({
  slots: {
    root: "w-64",
    row: [
      "flex w-full cursor-pointer items-center justify-between text-left",
      "has-[[data-slot=radio-group-item][data-disabled]]:cursor-not-allowed",
    ],
    label: "min-w-0 truncate",
    check: "shrink-0 opacity-0",
  },
  variants: {
    theme: {
      brutal: {
        root: "[&>label]:font-bold",
        row: [
          "gap-3 border-2 border-black bg-white px-3 py-2 text-sm font-bold text-black",
          "hover:bg-brutal-yellow/30",
          "has-[[data-slot=radio-group-item][data-checked]]:bg-brutal-yellow has-[[data-slot=radio-group-item][data-checked]]:shadow-sm",
          "has-[[data-slot=radio-group-item][data-disabled]]:border-line-hairline has-[[data-slot=radio-group-item][data-disabled]]:bg-fill-muted has-[[data-slot=radio-group-item][data-disabled]]:text-foreground-disabled has-[[data-slot=radio-group-item][data-disabled]]:hover:bg-fill-muted",
          "has-[[data-slot=radio-group-item][data-checked][data-disabled]]:bg-fill-muted has-[[data-slot=radio-group-item][data-checked][data-disabled]]:shadow-none",
        ],
        label: "font-bold",
        check: "size-3.5",
      },
      elegant: {
        row: [
          "gap-2.5 rounded-sm bg-layer-panel px-3 py-2 text-[13px] font-medium leading-5 tracking-[-0.005em] text-foreground-muted",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.05),0_1px_1.5px_-1px_oklch(0_0_0_/_0.035),0_0_0_1px_var(--line-muted)]",
          "hover:bg-foreground/[0.04]",
          "has-[[data-slot=radio-group-item][data-checked]]:bg-foreground/[0.04] has-[[data-slot=radio-group-item][data-checked]]:text-foreground-strong",
          "has-[[data-slot=radio-group-item][data-checked]]:shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.05),0_1px_1.5px_-1px_oklch(0_0_0_/_0.05),0_0_0_1px_oklch(0_0_0_/_0.14)]",
          "has-[[data-slot=radio-group-item][data-disabled]]:bg-fill-muted has-[[data-slot=radio-group-item][data-disabled]]:text-foreground-disabled has-[[data-slot=radio-group-item][data-disabled]]:shadow-[0_0_0_1px_var(--line-muted)]",
        ],
        label: "font-medium",
        check: "size-3 text-foreground-strong",
      },
    },
  },
});

export function RadioGroupReferralSourceRestoredComposition({
  value,
  onValueChange,
  disabled = false,
}: RadioGroupReferralSourceRestoredCompositionProps) {
  const [selectedValue, setSelectedValue] = useState(value ?? "twitter_x");
  const currentValue = value ?? selectedValue;
  const theme = useThemeFamily();
  const styles = referralSource({ theme });

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
      className={styles.root()}
    >
      {REFERRAL_OPTIONS.map((option) => (
        <label key={option.value} className={styles.row()}>
          <RadioGroupItem value={option.value} appearance="none" />
          <span className={styles.label()}>{option.label}</span>
          <Check
            aria-hidden
            className={cn(styles.check(), option.value === currentValue && "opacity-100")}
          />
        </label>
      ))}
    </RadioGroup>
  );
}
