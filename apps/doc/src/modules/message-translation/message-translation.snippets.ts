import type { PropRow } from "#/components/props-table.tsx";

export const MESSAGE_TRANSLATION_TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

export const MESSAGE_TRANSLATION_ANATOMY_SOURCE = `<MessageItemContent>
  <MessageItemBody>
    {/* Translated message */}
    <Markdown>{translatedContent}</Markdown>
  </MessageItemBody>

  <MessageItemTranslationOriginal>
    <MessageItemTranslationOriginalLabel>Original</MessageItemTranslationOriginalLabel>
    <Markdown>{originalContent}</Markdown>
  </MessageItemTranslationOriginal>

  <MessageItemTranslationStatus>
    <Languages />
    <MessageItemTranslationAction onClick={toggleOriginal}>
      Show original
    </MessageItemTranslationAction>
  </MessageItemTranslationStatus>
</MessageItemContent>`;

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
    description: "Translated status row. Consumers compose icons, copy, and actions.",
  },
  {
    name: "MessageItemTranslationPendingStatus",
    type: 'ComponentProps<"div">',
    description: "Pending status row with translation activity treatment.",
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
