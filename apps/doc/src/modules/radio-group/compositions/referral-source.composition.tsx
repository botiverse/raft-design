import { RadioGroup, RadioGroupItem } from "raft-ui";

// @docs-source-strip-start
import { useState } from "react";
// @docs-source-strip-end

const REFERRAL_OPTIONS = [
  { value: "twitter_x", label: "Twitter / X" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "friend_colleague", label: "A friend or colleague" },
  { value: "search", label: "Search" },
  { value: "hn_reddit", label: "Hacker News / Reddit" },
  { value: "podcast_blog_newsletter", label: "Podcast / blog / newsletter" },
  { value: "other", label: "Other" },
] as const;

export function RadioGroupReferralSourceContent({
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
      ariaLabel="Where did you hear about us?"
      value={value}
      onValueChange={onValueChange}
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

// @docs-source-strip-start
// Docs shell only: adds the uncontrolled fallback the docs route drives.
// Use RadioGroupReferralSourceContent above for real usage.
export function RadioGroupReferralSourceComposition({
  value,
  onValueChange,
  disabled = false,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}) {
  const [selectedValue, setSelectedValue] = useState(value ?? "twitter_x");

  function handleValueChange(nextValue: string) {
    if (value === undefined) {
      setSelectedValue(nextValue);
    }
    onValueChange?.(nextValue);
  }

  return (
    <RadioGroupReferralSourceContent
      value={value ?? selectedValue}
      onValueChange={handleValueChange}
      disabled={disabled}
    />
  );
}
// @docs-source-strip-end
