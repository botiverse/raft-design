import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "cuvii-rui";

const REFERRAL_OPTIONS = [
  { value: "twitter_x", label: "Twitter / X" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "friend_colleague", label: "A friend or colleague" },
  { value: "search", label: "Search" },
  { value: "hn_reddit", label: "Hacker News / Reddit" },
  { value: "podcast_blog_newsletter", label: "Podcast / blog / newsletter" },
  { value: "other", label: "Other" },
] as const;

type RadioGroupReferralSourceCompositionProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
};

export function RadioGroupReferralSourceComposition({
  value,
  onValueChange,
  disabled = false,
}: RadioGroupReferralSourceCompositionProps) {
  const [selectedValue, setSelectedValue] = useState(value ?? "twitter_x");
  const currentValue = value ?? selectedValue;

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
      className="w-64"
    >
      {REFERRAL_OPTIONS.map((option) => (
        <label key={option.value} className="flex cursor-pointer items-center gap-2 text-sm">
          <RadioGroupItem value={option.value} />
          <span>{option.label}</span>
        </label>
      ))}
    </RadioGroup>
  );
}
