---
title: SaveStatus
summary: The line under a setting that applies at once, which appears only when the change failed and says what failed; otherwise it takes no room.
status: experimental
aliases: [Save result, Save error, ImmediateSaveStatus]
layer: core
category: feedback
related: [field, list-row, switch, select, segmented-control]
---

# SaveStatus

SaveStatus is the line under a setting that saves itself: a select, a segmented control or a settings row with a switch. It shows only when the change failed, and says what failed. While the change saves and once it is stored, it shows nothing and takes no room: the control showing its new value is the confirmation, as in macOS's and iOS's settings.

```example
save-status/compositions/preview
```

## When to use

| Situation                                                           | Use                                                                                                                                                    |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A setting that applies at once failed to save                       | SaveStatus                                                                                                                                             |
| A value that is wrong before it is saved: a missing name, a bad URL | `FieldError` ([Field](../field/field.md))                                                                                                              |
| The result of a card saved with Save                                | The Save button, which reads "Saved" with a check for a moment ([Forms](../../../../../design/patterns/forms.md#settings-saved-together))              |
| Where a section's settings are stored ("Saved on this device")      | One line for the section, under its header or its group, not SaveStatus ([Forms](../../../../../design/patterns/forms.md#settings-that-apply-at-once)) |
| A failure that is about more than one setting                       | Where its scope puts it ([Feedback](../../../../../design/patterns/feedback.md#errors-by-scope))                                                       |

Which settings apply at once is in [Forms](../../../../../design/patterns/forms.md#when-a-change-takes-effect).

## Anatomy

- `SaveStatus`: the line. Put it right after the control: after the select or the segmented control in a `Field`, before any `FieldDescription`, or last in a settings row's `ListRowBody`, after the description or, in a row with none, the title. Render it in every state; with nothing in it, it is hidden and takes no height. Required.
- `SaveStatusError`: what failed, in `danger-strong`, one footnote line (18px) that wraps. Put it in `SaveStatus` only while the change has failed.
- `SaveStatusSaved`: deprecated. It renders nothing, whatever its children, so a `SaveStatus` holding it stays empty. Leave it out.

## States

```example
save-status/compositions/failed
```

- **Idle, saving and saved:** `SaveStatus` with nothing in it. It shows nothing and takes no room. The control already shows the new value, which is the confirmation; a "Saved" would repeat it, and a line kept for it made every such row taller than its neighbors (cindyz, 2026-11-10, #proj-raft-ui:4ae1a74e).
- **Failed:** the control goes back to its old value, so it never shows a value that isn't true, and `SaveStatusError` says what failed until the next change.

## Behavior

- Empty, the line takes no height and no gap, so a setting with it is exactly as tall as one without it. In a settings row, the switch (or the value, chevron or button at the row's end) centers on the whole row, as in any row.
- When a change fails, the line appears 4px under what comes before it: the select or the segmented control in a `Field`, or the description in a settings row, or its title when the row has no description, so the error takes the description's place. The setting grows by that line, and in a settings row the switch moves down by half of it, centered on the whole row with the error in it. In a `Field` the line moves up 2px from the field's 6px gap; in a `ListRowBody` it adds 2px to the body's 2px gap. Anywhere else, put the control and the line together in a block of their own with no gap, and the line is 4px under it.
- A failure longer than one line wraps rather than being cut off; keep it to one short sentence.

## Content

- Write a failure as what didn't happen and what to do: Couldn't mute this server. Try again. When the request comes back with a reason, show that reason ([Writing](../../../../../design/content/writing.md)).
- Don't write "Saved", and don't say where a setting is stored on its row. "Saved on this device" is said once for a section ([Forms](../../../../../design/patterns/forms.md#settings-that-apply-at-once)).

## Accessibility

- `SaveStatusError` has `role="alert"`, so the failure is announced when it appears.
- The control announces its own new value (a switch's on or off, a segmented control's or a select's choice), so a change that saves needs no announcement of its own.
- Point the control's `aria-describedby` at the line's `id` (on `SaveStatus`), beside any description, so a failure is read with the control.
