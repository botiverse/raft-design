---
title: AnnouncementDialog
summary: A dialog that tells people about something new in the product, with a small label, a title, an optional picture, a few lines of text and an action to try it.
status: experimental
aliases: [What's new]
layer: core
category: overlays
related: [dialog, notification-center, toast, banner, button]
---

# AnnouncementDialog

An announcement dialog tells people about something new in the product once: a small label, a title, an optional picture, a few lines of text and one action that takes them to it. It is a [Dialog](../dialog/dialog.md) with a fixed layout, so it has the dialog's scrim, Esc and focus handling. It is exported from `@botiverse/raft-ui/wip`, and its API can change in any release.

```example
dialog/compositions/announcement
```

## When to use

| Situation                                                             | Use                                                                                           |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| A new feature people should hear about once, with an action to try it | AnnouncementDialog                                                                            |
| The state of the whole server: a computer offline, a quota, an update | The notification center ([NotificationCenter](../notification-center/notification-center.md)) |
| The result of something the person just did                           | [Toast](../toast/toast.md)                                                                    |
| A decision people must make before they continue                      | [Dialog](../dialog/dialog.md) or [AlertDialog](../alert-dialog/alert-dialog.md)               |
| Something people must read before they act, inside a dialog or form   | [Banner](../banner/banner.md)                                                                 |

The full choice of how to tell people something is in [Choosing a component](../../../../../design/components/overview.md#telling-people-something).

## Anatomy

- `AnnouncementDialog`: the root, the same as `Dialog`. Owns the open state. Required.
- `AnnouncementDialogTrigger`: the button that opens it, when people open it themselves.
- `AnnouncementDialogContent`: the centered surface, with the scrim behind it. Required.
- `AnnouncementDialogBody`: everything above the footer. It scrolls when the content is taller than 70% of the window. Required.
  - `AnnouncementDialogHeader`: the row with the label and the close button.
  - `AnnouncementDialogLabel`: a short label in `text-caption` and `foreground-muted`, after an attention dot that is drawn for you.
  - `AnnouncementDialogClose`: the × icon button. It is `DialogClose`.
  - `AnnouncementDialogTitle`: the title, in `text-headline`. Required.
  - `AnnouncementDialogPicture`: a picture of the feature on `fill-muted`, with a hairline and `radius-container`. The image inside is contained, not cropped. Optional.
  - `AnnouncementDialogText`: the text, in `text-subhead` and `foreground-muted`. It takes paragraphs, lists and headings.
- `AnnouncementDialogFooter`: the actions, with no line above it.
  - `AnnouncementDialogSecondaryAction`: a frameless button that dismisses the announcement, because the dialog draws its own edge ([Button](../button/button.md#which-color)). Optional.
  - `AnnouncementDialogAction`: the pink action, at the end of the footer. Required.

## Behavior

- On open, focus goes to `AnnouncementDialogAction` instead of the close button, so Enter takes people to the feature. Pass `initialFocus` to change it.
- When the dialog is narrower than 448px, the footer stacks its buttons and each one takes the full width.
- Long titles, labels and button labels wrap instead of being cut off.
- Esc and × close the dialog. The two actions don't close it by themselves: each calls its own handler, and the caller closes the dialog from it.

## Content

- Write the label as the kind of announcement, in sentence case: What's new.
- Write the title as what people can now do, in sentence case: Work together across servers.
- Make the action say where it goes, in Title Case: Create Joint Channel ([Writing](../../../../../design/content/writing.md#casing)).
- Make the secondary action an acknowledgment, such as Got It. Leave it out when the action and × are enough.

## Accessibility

- AnnouncementDialog is the Base UI Dialog, through [Dialog](../dialog/dialog.md#accessibility). It provides the `dialog` role, the focus trap, Esc and focus return.
- `AnnouncementDialogTitle` names the dialog. Every announcement needs one.
- Give `AnnouncementDialogClose` an `aria-label` that says what it closes: Close Update.
- The attention dot in the label is hidden from assistive technology.
- Give the picture a text alternative, or hide it when the text already says the same thing.

## Rules

- Use exactly one `AnnouncementDialogAction`. It is the screen's one pink button ([Button](../button/button.md#which-color)).
- Don't put a form in it. When the feature needs input, open its form from the action.
