---
title: Dialog
summary: A centered overlay on a scrim for a decision or a few fields people must finish before they continue, with a wide size for a large form filled in one pass.
status: stable
aliases: [Modal]
layer: core
category: overlays
related: [alert-dialog, form-section, drawer, banner, toast]
---

# Dialog

A dialog is a centered overlay on a scrim for something people must finish before they continue: a small task of 2 or 3 fields, such as creating a channel. It has a title, a body and at most two buttons. Its wide size holds a large form filled in one pass. To confirm an action, use [AlertDialog](../alert-dialog/alert-dialog.md).

```example
dialog/compositions/create-channel
```

## When to use

| Situation                                                                            | Use                                                                                                                                     |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| A small task in 2 or 3 fields (Create Channel)                                       | Dialog                                                                                                                                  |
| A large form filled in one pass: registering or editing an app, configuring an agent | Dialog with `size="wide"`                                                                                                               |
| Task details                                                                         | A wider Dialog, 960px wide and full screen on a phone ([Tasks](../../../../../design/patterns/tasks.md))                                |
| Confirming an action that cannot be undone, or that interrupts                       | [AlertDialog](../alert-dialog/alert-dialog.md)                                                                                          |
| An action that can be reversed in place                                              | No dialog: do it; when a [Toast](../toast/toast.md) offers Undo is in [Feedback](../../../../../design/patterns/feedback.md#confirming) |
| Details or settings people look at and edit for a while                              | [Drawer](../drawer/drawer.md)                                                                                                           |

Which overlay fits which job is in [Choosing a component](../../../../../design/components/overview.md#overlays).

## Anatomy

- `Dialog`: the root. Owns the open state. Required.
- `DialogTrigger`: the button that opens it.
- `DialogContent`: the centered surface, portaled, with the scrim (`DialogOverlay`) behind it. Required.
- `DialogHeader`: the title row, with an optional `DialogClose` at its end.
- `DialogTitle`: the title. Required.
- `DialogDescription`: a sentence under the title or in the body.
- `DialogBody`: the content. It scrolls when the dialog reaches the window height.
- `DialogFooter`: the buttons, aligned to the end.
- `DialogClose`: closes the dialog. Without children it is the × icon button; with `render` it turns a Cancel button into a close button.
- `DialogNav`: the section list of a wide dialog.
- `DialogSurface`: the dialog's frame without Base UI behind it, for a centered modal whose app owns the backdrop, Esc and focus, such as search.
- `DialogPortal` and `DialogOverlay`: lower-level parts.

## Variants

| Variant                                         | Use for                                                                                                              |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `size="sm"`, `size="md"` (default), `size="lg"` | The small dialog: a decision or 2 or 3 fields. Use the narrowest one the content fits                                |
| `size="wide"`                                   | The large form dialog, 896px wide, with a fixed height of 760px or the window height less 32px, whichever is smaller |

The large form dialog uses `bar` on `DialogHeader`, `DialogBody` and `DialogFooter`: the header and footer stay in place and the body scrolls between them. The body holds `DialogNav` on the left, a `line-seam` after it, and one [FormSection](../form-section/form-section.md) per section on the right. Its structure and rules are in [Forms](../../../../../design/patterns/forms.md#the-large-form-dialog).

## Behavior

- A dialog appears and disappears without animation, always over the scrim ([Motion](../../../../../design/foundations/motion.md#usage)).
- Esc, × and Cancel close a dialog. A click on the scrim closes a small dialog.
- Don't close a large form dialog on a click outside it: pass `disablePointerDismissal` on `Dialog`, so a half-filled form isn't lost to a stray click.
- On a narrow screen the dialog keeps a 16px margin on each side and never grows taller than the window less 32px.
- Below 768px the wide dialog hides `DialogNav` and the sections follow one another.
- A dialog opened from another dialog takes `layer={1}`, so it and its scrim sit above the first.

## Content

- Title the dialog with the words of the button that opened it, or Edit and the item's name, and make Cancel say what stays: Keep Box ([Writing](../../../../../design/foundations/writing.md#actions-and-their-dialogs)).
- Set body text in `foreground-muted`, below a title in `foreground`. Their type styles are in [Typography](../../../../../design/foundations/typography.md).

## Accessibility

- Dialog wraps the Base UI Dialog. It provides the `dialog` role, the focus trap, Esc and focus return to the trigger.
- Give every dialog a `DialogTitle`. It becomes the dialog's accessible name, and it is what a screen reader announces on open.
- `DialogDescription` becomes the dialog's description.
- The × of `DialogClose` is labeled "Close". Pass `aria-label` to change it.
- `DialogSurface` has no behavior of its own. The app that uses it must add the `dialog` role, `aria-modal`, a name, the focus trap, Esc and the scrim.

## Rules

- Put at most two buttons in the footer: Cancel on the left (`variant="ghost"`), the confirm button on the right.
- Make the confirm button pink (`variant="primary"`) when it does something. Color it by its consequence when it interrupts or can't be undone ([AlertDialog](../alert-dialog/alert-dialog.md#variants)).
- Put anything people must read before they act in a [Banner](../banner/banner.md) inside the body ([Feedback](../../../../../design/patterns/feedback.md#errors-by-scope)).
- Keep the small dialog at most 400px wide, with 20px padding.
- Don't pass `overlay={false}` in product code: every centered dialog has the scrim, without exception.
