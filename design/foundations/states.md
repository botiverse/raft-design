---
title: States
summary: How hover, press, focus, selection, unread, disabled, error and busy look, shared by every component.
---

# States

Every component shows its interaction states the same way. A component doc only describes a state when it differs from this page.

## Principles

- **Hover and press add an overlay.** They never change the fill; see [Motion](./motion.md). Text that can be clicked has no box to lay an overlay on, so it underlines on hover instead ([Clickable text](#clickable-text)).
- **On a touch screen, show on press what hover shows.** There is no hover there, so nothing people need may exist only on hover ([Touch screens](#touch-screens)).
- **Selection has three meanings, and three looks.** Where you are in navigation is yellow, the item singled out in content is cyan, and a chosen value is ink.
- **Disabled looks the same everywhere** and doesn't react to hover or press.

## Usage

| State | Look |
| --- | --- |
| Hover, keyboard highlight | Menus, select lists and the quick reactions in a menu fill with `brand-soft`; so does the keyboard highlight in search results. Rows and buttons lay the pressed overlay over themselves on hover. A toolbar's actions are buttons, not menu rows, even in a toolbar that floats like a menu (the one over selected text): they hover grey with `fill-pressed`, never `brand-soft`. Hover shows only on devices that can hover; on a touch screen, show it on press instead ([Touch screens](#touch-screens)) |
| Press | The pressed overlay: `fill-pressed`, `sticker-pressed` or `fill-frame-pressed` ([Color](./color.md#pressed-overlays)). A text button lights up its hit area when pressed. Press and hold has no look of its own: show the pressed overlay while the finger rests on the thing, and keep it while the menu it opened is open |
| Focus | See [Focus](#focus) |
| Selected: navigation | A yellow sticker: sidebar rows, segmented controls, tabs, the tab bar's icon. On the yellow frame in light mode, the rail's selected item is a white sticker; in dark mode it is yellow |
| Selected: content | `info-soft`: the open item, the message someone jumped to, an active filter |
| Selected: value | Ink: a checked checkbox or radio. In a menu, the current value has a check mark and bold text |
| Unread | Bold text and a pink count. When someone mentions the person, a yellow @ marker replaces the count. On an icon, one pink pixel. The selected item never shows either |
| Disabled | `fill-muted` fill, `line-hairline` or `foreground-disabled` border, `foreground-disabled` text. The same for buttons, bordered icon buttons, inputs, selects, checkboxes, radios, switches, segmented controls and tabs. Frameless icon buttons and frameless buttons on the frame get no fill or border: only their icon and text turn `foreground-disabled`. List rows keep their fill: only their text and icons turn `foreground-disabled`. No reaction to hover or press |
| Display only | A row whose only interactive parts are its controls (a switch row in settings, this computer in the sidebar) is not a button: render it as a `<div>`, with no hover or press on the row, and focus only on its controls |
| Error | An input gets a `danger-strong` border and a line that says how to fix it. In a dialog, a banner. A problem with the whole server goes to the notification center; see [Feedback](../patterns/feedback.md) |
| Busy | A pixel spinner in the button, and a label that says what is happening. Anywhere else the spinner matches what it stands in for: in a line of text it keeps the line's height; in place of a panel's or a list's content it is `md` or `lg`, with a line in `text-callout` or `text-body` and `foreground-muted` ([Spinner](../../packages/ui/src/components/spinner/spinner.md#size)) |

## Clickable text

Text that does something or goes somewhere, with no box, chip or fill around it: a [TextLink](../../packages/ui/src/components/text-link/text-link.md), a mention of someone else, a sender's name, the text actions under a message, a toast's action.

- Show no underline at rest, and underline the text on hover in its own color: the underline is the one hover signal for clickable text everywhere, so people learn it once. At rest, its color, its weight and where it sits say it can be clicked.
- On a touch screen, underline it while it is pressed instead, and turn muted clickable text ink while pressed, as tabs do. raft-ui's TextLink doesn't underline while pressed yet.
- Never turn clickable text pink on hover. Pink is the one primary action on the screen ([Color](./color.md#meanings-of-color)); a color change on hover is only the step from a muted color to the ink of body text.
- Give text that cannot be clicked no hover change at all, and take the hover underline away from clickable text when it is disabled, so a change on hover always means "this can be clicked".
- Exception: a link inside rendered message or document text ([Markdown](../../packages/ui/src/components/markdown/markdown.md)) keeps an underline at rest, because the link blue alone is too close to the body text around it: below the 3:1 that [WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) asks of a link told apart by color alone. The underline is quieter at rest and takes the full color on hover; the values are in [Markdown](../../packages/ui/src/components/markdown/markdown.md).
- Chips, cards, badges, buttons and tabs are not clickable text: they keep the pressed overlay or their own hover.

## Touch screens

A touch screen has no hover, and its one pointer state is the press. raft-ui's hover styles apply only on devices that can hover (Tailwind's `hover:` matches under `@media (hover: hover)`), so a tap never leaves a hover look behind. These rules hold on the web on a touch screen and in the native apps alike.

- Show the hover look while pressed: the pressed overlay on a row or a button, the underline on clickable text ([Clickable text](#clickable-text)). The press is the one moment a finger points at something, so it is the moment to show what it will act on. raft-ui doesn't do this everywhere yet: [InboxItem](../../packages/ui/src/components/inbox-item/inbox-item.md) rows and [MessageItem](../../packages/ui/src/components/message-item/message-item.md) messages fill on hover and when their menu is open, but not on press, so on a touch screen a press on them shows nothing.
- In a list that scrolls, show a row's press only once the finger rests on it, after the platform's press delay, and drop it as soon as the finger moves. Otherwise a finger scrolling a conversation flashes every message it passes. Press and hold works the same way in [ContextMenu](../../packages/ui/src/components/context-menu/context-menu.md): Base UI opens the menu after a 500ms press and cancels it when the finger moves more than 10px.
- Never put anything people need only behind hover. Show it at rest, put it in the press-and-hold menu, or put it behind a visible action such as ⋯. The message's hover toolbar is meant to follow this: its actions are also in the message menu that press and hold opens ([Conversation](../patterns/conversation.md#actions)). In the docs' reference menu (the MessageItem examples), Reply in Thread appears as Open Thread and Save Message as itself, but Add Reaction only in part: the menu has 7 quick reactions and not yet the button that opens every emoji ([DropdownMenu](../../packages/ui/src/components/dropdown-menu/dropdown-menu.md#the-message-menu)), so on a touch screen no other emoji can be reached. Where hover actions go on a touch screen is in [Responsive layout](../patterns/responsive.md#touch-screens).
- Make press and hold open the same menu as right-click and, where the thing has one, its ⋯ button, with the same items in the same order, never a different set ([ContextMenu](../../packages/ui/src/components/context-menu/context-menu.md)). People learn where an action is once, on every device.
- On a touch screen, a message's menu opens by press and hold, with no ⋯ on the message: the convention of phone chat apps ([Touch](../patterns/touch.md#press-and-hold)).
- Never draw the focus ring after a tap ([Focus](#focus)).

The gestures themselves (swipe, pull to refresh, pinch) are in [Touch](../patterns/touch.md).

## Focus

Focus uses `focus-ring` ([Elevation](./elevation.md#focus-ring)), and it shows only when the person's last navigation input was the keyboard: a hardware keyboard on any device, or a D-pad on Android. The rule is the same on the web and in the native apps. The ring answers "where am I?" for someone moving with Tab and the arrow keys. A person who clicks or taps already knows where they are, since they just pointed there, and the caret marks a text field they clicked or tapped. A ring that shows up on every click, and stays on the always-focused composer, distracts and tells them nothing.

- Show the ring after keyboard navigation: Tab, Shift+Tab and F6 anywhere; the arrow keys, Home, End, Page Up, Page Down, Enter, Space and Esc outside a text field. Tabbing into a text field shows the full ring.
- Inside a text field those keys edit, so they keep the modality as it was, unless focus leaves the field right after: Esc closing the dialog the field is in, Enter submitting it, Left Arrow moving from a combobox's text to its chips. Then the person is on the keyboard, and the element focus lands on shows the ring.
- Show no ring after a click or a tap, and none when code moves focus after one (a dialog that focuses its first field, a popup that focuses its search row). A text field clicked with the mouse or tapped shows only its caret: no ring and no border change.
- Typing doesn't count as navigation. Letters, and Enter, Space and the arrow keys inside a text field, keep the modality as it was, so the composer stays quiet while someone types in it after clicking, and keeps its ring when they tabbed into it.
- Cmd and Ctrl shortcuts, and modifier keys pressed alone, don't count either. A shortcut that moves focus somewhere without a caret still gets the ring when nothing else explains the move (next rule); a shortcut that sends focus to a text field (Cmd+K) shows its caret.
- Show every ring when the input isn't a pointer we can see: before any input (the page just loaded; a keyboard user who hasn't pressed Tab yet), when focus arrives with no key or press just before it (a screen reader's browse cursor, a timer), and when a screen reader synthesizes a press (VoiceOver, TalkBack). Only a real pointer press, or real mouse movement before anything else, hides the ring. Keyboard and screen-reader users never lose it ([WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)).
- Ring the whole group for compound controls: the composer, an input with a prefix or suffix, a multi-select field. The group rings only when an element inside it has keyboard focus (`has-focus-visible`), not for any focus inside it (`focus-within`): clicking the clear button of a search field doesn't ring the field.
- Ring the box of a checkbox or radio. A hidden native input drives it.

On the web, raft-ui implements the rule with `installInputModality()`. [ThemeProvider](../about/use-raft-ui.md#theme-and-dark-mode) installs it, so an app that uses ThemeProvider gets it with no code of its own. It keeps `data-input-modality` on `document.documentElement`: absent until there is evidence, then `pointer`, `keyboard` or `virtual`. Only while it says `pointer` does styles.css empty `focus-ring`, in light and dark mode and in light or dark islands; every other value, and no value, shows the rings.

- Draw a focus indicator with `focus-visible:shadow-focus` (`has-focus-visible:shadow-focus` on a group), never `focus:` or `focus-within:`.
- Stack the `keyboard:` variant on any indicator not drawn with `focus-ring`, such as an outline or the inset ring: `focus-visible:keyboard:outline-2 focus-visible:keyboard:outline-line-strong`. It matches unless the last input was a pointer.

## Related

- [Color](./color.md): the tokens named here.
- [Elevation](./elevation.md): the focus ring.
- [Feedback](../patterns/feedback.md): where errors go, by scope.
