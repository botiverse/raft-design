import { Check } from "lucide-react";

import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";

const referralSourceOptions = [
  { value: "twitter_x", label: "Twitter / X", checked: true },
  { value: "linkedin", label: "LinkedIn", checked: false },
  { value: "friend_colleague", label: "A friend or colleague", checked: false },
  { value: "search", label: "Search", checked: false },
  { value: "hn_reddit", label: "Hacker News / Reddit", checked: false },
  { value: "podcast_blog_newsletter", label: "Podcast / blog / newsletter", checked: false },
  { value: "other", label: "Other", checked: false },
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
              option.checked ? "bg-brutal-yellow shadow-sm" : "bg-white",
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
