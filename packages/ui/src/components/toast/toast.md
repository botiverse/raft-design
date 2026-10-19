---
title: Toast
summary: A dark floating notice that confirms the result of something the person just did, disappears after a few seconds, and can offer View or Undo.
status: stable
aliases: [Snackbar]
category: feedback
related: [banner, notification-center, activity-inbox, dialog, spinner]
---

# Toast

A toast is the receipt for something the person just did: a message sent, a setting saved, an agent finishing the job they just gave it. It floats above the page on the dark HUD, says one sentence, and goes away after a few seconds. It can carry one text action, such as View or Undo.

```example
toast/toast
```

## When to use

| Situation                                  | Use                                                                                                     |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Something the person just did has a result | Toast                                                                                                   |
| An action that can be reversed in place    | Do it; when a toast offers Undo is in [Feedback](../../../../../design/patterns/feedback.md#confirming) |
| The state of the whole workspace           | [NotificationCenter](../notification-center/notification-center.md)                                     |
| Something that happened elsewhere          | [ActivityInbox](../activity-inbox/activity-inbox.md)                                                    |
| Something to confirm or decide             | [Dialog](../dialog/dialog.md)                                                                           |
| Something to read before acting            | [Banner](../banner/banner.md)                                                                           |

Never put anything in a toast that would confuse people if they missed it ([Choosing a component](../../../../../design/patterns/choosing-components.md#telling-people-something)).

## Anatomy

- `ToastProvider`: holds the toast manager and, by default, renders the viewport. Mount it once near the root.
- `toast`: the command API (`toast.success`, `toast.error`, …) for the default manager.
- `ToastViewport`: where toasts appear on screen. `ToastPositioner` and `ToastArrow` anchor a toast to an element instead.
- `ToastRoot` and `ToastContent`: one toast and its layout.
- `ToastIcon`: optional. Who did it (an avatar), or a status pixel when there is no "who".
- `ToastBody`, holding `ToastTitle` (required) and an optional `ToastDescription`.
- `ToastActions`: optional, holding one `ToastAction` and `ToastClose`.
- `ToastProgress`: an optional line that shows the time left before it closes.

Leave out a part you don't need instead of rendering it empty.

## Variants

The intent sets the pixel in `ToastIcon`. When the toast is about someone, show their avatar there instead.

| Intent                   | Use for                                                         |
| ------------------------ | --------------------------------------------------------------- |
| A person or agent did it | Their avatar in `ToastIcon`: "Bugen finished reviewing #25."    |
| `success`                | Something finished or saved                                     |
| `warning`, `error`       | Something went wrong. `error` is announced at a higher priority |
| `info`                   | A neutral result, such as "3 links copied."                     |
| A message sent as a task | The Todo pixel in `ToastIcon`                                   |

## Behavior

- A toast closes on its own after the provider's `timeout`; hovering or focusing it pauses the timer.
- People can swipe a toast away, or close it with `ToastClose`.
- Stacked toasts appear at the bottom center by default. An anchored toast opens next to the control that caused it.

## Content

- Write one sentence: who, what they did, and the result. Put anything more in `ToastDescription`, in `foreground-on-hud-muted`.
- Label the action View or Undo, or another verb in Title Case.
- Set IDs, counts and times in Space Mono ([Typography](../../../../../design/foundations/typography.md)).

## Accessibility

Toast wraps Base UI's Toast, which announces each toast in a live region and keeps it open while it has focus.

- Make `ToastTitle` carry the whole meaning. The pixel in `ToastIcon` is hidden from assistive technology, and so is `ToastProgress`.
- Hide an avatar in `ToastIcon` with `aria-hidden`; the name is already in the text.
- Pass `loadingLabel` to a `ToastAction` that shows a loading state, so its spinner says what it waits for.

## Rules

- Show at most one toast at a time.
- Use `layer-hud` for every toast, with `foreground-on-hud` text. Don't tint a toast with an intent color, and never use yellow: notices are neutral ([Color](../../../../../design/foundations/color.md#principles)).
- Make the action an underlined text action (`ToastAction`), never a button. Never put a colored button in a toast.
- Give a toast at most one action besides closing it.
