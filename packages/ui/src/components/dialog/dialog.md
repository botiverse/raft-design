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

A dialog is a centered overlay on a scrim for something people must finish before they continue: a decision, or a small task of a few fields, such as creating a channel. It has a title, a body and at most two buttons. Its wide size holds a large form filled in one pass. A confirmation is a Dialog too, at `size="sm"`, whether the action can be undone or not; [AlertDialog](../alert-dialog/alert-dialog.md) is only for the few confirmations a product lists ([Choosing a component](../../../../../design/components/overview.md#overlays), 2026-11-03).

```example
dialog/compositions/create-channel
```

## When to use

| Situation                                                                            | Use                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A small task in 1 to 5 fields (Create channel)                                       | Dialog                                                                                                                                                                                                                                                                                                                                                             |
| A large form filled in one pass: registering or editing an app, configuring an agent | Dialog with `size="wide"`                                                                                                                                                                                                                                                                                                                                          |
| Task details                                                                         | A workspace overlay on Dialog, 960px wide and full screen on a phone, outside the four sizes ([Tasks](../../../../../design/patterns/tasks.md))                                                                                                                                                                                                                    |
| Confirming an action that cannot be undone, or that interrupts                       | Dialog with `size="sm"`, its confirm button colored by the consequence ([Rules](#rules)). [AlertDialog](../alert-dialog/alert-dialog.md) only where the product lists it: in Raft Chat, discarding unsaved edits to an agent's profile and opening a link that hands off to another app ([Raft Chat](../../../../../design/products/raft-chat/README.md#overlays)) |
| An action that can be reversed in place                                              | No dialog: do it; when a [Toast](../toast/toast.md) offers Undo is in [Feedback](../../../../../design/patterns/feedback.md#confirming)                                                                                                                                                                                                                            |
| Details or settings people look at and edit for a while                              | [Drawer](../drawer/drawer.md)                                                                                                                                                                                                                                                                                                                                      |

Which overlay fits which job is in [Choosing a component](../../../../../design/components/overview.md#overlays).

## Anatomy

- `Dialog`: the root. Owns the open state. Required.
- `DialogTrigger`: the button that opens it.
- `DialogContent`: the centered surface, portaled, with the scrim (`DialogOverlay`) behind it. Required. On a desktop and a tablet, `placement="top"` puts its top edge near the top of the window instead of the middle ([At the top](#at-the-top)).
- `DialogHeader`: the title row, with an optional `DialogClose` at its end. The × is pulled out so its icon box, not the button, ends on the dialog's margin (`--surface-inset`: 20px, 16px with a mouse) ([Alignment](../../../../../design/foundations/alignment.md#the-ends-of-a-header)).
- `DialogTitle`: the title. Required.
- `DialogDescription`: a sentence under the title or in the body.
- `DialogBody`: the content. It scrolls when the dialog reaches the window height, natively, or under raft-ui's scrollbar with `unstable_scrollArea` ([Scrolling in a ScrollArea](#scrolling-in-a-scrollarea)).
- `DialogFooter`: the buttons in one row at the end, with a note or a `TextLink` at its start. It stacks them only when they don't fit on one line ([The footer](#the-footer)).
- `DialogFooterNote` (`@botiverse/raft-ui/wip`): one short line at the start of the footer that says what the commit button will do, in muted footnote text. Only in a `size="lg"` or `size="wide"` dialog. An empty note draws nothing.
- `DialogClose`: closes the dialog. Without children it is the × icon button; with `render` it turns a Cancel button into a close button.
- `DialogNav`: the section list of a wide dialog.
- `DialogSurface`: the dialog's frame without Base UI behind it, for a centered modal whose app owns the backdrop, Esc and focus, such as a step of the server setup. Prefer `DialogContent`: search moved off `DialogSurface` onto it (slock #14142).
- `DialogPortal` and `DialogOverlay`: lower-level parts.
- `DialogSheetContent`: `DialogContent` for a dialog that becomes a sheet on a phone ([On a phone](#on-a-phone)). On a desktop and a tablet it is `DialogContent`, the same markup.
- `DialogCommit`: the dialog's one commit button, a `Button` written at the end of `DialogFooter`. In a sheet on a phone it is drawn at the end of the head instead.
- `DialogSheetBack`: Back at the start of a sheet's head, in a later step of a flow. It draws nothing outside a sheet. On a touch screen it goes back when the finger lifts ([Switching on finger lift](../../../../../design/patterns/navigation.md#switching-on-finger-lift)).

## Variants

Pick the size by what the dialog holds, not by what looks right. The four sizes are far enough apart that each holds one kind of content (cindyz, 2026-10-21):

| Variant               | Width | Use for                                                                                                                                                                                                                                                         |
| --------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `size="sm"`           | 400px | A decision: every confirmation and acknowledgement, including one with a few options to choose from or a short list of what it affects (Reset agent, Change visibility, the restart options). It is the width of [AlertDialog](../alert-dialog/alert-dialog.md) |
| `size="md"` (default) | 448px | A small task: 1 to 5 fields, a list to pick from, a short help text that is only read (Create channel, Add members, role help)                                                                                                                                  |
| `size="lg"`           | 640px | Content that needs width: a list with several columns, a command or code, key-value rows, a long text to read, a flow of steps (Connect computer, a computer's release notes)                                                                                   |
| `size="wide"`         | 896px | The large form dialog, in sections, with a fixed height of 760px or the window height less 32px, whichever is smaller                                                                                                                                           |

- Every confirmation is one width, 400px, whether it is built on Dialog or AlertDialog. A confirmation whose content no longer fits 400px isn't a confirmation any more: it is a small task, at `md`.
- `sm`, `md` and `lg` are the small dialog: its height follows its content, up to the window less 32px, and a click on the scrim closes it. `wide` is the large form dialog.
- Set the width with `size` only. Product code never passes its own `max-w-*` to `DialogContent`. Content that fits none of the four sizes isn't a dialog: make it a page or a [Drawer](../drawer/drawer.md).
- Only these overlays have a width outside the four sizes, each set by its own rule. Nothing else may add one:
  - Task details, 960px: a workspace overlay ([Tasks](../../../../../design/patterns/tasks.md)).
  - Search, 720px, a `DialogContent` with `placement="top"`, its top edge over the top bar's field through `--dialog-top` ([At the top](#at-the-top), [Search](../search/search.md)).
  - The showcase frame, 720px wide and about 520px high, shared by steps 3 to 5 of onboarding, the Upgrade to Pro dialog and Pro's Add seats dialog (cindyz, 2026-10-26: adding seats is a paywall, like upgrading), and used by nothing else ([Onboarding](../../../../../design/products/raft-chat/onboarding.md)).
  - [AnnouncementDialog](../announcement-dialog/announcement-dialog.md), 576px: its picture and one-paragraph text read best there; at 640px the text runs past 80 characters a line.
  - An attachment preview, as wide as the file needs, up to 768px.
- On a narrow screen every size is as wide as itself or the window less 32px, whichever is smaller, so at 390px each one is 358px wide. Its height and the wide dialog's sections are in [Behavior](#behavior).

Deleting something large, such as an agent or a server, also asks for its name to be typed ([Forms](../../../../../design/patterns/forms.md#danger-zone)). It is still a confirmation, at `sm`, with the confirm button red ([AlertDialog](../alert-dialog/alert-dialog.md#variants)):

```example
dialog/compositions/typed-delete
```

The large form dialog uses `bar` on `DialogHeader`, `DialogBody` and `DialogFooter`: the header and footer stay in place and the body scrolls between them. The body holds `DialogNav` on the left, a `line-seam` after it, and one [FormSection](../form-section/form-section.md) per section on the right. Its structure and rules are in [Forms](../../../../../design/patterns/forms.md#the-large-form-dialog).

## The footer

Cancel comes first and the commit button last, both at the end of the footer, so the commit button is where the eye ends: bottom right. The start of the footer holds at most one quiet item, never both: a muted [TextLink](../text-link/text-link.md) that leads elsewhere, or a `DialogFooterNote` that says what the commit will do. Either one is safe to miss, because people don't look there first.

```example
dialog/compositions/footer-note
```

```example
dialog/compositions/footer-link
```

A dialog that is only read has one button, which closes it. It is still pink, so the dialog keeps one obvious way forward.

```example
dialog/compositions/footer-close-only
```

The footer stays one row on a phone, the same as on a desktop (stdrc, 2026-10-22). One layout everywhere means Cancel and the commit button are in the same place on every screen; stacking is only a fallback for a label too long for the row. So the footer stacks when its buttons don't fit on one line, at any width, and never because the window is narrow:

- The buttons stack full width, the commit button on top and Cancel under it. Cancel takes the ink border of `default` there, with its hover and press: a frameless button stretched to the full width reads as a line of text, not a button, so once buttons stack each needs its own box (stdrc, 2026-10-22). Keep writing Cancel as `ghost`; the stack gives it the frame, and it goes back to frameless when the row fits again.
- A note or a link stays first, left-aligned above the buttons.
- Write the parts in the order of the row: the note or the link first, then Cancel, then the commit button. The footer turns the stack around on screen only: Tab still goes Cancel then commit, so in the stack focus moves up from Cancel to the commit button ([Accessibility](#accessibility)).

Use a note only in a `size="lg"` or `size="wide"` dialog, and keep it to 40 characters. Put `DialogFooterNote` directly in `DialogFooter`, before the buttons: the footer then holds the buttons as one group. On a desktop the note is one line and never wraps, and it is never cut. It sits beside the buttons when both fit on the line; when they don't, it goes above them and the buttons stay one row at the end, so they never leave the footer's padding. A link at the start does the same. A smaller dialog has no room for a note beside its buttons: a development build warns when a note is in a `sm` or `md` dialog, the default included, unless a `className` sets the dialog's width instead (one of the exceptions in [Variants](#variants)). On a phone, above the buttons, the note has the footer's full width and may wrap to 2 lines. Anything longer belongs in the body.

When the dialog is a sheet on a phone ([On a phone](#on-a-phone)), it has no footer, so the note, or a link written first, moves to the end of the body, in the same muted footnote text, left-aligned, at most 2 lines. The sheet's commit button in its head does what the note describes.

## Behavior

- A centered dialog appears and disappears without animation, always over the scrim ([Motion](../../../../../design/foundations/motion.md#usage)). On a phone a dialog with fields is a sheet that slides up instead ([On a phone](#on-a-phone)).
- Esc, × and Cancel close a dialog. A click on the scrim closes a small dialog, except one drawn as a sheet on a phone ([On a phone](#on-a-phone)).
- Esc closes only the topmost thing that is open. A Menu or a Select opened from the dialog closes on Esc and the dialog stays open; the next Esc closes the dialog. In a widget of your own that closes on Esc, such as a suggestion list in a text box, call `event.stopPropagation()` in its `onKeyDown`, not only `preventDefault()`: Base UI closes the dialog on every Esc that reaches it, prevented or not. When you can't change the widget, cancel the close in `onOpenChange` on `Dialog` when `details.reason` is `"escape-key"` and `details.event.defaultPrevented` is true.
- Don't close a large form dialog on a click outside it: pass `disablePointerDismissal` on `Dialog`, so a half-filled form isn't lost to a stray click.
- A centered dialog on a narrow screen keeps a 16px margin on each side and never grows taller than the window less 32px.
- On a desktop and a tablet, a dialog with `placement="top"` sits near the top of the window instead of the middle ([At the top](#at-the-top)).
- On a phone a centered dialog moves up while the on-screen keyboard is open, and goes back to the middle when it closes ([On a phone](#on-a-phone)).
- Below 768px the wide dialog hides `DialogNav` and the sections follow one another.
- `DialogFooter` keeps its buttons in one row at every width. It measures the row laid out as a row, and only when its children run past the footer does it set `data-stacked` and stack them full width, the commit button on top ([The footer](#the-footer)). Content that may shrink, such as a label that truncates or wraps, shrinks first, so only what can't, the buttons, makes the footer stack. It measures again when the dialog resizes, a label changes or a font loads, and not at all while the footer is hidden in a sheet. A button wrapped in another element, such as a tooltip's trigger, fills the width too. `AlertDialogFooter` does the same.
- A footer that sets its own layout with `className`, such as a checkbox beside the button or a pair of links, is measured the same way and needs nothing more: it keeps that layout while its content fits on one line, and stacks only when it doesn't. Give text that may give way `min-w-0` (and `truncate` to cut it), so it shrinks before the footer stacks.
- A dialog opened from a dialog or a sheet draws its own, lighter scrim over the one below ([Stacked overlays](../../../../../design/foundations/elevation.md#stacked-overlays)). Render it inside the first one and this happens by itself. `layer={1}` is only for a dialog rendered outside the first one's tree: it lifts the dialog and its scrim above the first. What is lifted is the dialog's portal, to `z-dialog-layer` as a stacking context of its own, so a Select list or a menu opened from the card, which Base UI portals into the same element, is drawn over the card; the scrim follows the card, so a `layer` in `overlay` is ignored there. Before, the card and the scrim were lifted and the list stayed at `z-popup`, under both, and an app had to portal each list into the dialog's body.
- A Select list, a menu or a popover opened from a dialog is portaled beside its card, inside the dialog, so it is drawn over the card and its head, and focus and a press on it stay inside the dialog. Don't pass it a `container` inside the dialog's scrolling body to get that: a ScrollArea is a stacking context of its own, so a list portaled into one is drawn under the head whenever it reaches it ([ScrollArea](../scroll-area/scroll-area.md#rules)). In a phone sheet the list also stays under the head ([Popups in a sheet](#popups-in-a-sheet)).
- An app's own modal (its own backdrop, Esc and focus, on `DialogSurface`) joins the same stack with `OverlayLayerProvider` and `useParentOverlayKind` from `@botiverse/raft-ui/wip` ([Stacked overlays](../../../../../design/foundations/elevation.md#stacked-overlays)).

### At the top

On a desktop and a tablet, a dialog that grows out of something near the top of the window takes `placement="top"`, so it opens where people were looking. Search is the case today: the panel's top edge covers the top bar's field, so the field seems to grow into it ([Search](../search/search.md)). Centered, it would open somewhere else, and on a tall window far from the field.

- The dialog stays centered across. Its top edge sits at `--dialog-top`, 8% of the window's height down when nothing sets it.
- It never grows past the window's bottom less 16px, so it ends on screen however low its top is; its body scrolls instead. Its width still comes from `size`.
- To put the top edge on something, the app measures that thing as the dialog opens and sets `--dialog-top` in the `style` of `DialogContent`. raft-ui measures nothing and knows nothing of what the dialog is anchored to.
- Below 768px it does nothing: the dialog sits in the middle like every other, and `--dialog-top` is ignored. Like every centered dialog there, it moves up only while the on-screen keyboard is open ([On a phone](#on-a-phone)).
- `DialogSheetContent` takes it too, on a desktop and a tablet. On a phone a sheet is docked to the bottom and ignores it.

```example
dialog/compositions/top-placement
```

### Scrolling in a ScrollArea

`DialogBody` scrolls natively, so on Windows, and on a Mac set to always show scrollbars, a long body draws the platform's scrollbar, which takes room from the body's width when it appears. With `unstable_scrollArea` the body is a [ScrollArea](../scroll-area/scroll-area.md) instead: it scrolls the same way and draws raft-ui's scrollbar, which takes no room and looks the same on every platform and in both themes.

```example
dialog/compositions/create-agent
```

- It is opt-in for now and becomes the default in a later minor release. Nothing else about the body changes, so when it is the default, delete the prop.
- Use it for a body that can grow past the window: a form of many fields, a long list, a long text. A body that never scrolls draws no scrollbar either way.
- The body scrolls sideways too when something in it is wider than it (a wide table, a line that doesn't wrap, a `<pre>`, an image), as the native body does: the dialog keeps its width, and a horizontal scrollbar shows along the body's bottom edge, over the footer. A body with nothing wider than itself scrolls down only and draws no horizontal scrollbar. Sideways, the whole body moves, its fields with the wide part, so for a wide table prefer `TableScroll` ([Table](../table/table.md#wide-tables)) around it: then only the table scrolls. In a body laid out as a grid (`className="grid gap-4"`) one wide child also makes every row as wide as itself, with or without the prop, since the grid's one column takes the width of its widest item; a `TableScroll` around the wide child, or `grid-cols-[minmax(0,1fr)]` on the body, keeps the rows the body's width.
- The body is still the element with `data-slot="dialog-body"`. It takes `className`, `ref`, the native props and the children as before, so a layout written on it (`className="grid gap-4"`) is unchanged, and nothing is put inside it beside its children. It uses ScrollArea's [absolute gutters](../scroll-area/scroll-area.md#gutters-position): a frame, `data-slot="dialog-body-frame"`, is rendered around the body and holds the scrollbar.
- The frame, not the body, is the child of `DialogContent`. A class that sizes the body in the dialog (`max-h-*`, `h-*`, `flex-*`) goes in `wrapperClassName`, which is the frame's; padding and layout stay in `className`. A selector of your own that reaches the body as a child of the content (`[data-slot=dialog-content] > [data-slot=dialog-body]`) no longer matches: select the frame, or the body as a descendant.
- The body is a Tab stop only while it overflows and holds nothing that takes focus, as a native scroller is. A form adds no stop: Tab goes from the head to the first field, and the keyboard scrolls the body from whatever inside it has focus. A long text that is only read can be reached with Tab and scrolled with the arrow keys. A `tabIndex` of your own wins.
- A scroll that reaches the body's end stops there, and a Mac trackpad or iOS still bounces the body (`overscroll="contain"`, as in a [Panel](../panel/panel.md#anatomy)).
- For a header or a footer stuck inside the body (`position: sticky`), keep the scrollbar clear of it from the frame: `wrapperClassName="[--r-scroll-area-rail-inset-bottom:56px]"` ([Edge state](../scroll-area/scroll-area.md#edge-state)).
- The frame is a stacking context of its own, as every ScrollArea is: a popup given a `container` inside the body is drawn under the dialog's head. Leave popups where raft-ui portals them, beside the card.
- In a phone sheet ([On a phone](#on-a-phone)) it is the same body: it scrolls under the head on the 16px margin, keeps the home indicator's inset, and holds the footer's note at its end.
- A `bar` body ignores it. On a desktop a `bar` body doesn't scroll: the sections inside it do, and its `DialogNav` is a ScrollArea already. In a phone sheet a `bar` body still scrolls natively.

## On a phone

Below 768px a dialog stays centered unless it has several fields, a long list or steps, in which case it becomes a sheet (stdrc and Artea, 2026-10-21). On a desktop and a tablet every dialog stays centered.

A dialog that stays centered keeps its footer in one row, as on a desktop. It stacks only when the buttons don't fit, the commit button on top ([The footer](#the-footer)).

| What the dialog holds                                                                                                                                               | On a phone                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A decision: a statement and buttons, at most a few fixed choices, nothing typed (every confirmation; archive, stop, reset)                                          | The centered dialog, as on a desktop                                                                                                                                 |
| One input or one text box and its buttons: a confirmation that asks for a typed name, naming a section, editing a display name or a description, a reason to reject | The centered dialog, as on a desktop. While the keyboard is open it moves up, so the keyboard doesn't cover the field or the buttons ([The keyboard](#the-keyboard)) |
| Several fields, a long or searchable list to pick from, or steps: forms, pickers, wizards                                                                           | A sheet 90% of the screen tall                                                                                                                                       |
| Content that is only read: role help, release notes, an app's details. It is short information, so it stays a dialog                                                | The centered dialog, as on a desktop                                                                                                                                 |

The sheet:

- Rises from the bottom over the scrim, with `radius-dialog` on its top corners. The strip of page left above it shows that it is a layer over the page, not a new page.
- Its head is a pushed page's head ([Navigation](../../../../../design/patterns/navigation.md)): × at the start, the title, and the dialog's one commit button at the end, at size `md` with the same color and words as on a desktop. It has no footer: × is Cancel. In a flow of steps the button at the end is the step's (Next, then the last step's action).
- From the second step of a flow on, Back takes the place of × at the start of the head, with no × beside it (stdrc, 2026-10-22): the sheet is a stack of steps, and Back undoes one, as on a pushed page. Esc still closes the sheet from any step; on a touch screen, people go Back to the first step and close it with ×.
- A footer note, or a link written first in the footer, moves to the end of the body, in muted footnote text, left-aligned ([The footer](#the-footer)).
- The body scrolls under the head and keeps the phone's 16px margin and the home indicator's inset at the bottom.
- × and Esc close it. A tap on the scrim doesn't, so a half-filled form isn't lost to a stray tap, as with a large form dialog on a desktop. When something has been typed, ask before closing ([Asking before closing](#asking-before-closing)).
- Dragging the sheet down to close it is planned, for when the sheet moves onto Drawer's drag.
- It slides up as it opens, like every bottom sheet, and its scrim fades in with it ([Motion](../../../../../design/foundations/motion.md#usage)). With reduced motion it is simply there.
- With the on-screen keyboard up, the sheet shrinks to the space above it, so the head and its commit button stay in view.
- An alert or a warning or destructive Banner that appears in the body after it opens, such as the error a failed commit adds, is scrolled into view: the button that caused it is at the top.

### The keyboard

Every centered dialog on a phone moves up while the on-screen keyboard is open, whatever its `placement`, and no app opts in. A centered dialog covered by the keyboard is always wrong: the field people are typing in, or the buttons under it, are out of sight. So this is the platform's behavior, not a choice per dialog (stdrc, 2026-10-21: centered unless the keyboard is open).

- Its top edge goes where the phone's top bar ends: `--header-height` below the top of what is visible, under the status bar.
- It ends at least 16px above the keyboard. When it is taller than that, its body scrolls.
- When the keyboard closes, it goes back to the middle.
- The keyboard counts as open only while a text field has focus and the visible area is more than 100px shorter than the window, so a short window with nothing to type in doesn't move it.
- A sheet doesn't move: it shrinks to the space above the keyboard instead.

### Popups in a sheet

A Select or Combobox list, a menu or a popover opened from a field in a sheet stays in the sheet, under its head: it flips to the other side of its field and shrinks to the room between the head and the bottom of what is visible of the sheet, and its rows scroll. Nothing is passed for this: every raft-ui popup with no `collisionBoundary` of its own takes the sheet's, decided for that popup each time it is placed.

- Why: a popup otherwise keeps to the window. With the keyboard up the sheet is all that is left of the screen, and a list that flipped upward covered the head, the title and the commit button with it, and ran past the sheet's top edge.
- The room ends at the sheet's bottom edge, or at the top of the on-screen keyboard when that is higher (the visual viewport's bottom): what counts is what can be seen.
- A popup anchored in the head is left alone: a tooltip, a menu or a popover on a head button opens where it asks to, a tooltip above the button and over the scrim, as outside a sheet. Held under the head it would be pushed down over the sheet's content.
- A popup anchored in the sheet's body is always bounded, however little room its field has: the list takes the larger side, above or below the field, is as tall as that side less 12px (4px from the field, 8px from the edge of the area), and its rows scroll. Why: on a small phone with the keyboard up, a field in the middle of a sheet has about 130px on each side, and that is the commonest case, not a rare one. A list let over the head there covers the title and the commit button, or, portaled into the sheet's scrolling body, is drawn under the head, where its first rows can be neither seen nor pressed. A short list that scrolls can be used; one hidden under the head can't. No popup sets a least height, so with 60px on the larger side a list is 48px tall, about one row.
- It is drawn over the sheet's content, as from any dialog ([Behavior](#behavior)).
- A dialog, an alert dialog, a drawer or a lightbox opened from the sheet starts again: its popups keep to the window, or to its own sheet. So does an app's own surface inside `OverlayLayerProvider`.
- A centered dialog bounds nothing: a list opened from a small card may run past the card's edge, over the scrim, as it always has.
- To opt one popup out, pass it `collisionBoundary="clipping-ancestors"`, Base UI's default, and it keeps to the window. Any `collisionBoundary` you pass wins; leaving it out, or passing `undefined`, takes the sheet's.
- A sheet you draw yourself, with its own surface, a head that stays put and a body that scrolls, gets the same from `SheetPopupBoundary` (`@botiverse/raft-ui/wip`): wrap the body in it, or the head and the body, and give it the head's ref as `head`. The sheet's bottom edge is the head's parent's, or `surface`'s when the head is nested deeper. It renders no element. When the sheet is also an `OverlayLayerProvider`, put `SheetPopupBoundary` inside it.
- Which element a popup is anchored to is read from the page: the open trigger whose `aria-controls` names the popup's list or panel, and for a tooltip or a preview card, which nothing names, the one open trigger of its kind. A popup whose anchor can't be told, such as a context menu at the pointer, stays bounded.
- Two tooltips open at once, or two preview cards, can't be told apart in a sheet you draw yourself, where a head button's tooltip is under `SheetPopupBoundary` when it wraps the head: nothing names either, so both stay bounded, and one anchored in the head can flip downward, over the sheet's content. In `DialogSheetContent` and `Drawer` the head starts outside the sheet, so its tooltips are never bounded. Wrap only the body, or pass the tooltip its `anchor`.
- A popup given an `anchor` is decided by it, and nothing is looked up in the page: an element, a ref, or a function that returns one is in the head or isn't, like a trigger. A virtual element (an object with `getBoundingClientRect`, such as a text selection) has no element to find in the head, so it is in the head when the middle of its rect is. An `anchor` that is empty when the popup is placed, a ref not yet set, falls back to the trigger.
- In Safari on iOS the page pans under the keyboard, and the boundary is moved by the visual viewport's offset so it stays on the head: twice for a popup fixed to the window, once for one with `positionMethod="absolute"` or portaled into a transformed element such as a drawer (`@floating-ui/dom` 1.8 takes that offset from a boundary rect, and adds it to the field only for a popup fixed to the window). A rect you pass as `collisionBoundary` yourself is not corrected.

### Making a dialog a sheet

Write the dialog as it is on a desktop and swap `DialogContent` for `DialogSheetContent`, and the commit `Button` for `DialogCommit`. Nothing else changes, and on a desktop nothing changes at all. Below 768px:

- `DialogHeader` becomes the pushed page's head: its `DialogClose` goes first, as the head's ×, and its `DialogTitle` follows. Give the header a `DialogClose` as a direct child: it is the only way out of the sheet. One wrapped in a Tooltip, a Fragment or a component of your own isn't found and stays after the title; in development the head warns about it in the console.
- The head has room for one line, the title. A `DialogDescription` goes at the top of `DialogBody` in a sheet dialog, not in `DialogHeader`.
- `DialogCommit` moves to the end of the head at `size="md"`, with the same variant, words, disabled and loading state. A `type="submit"` button stays its form's default button: it is tied to the form it was written in by the form's `id`, so a click and Enter in a field still submit, and neither does while it is disabled. Give that `form` an `id` (or pass `form` to `DialogCommit`); without one a click still submits but Enter in a field doesn't, and only on a phone, so in development `DialogCommit` warns about it in the console, as it does when a submit `DialogCommit` has no form to submit.
- `DialogFooter` is hidden, and with it Cancel and any other button in it, such as a step's Back. A `DialogFooterNote`, or a `TextLink` written first in the footer, moves to the end of `DialogBody` instead, left-aligned in muted footnote text; keep the note to 40 characters, so it is at most 2 lines there.
- `DialogBody` scrolls under the head on the phone's 16px margin, with the home indicator's inset at the bottom. A wide dialog's `bar` body does the same: its `DialogNav` is hidden and its sections follow one another.

```example
dialog/compositions/sheet-form
```

In a flow of steps, write each step's button as a `DialogCommit`: Next, then the last step's action. From the second step on, put a `DialogSheetBack` in `DialogHeader`: on a phone the head shows it at its start and leaves out the `DialogClose`, so a later step has Back and no ×; on a desktop it draws nothing and Back stays in the footer.

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

- Title the dialog with the words of the button that opened it, or Edit and the item's name. Label its main button with the action it performs, without the object: usually the title's verb (Create channel → Create); an Edit title's button is Save, and the other one Cancel ([Writing](../../../../../design/content/writing.md#actions-and-their-dialogs)).
- Set body text in `foreground-muted`, below a title in `foreground`. Their type styles are in [Typography](../../../../../design/foundations/typography.md).

## Accessibility

- Dialog wraps the Base UI Dialog. It provides the `dialog` role, the focus trap, Esc and focus return to the trigger.
- Give every dialog a `DialogTitle`. It becomes the dialog's accessible name, and it is what a screen reader announces on open.
- `DialogDescription` becomes the dialog's description.
- The focus order and the reading order are the markup's: the note or the link, Cancel, then the commit button. In the row that is the order seen. When the buttons stack, the commit button is drawn on top but stays after Cancel in the markup, so focus goes up from Cancel to it, as it would in any browser. The footer doesn't use `reading-flow` to follow the stack: the dialog's focus trap wraps in markup order, and a visual order fights it, trapping Tab on Cancel and leaving the commit button unreachable (Jasper, 2026-10-22).
- To have the note read with the commit button, give the note an `id` and the button `aria-describedby`.
- The × of `DialogClose` is labeled "Close". Pass `aria-label` to change it.
- In a sheet the head puts × (or Back) first in the DOM, so Tab and a screen reader meet the head in the order it is seen: ×, the title, the commit button. The title stays the dialog's accessible name.
- `DialogSurface` has no behavior of its own. The app that uses it must add the `dialog` role, `aria-modal`, a name, the focus trap, Esc and the scrim.

## Rules

- Put at most two buttons in the footer: Cancel first (`variant="ghost"`), the confirm button last. They stay one row on a phone; only when they don't fit do they stack, the confirm button on top and Cancel framed.
- Put at most one item at the start of the footer: a muted `TextLink` or a `DialogFooterNote`, never both. Never put an action that changes something there, and never something people need to decide; that goes in the body.
- Use a `DialogFooterNote` only in a `size="lg"` or `size="wide"` dialog, and keep it to 40 characters: it never wraps on a desktop.
- Build the footer from `DialogFooter`, not a row of your own: it holds the spacing, the order and the stack when the buttons don't fit.
- Make the confirm button pink (`variant="primary"`) when it does something. Color it by its consequence when it interrupts or can't be undone ([AlertDialog](../alert-dialog/alert-dialog.md#variants)).
- Put anything people must read before they act in a [Banner](../banner/banner.md) inside the body ([Feedback](../../../../../design/patterns/feedback.md#errors-by-scope)).
- Pad every size by 20px. Its width comes from `size` ([Variants](#variants)), never from a class of your own, except the exceptions listed there.
- Don't pass `overlay={false}` in product code: every centered dialog has the scrim, without exception.
