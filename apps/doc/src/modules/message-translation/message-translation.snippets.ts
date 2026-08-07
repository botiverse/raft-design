import type { PropRow } from "#/components/props-table.tsx";

export const MESSAGE_TRANSLATION_TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

export const MESSAGE_ITEM_TRANSLATION_ORIGINAL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentProps<"blockquote">',
    description:
      "Original-content blockquote for bilingual display. It shares Message Markdown's quote treatment; consumers choose when it is visible.",
  },
];

export const MESSAGE_ITEM_TRANSLATION_ORIGINAL_LABEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentProps<"div">',
    description:
      "Label inside the bilingual original-content container. Localization and visible copy stay consumer-owned.",
  },
];

export const MESSAGE_ITEM_TRANSLATION_STATUS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentProps<"div">',
    description:
      "Translation status row for translated or pending states. Consumers compose icons, copy, and actions.",
  },
];

export const MESSAGE_ITEM_TRANSLATION_PROGRESS_TRACK_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "ProgressTrackProps",
    description: "Translation progress track with theme-specific height treatment.",
  },
];

export const MESSAGE_ITEM_TRANSLATION_FAILED_STATUS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentProps<"div">',
    description: "Failed status row with failure treatment for copy and retry actions.",
  },
];

export const MESSAGE_ITEM_TRANSLATION_ACTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentProps<"button">',
    description:
      "Native button for original/translation toggles. The consumer owns callbacks and accessible labels.",
  },
];

export const MESSAGE_ITEM_TRANSLATION_RETRY_ACTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentProps<"button">',
    description:
      "Native retry button with the failed-translation action treatment. The consumer owns callbacks, icons, copy, and accessible labels.",
  },
];
