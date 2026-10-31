---
title: Button
summary: A button for an action, with or without a label; its color says what kind of action it is, and its size follows where it sits.
status: stable
aliases: [IconButton]
layer: core
category: actions
related: [dropdown-menu, alert-dialog, tooltip, spinner, composer]
redirectFrom: [decisions/0034-button-size-by-use]
---

# Button

A button starts an action. Its color says what kind of action it is: pink for the one action a screen exists for, an ink border for the rest, no frame for cancel and minor actions, orange for what interrupts and red for what cannot be undone. An icon-only button is the same component at an icon size.

```example
button/compositions/preview
```

## When to use

| Situation                                                                                 | Use                                                                  |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| An action with a label                                                                    | Button                                                               |
| An action whose icon is understood without words: search, more, back, close, copy, attach | Button at an icon size; see [Icon buttons](#icon-buttons)            |
| An action whose icon needs words to be understood                                         | Button with a label                                                  |
| The quietest control on a screen, action or not                                           | [TextLink](../text-link/text-link.md): text that underlines on hover |
| A list of actions on one thing                                                            | [DropdownMenu](../dropdown-menu/dropdown-menu.md)                    |
| Picking a value                                                                           | [Select](../select/select.md)                                        |

## Variants

| Variant              | Use for                                                                                      | Examples                             |
| -------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------ |
| `variant="primary"`  | The action the screen exists for: a pink sticker                                             | Send, Create Channel, Bring an Agent |
| `variant="default"`  | Every other action, including one that every row of a list repeats: an ink border            | Assign, Approve, Claim               |
| `variant="ghost"`    | Cancel and minor actions inside a surface that draws its own edge: no frame                  | Cancel in a dialog                   |
| `variant="warning"`  | Actions that interrupt but can be undone: an orange sticker                                  | Stop Wug, Leave Channel, Reset       |
| `variant="danger"`   | Actions that cannot be undone, on the confirm button of a confirmation dialog: a red sticker | Delete Agent                         |
| `variant="on-frame"` | A frameless button on the frame: the rail, the web top bar, the desktop title bar            | The workspace button                 |

`accent` renders the same as `primary`, and `outline`, `information`, `muted` and `success` the same as `default`. Use the names in the table.

```example
button/compositions/on-frame
```

On the frame, a button takes the frame's ink (`foreground-on-frame`) and lays `fill-frame-medium` over itself on hover, on press and while its popup is open. The text and icon sizes become the 36px frame item.

### Which color

**Emphasis is relative to the surface that holds the button, not a property of the action.** A frameless Cancel reads as a control inside a dialog and as a line of text on a page; the action did not change, what encloses it did. The test is whether the surface draws its own edge and takes focus while it is open — a dialog, a sheet, a menu, a popover, a toolbar, a card, a panel header all do; a page and a section of a page do not. When a surface is not on that list, apply the test rather than guessing: if the button would be the only thing marking where it sits, give it a border.

Every button is flat: the ink border or the sticker marks it as a control, never a shadow ([Elevation](../../../../../design/foundations/elevation.md)). Colored buttons carry ink type ([Color](../../../../../design/foundations/color.md#stickers)).

- Make the primary action pink. Use at most one pink button per screen; a screen may have none. Unread counts and attention dots don't count toward the one.
- When a screen has a second primary action, make it `default`.
- Give every other action an ink border (`default`).
- Make cancel and minor actions frameless (`ghost`) inside a surface that draws its own edge. On a page, give the same action an ink border (`default`).
- When buttons stack full width (a dialog footer whose row doesn't fit, a bottom sheet's actions), a `ghost` button there takes the ink border of `default`, with its hover and press. Stretched to the full width, a frameless button reads as a line of text, not a button: once buttons stack, each needs its own box (stdrc, 2026-10-22). The container marks the stack with `data-stacked`; the button keeps its `ghost` variant and loses the frame again when the row comes back. Disabled, it keeps the disabled fill; an icon button stays frameless.
- Use [TextLink](../text-link/text-link.md) for the bottom of the ladder: where even a frameless button is too much weight, such as Forgot Password on a sign-in page or a See All beside a section title. It may carry an action, but it is the quietest control on the screen, never a way to fit one more button into a crowded row. It is not a Button variant: a text link is a word in a line, not a box, so it takes the size of the text around it, and a Button would bring a height, a border and padding that each have to be taken off again.
- Use orange (`warning`) for actions that interrupt but can be undone: stop, leave, reset.
- Use red (`danger`) only for actions that cannot be undone, and only in a confirmation dialog ([AlertDialog](../alert-dialog/alert-dialog.md)). Don't color a destructive item in a menu ([DropdownMenu](../dropdown-menu/dropdown-menu.md)).
- Don't use `danger-secondary` or `danger-outline`: red text on an outline button puts red outside a confirmation dialog.
- Never make a button yellow: yellow means "you" ([Color](../../../../../design/foundations/color.md#meanings-of-color)).

### Sizes

Size follows the purpose. The same purpose has the same size everywhere, and there are no other sizes. `lg`, `icon-lg` and `xl` take the control height ([Spacing](../../../../../design/foundations/spacing.md#heights)): a finger's size on a phone and a touch screen, and Feishu's PC sizes on a desktop (from 768px with a mouse or trackpad). On a desktop `lg` is as tall as `md`, with its wider padding and its `text-subhead` label. Still pick `lg` by purpose, as the table says: the same code runs on a phone, where `lg` is the finger-sized button the purpose needs, and on a desktop it costs nothing in height.

| Size                  | Height                                             | Use for                                                                                                                                                 |
| --------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `size="lg"`           | 44px on a phone; 32px, 44px hit area, on a desktop | Dialog and drawer footers, form submit buttons, a full-width column of actions at the bottom of a panel (Remove Member, Leave Channel, Archive Channel) |
| `size="md"` (default) | 32px, 44px hit area                                | Actions in list rows, cards, banners, toolbars and panel headers                                                                                        |
| `size="xl"`           | 52px on a phone, 40px on a desktop                 | Only the full-width pink button across a sign-in, sign-up or setup form                                                                                 |

These three and the two icon sizes, `icon-md` and `icon-lg`, are all the sizes. `xs` and `sm` render exactly as `md`, and `icon-xs` and `icon-sm` exactly as `icon-md`. They are deprecated aliases, kept until raft-ui 1.0. `node node_modules/@botiverse/raft-ui/codemods/button-sizes.mjs <src>` renames them, and nothing on screen changes.

When a place looks too tight for a 32px button, change the container, not the button. A banner's button is `md` at every banner size, and the banner's text is as large as its label ([Banner](../banner/banner.md#sizes)).

#### Size by place

Every place has one answer. Where a part of the container sets the place, follow it: the size comes with the place, not with the button.

| Place                                                                       | Size                                   | Who decides                                                                                               |
| --------------------------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Dialog, drawer and sheet footers                                            | `lg`                                   | `DialogFooter`: Cancel and the submit button are `lg`. `DialogCommit` moved into a phone's header is `md` |
| A form's submit; Save on a card that holds fields                           | `lg`                                   | You, because fields are above it                                                                          |
| Beside a field: copy a link, remove a row, add                              | `lg`, `icon-lg`                        | You: it takes the field's height ([Icon buttons](#icon-buttons))                                          |
| A full-width button across a sign-in, sign-up or setup form                 | `xl`                                   | You                                                                                                       |
| A full-width column of actions at the bottom of a panel                     | `lg`                                   | You                                                                                                       |
| A banner's button and its Dismiss                                           | `md`                                   | `BannerAction` places them; `BannerClose` is its own 32px ×                                               |
| A toast's action                                                            | none                                   | `ToastAction` is the toast's own text action; it takes no Button size                                     |
| A desktop panel header                                                      | none                                   | `PanelAction` and `PanelToggleAction` are their own buttons, 32px on a desktop and 44px on a phone        |
| Card and message action card actions; a single action in a settings section | `md`                                   | You                                                                                                       |
| The end of a list row or a table row                                        | `md`, `icon-md`                        | You                                                                                                       |
| Toolbars, filter bars, empty states, the bottom of a popover, Load More     | `md`, `icon-md`                        | You                                                                                                       |
| A phone top bar; the media viewer                                           | `icon-lg`                              | The top bar, `Lightbox`                                                                                   |
| The rail, the web top bar, the desktop title bar                            | `on-frame` at `md` or `icon-md` (36px) | The frame                                                                                                 |
| A menu, a phone's overflow menu                                             | No Button: a menu item                 | `DropdownMenu`, the sheet                                                                                 |

#### Inside a floating toolbar

A toolbar that floats over content shows on every message under the pointer, so it is more compact than the page. The message hover toolbar and the text-selection toolbar are 36px high, with 28px buttons 4px from the frame and 4px apart, at `radius-chip`. The container sizes them: `MessageItemToolbarButton` and `TextSelectionToolbarButton` are the toolbars' own parts, and `MessageMultiSelectToolbarActions` brings a `md` Button in it to 28px ([MessageItem](../message-item/message-item.md)). 28px is not a Button size, so don't make a Button 28px yourself. `SidebarSectionControl`, on a sidebar section's header line, is smaller still: 24px with a 14px icon ([Sidebar](../sidebar/sidebar.md#rules)).

### Icon buttons

| Where                                                                   | Props                               | Size and icon                                                           |
| ----------------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------- |
| A phone top bar, or beside a field                                      | `variant="ghost" size="icon-lg"`    | 44px, 22px icon on a phone; 32px, 18px icon, 44px hit area on a desktop |
| A desktop panel header, composer tools, copy in cards and command lines | `variant="ghost" size="icon-md"`    | 32px, 18px icon, 44px hit area                                          |
| A tool that stands alone in content                                     | `variant="default"` at an icon size | Ink border on `layer-card`                                              |
| Send                                                                    | `variant="primary"` at an icon size | A pink sticker                                                          |
| The rail, the web top bar, the desktop title bar                        | `variant="on-frame" size="icon-md"` | 36px, 20px icon                                                         |

- Make an icon button next to an input (copy a link, remove a row) the input's height: `size="icon-lg"`, which follows the field's height on a phone and on a desktop.
- Put several icon buttons in a panel header inside `PanelActions` ([Panel](../panel/panel.md)), which aligns them to the end and spaces them.
- Mark a bell that has something new with an attention dot on its top-right corner.
- Count the send button as the screen's pink button.

Icon sizes by context are in [Iconography](../../../../../design/foundations/iconography.md#sizes).

## States

Hover, press, focus and disabled follow [States](../../../../../design/foundations/states.md): every button hovers and presses with the medium tier ([Hover and press](../../../../../design/foundations/states.md#hover-and-press)): a sticker lays `sticker-medium` over itself, a paper-colored button `fill-medium`.

- **Disabled, frameless:** a frameless icon button (`ghost` at an icon size) and an `on-frame` button only turn their icon and text `foreground-disabled`. No fill or border appears.
- **Disabled, colored:** a disabled pink, orange or red button is no longer a sticker: it takes the shared disabled look.
- **Loading:** `loading` shows the pixel spinner ([Spinner](../spinner/spinner.md)) and keeps the button's width and color. Use it for any wait a button started ([Choosing a component](../../../../../design/components/overview.md#waiting)).

## Content

- Start with a verb and name the result: Send for Review, not OK or Submit. In a dialog the title names the object, so its main button says the verb alone: Create in Create Channel ([Writing](../../../../../design/content/writing.md#actions-and-their-dialogs)).
- Use Title Case ([Writing](../../../../../design/content/writing.md#casing)), and repeat the button's words in the dialog it opens ([Writing](../../../../../design/content/writing.md#actions-and-their-dialogs)).
- Put an icon before the label (`data-icon="inline-start"`), and Return or an arrow after it (`data-icon="inline-end"`).
- While loading, say what is happening: Creating….

## Accessibility

Button wraps Base UI Button and renders a native `<button>`. For navigation, render a real link instead: `render={<a href="…" />}`.

- Give every icon-only button an `aria-label` in Title Case (Add Reaction). On devices with a pointer, add a [Tooltip](../tooltip/tooltip.md) with the same name and the shortcut.
- While `loading`, the button is `aria-disabled` and the spinner is named by `loadingLabel`. Set `loadingLabel` to what is happening.
- Use `focusableWhenDisabled` when a Tooltip has to explain why an action is unavailable: the button stays focusable and keeps the disabled look.
