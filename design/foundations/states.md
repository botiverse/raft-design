---
title: States
summary: How hover, press, focus, selection, unread, disabled, error, busy and autofill look, shared by every component.
---

# States

Every component shows its interaction states the same way. A component doc only describes a state when it differs from this page.

## Principles

- **Hover and press add an overlay, in two tiers.** They never change the fill; see [Motion](./motion.md). Large things people read hover with the subtle tier, small controls with the medium tier, and every press is medium ([Hover and press](#hover-and-press)). Selected items don't respond to hover, and fields don't hover. Text that can be clicked has no box to lay an overlay on, so it underlines on hover instead ([Clickable text](#clickable-text)).
- **Selection has three meanings, and three looks.** Where you are in navigation is yellow, the item singled out in content is cyan, and a chosen value is ink.
- **Disabled looks the same everywhere** and doesn't react to hover or press.

## Usage

| State | Look |
| --- | --- |
| Hover, keyboard highlight | Menus, select lists and the quick reactions in a menu fill with `brand-soft`; so does the keyboard highlight in search results. Rows, messages and readable cards lay the subtle tier, `fill-subtle`; buttons, chips, tabs and segments the medium tier ([Hover and press](#hover-and-press)). A toolbar's actions are buttons, not menu rows, even in a toolbar that floats like a menu (the one over selected text): they hover grey with `fill-medium`, never `brand-soft` |
| Press | The medium tier on everything, rows and cards too: `fill-medium`, `sticker-medium` on a colour sticker or `fill-frame-medium` on the frame ([Color](./color.md#hover-overlays)). A text button lights up its hit area when pressed |
| Focus | See [Focus](#focus) |
| Selected: navigation | A yellow sticker: sidebar rows, segmented controls, tabs, the tab bar's icon. On the yellow frame in light mode, the rail's selected item is a white sticker; in dark mode it is yellow |
| Selected: content | `info-soft`: the open item, the message someone jumped to, an active filter |
| Selected: value | Ink: a checked checkbox or radio. In a menu, the current value has a check mark and bold text |
| Unread | Bold text and a pink count. When someone mentions the person, a yellow @ marker replaces the count. On an icon, one pink pixel. The selected item never shows either |
| Disabled | `fill-muted` fill, `line-hairline` or `foreground-disabled` border, `foreground-disabled` text. The same for buttons, bordered icon buttons, inputs, selects, checkboxes, radios, switches, segmented controls and tabs. Frameless icon buttons and frameless buttons on the frame get no fill or border: only their icon and text turn `foreground-disabled`. List rows keep their fill: only their text and icons turn `foreground-disabled`. No reaction to hover or press |
| Display only | A row whose only interactive parts are its controls (a switch row in settings, this computer in the sidebar) is not a button: render it as a `<div>`, with no hover or press on the row, and focus only on its controls |
| Error | An input gets a `danger-strong` border and a line that says how to fix it. In a dialog, a banner. A problem with the whole server goes to the notification center; see [Feedback](../patterns/feedback.md) |
| Busy | A pixel spinner in the button, and a label that says what is happening. Anywhere else the spinner matches what it stands in for: in a line of text it keeps the line's height; in place of a panel's or a list's content it is `md` or `lg`, with a line in `text-callout` or `text-body` and `foreground-muted` ([Spinner](../../packages/ui/src/components/spinner/spinner.md#size)) |

## Hover and press

Hover says "the pointer is here, and this is what a click acts on"; press confirms the click. Both lay one translucent layer of ink over the resting colour, never a different fill, so the step looks the same on white, on the yellowish sidebar and on a card. There are two tiers, sized by what is under the pointer, not by which token a component happened to use: before, raft-ui had nine ways to turn a thing grey, from a step of 2.1 to 8.4 (OKLab ΔE × 100), and two cards that look alike hovered at 2.7 and 5.7.

| Tier | For | Token | Light | Dark | Step |
| --- | --- | --- | --- | --- | --- |
| **Subtle** | Hover on large things people read: a row, a message, a readable card (comment, attachment, replies bar, task card), and a row whose menu is open | `fill-subtle` (`overlay-subtle`) | 4% ink | 3% paper | 2.5 to 3 |
| **Medium** | Hover on small controls: buttons, icon buttons, chips, badges, tabs, segment items, navigation items. Press on everything | `fill-medium` (`overlay-medium`) | 7.8% ink | 6.5% paper | 5 to 6.5 |
| Medium on a colour sticker | Primary, warning and danger buttons, colour badges, a selected segment pressed | `sticker-medium` (`overlay-sticker-medium`) | 10% ink | 10% ink | 5.5 to 6 |
| Medium on the frame | Rail items, on-frame buttons, the workspace button, the notification trigger | `fill-frame-medium` (`overlay-frame-medium`, `bg-fill-frame-medium`) | 10% ink | 6% paper | about 6.4 |
| **Yellow highlight** | The current item in a popup, by pointer and keyboard: menu items, options, suggestions, quick reactions | `brand-soft` | opaque | 20% yellow | 8.1 / 5.9 |
| **None** | Selected items: a selected segment or toggle, the active sidebar item, the selected tab, a selected row. Fields: inputs, the select trigger, the search box | — | — | — | — |

- **Subtle for what people read.** A message can be twenty lines tall and a row runs the width of the panel; the pointer rests on them while someone reads. A small step shows on a large area, and body text loses at most 6 APCA Lc on it, `foreground-hint` stays at 4.5:1 or more on every surface ([Contrast](./color.md#contrast)). Messages used to hover lighter than rows (3% and 2.2%) and readable cards heavier (7.8%); now a row, a message and a card on the same screen step the same.
- **Medium for small controls.** A 32px button needs a clear answer under the pointer, and nobody reads through it. The alphas differ by backdrop so the step looks the same: the same ink shows more on dark, yellow and pink, so dark mode takes 6.5%, a sticker and the yellow frame 10%, the dark frame 6%.
- **Press is medium, everywhere.** A press lasts a moment and confirms the click, so it may be strong. A control hovers and presses with the same tier: there is no third, stronger press tier.
- **A row with its menu open is subtle, hovered or not.** Every row, a message or any other, takes `fill-subtle` while a menu or popup it opened is up (`data-popup-open` on the row, or on a button inside it); a selected row keeps its selection. On a phone, which has no hover, it is the sign of which row the menu acts on (2.5 to 2.9 off every row surface). With a mouse it is the hover it already had, so the two never stack.
- **Under selection.** Both grey tiers stay under the selection tints on the same surface, so a hover never reads as selected: on paper `info-soft` is 6.4 (light) and 4.6 (dark), `brand-soft` 8.1 and 6.1. Hover stays neutral ink; selection keeps its color ([Selected: content](#usage)).
- **Selected items don't respond to hover.** Selection is the strongest signal on the item; darkening it on hover adds nothing and makes it look like something else. A selected segment or toggle, like a selected tab and the active sidebar item, keeps its look under the pointer; pressing it lays the medium tier.
- **The yellow highlight is the popup's cursor, not a grey.** It moves with the pointer and the keyboard alike. In dark mode it is 20% yellow: at 16% it was 5.0, weaker than the button hover beside the popup.
- **Fields don't hover.** A field's states are its caret, its focus ring and its error; a hover would say "click here to act" on something you type into. The select trigger and the top bar's search box are drawn as fields, so they don't hover either; pressing them still lays the medium tier.
- **One signal.** A hover never adds a second change, a border, a shadow, a colour, to its overlay.
- **Only with a pointer that hovers.** Every hover applies under `@media (hover: hover)`: Tailwind's `hover:` does this, and the CSS files wrap their `:hover` rules in the same query. On a touch screen a hover would stay on the last thing tapped.

Use the overlay utility (`overlay-subtle`, `overlay-medium`, `overlay-sticker-medium`, `overlay-frame-medium`) on anything with a fill of its own, and the colour (`bg-fill-subtle`, `bg-fill-medium`, `bg-fill-frame-medium`) on a transparent control whose fill fades in with `transition-colors`.

## Clickable text

Text that does something or goes somewhere, with no box, chip or fill around it: a [TextLink](../../packages/ui/src/components/text-link/text-link.md), a mention of someone else, a sender's name, the text actions under a message, a toast's action.

- Show no underline at rest, and underline the text on hover in its own color: the underline is the one hover signal for clickable text everywhere, so people learn it once. At rest, its color, its weight and where it sits say it can be clicked.
- Never turn clickable text pink on hover. Pink is the one primary action on the screen ([Color](./color.md#meanings-of-color)); a color change on hover is only the step from a muted color to the ink of body text.
- Give text that cannot be clicked no hover change at all, and take the hover underline away from clickable text when it is disabled, so a change on hover always means "this can be clicked".
- Exception: a link inside rendered message or document text ([Markdown](../../packages/ui/src/components/markdown/markdown.md)) keeps an underline at rest, because the link blue alone is too close to the body text around it: below the 3:1 that [WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) asks of a link told apart by color alone. The underline is quieter at rest and takes the full color on hover; the values are in [Markdown](../../packages/ui/src/components/markdown/markdown.md).
- Chips, cards, badges, buttons and tabs are not clickable text: they keep their hover tier or their own hover.

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

## Autofill

A field the browser filled in (a saved email or password) looks like any other field: `layer-card` with ink text.

- Never show the browser's autofill fill: Chrome's pale blue and Safari's yellow made the filled field the one field on the page that matched nothing else in the system, and the colour says nothing a person needs.
- raft-ui's styles.css does this in Chrome and Safari for every `input`, `textarea` and `select` on the page, so an app needs no code of its own. A disabled autofilled field keeps the disabled ink.

## Related

- [Color](./color.md): the tokens named here.
- [Elevation](./elevation.md): the focus ring.
- [Feedback](../patterns/feedback.md): where errors go, by scope.
