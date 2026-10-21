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

A dialog is a centered overlay on a scrim for something people must finish before they continue: a decision, or a small task of a few fields, such as creating a channel. It has a title, a body and at most two buttons. Its wide size holds a large form filled in one pass. To confirm an action, use [AlertDialog](../alert-dialog/alert-dialog.md).

```example
dialog/compositions/create-channel
```

## When to use

| Situation                                                                            | Use                                                                                                                                             |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| A small task in 1 to 5 fields (Create Channel)                                       | Dialog                                                                                                                                          |
| A large form filled in one pass: registering or editing an app, configuring an agent | Dialog with `size="wide"`                                                                                                                       |
| Task details                                                                         | A workspace overlay on Dialog, 960px wide and full screen on a phone, outside the four sizes ([Tasks](../../../../../design/patterns/tasks.md)) |
| Confirming an action that cannot be undone, or that interrupts                       | [AlertDialog](../alert-dialog/alert-dialog.md)                                                                                                  |
| An action that can be reversed in place                                              | No dialog: do it; when a [Toast](../toast/toast.md) offers Undo is in [Feedback](../../../../../design/patterns/feedback.md#confirming)         |
| Details or settings people look at and edit for a while                              | [Drawer](../drawer/drawer.md)                                                                                                                   |

Which overlay fits which job is in [Choosing a component](../../../../../design/components/overview.md#overlays).

## Anatomy

- `Dialog`: the root. Owns the open state. Required.
- `DialogTrigger`: the button that opens it.
- `DialogContent`: the centered surface, portaled, with the scrim (`DialogOverlay`) behind it. Required.
- `DialogHeader`: the title row, with an optional `DialogClose` at its end. The × is pulled out so its icon box, not the button, ends on the dialog's 20px margin ([Alignment](../../../../../design/foundations/alignment.md#the-ends-of-a-header)).
- `DialogTitle`: the title. Required.
- `DialogDescription`: a sentence under the title or in the body.
- `DialogBody`: the content. It scrolls when the dialog reaches the window height.
- `DialogFooter`: the buttons, aligned to the end.
- `DialogClose`: closes the dialog. Without children it is the × icon button; with `render` it turns a Cancel button into a close button.
- `DialogNav`: the section list of a wide dialog.
- `DialogSurface`: the dialog's frame without Base UI behind it, for a centered modal whose app owns the backdrop, Esc and focus, such as search.
- `DialogPortal` and `DialogOverlay`: lower-level parts.
- `DialogSheetContent` (`@botiverse/raft-ui/wip`): `DialogContent` for a dialog that becomes a sheet on a phone ([On a phone](#on-a-phone)). On a desktop and a tablet it is `DialogContent`, the same markup.
- `DialogCommit` (`@botiverse/raft-ui/wip`): the dialog's one commit button, a `Button` written at the end of `DialogFooter`. In a sheet on a phone it is drawn at the end of the head instead.
- `DialogSheetBack` (`@botiverse/raft-ui/wip`): Back at the start of a sheet's head, in a later step of a flow. It draws nothing outside a sheet.

## Variants

Pick the size by what the dialog holds, not by what looks right. The four sizes are far enough apart that each holds one kind of content (cindyz, 2026-10-21):

| Variant               | Width | Use for                                                                                                                                                                                                                                                         |
| --------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `size="sm"`           | 400px | A decision: every confirmation and acknowledgement, including one with a few options to choose from or a short list of what it affects (Reset Agent, Change Visibility, the restart options). It is the width of [AlertDialog](../alert-dialog/alert-dialog.md) |
| `size="md"` (default) | 448px | A small task: 1 to 5 fields, a list to pick from, a short help text that is only read (Create Channel, Add Members, role help)                                                                                                                                  |
| `size="lg"`           | 640px | Content that needs width: a list with several columns, a command or code, key-value rows, a long text to read, a flow of steps (Connect Computer, a computer's release notes)                                                                                   |
| `size="wide"`         | 896px | The large form dialog, in sections, with a fixed height of 760px or the window height less 32px, whichever is smaller                                                                                                                                           |

- Every confirmation is one width, 400px, whether it is built on Dialog or AlertDialog. A confirmation whose content no longer fits 400px isn't a confirmation any more: it is a small task, at `md`.
- `sm`, `md` and `lg` are the small dialog: its height follows its content, up to the window less 32px, and a click on the scrim closes it. `wide` is the large form dialog.
- Set the width with `size` only. Product code never passes its own `max-w-*` to `DialogContent`. Content that fits none of the four sizes isn't a dialog: make it a page or a [Drawer](../drawer/drawer.md).
- Only these overlays have a width outside the four sizes, each set by its own rule. Nothing else may add one:
  - Task details, 960px: a workspace overlay ([Tasks](../../../../../design/patterns/tasks.md)).
  - Search, 720px, on `DialogSurface`, its top edge over the top bar's field ([Search](../search/search.md)).
  - The showcase frame, 720px wide and about 520px high, shared by steps 3 to 5 of onboarding and the Upgrade to Pro dialog, and used by nothing else ([Onboarding](../../../../../design/products/raft-chat/onboarding.md)).
  - [AnnouncementDialog](../announcement-dialog/announcement-dialog.md), 576px: its picture and one-paragraph text read best there; at 640px the text runs past 80 characters a line.
  - An attachment preview, as wide as the file needs, up to 768px.
- On a narrow screen every size is as wide as itself or the window less 32px, whichever is smaller, so at 390px each one is 358px wide. Its height and the wide dialog's sections are in [Behavior](#behavior).

The large form dialog uses `bar` on `DialogHeader`, `DialogBody` and `DialogFooter`: the header and footer stay in place and the body scrolls between them. The body holds `DialogNav` on the left, a `line-seam` after it, and one [FormSection](../form-section/form-section.md) per section on the right. Its structure and rules are in [Forms](../../../../../design/patterns/forms.md#the-large-form-dialog).

## Behavior

- A centered dialog appears and disappears without animation, always over the scrim ([Motion](../../../../../design/foundations/motion.md#usage)). On a phone a dialog with fields is a sheet that slides up instead ([On a phone](#on-a-phone)).
- Esc, × and Cancel close a dialog. A click on the scrim closes a small dialog.
- Don't close a large form dialog on a click outside it: pass `disablePointerDismissal` on `Dialog`, so a half-filled form isn't lost to a stray click.
- A centered dialog on a narrow screen keeps a 16px margin on each side and never grows taller than the window less 32px.
- Below 768px the wide dialog hides `DialogNav` and the sections follow one another.
- A dialog opened from a dialog or a sheet draws its own, lighter scrim over the one below ([Stacked overlays](../../../../../design/foundations/elevation.md#stacked-overlays)). Render it inside the first one and this happens by itself. `layer={1}` is only for a dialog rendered outside the first one's tree: it lifts the dialog and its scrim above the first.
- An app's own modal (its own backdrop, Esc and focus, on `DialogSurface`) joins the same stack with `OverlayLayerProvider` and `useParentOverlayKind` from `@botiverse/raft-ui/wip` ([Stacked overlays](../../../../../design/foundations/elevation.md#stacked-overlays)).

## On a phone

Below 768px a dialog stays centered unless it has several fields, a long list or steps, in which case it becomes a sheet (stdrc and Artea, 2026-10-21). On a desktop and a tablet every dialog stays centered.

| What the dialog holds                                                                                                                                               | On a phone                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A decision: a statement and buttons, at most a few fixed choices, nothing typed (every confirmation; archive, stop, reset)                                          | The centered dialog, as on a desktop                                                                                                                                                                            |
| One input or one text box and its buttons: a confirmation that asks for a typed name, naming a section, editing a display name or a description, a reason to reject | The centered dialog, as on a desktop. While the keyboard is open it should move up, so the keyboard doesn't cover it: Raft Chat does this in the app today (`narrow="top"` in slock); it is planned for raft-ui |
| Several fields, a long or searchable list to pick from, or steps: forms, pickers, wizards                                                                           | A sheet 90% of the screen tall                                                                                                                                                                                  |
| Content that is only read: role help, release notes, an app's details. It is short information, so it stays a dialog                                                | The centered dialog, as on a desktop                                                                                                                                                                            |

The sheet:

- Rises from the bottom over the scrim, with `radius-dialog` on its top corners. The strip of page left above it shows that it is a layer over the page, not a new page.
- Its head is a pushed page's head ([Navigation](../../../../../design/patterns/navigation.md)): × at the start, the title, and the dialog's one commit button at the end, at size `md` with the same color and words as on a desktop. It has no footer: × is Cancel. In a flow of steps the button at the end is the step's (Next, then the last step's action), and × still closes.
- The body scrolls under the head and keeps the phone's 16px margin and the home indicator's inset at the bottom.
- × and Esc close it. A tap on the scrim doesn't, so a half-filled form isn't lost to a stray tap, as with a large form dialog on a desktop. When something has been typed, ask before closing ([Asking before closing](#asking-before-closing)).
- Dragging the sheet down to close it is planned, for when the sheet moves onto Drawer's drag.
- It slides up as it opens, like every bottom sheet, and its scrim fades in with it ([Motion](../../../../../design/foundations/motion.md#usage)). With reduced motion it is simply there.
- With the on-screen keyboard up, the sheet shrinks to the space above it, so the head and its commit button stay in view.
- An alert or a warning or destructive Banner that appears in the body after it opens, such as the error a failed commit adds, is scrolled into view: the button that caused it is at the top.

### Making a dialog a sheet

Write the dialog as it is on a desktop and swap `DialogContent` for `DialogSheetContent`, and the commit `Button` for `DialogCommit`. Nothing else changes, and on a desktop nothing changes at all. Below 768px:

- `DialogHeader` becomes the pushed page's head: its `DialogClose` goes first, as the head's ×, and its `DialogTitle` follows. Give the header a `DialogClose` as a direct child: it is the only way out of the sheet. One wrapped in a Tooltip, a Fragment or a component of your own isn't found and stays after the title; in development the head warns about it in the console.
- The head has room for one line, the title. A `DialogDescription` goes at the top of `DialogBody` in a sheet dialog, not in `DialogHeader`.
- `DialogCommit` moves to the end of the head at `size="sm"`, with the same variant, words, disabled and loading state. A `type="submit"` button stays its form's default button: it is tied to the form it was written in by the form's `id`, so a click and Enter in a field still submit, and neither does while it is disabled. Give that `form` an `id` (or pass `form` to `DialogCommit`); without one a click still submits but Enter in a field doesn't.
- `DialogFooter` is hidden, and with it Cancel and any other button in it, such as a step's Back.
- `DialogBody` scrolls under the head on the phone's 16px margin, with the home indicator's inset at the bottom. A wide dialog's `bar` body does the same: its `DialogNav` is hidden and its sections follow one another.

```example
dialog/compositions/sheet-form
```

In a flow of steps, write each step's button as a `DialogCommit`: Next, then the last step's action. From the second step on, put a `DialogSheetBack` in `DialogHeader`: on a phone it takes the head's start in place of ×, as on a pushed page, and Esc still closes; on a desktop it draws nothing and Back stays in the footer. (Back in place of × is proposed here for stdrc's review; the rule above says only that × closes.)

```example
dialog/compositions/sheet-steps
```

A dialog or an alert dialog opened from the sheet is centered over it, on its own lighter scrim ([Stacked overlays](../../../../../design/foundations/elevation.md#stacked-overlays)). It keeps its own head, footer and commit button: only the sheet's own parts change.

#### Asking before closing

When something has been typed, × and Esc ask first. Cancel the close in `onOpenChange` on `Dialog` and open the confirm from inside the sheet:

```tsx
<Dialog
  open={open}
  onOpenChange={(next, details) => {
    if (!next && dirty) {
      details.cancel();
      setConfirmOpen(true);
      return;
    }
    setOpen(next);
  }}
>
```

The example below is wired that way; its canvas shows the confirm after × with edits.

```example
dialog/compositions/sheet-stacked
```

A dialog that stays centered on a phone keeps `DialogContent` and `Button`.

## Content

- Title the dialog with the words of the button that opened it, or Edit and the item's name. Label its main button with the action it performs, without the object: usually the title's verb (Create Channel → Create); an Edit title's button is Save, and the other one Cancel ([Writing](../../../../../design/content/writing.md#actions-and-their-dialogs)).
- Set body text in `foreground-muted`, below a title in `foreground`. Their type styles are in [Typography](../../../../../design/foundations/typography.md).

## Accessibility

- Dialog wraps the Base UI Dialog. It provides the `dialog` role, the focus trap, Esc and focus return to the trigger.
- Give every dialog a `DialogTitle`. It becomes the dialog's accessible name, and it is what a screen reader announces on open.
- `DialogDescription` becomes the dialog's description.
- The × of `DialogClose` is labeled "Close". Pass `aria-label` to change it.
- In a sheet the head puts × (or Back) first in the DOM, so Tab and a screen reader meet the head in the order it is seen: ×, the title, the commit button. The title stays the dialog's accessible name.
- `DialogSurface` has no behavior of its own. The app that uses it must add the `dialog` role, `aria-modal`, a name, the focus trap, Esc and the scrim.

## Rules

- Put at most two buttons in the footer: Cancel on the left (`variant="ghost"`), the confirm button on the right.
- Make the confirm button pink (`variant="primary"`) when it does something. Color it by its consequence when it interrupts or can't be undone ([AlertDialog](../alert-dialog/alert-dialog.md#variants)).
- Put anything people must read before they act in a [Banner](../banner/banner.md) inside the body ([Feedback](../../../../../design/patterns/feedback.md#errors-by-scope)).
- Pad every size by 20px. Its width comes from `size` ([Variants](#variants)), never from a class of your own.
- Don't pass `overlay={false}` in product code: every centered dialog has the scrim, without exception.
