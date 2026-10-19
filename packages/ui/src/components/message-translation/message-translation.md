---
title: MessageItemTranslation
summary: The parts that show a message was translated — a short Space Mono status line under the body that switches between the translation and the original, the original kept below, and the translating and failed states.
status: stable
aliases: [MessageTranslation, Translation]
layer: collaboration
category: messages
related: [message-item, progress]
---

# MessageItemTranslation

A translated message shows the translation in its body and one short line of Space Mono text under it, which says it was translated and switches to the original. The same line says when a translation is on its way or failed. When both languages should stay visible, the original sits under the translation. These parts go inside `MessageItemContent` ([MessageItem](../message-item/message-item.md)).

```example
message-translation/compositions/translation-showcase
```

## When to use

| Situation                       | Use                                                                                                                                 |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| A message was translated        | `MessageItemTranslationStatus` with `MessageItemTranslationAction`, under the body                                                  |
| Both languages stay visible     | `MessageItemTranslationOriginal` under the body, and the status line                                                                |
| A translation is on its way     | `MessageItemTranslationProgressTrack` in the body, and a status line that says so                                                   |
| A translation failed            | `MessageItemTranslationFailedStatus` with `MessageItemTranslationRetryAction`                                                       |
| A message is saved, or was read | `MessageItemSavedIndicator` or `MessageItemReadReceipt`, in the footer row ([MessageItem](../message-item/message-item.md#anatomy)) |

## Anatomy

- `MessageItemTranslationStatus`: one line in `text-mono-meta`, `foreground-hint`, under the body: an icon, then the words or the action.
- `MessageItemTranslationAction`: the text button in the status line that switches between translation and original.
- `MessageItemTranslationOriginal`: the original text, drawn as a quote in the message, with `MessageItemTranslationOriginalLabel` above it.
- `MessageItemTranslationProgressTrack`: a 4px track inside a [Progress](../progress/progress.md), in the body while the translation is on its way.
- `MessageItemTranslationFailedStatus`: the status line in `warning-strong`, for a failure.
- `MessageItemTranslationRetryAction`: the text button in the failed line.

## Variants

| Variant    | Use for                                                                     |
| ---------- | --------------------------------------------------------------------------- |
| Translated | The translation replaces the text; the action switches back to the original |
| Bilingual  | The translation in the body, and the original kept under it                 |

```example
message-translation/compositions/translated
```

```example
message-translation/compositions/bilingual
```

## States

| State       | Look                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------- |
| Translating | A progress track in place of the body, and the status line says the translation is on its way     |
| Failed      | The status line in `warning-strong`, with what happened and Retry. The original stays in the body |

```example
message-translation/compositions/translation-states
```

## Behavior

- The action switches the body between the translation and the original; you swap the text. raft-ui doesn't hold which one is showing.
- Retry replaces the failed line with the translating state.

## Content

- Say what the action does, in Title Case: Show Original, Show Translation.
- Label the original Original.
- Say the translation is on its way: "Translating…".
- Say a failure in a few words, then offer Retry: "Translation unavailable · Retry".

## Accessibility

- `MessageItemTranslationAction` and `MessageItemTranslationRetryAction` are native `<button type="button">` elements; their visible text is their name. An icon-only Retry needs an `aria-label`.
- Give the failed and translating status lines `aria-live="polite"`, so the change after Retry is announced.
- Give the `Progress` an `aria-label`, such as "Translating message".
- Hide the icons in the status line from screen readers; the words carry the meaning.

## Rules

- Keep the status to one short line of Space Mono text under the message, and don't add a color for it ([Built from existing parts](../../../../../design/components/overview.md#translation-read-and-saved-markers)).
- Use orange for a failed translation, as for any failure ([Feedback](../../../../../design/patterns/feedback.md#errors-by-scope)).
