---
title: Drawer
summary: A panel that slides in from the right for details and settings people look at for a while, and on a phone a bottom sheet for picking a place to go or reading a short explanation.
status: stable
aliases: [Sheet, BottomSheet]
layer: core
category: overlays
related: [dialog, form-section, dropdown-menu, preview-card, thread-panel]
redirectFrom: [decisions/0022-floating-drawers-and-sheets, decisions/0027-modal-drawer-scrim]
---

# Drawer

A drawer slides in from the right with details and settings that people look at for a while, scroll and edit, such as the details and members of #launch-week. The page stays in place behind it, under a scrim. On a phone the same component rises from the bottom as a bottom sheet: to pick a place to go, or to read a short explanation with one button.

```example
drawer/compositions/responsive-placement
```

## When to use

| Situation                                                      | Use                                                                                                                                                      |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Details or settings people read, scroll and edit               | Drawer, from the right                                                                                                                                   |
| A large form filled in one pass: registering or editing an app | The wide [Dialog](../dialog/dialog.md), not a wide drawer ([Forms](../../../../../design/patterns/forms.md#the-large-form-dialog))                       |
| Switching server, on a phone                                   | Not a drawer: a popover under the top bar ([Navigation](../../../../../design/patterns/navigation.md#servers)). Working now is a popover, on a phone too |
| A sentence or two and one button, on a phone                   | A bottom sheet                                                                                                                                           |
| Acting on one thing                                            | A menu ([DropdownMenu](../dropdown-menu/dropdown-menu.md), [ContextMenu](../context-menu/context-menu.md)), never a bottom sheet                         |
| Picking a value, such as sort order or status                  | The list of a [Select](../select/select.md), or radio items in a menu                                                                                    |
| Confirming                                                     | [AlertDialog](../alert-dialog/alert-dialog.md)                                                                                                           |
| A glance on hover                                              | [PreviewCard](../preview-card/preview-card.md)                                                                                                           |
| A thread or a profile kept open beside the conversation        | A side panel ([ThreadPanel](../thread-panel/thread-panel.md), [Panel](../panel/panel.md)), which is not a drawer and has no scrim                        |

## Anatomy

- `Drawer`: the root. Its `swipeDirection` sets the edge it comes from. Required.
- `DrawerTrigger`: the button that opens it.
- `DrawerContent`: the surface, portaled, with the scrim (`DrawerOverlay`) behind it when the drawer is modal. Required. It is `layer-popover` with a `line-seam` edge and `shadow-float`, like every other popup, not an ink border and a hard shadow: every floating surface uses the same shadow ([Elevation](../../../../../design/foundations/elevation.md)).
- `DrawerHeader`: the title row. In a drawer from the right it is 56px tall, with a `line-seam` under it and `DrawerClose` at its end.
- `DrawerTitle`: the title. Required, unless the content has an `aria-label`.
- `DrawerDescription`: a sentence under the title.
- `DrawerBody`: the content. It scrolls.
- `DrawerFooter`: the bottom bar. In a drawer from the right it has a `line-seam` over it.
- `DrawerActions`: the buttons in the footer, in a row at the end in a drawer and stacked full width in a bottom sheet.
- `DrawerClose`: closes the drawer. Without children it is the × icon button; with `render` it turns another button into a close button.
- `DrawerPortal` and `DrawerOverlay`: lower-level parts.

## Variants

| Variant                           | Use for                                                                                         |
| --------------------------------- | ----------------------------------------------------------------------------------------------- |
| `swipeDirection="right"`          | The drawer: details and settings on desktop, at most 420px wide and the full window height      |
| `swipeDirection="down"` (default) | The bottom sheet, on a phone                                                                    |
| `snapPoints`                      | A bottom sheet that opens to a summary and expands to its full height. It shows the grab handle |

```example
drawer/compositions/snap-points
```

## Behavior

- A drawer slides in from its edge with `ease-slide`. It is the only overlay that moves, because the slide shows where it came from ([Motion](../../../../../design/foundations/motion.md#usage)).
- A modal drawer puts the same scrim as a dialog over the rest of the page: the page can't be used while the drawer is open, and the scrim says so. A click on the scrim closes it. A bottom sheet has the scrim too.
- Swiping toward its edge dismisses a drawer.
- A drawer opened from a drawer stacks on top of it, and the one below steps back.
- On a phone, a drawer from the right fills the screen and works as a page: no ×, and Back at the top left.
- A bottom sheet rises to at most 82% of the window height, with `radius-dialog` on its top corners, and keeps clear of the home indicator.

```example
drawer/compositions/nested-close-callback
```

## Content

- Title it with the words of the button that opened it ([Writing](../../../../../design/content/writing.md#actions-and-their-dialogs)).
- In a bottom sheet, write the explanation in one or two sentences, in `foreground-muted`, and its button as one action in Title Case: Got It.

## Accessibility

- Drawer wraps the Base UI Drawer. It provides the `dialog` semantics, the focus trap of a modal drawer, Esc, swipe to dismiss, and focus return to the trigger.
- Give every drawer and bottom sheet a title: a visible `DrawerTitle`, or at least an `aria-label` on `DrawerContent`.
- The × of `DrawerClose` is labeled "Close". On a phone, give the Back button that replaces it an `aria-label` ("Back").
- The grab handle is hidden from assistive technology. Never make swiping the only way to close: keep ×, Back or a button in the sheet.

## Rules

- Keep a drawer to 420px at most. A form that needs more room is the wide [Dialog](../dialog/dialog.md).
- Make the × the same icon button as in a panel header, with the same icon size, and put it last in `DrawerHeader`: its icon box ends on the margin, and a Back that replaces it on a phone starts on it ([Alignment](../../../../../design/foundations/alignment.md#the-ends-of-a-header)).
- Put the buttons in the footer, never in the header. They are `size="lg"` (44px on a phone, 32px on a desktop): Cancel first, Save last ([Forms](../../../../../design/patterns/forms.md#forms-in-a-dialog)).
- Split a long form in a drawer into [FormSection](../form-section/form-section.md) parts, the same sections as in the wide dialog, and save them all together with the footer's Save.
- Under each yes-or-no checkbox in a drawer form, add a line that says what happens when it is unchecked. It is a checkbox, not a switch, because the form is saved ([Forms](../../../../../design/patterns/forms.md#forms-in-a-dialog)).
- Give every bottom sheet a grab handle at its top edge.
- In a bottom sheet list, make each row 52px tall, with a 20px icon and the label in `text-body`, medium. Mark the current row with a check mark and bold text.
