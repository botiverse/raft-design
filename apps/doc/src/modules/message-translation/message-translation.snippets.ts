import type { PropRow } from "#/components/props-table.tsx";

export const MESSAGE_TRANSLATION_TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

export const MESSAGE_TRANSLATION_PROPS: readonly PropRow[] = [
  {
    name: "MessageItemTranslationOriginal",
    type: 'ComponentProps<"blockquote">',
    description:
      "Original-content blockquote for bilingual display. It shares Message Markdown's quote treatment; consumers choose when it is visible.",
  },
  {
    name: "MessageItemTranslationOriginalLabel",
    type: 'ComponentProps<"div">',
    description:
      "Label inside the bilingual original-content container. Localization and visible copy stay consumer-owned.",
  },
  {
    name: "MessageItemTranslationStatus",
    type: 'ComponentProps<"div">',
    description:
      "Translation status row for translated or pending states. Consumers compose icons, copy, and actions.",
  },
  {
    name: "MessageItemTranslationProgressTrack",
    type: "ProgressTrackProps",
    description: "Translation progress track with theme-specific height treatment.",
  },
  {
    name: "MessageItemTranslationFailedStatus",
    type: 'ComponentProps<"div">',
    description: "Failed status row with failure treatment for copy and retry actions.",
  },
  {
    name: "MessageItemTranslationAction",
    type: 'ComponentProps<"button">',
    description:
      "Native button for original/translation toggles. The consumer owns callbacks and accessible labels.",
  },
  {
    name: "MessageItemTranslationRetryAction",
    type: 'ComponentProps<"button">',
    description:
      "Native retry button with the failed-translation action treatment. The consumer owns callbacks, icons, copy, and accessible labels.",
  },
];
