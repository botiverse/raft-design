import { Check } from "lucide-react";

import { SourceComparisonPreview } from "./source-comparison-preview.tsx";
import { RadioGroupReferralSourceComposition } from "./radio-group/referral-source-composition.tsx";
import { RadioGroupReferralSourceRestoredComposition } from "./radio-group/referral-source-restored-composition.tsx";
import { RadioGroupResetModeComposition } from "./radio-group/reset-mode-composition.tsx";
import { RadioGroupResetModeRestoredComposition } from "./radio-group/reset-mode-restored-composition.tsx";

export const RADIO_GROUP_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  ReferralSource: "apps/doc/src/compositions/radio-group/referral-source-restored-composition.tsx",
  ResetMode: "apps/doc/src/compositions/radio-group/reset-mode-restored-composition.tsx",
} as const;

export const RADIO_GROUP_SOURCE_COMPARISON_COMPOSITION = {
  ReferralSource: RadioGroupReferralSourceComposition,
  ReferralSourceRestored: RadioGroupReferralSourceRestoredComposition,
  ResetMode: RadioGroupResetModeComposition,
  ResetModeRestored: RadioGroupResetModeRestoredComposition,
} as const;

const referralSourceOptions = [
  { value: "twitter_x", label: "Twitter / X", checked: true },
  { value: "linkedin", label: "LinkedIn", checked: false },
  { value: "friend_colleague", label: "A friend or colleague", checked: false },
  { value: "search", label: "Search", checked: false },
  { value: "hn_reddit", label: "Hacker News / Reddit", checked: false },
  { value: "podcast_blog_newsletter", label: "Podcast / blog / newsletter", checked: false },
  { value: "other", label: "Other", checked: false },
] as const;

const resetModeOptions = [
  {
    value: "restart",
    label: "Restart",
    description:
      "Stop and restart the agent process. Keeps the runtime session and workspace files.",
    checked: true,
  },
  {
    value: "session",
    label: "Reset Session & Restart",
    description: "Clear the runtime session and restart. Workspace files are preserved.",
    checked: false,
  },
  {
    value: "full",
    label: "Full Reset & Restart",
    description: "Clear the runtime session, delete all workspace files, and restart from scratch.",
    checked: false,
  },
] as const;

export function RadioGroupReferralSourcePreview({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <div role="radiogroup" aria-label="Where did you hear about us?" className="grid w-64 gap-2">
        {referralSourceOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={option.checked}
            className={[
              "flex w-full items-center justify-between gap-3 border-2 border-black px-3 py-2 text-left text-sm font-bold",
              option.checked ? "bg-brutal-yellow shadow-brutal-sm" : "bg-white",
            ].join(" ")}
          >
            <span>{option.label}</span>
            <Check
              size={14}
              className={option.checked ? "shrink-0 opacity-100" : "shrink-0 opacity-0"}
            />
          </button>
        ))}
      </div>
    </SourceComparisonPreview>
  );
}

export function RadioGroupResetModeSourcePreview({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <div className="grid w-[22rem] max-w-full gap-3">
        {resetModeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={[
              "w-full border-2 p-4 text-left",
              option.checked
                ? "border-black bg-brutal-cyan/20 shadow-brutal-sm"
                : "border-black/30 bg-white",
            ].join(" ")}
          >
            <div className="text-sm font-bold uppercase">{option.label}</div>
            <p className="mt-1 text-xs text-black/60">{option.description}</p>
          </button>
        ))}
      </div>
    </SourceComparisonPreview>
  );
}
