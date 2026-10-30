---
title: SaveStatus
summary: The line under a setting that applies at once, which says "Saved" for a moment or what failed, and keeps its space when it is empty.
status: experimental
aliases: [Saved line, Save result, ImmediateSaveStatus]
layer: core
category: feedback
related: [field, list-row, switch, select, segmented-control]
---

# SaveStatus

SaveStatus is the line under a setting that saves itself: a select, a segmented control or a settings row with a switch. It says "Saved" for a moment once the change is stored, or what failed. The line is always there, empty while nothing has happened, so the result coming and going never moves the card, the row or the switch.

```example
save-status/compositions/preview
```

## When to use

| Situation                                                           | Use                                                                                                                                       |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| The result of a setting that applies at once                        | SaveStatus                                                                                                                                |
| A value that is wrong before it is saved: a missing name, a bad URL | `FieldError` ([Field](../field/field.md))                                                                                                 |
| The result of a card saved with Save                                | The Save button, which reads "Saved" with a check for a moment ([Forms](../../../../../design/patterns/forms.md#settings-saved-together)) |
| A failure that is about more than one setting, or the whole page    | A [Banner](../banner/banner.md) at the top of what failed ([Feedback](../../../../../design/patterns/feedback.md))                        |

Which settings apply at once is in [Forms](../../../../../design/patterns/forms.md#when-a-change-takes-effect).

## Anatomy

- `SaveStatus`: the line, one line of footnote text tall (18px) whether or not it says anything. Put it right after the control: after the select or the segmented control in a `Field`, or after the description in a settings row's `ListRowBody`. Required.
- `SaveStatusSaved`: a check and "Saved", in `foreground-muted`. It is the polite live region, so render it empty while nothing has happened and put the words in when the change is stored; the check shows only with them.
- `SaveStatusError`: what failed, in `danger-strong`, in place of `SaveStatusSaved`.

## States

```example
save-status/compositions/failed
```

- **Idle and saving:** `SaveStatusSaved` with nothing in it. The line is empty and keeps its height. Saving shows nothing: the control already shows the new value.
- **Saved:** "Saved" with a check, for 2 seconds, then empty again.
- **Failed:** the control goes back to its old value, so it never shows a value that isn't true, and `SaveStatusError` says what failed until the next change.

## Behavior

- The line keeps its height in every state, so neither the card nor the row grows when the result appears, and a switch centered on its row doesn't move (stdrc, 2026-10-30).
- It sits 4px under the control, whatever the control is: a select, a segmented control or a row's description. In a `Field` and in a `ListRowBody` it makes up the difference from their own gaps (6px and 2px). Anywhere else, put the control and the line together in a block of their own with no gap, and the line is 4px under it.
- It reserves one line. A failure longer than one line wraps and the setting grows, rather than being cut off; keep it to one short sentence so that doesn't happen.

## Content

- Write "Saved", no more: the setting already says what changed.
- Write a failure as what didn't happen and what to do: Couldn't mute this server. Try again. Show the server's own reason when it gives one ([Writing](../../../../../design/content/writing.md)).

## Accessibility

- `SaveStatusSaved` has `role="status"` and `aria-live="polite"`. Keep it mounted while nothing has happened, so it exists before "Saved" arrives: a live region inserted together with its words is often not announced.
- `SaveStatusError` has `role="alert"`, so the failure is announced when it appears. Render it in place of `SaveStatusSaved`, never inside it.
- Point the control's `aria-describedby` at the line's `id` (on `SaveStatus`), beside any description, so the result is read with the control.
