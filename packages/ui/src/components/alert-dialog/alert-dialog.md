---
title: AlertDialog
summary: A small centered dialog that asks people to confirm an action that cannot be undone or that interrupts work, with a confirm button colored by the consequence.
status: stable
aliases: [ConfirmDialog, Confirmation]
category: overlays
related: [dialog, button, banner, dropdown-menu, toast]
---

# AlertDialog

An alert dialog asks people to confirm an action before it happens, when the action cannot be undone (delete) or interrupts work (stop, reset). It is a 400px dialog on a scrim with a title, a sentence on what will happen, Cancel and a confirm button whose color states the consequence.

```example
alert-dialog/compositions/confirm-action
```

## When to use

| Situation                                                                                       | Use                                                                                                                                                 |
| ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| An action that cannot be undone: delete a message, an agent, a workspace                        | AlertDialog, red                                                                                                                                    |
| An action that interrupts but can be recovered: stop an agent, reset a session, leave a channel | AlertDialog, orange                                                                                                                                 |
| An action that can be undone                                                                    | No dialog: do it, then show a [Toast](../toast/toast.md) with Undo ([Feedback](../../../../../design/patterns/feedback.md#undo-instead-of-confirm)) |
| A decision that needs more than the name typed                                                  | [Dialog](../dialog/dialog.md)                                                                                                                       |

## Anatomy

- `AlertDialog`: the root. Required.
- `AlertDialogTrigger`: the button that opens it. Usually the dialog is opened from a menu item instead.
- `AlertDialogContent`: the centered surface, at most 400px wide, with the scrim (`AlertDialogOverlay`) behind it. Required.
- `AlertDialogHeader`: the title row, with an optional `AlertDialogClose` (×).
- `AlertDialogTitle`: the title. Required.
- `AlertDialogBody` and `AlertDialogDescription`: what will happen.
- `AlertDialogFooter`: the buttons, aligned to the end.
- `AlertDialogCancel`: a ghost button that closes the dialog. Required.
- `AlertDialogAction`: the confirm button. It is a Button and doesn't close the dialog by itself: close it when the action finishes.
- `AlertDialogPortal`: a lower-level part.

## Variants

The confirm button's color says what happens:

| Consequence                      | Confirm button                                                                                  | Example      |
| -------------------------------- | ----------------------------------------------------------------------------------------------- | ------------ |
| Does something                   | `variant="primary"`                                                                             | Make Public  |
| Interrupts, but can be recovered | `variant="warning"`                                                                             | Stop Wug     |
| Cannot be undone                 | `variant="danger"`, and a [Banner](../banner/banner.md) with `status="destructive"` in the body | Delete Agent |

Deleting something large, such as an agent or a workspace, also asks for its name to be typed ([Forms](../../../../../design/patterns/forms.md#danger-zone)):

```example
alert-dialog/compositions/typed-delete
```

## Behavior

- It appears and disappears without animation, over the scrim, like every centered dialog ([Dialog](../dialog/dialog.md#behavior)).
- Esc and Cancel close it without acting.

## Content

- Title it with the action and the thing it acts on, as a question: Delete Box?
- Say in one or two sentences what happens, in plain words: "Box leaves every channel."
- Make the confirm button repeat the verb and name the result (Delete Agent), and make Cancel say what stays (Keep Box) ([Writing](../../../../../design/foundations/writing.md#actions-and-their-dialogs)).

## Accessibility

- AlertDialog wraps the Base UI Dialog and sets the `alertdialog` role, so screen readers announce it as an interruption. Base UI provides the focus trap, Esc and focus return.
- `AlertDialogTitle` is the accessible name and `AlertDialogDescription` the description. Put the consequence in `AlertDialogDescription`, so it is announced with the title.
- The × of `AlertDialogClose` is labeled "Close".

## Rules

- Put Cancel on the left and the confirm button on the right, and no other buttons.
- Don't color the menu item that opens the dialog: the confirm button carries the color ([Feedback](../../../../../design/patterns/feedback.md#undo-instead-of-confirm)).
