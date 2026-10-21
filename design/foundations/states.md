---
title: States
summary: How hover, press, focus, selection, unread, disabled, error and busy look, shared by every component.
---

# States

Every component shows its interaction states the same way. A component doc only describes a state when it differs from this page.

## Principles

- **Hover and press add an overlay.** They never change the fill; see [Motion](./motion.md). A row's hover is the lightest step people can see, lighter than its press and than any selection ([Row hover](#row-hover)). Text that can be clicked has no box to lay an overlay on, so it underlines on hover instead ([Clickable text](#clickable-text)).
- **Selection has three meanings, and three looks.** Where you are in navigation is yellow, the item singled out in content is cyan, and a chosen value is ink.
- **Disabled looks the same everywhere** and doesn't react to hover or press.

## Usage

| State | Look |
| --- | --- |
| Hover, keyboard highlight | Menus, select lists and the quick reactions in a menu fill with `brand-soft`; so does the keyboard highlight in search results. Buttons lay the pressed overlay over themselves on hover. Rows lay a lighter one: `fill-row-hover`, and `fill-message-hover` on a message ([Row hover](#row-hover)). A toolbar's actions are buttons, not menu rows, even in a toolbar that floats like a menu (the one over selected text): they hover grey with `fill-pressed`, never `brand-soft` |
| Press | The pressed overlay: `fill-pressed`, `sticker-pressed` or `fill-frame-pressed` ([Color](./color.md#pressed-overlays)), on rows too. A text button lights up its hit area when pressed |
| Focus | See [Focus](#focus) |
| Selected: navigation | A yellow sticker: sidebar rows, segmented controls, tabs, the tab bar's icon. On the yellow frame in light mode, the rail's selected item is a white sticker; in dark mode it is yellow |
| Selected: content | `info-soft`: the open item, the message someone jumped to, an active filter |
| Selected: value | Ink: a checked checkbox or radio. In a menu, the current value has a check mark and bold text |
| Unread | Bold text and a pink count. When someone mentions the person, a yellow @ marker replaces the count. On an icon, one pink pixel. The selected item never shows either |
| Disabled | `fill-muted` fill, `line-hairline` or `foreground-disabled` border, `foreground-disabled` text. The same for buttons, bordered icon buttons, inputs, selects, checkboxes, radios, switches, segmented controls and tabs. Frameless icon buttons and frameless buttons on the frame get no fill or border: only their icon and text turn `foreground-disabled`. List rows keep their fill: only their text and icons turn `foreground-disabled`. No reaction to hover or press |
| Display only | A row whose only interactive parts are its controls (a switch row in settings, this computer in the sidebar) is not a button: render it as a `<div>`, with no hover or press on the row, and focus only on its controls |
| Error | An input gets a `danger-strong` border and a line that says how to fix it. In a dialog, a banner. A problem with the whole server goes to the notification center; see [Feedback](../patterns/feedback.md) |
| Busy | A pixel spinner in the button, and a label that says what is happening. Anywhere else the spinner matches what it stands in for: in a line of text it keeps the line's height; in place of a panel's or a list's content it is `md` or `lg`, with a line in `text-callout` or `text-body` and `foreground-muted` ([Spinner](../../packages/ui/src/components/spinner/spinner.md#size)) |

## Row hover

A row is anything whose whole width is one target: a message, a sidebar item, a list row, an inbox item, a search result, a table row, a file row. Its hover says "the pointer is here, and this is what a click or the toolbar acts on". That is all it has to say, and people read the row while the pointer rests on it, so the hover takes the smallest step they can see and leaves the text as it was.

| Row | Hover | Light | Dark |
| --- | --- | --- | --- |
| Message ([MessageItem](../../packages/ui/src/components/message-item/message-item.md)) | `fill-message-hover` | 3% ink | 2.2% ink |
| Every other row, and a [comment card](../../packages/ui/src/components/comment/comment.md) | `fill-row-hover` | 4% ink | 3% ink |
| Any row with its menu open | `fill-row-open` | 5% ink | 4% ink |
| Press, on every row | `fill-pressed` | 7.8% ink | 7.8% ink |

- **Visible.** The hover is at least one just-noticeable step from its surface: 2 or more in OKLab distance (ΔE × 100). `fill-row-hover` is 2.8 on paper in both modes, `fill-message-hover` 2.1. The light and dark alphas differ so the step looks the same in both modes: the same ink alpha shows more on a dark surface.
- **Under selection.** A hover is always lighter than the selected, jumped-to and search-hit tints on the same surface, so it never reads as one of them: on paper `info-soft` is 6.4 (light) and 4.6 (dark), `brand-soft` 8.1 and 6.1. Hover stays neutral ink; selection keeps its color ([Selected: content](#usage)). A selected row doesn't change on hover.
- **Text keeps its contrast.** On the hover, body text loses at most 5 APCA Lc on a message and 6 on a row, and `foreground-hint` stays at 4.5:1 or more on every surface ([Contrast](./color.md#contrast)).
- **A message is lighter than a row.** A message can be twenty lines tall, and the pointer rests on it while someone reads: a large area shows a smaller step just as well as a 36px row shows a larger one, so the message takes the lightest step that is still visible.
- **Press stays `fill-pressed`.** A press lasts a moment and confirms a click, so it may be strong. A button keeps `fill-pressed` for hover too: it is small, and nobody reads through it.
- **A row with its menu open is a step past its hover.** Every row, a message or any other, takes `fill-row-open` while a menu or popup it opened is up (`data-popup-open` on the row, or on a button inside it), hovered or not, and a selected row keeps its selection. The menu opens on right-click, from the row's ⋯ button, or on a phone when someone presses and holds the row. A phone has no hover, so the row's fill is the only sign of which row the menu acts on, and a hover (2.1 to 2.8) is too faint to find at a glance. With a mouse it looks the same, so "the row this menu belongs to" reads the same everywhere. On every surface a row sits on, it is a clear step and still under both selection tints:

  | Surface | `fill-row-open`, light / dark | `info-soft` | `brand-soft` | `foreground-hint` on it |
  | --- | --- | --- | --- | --- |
  | `layer-canvas` (messages, inbox, tables) | 3.5 / 3.8 | 6.4 / 4.6 | 8.1 / 6.1 | 5.1:1 / 5.8:1 |
  | `layer-sidebar` (sidebar items) | 3.5 / 4.3 | 6.1 / 6.0 | 6.1 / 7.5 | 5.0:1 / 6.7:1 |
  | `layer-card` (list rows, file rows) | 3.5 / 3.5 | 6.4 / 3.9 | 8.1 / 5.4 | 5.1:1 / 5.2:1 |
  | `layer-popover` (search results) | 3.5 / 3.4 | 6.4 / 3.6 | 8.1 / 5.0 | 5.1:1 / 4.8:1 |

  Dark mode stops at 4% because of the popover and the card: 5% would be 4.2 on a dark popover, above `info-soft`. Body text loses up to 7 Lc on it, more than on a hover, which is fine for the moment a menu is open: people are choosing an action, not reading.
- **A comment card hovers like a row.** A collapsed card is two lines of a comment on `layer-card`, read like a row; `fill-message-hover` would be 1.9 on a dark card, under the visible step.

Why: rows used to hover with `fill-pressed`, 7.8% ink. On paper that is 5.5 (light) and 7.3 (dark) from the surface, more than `info-soft` and as much as `brand-soft`, so the hover outranked the selected item. A comment card hovered with it too. On a long message it greyed a block of text: body text fell from Lc 105 to 94 in light mode, and on a dark popup `foreground-hint` fell to 4.3:1, under its 4.5:1 guarantee.

## Clickable text

Text that does something or goes somewhere, with no box, chip or fill around it: a [TextLink](../../packages/ui/src/components/text-link/text-link.md), a mention of someone else, a sender's name, the text actions under a message, a toast's action.

- Show no underline at rest, and underline the text on hover in its own color: the underline is the one hover signal for clickable text everywhere, so people learn it once. At rest, its color, its weight and where it sits say it can be clicked.
- Never turn clickable text pink on hover. Pink is the one primary action on the screen ([Color](./color.md#meanings-of-color)); a color change on hover is only the step from a muted color to the ink of body text.
- Give text that cannot be clicked no hover change at all, and take the hover underline away from clickable text when it is disabled, so a change on hover always means "this can be clicked".
- Exception: a link inside rendered message or document text ([Markdown](../../packages/ui/src/components/markdown/markdown.md)) keeps an underline at rest, because the link blue alone is too close to the body text around it: below the 3:1 that [WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) asks of a link told apart by color alone. The underline is quieter at rest and takes the full color on hover; the values are in [Markdown](../../packages/ui/src/components/markdown/markdown.md).
- Chips, cards, badges, buttons and tabs are not clickable text: they keep the pressed overlay or their own hover.

## Focus

Focus uses `focus-ring` ([Elevation](./elevation.md#focus-ring)), and it shows only when the person's last navigation input was the keyboard. The ring answers "where am I?" for someone moving with Tab and the arrow keys. A person who clicks or taps already knows where they are, since they just pointed there, and the caret marks a text field they clicked. A ring that shows up on every click, and stays on the always-focused composer, distracts and tells them nothing.

- Show the ring after keyboard navigation: Tab, Shift+Tab and F6 anywhere; the arrow keys, Home, End, Page Up, Page Down, Enter, Space and Esc outside a text field. Tabbing into a text field shows the full ring.
- Inside a text field those keys edit, so they keep the modality as it was, unless focus leaves the field right after: Esc closing the dialog the field is in, Enter submitting it, Left Arrow moving from a combobox's text to its chips. Then the person is on the keyboard, and the element focus lands on shows the ring.
- Show no ring after a click or a tap, and none when code moves focus after one (a dialog that focuses its first field, a popup that focuses its search row). A text field clicked with the mouse shows only its caret: no ring and no border change.
- Typing doesn't count as navigation. Letters, and Enter, Space and the arrow keys inside a text field, keep the modality as it was, so the composer stays quiet while someone types in it after clicking, and keeps its ring when they tabbed into it.
- Cmd and Ctrl shortcuts, and modifier keys pressed alone, don't count either. A shortcut that moves focus somewhere without a caret still gets the ring when nothing else explains the move (next rule); a shortcut that sends focus to a text field (Cmd+K) shows its caret.
- Show every ring when the input isn't a pointer we can see: before any input (the page just loaded; a keyboard user who hasn't pressed Tab yet), when focus arrives with no key or press just before it (a screen reader's browse cursor, a timer), and when a screen reader synthesizes a press (VoiceOver, TalkBack). Only a real pointer press, or real mouse movement before anything else, hides the ring. Keyboard and screen-reader users never lose it ([WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)).
- Ring the whole group for compound controls: the composer, an input with a prefix or suffix, a multi-select field. The group rings only when an element inside it has keyboard focus (`has-focus-visible`), not for any focus inside it (`focus-within`): clicking the clear button of a search field doesn't ring the field.
- Ring the box of a checkbox or radio. A hidden native input drives it.

raft-ui implements the rule with `installInputModality()`. [ThemeProvider](../about/use-raft-ui.md#theme-and-dark-mode) installs it, so an app that uses ThemeProvider gets it with no code of its own. It keeps `data-input-modality` on `document.documentElement`: absent until there is evidence, then `pointer`, `keyboard` or `virtual`. Only while it says `pointer` does styles.css empty `focus-ring`, in light and dark mode and in light or dark islands; every other value, and no value, shows the rings.

- Draw a focus indicator with `focus-visible:shadow-focus` (`has-focus-visible:shadow-focus` on a group), never `focus:` or `focus-within:`.
- Stack the `keyboard:` variant on any indicator not drawn with `focus-ring`, such as an outline or the inset ring: `focus-visible:keyboard:outline-2 focus-visible:keyboard:outline-line-strong`. It matches unless the last input was a pointer.

## Dragging on a touch screen

On a touch screen one long press can mean two things on an item that can be moved: its menu, or picking it up. Holding still is the menu; holding and then moving is the drag. This is how iOS separates them, and it means the menu and the drag never fight over the same moment.

- Arm an item after the finger holds still for 500ms, the moment raft-ui's long-press menu opens (`ContextMenuTrigger`) and iOS's long press fires, so a menu and the armed item arrive together. Android's own long press comes at 400ms: its menu shows first and stays until the drag starts.
- Start the drag on the first move of 10px after that.
- Let go of the item if the finger moves more than 10px before the 500ms are up (that was a scroll), or if a second finger comes down (a pinch).
- Lifting the finger after the hold without moving leaves the menu open and moves nothing.
- Close the item's menu when its drag starts. The component that owns the menu closes it: an app that puts its own menu on a draggable item closes it in the drag's `onDragStart` (`SortableTabsList` passes one through).
- Use the same hold, distance and tolerance for everything that can be dragged by touch (sidebar rows, tabs, task cards, attachments in the composer): raft-ui's `useHoldThenMoveTouchSensor` carries them, next to a pointer sensor that leaves fingers to it. A mouse or a pen still starts a drag after 5–6px of movement, with no hold.
- Don't let the held item select its text or open the platform's own callout (`select-none`, `-webkit-touch-callout: none`), and keep it scrollable (`touch-manipulation`, not `touch-none`).

## Related

- [Color](./color.md): the tokens named here.
- [Elevation](./elevation.md): the focus ring.
- [Feedback](../patterns/feedback.md): where errors go, by scope.
