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

- `ToastProvider`: holds the toast manager and, by default, renders the viewport. Mount it once near the root: the default manager (`toast.*`) takes its timing (`timeout`, `actionTimeout`) from the one provider that uses it, so two providers on the default manager would overwrite each other's. Give a second provider its own `toastManager`.
- `toast`: the command API (`toast.success`, `toast.error`, …) for the default manager.
- `ToastViewport`: where toasts appear on screen. `ToastPositioner` and `ToastArrow` anchor a toast to an element instead.
- `ToastRoot` and `ToastContent`: one toast and its layout.
- `ToastIcon`: optional. Who did it (an avatar), or the intent's icon when there is no "who". Never a status light for the toast's intent: a status light never says what kind of notice this is (success, info, warning, error). A status light keeps its own meanings, whether an agent, a person or a computer is working or online, a task's status, and the square attention dot that marks something waiting or unread; a notice about one of those things may still show that thing's light inside it ([Status](../status/status.md#sizes)).
- `ToastBody`, holding `ToastTitle` (required) and an optional `ToastDescription`, both in `text-callout` ([Typography](../../../../../design/foundations/typography.md#type-scale)): 14/20 on a phone, 14/22 on a desktop, like a banner. `ToastIcon` is one line of that text tall, so the icon stays on the title's line: a 16px icon, centered in a 20px column 12px before the title, as is an avatar ([A mark that leads text](../../../../../design/foundations/alignment.md#a-mark-that-leads-text)).
- `ToastActions`: optional, holding one `ToastAction`. `ToastClose` (Dismiss) is there for a toast that doesn't close by itself, which Raft doesn't use; the command API shows it only with `dismissible: true`.
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

With the `toast` command API, pass the avatar as `leading`. It takes the icon's place in `ToastIcon`, hidden from assistive technology.

```example
toast/compositions/person
```

## Behavior

- A toast closes on its own: after the provider's `timeout`, 5 seconds by default, and after its `actionTimeout`, 8 seconds, when it has an action or is an `error`, so there is time to read and then act. The `toast` command API applies `actionTimeout`; with a manager of your own, pass `timeout: 8000` to such a toast. Hovering, focusing or touching it pauses the timer.
- People can swipe a toast away or press Esc while it has focus (F6 moves focus to the toasts). There is no Dismiss: every toast closes by itself, and a second text action beside Undo would read as a second choice.
- One toast shows at a time (`limit`, 1 by default). A new toast replaces the one on screen at once, and the replaced one is closed, not queued: it doesn't come back when the new one goes.
- An anchored toast opens next to the control that caused it (`ToastPositioner`).

### Where it appears

Toasts appear at the bottom center (`viewportPlacement="bottom-center"`). On a desktop that is the bottom of the window (decided by stdrc, 2026-10-23). On a phone the toast sits just above whatever holds the bottom of the page: the composer on a conversation page, the tab bar on a top-level page, and the on-screen keyboard while it is up. Only the app knows where that is, so it sets `--toast-viewport-bottom` to the distance from the bottom of the window to that thing's top edge, on `:root` or with `viewportClassName`, and updates it as the composer grows or the keyboard opens. The toast's bottom edge sits 16px above it, and never lower than 16px above the system's home indicator (`env(safe-area-inset-bottom)`), so on a phone it stays clear of it even when the variable is unset.

```css
:root {
  --toast-viewport-bottom: 72px; /* the top edge of the composer */
}
```

```example
toast/compositions/above-composer
```

A surface whose bottom is taken by something a toast must not cover can pass `viewportPlacement="top-center"` instead; the app then sets `--toast-viewport-top` to where its header ends, and the toast sits 16px under it, never higher than 16px under the status bar (`env(safe-area-inset-top)`).

A toast swipes away the way it came: down or right from the bottom, up from the top. `ToastRoot` takes the direction from its `ToastViewport`; pass `swipeDirection` to change it.

While a modal dialog or sheet is open, show only the toasts it causes and that leave it open, without an action. Toasts already draw above dialogs and their scrim.

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

- Show at most one toast at a time; a new one replaces it.
- Use `layer-hud` for every toast, with `foreground-on-hud` text. Don't tint a toast with an intent color, and never use yellow: notices are neutral ([Color](../../../../../design/foundations/color.md#principles)).
- Make the action a bold text action that underlines on hover (`ToastAction`), never a button. Never put a colored button in a toast.
- Give a toast at most one action besides closing it.
