---
title: Toast
summary: A dark floating notice that confirms the result of something the person just did, disappears after a few seconds, and can offer View or Undo.
status: stable
aliases: [Snackbar]
layer: core
category: feedback
related: [banner, notification-center, activity-inbox, dialog, spinner]
---

# Toast

A toast is the receipt for something the person just did: a message sent, a setting saved, an agent finishing the job they just gave it. It floats above the page on the dark HUD, says one sentence, and goes away after a few seconds. It can carry one text action, such as View or Undo.

```example
toast/compositions/toast
```

## When to use

| Situation                                  | Use                                                                                                     |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Something the person just did has a result | Toast                                                                                                   |
| An action that can be reversed in place    | Do it; when a toast offers Undo is in [Feedback](../../../../../design/patterns/feedback.md#confirming) |
| The state of the whole server              | [NotificationCenter](../notification-center/notification-center.md)                                     |
| Something that happened elsewhere          | [ActivityInbox](../activity-inbox/activity-inbox.md)                                                    |
| Something to confirm or decide             | [Dialog](../dialog/dialog.md)                                                                           |
| Something to read before acting            | [Banner](../banner/banner.md)                                                                           |

Never put anything in a toast that would confuse people if they missed it ([Choosing a component](../../../../../design/components/overview.md#telling-people-something)).

## Anatomy

- `ToastProvider`: holds the toast manager and, by default, renders the viewport. Mount it once near the root.
- `toast`: the command API (`toast.success`, `toast.error`, …) for the default manager.
- `ToastViewport`: where toasts appear on screen. `ToastPositioner` and `ToastArrow` anchor a toast to an element instead.
- `ToastRoot` and `ToastContent`: one toast and its layout.
- `ToastIcon`: optional. Who did it (an avatar), or the intent's icon when there is no "who". Never a status light: a status light shows only a state: whether an agent, a person or a computer is working or online, or a task's status; never which kind a notice is ([A mark that leads text](../../../../../design/foundations/alignment.md#a-mark-that-leads-text)).
- `ToastBody`, holding `ToastTitle` (required) and an optional `ToastDescription`, both in `text-callout` ([Typography](../../../../../design/foundations/typography.md#type-scale)): 14/20 on a phone, 14/22 on a desktop, like a banner. `ToastIcon` is one line of that text tall, so the icon stays on the title's line: a 16px icon, centered in a 20px column 12px before the title, as is an avatar ([A mark that leads text](../../../../../design/foundations/alignment.md#a-mark-that-leads-text)).
- `ToastActions`: optional, holding one `ToastAction` and `ToastClose`.
- `ToastProgress`: an optional line that shows the time left before it closes.

Leave out a part you don't need instead of rendering it empty.

## Variants

The intent sets the icon in `ToastIcon`, the same icon a banner of that intent leads with ([Banner](../banner/banner.md#variants)). When the toast is about someone, show their avatar there instead.

| Intent                   | Use for                                                         | In `ToastIcon`  |
| ------------------------ | --------------------------------------------------------------- | --------------- |
| A person or agent did it | "Bugen finished reviewing #25."                                 | Their avatar    |
| `success`                | Something finished or saved                                     | `CircleCheck`   |
| `warning`, `error`       | Something went wrong. `error` is announced at a higher priority | `TriangleAlert` |
| `info`                   | A neutral result, such as "3 links copied."                     | `Info`          |
| A message sent as a task | "Sent to #design as a task."                                    | The Todo pixel  |

With the `toast` command API, pass the avatar as `leading`. It takes the icon's place in `ToastIcon`, hidden from assistive technology.

```example
toast/compositions/person
```

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

- Make `ToastTitle` carry the whole meaning. The icon in `ToastIcon` is hidden from assistive technology, and so is `ToastProgress`.
- Hide an avatar in `ToastIcon` with `aria-hidden`; the name is already in the text. The command API's `leading` does this for you.
- Pass `loadingLabel` to a `ToastAction` that shows a loading state, so its spinner says what it waits for.

## Rules

- Show at most one toast at a time.
- Use `layer-hud` for every toast, with `foreground-on-hud` text. Don't tint a toast with an intent color, and never use yellow: notices are neutral ([Color](../../../../../design/foundations/color.md#principles)).
- Make the action a bold text action that underlines on hover (`ToastAction`), never a button. Never put a colored button in a toast.
- Give a toast at most one action besides closing it.
