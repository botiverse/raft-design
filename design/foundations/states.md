---
title: States
summary: How hover, press, focus, selection, located, unread, disabled, error, busy and autofill look, shared by every component.
---

# States

Every component shows its interaction states the same way. A component doc only describes a state when it differs from this page.

## Principles

- **Hover and press add an overlay, in two tiers.** They never change the fill; see [Motion](./motion.md). Large things people read hover with the subtle tier, small controls with the medium tier, and anything clickable presses with the medium tier ([Hover and press](#hover-and-press)). Selected items don't respond to hover, and fields don't hover. Text that can be clicked has no box to lay an overlay on, so it underlines on hover instead ([Clickable text](#clickable-text)). One named exception: a collapsible group heading only darkens ([Collapsible group headings](#collapsible-group-headings)).
- **Selection has three meanings, and three looks.** Where you are in navigation is yellow (`selected`, in every theme: [Themes](./themes.md#signals); on the frame, such as the rail, it takes the theme's frame colors), the item singled out in content is cyan, and a chosen value is ink.
- **Disabled looks the same everywhere** and doesn't react to hover or press.

## Usage

| State | Look |
| --- | --- |
| Hover, keyboard highlight | Menus, select lists and the quick reactions in a menu fill with `brand-soft`; so does the keyboard highlight in search results. Rows, messages and readable cards lay the subtle tier, `fill-subtle`; buttons, chips, tabs and segments the medium tier ([Hover and press](#hover-and-press)). A toolbar's actions are buttons, not menu rows, even in a toolbar that floats like a menu (the one over selected text): they hover gray with `fill-medium`, never `brand-soft` |
| Press | The medium tier on everything, rows and cards too: `fill-medium`, `sticker-medium` on a color sticker or `fill-frame-medium` on the frame ([Color](./color.md#hover-overlays)). A text button lights up its hit area when pressed |
| Focus | See [Focus](#focus) |
| Selected: navigation | A yellow sticker: sidebar rows, segmented controls, tabs, the tab bar's icon. On the yellow frame in light mode, the rail's selected item is a white sticker; in dark mode it is yellow. On the frame the selection is the theme's `layer-frame-active`, so other themes recolor it (gray in Boring Gray) |
| Selected: content | `info-soft`: the open item, an active filter, the current match of a search inside a page while that search is open |
| Located | `info-soft` for 2 seconds, fading out: the item a jump took someone to ([Located](#located)) |
| Selected: value | Ink: a checked checkbox or radio. In a menu, the current value has a check mark and bold text |
| Unread | Bold text and a pink count. When someone mentions the person, a yellow @ marker replaces the count. On an icon, one pink pixel. The selected item never shows either |
| Disabled | `fill-muted` fill, `line-hairline` or `foreground-disabled` border, `foreground-disabled` text. The same for buttons, bordered icon buttons, inputs, selects, checkboxes, radios, switches, segmented controls and tabs. Frameless icon buttons and frameless buttons on the frame get no fill or border: only their icon and text turn `foreground-disabled`. List rows keep their fill: only their text and icons turn `foreground-disabled`. No reaction to hover or press |
| Display only | A row whose only interactive parts are its controls (a switch row in settings, this computer in the sidebar) is not a button: render it as a `<div>`, with no hover or press on the row, and focus only on its controls |
| Error | An input gets a `danger-strong` border and a line that says how to fix it. In a dialog, a banner. A problem with the whole server goes to the notification center; see [Feedback](../patterns/feedback.md) |
| Busy | A pixel spinner in the button, and a label that says what is happening. Anywhere else the spinner matches what it stands in for: in a line of text it keeps the line's height; in place of a panel's or a list's content it is `md` or `lg`, with a line in `text-callout` or `text-body` and `foreground-muted` ([Spinner](../../packages/ui/src/components/spinner/spinner.md#size)). Over something busy in place, an image uploading or a preview being prepared, a `layer-veil` cover with the spinner in its default color ([Surfaces](./color.md#surfaces)) |
| Dimmed | Deleted, offline or still pending: 60%, `opacity-dimmed`. The place a dragged item came from is 40% ([Dimmed](#dimmed)) |

## Hover and press

Hover says "the pointer is here, and this is what a click acts on"; press confirms the click. Both lay one translucent layer of ink over the resting color, never a different fill, so the step looks the same on white, on the yellowish sidebar and on a card. There are two tiers, sized by what is under the pointer, not by which token a component happened to use: before, raft-ui had nine ways to turn a thing gray, from a step of 2.1 to 8.4 (OKLab ΔE × 100), and two cards that look alike hovered at 2.7 and 5.7.

| Tier | For | Token | Light | Dark | Step |
| --- | --- | --- | --- | --- | --- |
| **Subtle** | Hover on large things people read: a row, a message, a readable card (comment, attachment, replies bar, task card), and a row whose menu is open | `fill-subtle` (`overlay-subtle`) | 4% ink | 3% paper | 2.5 to 3 |
| **Medium** | Hover on small controls: buttons, icon buttons, chips, badges, tabs, segment items, navigation items. Press on anything clickable | `fill-medium` (`overlay-medium`) | 7.8% ink | 6.5% paper | 5 to 6.5 |
| Medium on a color sticker | Primary, warning and danger buttons, color badges, a selected segment pressed | `sticker-medium` (`overlay-sticker-medium`) | 10% ink | 10% ink | 5.5 to 6 |
| Medium on an ink sticker | The server tile, in the rail header or the sidebar header: hover, press and while its list is open | `sticker-ink-medium` (`overlay-sticker-ink-medium`) | 6% paper | 6% paper | about 6.2 |
| Medium on the frame | Rail items, on-frame buttons, the workspace button, the notification trigger | `fill-frame-medium` (`overlay-frame-medium`, `bg-fill-frame-medium`) | 10% ink | 6% paper | about 6.4 |
| **Yellow highlight** | The current item in a popup, by pointer and keyboard: menu items, options, suggestions, quick reactions | `brand-soft` | opaque | 20% yellow | 8.1 / 5.9 |
| **None** | Selected items: a selected segment or toggle, the active sidebar item, the selected tab, a selected row. Fields: inputs, the select trigger, the search box | — | — | — | — |

- **Subtle for what people read.** A message can be twenty lines tall and a row runs the width of the panel; the pointer rests on them while someone reads. A small step shows on a large area, and body text loses at most 6 APCA Lc on it, `foreground-hint` stays at 4.5:1 or more on every surface ([Contrast](./color.md#contrast)). Messages used to hover lighter than rows (3% and 2.2%) and readable cards heavier (7.8%); now a row, a message and a card on the same screen step the same.
- **Medium for small controls.** A 32px button needs a clear answer under the pointer, and nobody reads through it. The alphas differ by backdrop so the step looks the same: the same ink shows more on dark, yellow and pink, so dark mode takes 6.5%, a sticker and the yellow frame 10%, the dark frame 6%.
- **Anything clickable presses with the medium tier**, except a collapsible group heading ([Collapsible group headings](#collapsible-group-headings)). A press lasts a moment and confirms the click, so it may be strong: rows, cards, chips, badges, mentions and the selected sticker (a selected segment, toggle, tab or sidebar item lays `sticker-medium`). A control hovers and presses with the same tier: there is no third, stronger press tier. A message has no press: the row itself is not an action (a click selects text or lands on a link, a name or a button inside it), so its hover only marks what the toolbar and the menu act on.
- **A row with its menu open is subtle, hovered or not.** Every row, a message or any other, takes `fill-subtle` (a list cell its `fill-cell-hover`) while a menu or popup it opened is up (`data-popup-open` on the row, or on a button inside it); a selected row keeps its selection. On a phone, which has no hover, it is the sign of which row the menu acts on (2.5 to 2.9 off every row surface). With a mouse it is the hover it already had, so the two never stack.
- **Under selection.** Both gray tiers stay under the selection tints on the same surface, so a hover never reads as selected: on paper `info-soft` is 6.4 (light) and 4.6 (dark), `brand-soft` 8.1 and 6.1. Hover stays neutral ink; selection keeps its color ([Selected: content](#usage)).
- **Selected items don't respond to hover.** Selection is the strongest signal on the item; darkening it on hover adds nothing and makes it look like something else. A selected segment or toggle, like a selected tab and the active sidebar item, keeps its look under the pointer; pressing it lays the medium tier.
- **The yellow highlight is the popup's cursor, not a gray.** It moves with the pointer and the keyboard alike. In dark mode it is 20% yellow: at 16% it was 5.0, weaker than the button hover beside the popup.
- **Fields don't hover.** A field's states are its caret, its focus ring and its error; a hover would say "click here to act" on something you type into. The select trigger and the top bar's search box are drawn as fields, so they don't hover either; pressing them still lays the medium tier.
- **One signal.** A hover never adds a second change to its surface: no border, shadow or fill change beside the overlay. One exception: a frameless control whose icon or label rests in `foreground-muted` or `foreground-hint` (a field's clear and chevron buttons, the system-message disclosure, an icon button) steps that content to `foreground` with its overlay, the way clickable text steps to ink; the content answers, the surface doesn't change twice.
- **Media hovers with `ink-8`.** An image in a message has no resting fill to lay a tier on, and the button that opens it covers the whole picture (`MessageImageGalleryPreview`): it fades in `bg-ink-8` on hover (`transition-colors duration-75 hover:bg-ink-8`, no new token, the rule for a transparent control). In light mode ink is near black and the picture dims; in dark mode it is near white and the picture lifts, the same direction as every other hover in dark mode. Never hover media with a `brightness` filter: it multiplies, so a dark photo, the usual one on a dark page, moved by about one level in 255 and showed no hover at all.
- **Only with a pointer that hovers.** Every hover applies under `@media (hover: hover)`: Tailwind's `hover:` does this, and the CSS files wrap their `:hover` rules in the same query. On a touch screen a hover would stay on the last thing tapped.

Use the overlay utility (`overlay-subtle`, `overlay-medium`, `overlay-sticker-medium`, `overlay-frame-medium`) on anything with a fill of its own, and the color (`bg-fill-subtle`, `bg-fill-medium`, `bg-fill-frame-medium`) on a transparent control whose fill fades in with `transition-colors`.

The rows of a list (Activity items, sidebar rows, search results, ListRow) draw these states on an inset rounded shape instead of the whole row, with their own tokens: `fill-cell-hover` and `fill-cell-press` are the subtle and medium tiers in light, and step up in dark (7.5% and 12% paper) so the smaller shape still reads on a dark surface. The global tiers above don't change ([Lists](../patterns/lists.md)).

## Clickable text

Text that does something or goes somewhere, with no box, chip or fill around it: a [TextLink](../../packages/ui/src/components/text-link/text-link.md), a mention of someone else, a sender's name, the text actions under a message, a toast's action.

- Show no underline at rest, and underline the text on hover in its own color: the underline is the one hover signal for clickable text everywhere, so people learn it once. At rest, its color, its weight and where it sits say it can be clicked.
- Never turn clickable text pink on hover. Pink is the one primary action on the screen ([Color](./color.md#meanings-of-color)); a color change on hover is only the step from a muted color to the ink of body text.
- Give text that cannot be clicked no hover change at all, and take the hover underline away from clickable text when it is disabled, so a change on hover always means "this can be clicked".
- Exception: a link inside rendered message or document text ([Markdown](../../packages/ui/src/components/markdown/markdown.md)) keeps an underline at rest, because the link blue alone is too close to the body text around it: below the 3:1 that [WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) asks of a link told apart by color alone. The underline is quieter at rest and takes the full color on hover; the values are in [Markdown](../../packages/ui/src/components/markdown/markdown.md).
- Chips, cards, badges, buttons and tabs are not clickable text: they keep their hover tier or their own hover.

## Located

Located answers "where did that take me?". After a jump, the item someone arrived at shows `info-soft` at once, holds it, and fades out: a link to a message, a search result or Activity item that opens a message, Back to the list a result was opened from, the passage or table row a file comment is anchored to, the rows a bulk change touched. It is one look for one meaning, whatever the item is: a message, a list row, a table row or a region of a file.

| Step | Value | Why |
| --- | --- | --- |
| Appears | At once, no fade in | The eye has to catch it as the view lands; a fade in starts at nothing just when people look for it |
| Holds | 1.2s at full `info-soft` | Long enough to find the item in a list that just scrolled |
| Fades out | 0.8s, `ease-out` | The item goes back to its own fill without a jump, so the end of the highlight doesn't read as a second change |
| Gone | At 2s (`LOCATED_MS`) | Short enough not to look selected: the person didn't choose the item, the jump did |

- **Cyan, because it singles out an item in content**, as [Selected: content](#usage) does. It is not a selection, so it goes away by itself; a selection stays until people change it. The current match of a search inside a page is a selection: it stays `info-soft` while that search is open, and doesn't fade.
- **Layered over the item's own fill**, not in place of it: the row's surface is still there and comes back as the cyan fades. A message lays it as its row fill, so the ring around a delegated face matches the row ([MessageItem](../../packages/ui/src/components/message-item/message-item.md#states)).
- **No shape of its own.** The highlight takes the shape the item's hover has. A message and the rows of a sheet run from edge to edge of their panel and stay square. The rows of a list (Activity items, sidebar rows, search results, ListRow) are list cells: the highlight fills their inset rounded shape, as tall as the row and 8px from each side, in `fill-cell-selected` (`info-soft` in light, a stronger cyan in dark), and the row stays transparent ([Lists](../patterns/lists.md)). An item with its own radius has the highlight clipped to that radius. A region of a file is marked the same way: a square fill with no border.
- **A stronger mark wins.** An item that is already selected, current, a search match, checked, or has its menu open isn't located: its own mark already says where it is, and the highlight must never take it away, not even for 2 seconds.
- **No hover while it lasts, but a press shows.** The pointer often rests where the item lands, and a gray hover would hide the cyan, so a located item doesn't answer hover. A press is an action, so it lays the medium tier as always.
- **Start it when the item is on screen**, after the scroll that brings it there, not when the jump is asked for: a highlight that ran out while the list was still loading was never seen. New messages and loaded pages don't restart it; a new jump does, also to the same item.
- **Reduced motion:** the same 2 seconds, held still, then off with no fade ([Motion](./motion.md)).
- **Not for success.** The rows a bulk change touched are located, not green: the receipt already says the change worked, and the highlight only shows which rows it was.
- **Only a look.** A screen reader doesn't see the highlight, and a keyboard user needs more than a color. A jump started from the keyboard also moves focus to the item (`tabIndex={-1}`, then `focus({ preventScroll: true })` after the scroll), so keyboard and screen reader users land on it. A jump started with the pointer leaves focus where it was, in the composer for instance.
- **Focus on the item is the inset ring.** The focused item draws the inset ring (`outline-none focus-visible:keyboard:inset-ring-2 focus-visible:keyboard:inset-ring-foreground`, [Focus](#focus)), never the browser's outline: the browser draws its outline outside the item, with rounded corners of its own, so on a message it frames the transparent gap above the row instead of its fill, and a scroller that ends at the row's edge cuts it off. The ring sits inside the item and takes its shape, as the highlight does: square on a message, on the inset rounded shape of a list row, the item's own radius otherwise. It shows only after keyboard input, like every ring, so it marks a jump started from the keyboard and nothing else; it stays while focus does, after the cyan has faded. An item that is a button or a link (an Activity item, a search result, a Saved row) takes focus on that control and shows the ring it already has.
- **A message is announced as an article named by its sender and its time** (MessageItem gives its row `role="article"` and `aria-labelledby` on its name and time), so a screen reader landing on it says whose message it is and when, before the text. A continuation row, which shows no name, is named by its time; a row with neither a name nor a time stays a plain container, since an article with no name is announced with nothing to tell it apart.
- Drive it with `useLocated(request)` from raft-ui: pass a new request for each jump once the item is on screen (a counter or token that changes on every jump, a string or number; not the item's id, which stays the same on a second jump), and set `data-located` (MessageItem's `located`) while it returns true; styles.css runs the animation. The hook turns it off after `LOCATED_MS` and restarts it on the next jump, also to the same item: setting the attribute again while it is on doesn't restart the animation, only removing it for a frame does. Left on, the attribute keeps hiding hover, so don't set it by hand, and don't write your own flash or timer.

## Dimmed

Something that is there but not active, a deleted agent's avatar, an offline slot, a message or a chip still pending, a task being changed, is drawn at 60%, with the `opacity-dimmed` utility (the `opacity-dimmed` token, 0.6).

- **Two values, two meanings.** 60% says "here, but inactive". 40% says "this is where it was": only the place a dragged item came from takes it (`data-drag-origin`, [Drag and drop](../patterns/drag-and-drop.md#where-it-came-from)), so the two never read alike. Don't give either meaning another value, such as 30% or 70%.
- **A deleted person or agent is gray as well as dimmed** (`grayscale` with `opacity-dimmed`): their colors are their identity, and gray says it is gone.
- **Something loading in place is veiled, not dimmed.** An image uploading or a preview being prepared takes a `layer-veil` cover and a spinner ([Busy](#usage)), so it reads as "working", not as "inactive".

## Collapsible group headings

A heading that folds the group under it, such as a status heading in the Tasks section ([Tasks](../patterns/tasks.md#rows-in-a-compact-list)), is a named exception to [Hover and press](#hover-and-press) and [Clickable text](#clickable-text): it has a box, but lays no overlay, and its words can be clicked, but don't underline.

- On hover, turn its words and its chevron from `foreground-hint` to `foreground`, with no fill and no underline. A heading is a label over its rows, not a row: a fill would read as one more row in the list, and an underline would make the group's name read as a link that goes somewhere.
- On press, show the same as hover, with no pressed fill: a press fill would flash that extra row for a moment.
- On keyboard focus, show the inset ring (`inset-ring-2` in `foreground`, with the `keyboard:` variant; see [Focus](#focus)), so the heading still says where focus is.
- Only a heading that folds its group takes this. A heading that does nothing has no hover at all ([Clickable text](#clickable-text)).

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
- Use the same hold, distance and tolerance for everything that can be dragged by touch (sidebar rows, tabs, task cards, attachments in the composer): raft-ui's `useDragSensors` carries them (`useHoldThenMoveTouchSensor`, next to a pointer sensor that leaves fingers to it). A mouse or a pen still starts a drag after 6px of movement, with no hold. The rest of a drag, from the lifted copy to the drop, is in [Drag and drop](../patterns/drag-and-drop.md).
- Don't let the held item select its text or open the platform's own callout (`select-none`, `-webkit-touch-callout: none`), and keep it scrollable (`touch-manipulation`, not `touch-none`).

## Autofill

A field the browser filled in (a saved email or password) looks like any other field: `layer-card` with ink text.

- Never show the browser's autofill fill: Chrome's pale blue and Safari's yellow made the filled field the one field on the page that matched nothing else in the system, and the color says nothing a person needs.
- raft-ui's styles.css does this in Chrome and Safari for every `input`, `textarea` and `select` on the page, so an app needs no code of its own. A disabled autofilled field keeps the disabled ink.

## Related

- [Color](./color.md): the tokens named here.
- [Elevation](./elevation.md): the focus ring.
- [Feedback](../patterns/feedback.md): where errors go, by scope.
- [Drag and drop](../patterns/drag-and-drop.md): the whole drag, from pick-up to drop.
