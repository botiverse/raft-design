---
title: Button
summary: A control that runs an action when pressed, with one pink primary button per screen at most.
status: stable
aliases: [IconButton]
category: actions
related: [dropdown-menu, alert-dialog, float-button]
placeholder: true
---

# Button

A button runs an action in place: it saves, sends, opens a dialog or starts a flow. Use one pink primary button per screen at most; every other action is an ink-outline or frameless button.

```example
button/compositions/default
```

## When to use

| Situation                                          | Use                                                                       |
| -------------------------------------------------- | ------------------------------------------------------------------------- |
| The one action this screen exists for              | Button, `variant="accent"`                                                |
| Any other action                                   | Button, `variant="outline"` or `variant="ghost"`                          |
| An action that interrupts work: stop, leave, reset | Button, `variant="warning"`                                               |
| An action that cannot be undone                    | Button, `variant="danger"`, confirmed in an [AlertDialog](./alert-dialog) |
| Going to another page                              | A link, not a button                                                      |
| A choice between views of the same content         | [SegmentedControl](./segmented-control)                                   |

## Anatomy

- `Button`: the only part. Put a Lucide icon before or after the label with `data-icon="inline-start"` or `data-icon="inline-end"`.

## Variants

| Variant    | Use for                                           |
| ---------- | ------------------------------------------------- |
| `accent`   | The primary action. Pink, at most one per screen. |
| `outline`  | Secondary actions in content.                     |
| `ghost`    | Actions inside a header, toolbar or composer.     |
| `on-frame` | Actions on the yellow frame.                      |
| `warning`  | Actions that interrupt: Stop, Leave, Reset.       |
| `danger`   | Actions that cannot be undone.                    |

```example
button/compositions/on-frame
```

## States

- **Busy**: set `loading`. The button keeps its width, shows the pixel spinner, and its label says what is happening ("Saving").
- **Disabled**: prefer explaining why an action is unavailable over disabling it silently.

## Content

- Labels are verbs in Title Case: Create Task, Mark All Read.
- The label names the layer it opens: Create Channel opens a dialog titled Create Channel.

## Accessibility

- Renders a native `<button>`. To navigate, render a link with `render={<a href="…" />}`.
- An icon-only button needs `aria-label`.
- Every button meets the 44px hit target; smaller visual sizes extend their hit area.

## Rules

- No shadows on buttons. Elevation is for floating surfaces.
- Never use pink for a second action on the same screen; pink means "do this".
