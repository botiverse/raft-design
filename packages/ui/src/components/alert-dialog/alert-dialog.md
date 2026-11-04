---
title: AlertDialog
summary: A small centered confirmation with the alertdialog role, for the few confirmations a product lists; every other confirmation is a Dialog at size sm.
status: stable
aliases: [ConfirmDialog, Confirmation]
layer: core
category: overlays
related: [dialog, button, banner, dropdown-menu, toast]
---

# AlertDialog

An alert dialog asks people to confirm an action before it happens, with the `alertdialog` role, so a screen reader announces it as an interruption. Most confirmations aren't built on it: a confirmation is a [Dialog](../dialog/dialog.md#variants) at `size="sm"`, deleting and stopping included, and a product lists the few that use AlertDialog instead ([Choosing a component](../../../../../design/components/overview.md#overlays), 2026-11-03). In Raft Chat there are two: discarding unsaved edits to an agent's profile, and opening a link that hands off to another app ([Raft Chat](../../../../../design/products/raft-chat/README.md#overlays)). It is a 400px dialog on a scrim, the width of every confirmation, with a title, a sentence on what will happen, Cancel and a confirm button whose color states the consequence.

```example
alert-dialog/compositions/confirm-action
```

## When to use

| Situation                                                                                                                                                                                          | Use                                                                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| A confirmation the product lists as an AlertDialog: in Raft Chat, discarding unsaved edits to an agent's profile, opening a link that hands off to another app                                     | AlertDialog, its confirm button colored by the consequence ([Variants](#variants))                                                      |
| Any other confirmation, including an action that cannot be undone (delete a message, an agent, a server) or that interrupts but can be recovered (stop an agent, reset a session, leave a channel) | A [Dialog](../dialog/dialog.md#variants) at `size="sm"`, its confirm button red or orange by the same table ([Variants](#variants))     |
| An action that can be reversed in place                                                                                                                                                            | No dialog: do it; when a [Toast](../toast/toast.md) offers Undo is in [Feedback](../../../../../design/patterns/feedback.md#confirming) |
| A decision that needs more than the name typed                                                                                                                                                     | [Dialog](../dialog/dialog.md)                                                                                                           |

## Anatomy

- `AlertDialog`: the root. Required.
- `AlertDialogTrigger`: the button that opens it. Usually the dialog is opened from a menu item instead.
- `AlertDialogContent`: the centered surface, at most 400px wide, the width of a `size="sm"` [Dialog](../dialog/dialog.md#variants), so every confirmation is one width, with the scrim (`AlertDialogOverlay`) behind it. Required.
- `AlertDialogHeader`: the title row, with an optional `AlertDialogClose` (×).
- `AlertDialogTitle`: the title. Required.
- `AlertDialogBody` and `AlertDialogDescription`: what will happen.
- `AlertDialogFooter`: the buttons in one row at the end, Cancel then the commit button, on a phone as on a desktop. Only when they don't fit on one line do they stack full width, the commit button on top and Cancel framed, as in [Dialog](../dialog/dialog.md#the-footer).
- `AlertDialogCancel`: a ghost button that closes the dialog; framed when the buttons stack. Required.
- `AlertDialogAction`: the confirm button. It is a Button and doesn't close the dialog by itself: close it when the action finishes.
- `AlertDialogPortal`: a lower-level part.

## Variants

The confirm button's color says what happens, the same in a confirmation built on Dialog:

| Consequence                      | Confirm button                                                                                  | Example      |
| -------------------------------- | ----------------------------------------------------------------------------------------------- | ------------ |
| Does something                   | `variant="primary"`                                                                             | Make Public  |
| Interrupts, but can be recovered | `variant="warning"`                                                                             | Stop         |
| Cannot be undone                 | `variant="danger"`, and a [Banner](../banner/banner.md) with `status="destructive"` in the body | Delete Agent |

Deleting something large, such as an agent or a server, also asks for its name to be typed ([Forms](../../../../../design/patterns/forms.md#danger-zone)). The example shows the parts on AlertDialog; in Raft Chat that confirmation is a `size="sm"` Dialog with the same body:

```example
alert-dialog/compositions/typed-delete
```

## Behavior

- It appears and disappears without animation, over the scrim, like every centered dialog ([Dialog](../dialog/dialog.md#behavior)).
- Esc and Cancel close it without acting.

## Content

- Title it with the action and the thing it acts on, as a question: Delete Box?
- Say in one or two sentences what happens, in plain words: "Box leaves every channel."
- Label the confirm button with the title's verb: Stop for Stop Wug?. Keep the object when it can't be undone, on the red button: Delete Agent. Label the other button Cancel ([Writing](../../../../../design/content/writing.md#actions-and-their-dialogs)).

## Accessibility

- AlertDialog wraps the Base UI Dialog and sets the `alertdialog` role, so screen readers announce it as an interruption. Base UI provides the focus trap, Esc and focus return.
- `AlertDialogTitle` is the accessible name and `AlertDialogDescription` the description. Put the consequence in `AlertDialogDescription`, so it is announced with the title.
- The × of `AlertDialogClose` is labeled "Close".

## Rules

- Put Cancel on the left and the confirm button on the right, and no other buttons.
- Don't color the menu item that opens the dialog: the confirm button carries the color ([Feedback](../../../../../design/patterns/feedback.md#confirming)).
