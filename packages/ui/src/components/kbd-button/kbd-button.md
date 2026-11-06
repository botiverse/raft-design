---
title: KbdButton
summary: The button around a shortcut that people can change, with its recording and invalid looks; a shortcut that can't be changed stays a KbdShortcut.
status: experimental
aliases: [Shortcut binding, Shortcut recorder, Keybinding, Hotkey input]
layer: core
category: inputs
related: [kbd, list-row, banner, tooltip]
---

# KbdButton

KbdButton is the control around a shortcut that people can change, in a list of shortcuts. It wraps a `KbdShortcut` at `md`; a click turns it into a field that records the next shortcut. Kbd itself is never a control, so the button carries the hover, the focus ring and the click, and the caps stay the same caps a read-only list shows.

```example
kbd-button/compositions/states
```

## When to use

| Situation                                                                      | Use                                                                                                                            |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| A shortcut people can change, in a shortcuts panel                             | KbdButton around a `KbdShortcut` at `size="md"`                                                                                |
| A shortcut people can't change: read-only, set by the app menu, a phone's list | `KbdShortcut` at `md`, with no button ([Kbd](../kbd/kbd.md)); a lock icon before it says why where it can't be changed yet     |
| The shortcut of an action, in its tooltip or menu item                         | `KbdShortcut` at `sm` ([Tooltip](../tooltip/tooltip.md), [Kbd](../kbd/kbd.md#menus))                                           |
| A choice between a few fixed keys, such as Enter or ⌘ Enter to send            | A [SegmentedControl](../segmented-control/segmented-control.md) or a [Select](../select/select.md): there is nothing to record |

Use it only where the binding is editable. A button that can't change anything is an enabled control with no effect; a read-only binding stays Kbd, so a list shows at a glance which shortcuts can be changed.

## Anatomy

- `KbdButton`: the native button. Required. Put a `KbdShortcut` at `md` in it: at rest the current keys, while recording the keys held so far.
- `KbdButtonPlaceholder`: the consumer's prompt in a recording KbdButton before any key ("Press a shortcut"), or the word for a command that has no shortcut ("No shortcut"). Optional.
- `KbdButtonCaret`: a caret after the held keys, while the field waits for more. Optional: leave it out once the keys have landed, refused or held for a choice.

A mark that a shortcut was changed (a yellow dot before the row's label, and its default on the row's second line) and a Reset button belong to the row, not to KbdButton: they are the product's state.

## States

| State          | Looks                                                                                                                                                                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| At rest        | The caps alone, with no frame: the list reads as the read-only list does.                                                                                                                                                                        |
| Hover          | The medium tier and a `line-hairline` inside the button's `radius-chip` box, 4px around the caps ([Hover and press](../../../../../design/foundations/states.md#hover-and-press)).                                                               |
| Keyboard focus | The focus ring around the same box.                                                                                                                                                                                                              |
| `recording`    | A field: the control height (34px with a mouse, 44px on touch), `layer-card`, a 1.5px `line-field` border, the control radius and, when it was reached from the keyboard, the focus ring; the caps 8px from its start. It sets `data-recording`. |
| `invalid`      | The caps take `danger-soft` with `danger-strong` text and line, and a recording field a `danger-strong` border. It sets `data-invalid`.                                                                                                          |

Started with a click, the field shows no ring, as a text field clicked with the mouse shows none: its border, the caret and the row's highlight mark it, and the person just pointed there ([Focus](../../../../../design/foundations/states.md#focus)). Started with Enter or Space, it keeps the ring.

The caret doesn't blink: it marks where the next key lands, and a blink in a list people read is motion that says nothing new ([Motion](../../../../../design/foundations/motion.md)).

## Sizes

- At rest the button's box reaches 4px past the caps on every side, 32px tall around 24px caps, and a negative margin takes the 4px back, so the caps sit exactly where a read-only `KbdShortcut` sits: on the row's trailing edge, centered on the row, and the row keeps its height. Its hit area reaches 44px ([Accessibility](../../../../../design/foundations/accessibility.md)).
- Recording, the field is the control height, as tall as the fields and buttons beside it, and its margin takes back what it adds over the caps: (34 − 24) / 2 = 5px with a mouse and 10px on touch. Keep at least that much between the caps and the row's edges: a ListRow's 12px does ([ListRow](../list-row/list-row.md)). The field grows toward the start, so its end stays on the row's trailing edge.

## Behavior

KbdButton draws the states; the product records the keys.

- A click or Enter starts recording. While recording, every key press is the shortcut: prevent its default, show the held modifiers live, and land the shortcut on the first key that isn't a modifier.
- Esc, a click elsewhere or leaving the panel cancels, and nothing is saved until a valid shortcut lands.
- Let Tab with no modifier leave the field and cancel, so recording never traps the keyboard.
- Keys that can't be used (one the browser or the system keeps, a single key) stay in the field as `invalid`, with the reason on the row's second line, until the next key press; recording stays open.
- Keys that belong to another command are held, not saved: keep the field, drop the caret and attach a notice under the row with Cancel and the choices ([Banner](../banner/banner.md#attached-to-a-list-row)).

```example
kbd-button/compositions/shortcuts-panel
```

## Accessibility

- KbdButton is Base UI's Button, a native `button`. It has no words of its own: name it with `aria-label` that names the command ("Change the shortcut for Search"). The caps' visually hidden words are replaced by that name.
- Pass the current shortcut in `aria-keyshortcuts` (`Meta+K`), so a screen reader can say it; leave it out for a command with no shortcut.
- `data-recording` and `data-invalid` are styling hooks, not announcements. Point `aria-describedby` at the row's second line, where the product writes the instruction ("Press the new shortcut, Esc to cancel") or the reason it refused the keys.
- When a notice attached to the row closes, move focus back to the KbdButton, so it isn't left on the document.
- Don't add `aria-pressed`: recording is not a toggle that stays on, and a pressed button says the wrong thing.

## Rules

- Use KbdButton only where the binding can be changed, and never disable it: a shortcut that can't be changed is a `KbdShortcut` with no button.
- Put one `KbdShortcut` at `md` in each KbdButton. Alternatives ("⌘↑ / ⌘↓") are two KbdButtons with the "/" between them, as in a read-only list ([Kbd](../kbd/kbd.md#spacing-and-shape)): each is its own binding.
- Don't put a label, an icon or "+" in the button: the row's label says what the shortcut does, and the caps are the value.
- Say why the keys were refused in words, on the row's second line, not only with the danger tint ([Color](../../../../../design/foundations/color.md#meanings-of-color)).
