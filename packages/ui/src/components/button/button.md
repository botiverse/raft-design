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

| Situation                                                                                 | Use                                                       |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| An action with a label                                                                    | Button                                                    |
| An action whose icon is understood without words: search, more, back, close, copy, attach | Button at an icon size; see [Icon buttons](#icon-buttons) |
| An action whose icon needs words to be understood                                         | Button with a label                                       |
| The quietest control on a screen, action or not                                           | [TextLink](../text-link/text-link.md): underlined text    |
| A list of actions on one thing                                                            | [DropdownMenu](../dropdown-menu/dropdown-menu.md)         |
| Picking a value                                                                           | [Select](../select/select.md)                             |

## Variants

| Variant              | Use for                                                                                      | Examples                             |
| -------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------ |
| `variant="primary"`  | The action the screen exists for: a pink sticker                                             | Send, Create Channel, Bring an Agent |
| `variant="default"`  | Every other action, including one that every row of a list repeats: an ink border            | Assign, Approve, Claim               |
| `variant="ghost"`    | Cancel and minor actions inside a surface that draws its own edge: no frame                  | Cancel in a dialog, Keep Box         |
| `variant="warning"`  | Actions that interrupt but can be undone: an orange sticker                                  | Stop Wug, Leave Channel, Reset       |
| `variant="danger"`   | Actions that cannot be undone, on the confirm button of a confirmation dialog: a red sticker | Delete Agent                         |
| `variant="on-frame"` | A frameless button on the frame: the rail, the web top bar, the desktop title bar            | The workspace button                 |

`accent` renders the same as `primary`, and `outline`, `information`, `muted` and `success` the same as `default`. Use the names in the table.

```example
button/compositions/on-frame
```

On the frame, a button takes the frame's ink (`foreground-on-frame`) and lays `fill-frame-pressed` over itself on hover, on press and while its popup is open. The text and icon sizes become the 36px frame item.

### Which color

**Emphasis is relative to the surface that holds the button, not a property of the action.** A frameless Cancel reads as a control inside a dialog and as a line of text on a page; the action did not change, what encloses it did. The test is whether the surface draws its own edge and takes focus while it is open — a dialog, a sheet, a menu, a popover, a toolbar, a card, a panel header all do; a page and a section of a page do not. When a surface is not on that list, apply the test rather than guessing: if the button would be the only thing marking where it sits, give it a border.

Every button is flat: the ink border or the sticker marks it as a control, never a shadow ([Elevation](../../../../../design/foundations/elevation.md)). Colored buttons carry ink type ([Color](../../../../../design/foundations/color.md#stickers)).

- Make the primary action pink. Use at most one pink button per screen; a screen may have none. Unread counts and attention dots don't count toward the one.
- When a screen has a second primary action, make it `default`.
- Give every other action an ink border (`default`).
- Make cancel and minor actions frameless (`ghost`) inside a surface that draws its own edge. On a page, give the same action an ink border (`default`).
- Use [TextLink](../text-link/text-link.md) for the bottom of the ladder: where even a frameless button is too much weight, such as Forgot Password on a sign-in page or a See All beside a section title. It may carry an action, but it is the quietest control on the screen, never a way to fit one more button into a crowded row. It is not a Button variant: a text link is a word in a line, not a box, so it takes the size of the text around it, and a Button would bring a height, a border and padding that each have to be taken off again.
- Use orange (`warning`) for actions that interrupt but can be undone: stop, leave, reset.
- Use red (`danger`) only for actions that cannot be undone, and only in a confirmation dialog ([AlertDialog](../alert-dialog/alert-dialog.md)). Don't color a destructive item in a menu ([DropdownMenu](../dropdown-menu/dropdown-menu.md)).
- Don't use `danger-secondary` or `danger-outline`: red text on an outline button puts red outside a confirmation dialog.
- Never make a button yellow: yellow means "you" ([Color](../../../../../design/foundations/color.md#meanings-of-color)).

### Sizes

Size follows the purpose. The same purpose has the same size everywhere, and there are no other sizes.

| Size                  | Height              | Use for                                                                                                                                                 |
| --------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `size="lg"`           | 44px                | Dialog and drawer footers, form submit buttons, a full-width column of actions at the bottom of a panel (Remove Member, Leave Channel, Archive Channel) |
| `size="md"` (default) | 32px, 44px hit area | Actions in list rows, cards, banners, toolbars and panel headers                                                                                        |
| `size="xl"`           | 52px                | Only the full-width pink button across a sign-in, sign-up or setup form                                                                                 |

### Icon buttons

| Where                                                                   | Props                               | Size and icon                  |
| ----------------------------------------------------------------------- | ----------------------------------- | ------------------------------ |
| A phone top bar                                                         | `variant="ghost" size="icon-lg"`    | 44px, 22px icon                |
| A desktop panel header, composer tools, copy in cards and command lines | `variant="ghost" size="icon-md"`    | 32px, 18px icon, 44px hit area |
| A tool that stands alone in content                                     | `variant="default"` at an icon size | Ink border on `layer-card`     |
| Send                                                                    | `variant="primary"` at an icon size | A pink sticker                 |
| The rail, the web top bar, the desktop title bar                        | `variant="on-frame" size="icon-md"` | 36px, 20px icon                |

- Make an icon button next to a 44px input (copy a link, remove a row) 44px too: `size="icon-lg"`.
- Put several icon buttons in a panel header inside `PanelActions` ([Panel](../panel/panel.md)), which aligns them to the end and spaces them.
- Mark a bell that has something new with an attention dot on its top-right corner.
- Count the send button as the screen's pink button.

Icon sizes by context are in [Iconography](../../../../../design/foundations/iconography.md#sizes).

## States

Hover, press, focus and disabled follow [States](../../../../../design/foundations/states.md): a sticker lays `sticker-pressed` over itself, a paper-colored button `fill-pressed`.

- **Disabled, frameless:** a frameless icon button (`ghost` at an icon size) and an `on-frame` button only turn their icon and text `foreground-disabled`. No fill or border appears.
- **Disabled, colored:** a disabled pink, orange or red button is no longer a sticker: it takes the shared disabled look.
- **Loading:** `loading` shows the pixel spinner ([Spinner](../spinner/spinner.md)) and keeps the button's width and color. Use it for any wait a button started ([Choosing a component](../../../../../design/components/overview.md#waiting)).

## Content

- Start with a verb and name the result: Send for Review, not OK or Submit.
- Use Title Case ([Writing](../../../../../design/content/writing.md#casing)), and repeat the button's words in the dialog it opens ([Writing](../../../../../design/content/writing.md#actions-and-their-dialogs)).
- Put an icon before the label (`data-icon="inline-start"`), and Return or an arrow after it (`data-icon="inline-end"`).
- While loading, say what is happening: Creating….

## Accessibility

Button wraps Base UI Button and renders a native `<button>`. For navigation, render a real link instead: `render={<a href="…" />}`.

- Give every icon-only button an `aria-label` in Title Case (Add Reaction). On devices with a pointer, add a [Tooltip](../tooltip/tooltip.md) with the same name and the shortcut.
- While `loading`, the button is `aria-disabled` and the spinner is named by `loadingLabel`. Set `loadingLabel` to what is happening.
- Use `focusableWhenDisabled` when a Tooltip has to explain why an action is unavailable: the button stays focusable and keeps the disabled look.
