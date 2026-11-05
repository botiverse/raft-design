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
| One action, with a menu of other ways to do it beside it                                  | Button split; see [Split buttons](#split-buttons)                    |
| Picking a value                                                                           | [Select](../select/select.md)                                        |

## Variants

| Variant              | Use for                                                                                      | Examples                             |
| -------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------ |
| `variant="primary"`  | The action the screen exists for: a pink sticker                                             | Send, Create channel, Bring an agent |
| `variant="default"`  | Every other action, including one that every row of a list repeats: an ink border            | Assign, Approve, Claim               |
| `variant="ghost"`    | Cancel and minor actions inside a surface that draws its own edge: no frame                  | Cancel in a dialog                   |
| `variant="warning"`  | Actions that interrupt but can be undone: an orange sticker                                  | Stop Wug, Leave channel, Reset       |
| `variant="danger"`   | Actions that cannot be undone, on the confirm button of a confirmation dialog: a red sticker | Delete agent                         |
| `variant="on-frame"` | A frameless button on the frame: the rail, the web top bar, the desktop title bar            | The workspace button                 |

`accent` renders the same as `primary`, and `outline`, `information`, `muted` and `success` the same as `default`. Use the names in the table.

```example
button/compositions/on-frame
```

On the frame, a button takes the frame's ink (`foreground-on-frame`) and lays `fill-frame-medium` over itself on hover, on press and while its popup is open. The text and icon sizes become the frame item (`frame-item-height`: 34px with a mouse, the control height, and 36px on a touch screen).

### Which color

**Emphasis is relative to the surface that holds the button, not a property of the action.** A frameless Cancel reads as a control inside a dialog and as a line of text on a page; the action did not change, what encloses it did. The test is whether the surface draws its own edge and takes focus while it is open — a dialog, a sheet, a menu, a popover, a toolbar, a card, a panel header all do; a page and a section of a page do not. When a surface is not on that list, apply the test rather than guessing: if the button would be the only thing marking where it sits, give it a border.

Every button is flat: the ink border or the sticker marks it as a control, never a shadow ([Elevation](../../../../../design/foundations/elevation.md)). Colored buttons carry ink type ([Color](../../../../../design/foundations/color.md#stickers)).

- Make the primary action pink. Use at most one pink button per screen; a screen may have none. Unread counts and attention dots don't count toward the one.
- When a screen has a second primary action, make it `default`.
- Give every other action an ink border (`default`).
- Make cancel and minor actions frameless (`ghost`) inside a surface that draws its own edge. On a page, give the same action an ink border (`default`).
- When buttons stack full width (a dialog footer whose row doesn't fit, a bottom sheet's actions), a `ghost` button there takes the ink border of `default`, with its hover and press. Stretched to the full width, a frameless button reads as a line of text, not a button: once buttons stack, each needs its own box (stdrc, 2026-10-22). The container marks the stack with `data-stacked`; the button keeps its `ghost` variant and loses the frame again when the row comes back. Disabled, it keeps the disabled fill; an icon button stays frameless.
- Use [TextLink](../text-link/text-link.md) for the bottom of the ladder: where even a frameless button is too much weight, such as Forgot password on a sign-in page or a See all beside a section title. It may carry an action, but it is the quietest control on the screen, never a way to fit one more button into a crowded row. It is not a Button variant: a text link is a word in a line, not a box, so it takes the size of the text around it, and a Button would bring a height, a border and padding that each have to be taken off again.
- Use orange (`warning`) for actions that interrupt but can be undone: stop, leave, reset.
- Use red (`danger`) only for actions that cannot be undone, and only in a confirmation dialog ([AlertDialog](../alert-dialog/alert-dialog.md)). Don't color a destructive item in a menu ([DropdownMenu](../dropdown-menu/dropdown-menu.md)).
- Don't use `danger-secondary` or `danger-outline`: red text on an outline button puts red outside a confirmation dialog.
- Never make a button yellow: yellow means "you" ([Color](../../../../../design/foundations/color.md#meanings-of-color)).

### Sizes

Size follows the purpose. The same purpose has the same size everywhere, and there are no other sizes. `lg`, `icon-lg` and `xl` take the control height ([Spacing](../../../../../design/foundations/spacing.md#heights)): a finger's size on a phone and a touch screen, and Feishu's PC sizes on a desktop (from 768px with a mouse or trackpad). On a desktop `lg` is as tall as `md`, with its wider padding and its `text-subhead` label. Still pick `lg` by purpose, as the table says: the same code runs on a phone, where `lg` is the finger-sized button the purpose needs, and on a desktop it costs nothing in height.

| Size                  | Height                                                                   | Use for                                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `size="lg"`           | 44px on a phone; 34px, 44px hit area, on a desktop                       | Dialog and drawer footers, form submit buttons, a full-width column of actions at the bottom of a panel (Remove member, Leave channel, Archive channel) |
| `size="md"` (default) | 32px, 44px hit area; 34px (the control height) with a mouse on a desktop | Actions in list rows, cards, banners, toolbars and panel headers                                                                                        |
| `size="xl"`           | 52px on a phone, 40px on a desktop                                       | Only the full-width pink button across a sign-in, sign-up or setup form                                                                                 |

These three and the two icon sizes, `icon-md` and `icon-lg`, are all the sizes. `xs` and `sm` render exactly as `md`, and `icon-xs` and `icon-sm` exactly as `icon-md`. They are deprecated aliases, kept until raft-ui 1.0. `node node_modules/@botiverse/raft-ui/codemods/button-sizes.mjs <src>` renames them, and nothing on screen changes.

When a place looks too tight for a 32px button, change the container, not the button. A banner's button is `md` at every banner size, and the banner's text is as large as its label ([Banner](../banner/banner.md#sizes)).

#### Size by place

Every place has one answer. Where a part of the container sets the place, follow it: the size comes with the place, not with the button.

| Place                                                                       | Size                                                                               | Who decides                                                                                               |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Dialog, drawer and sheet footers                                            | `lg`                                                                               | `DialogFooter`: Cancel and the submit button are `lg`. `DialogCommit` moved into a phone's header is `md` |
| A form's submit; Save on a card that holds fields                           | `lg`                                                                               | You, because fields are above it                                                                          |
| Beside a field: copy a link, remove a row, add                              | `lg`, `icon-lg`                                                                    | You: it takes the field's height ([Icon buttons](#icon-buttons))                                          |
| A full-width button across a sign-in, sign-up or setup form                 | `xl`                                                                               | You                                                                                                       |
| A full-width column of actions at the bottom of a panel                     | `lg`                                                                               | You                                                                                                       |
| A banner's button and its Dismiss                                           | `md`                                                                               | `BannerAction` places them; `BannerClose` is its own `icon-md` ×                                               |
| A toast's action                                                            | none                                                                               | `ToastAction` is the toast's own text action; it takes no Button size                                     |
| A desktop panel header                                                      | none                                                                               | `PanelAction` and `PanelToggleAction` are their own buttons, a 28px bar button on a desktop and 44px on a phone |
| Card and message action card actions; a single action in a settings section | `md`                                                                               | You                                                                                                       |
| The end of a list row or a table row                                        | `md`, `icon-md`                                                                    | You                                                                                                       |
| Toolbars, filter bars, empty states, the bottom of a popover, Load more     | `md`, `icon-md`                                                                    | You                                                                                                       |
| A phone top bar; the media viewer                                           | `icon-lg`                                                                          | The top bar, `Lightbox`                                                                                   |
| The rail, the web top bar, the desktop title bar                            | `on-frame` at `md` or `icon-md` (the frame item: 34px with a mouse, 36px by touch) | The frame                                                                                                 |
| A menu, a phone's overflow menu                                             | No Button: a menu item                                                             | `DropdownMenu`, the sheet                                                                                 |

#### Inside a floating toolbar

A toolbar that floats over content shows on every message under the pointer, so it is more compact than the page. The message hover toolbar and the text-selection toolbar are 36px high on a touch screen, with 28px buttons at `radius-chip`, and 42px high with a mouse, with buttons at the control height (34px) and `radius-control`, like every desktop control (stdrc, 2026-11-05); the buttons sit 4px from the frame and 4px apart. The container sizes them: `MessageItemToolbarButton` and `TextSelectionToolbarButton` are the toolbars' own parts, and `MessageMultiSelectToolbarActions` brings a `md` Button in it to 28px at every input ([MessageItem](../message-item/message-item.md)). 28px is not a Button size, so don't make a Button 28px yourself. `SidebarSectionControl`, on a sidebar section's header line, is smaller still: 24px with a 14px icon ([Sidebar](../sidebar/sidebar.md#rules)).

### Icon buttons

| Where                                                                   | Props                               | Size and icon                                                           |
| ----------------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------- |
| A phone top bar, or beside a field                                      | `variant="ghost" size="icon-lg"`    | 44px, 22px icon on a phone; 34px, 18px icon, 44px hit area on a desktop |
| A desktop panel header, composer tools, copy in cards and command lines | `variant="ghost" size="icon-md"`    | 32px on a touch screen, 34px on a desktop; 18px icon, 44px hit area     |
| A tool that stands alone in content                                     | `variant="default"` at an icon size | Ink border on `layer-card`                                              |
| Send                                                                    | `variant="primary"` at an icon size | A pink sticker                                                          |
| The rail, the web top bar, the desktop title bar                        | `variant="on-frame" size="icon-md"` | 36px, 20px icon                                                         |

- Make an icon button next to an input (copy a link, remove a row) the input's height: `size="icon-lg"`, which follows the field's height on a phone and on a desktop.
- Put several icon buttons in a panel header inside `PanelActions` ([Panel](../panel/panel.md)), which aligns them to the end and spaces them.
- Mark a bell that has something new with an attention dot on its top-right corner.
- Count the send button as the screen's pink button.

Icon sizes by context are in [Iconography](../../../../../design/foundations/iconography.md#sizes).

### Split buttons

When one action is what most people want and a short menu holds other ways to reach the same result, such as Create agent and its ▾ (Take over a local session, Connect an external agent) on Raft Chat's Members header, the button comes in two parts that read as one: `ButtonSplit` holds a `ButtonSplitMain`, the action, and a `ButtonSplitMenu`, the narrow chevron that opens the menu. Render the menu part as the trigger of a DropdownMenu: `<DropdownMenuTrigger render={<ButtonSplitMenu aria-label="More ways to create an agent" />} />`. Work in progress: import the parts from `@botiverse/raft-ui/wip`.

```example
button/compositions/split
```

- **When.** Use a split when the main action is the usual one and the menu holds a few others. When the choices weigh the same, use one Button that opens a [DropdownMenu](../dropdown-menu/dropdown-menu.md); when they do different things, use separate buttons.
- **Variant and size.** Give both parts the same `variant` and `size`, as a Button takes them: `primary` or `default`, `md` or `lg`. `warning` and `danger` split the same way, used only where their own rules allow those colors ([Which color](#which-color)); a destructive action is rarely the usual one with others beside it. The frameless split is `PanelSplitAction`, for a panel header ([Split actions](../panel/panel.md#split-actions)); there is no `ghost` split button.
- **One shape.** The two parts touch, with no gap, and together are one `radius-control` shape: the main part is rounded only on its start side, the menu part only on its end side, and both are the Button size's height. The menu part is 28px wide beside a 34px height (`md` and `lg` on a desktop; `md` is 32px on a touch screen) and 36px beside `lg`'s 44px on a touch screen, with the size's chevron (16px at `md`, 18px at `lg`). A square would read as a second icon button beside the first (`icon-md` is a 34px square on a desktop); a little narrower than tall, it reads as the end of the main button, and the chevron's ink keeps about 8px of fill on each side.
- **One divider.** The frameless split action needs nothing between its parts, since at rest they are an icon and a chevron on the header. Two parts of the same fill and edge read as one undivided button, so the chevron would seem to belong to the label: a split button draws a line between them. The line is the menu part's start border, the button's own 1.5px edge: `sticker-ink` on a sticker, `line-strong` on `default`. The main part draws no end border, so the line is never doubled. It is the edge every sticker has ([Stickers](../../../../../design/foundations/color.md#stickers)), so it brings no new color or weight. In dark mode the die-cut edge (`sticker-edge`) goes around the whole shape, drawn by the group: around each part it would show as a light seam beside the divider.
- **Hover and press.** The part under the pointer lays its variant's medium tier, `sticker-medium` on a sticker and `fill-medium` on `default`, and press lays the same; its neighbour stays at rest. [Joined frameless parts hover as one control](../../../../../design/foundations/states.md#hover-and-press) tints a frameless part's neighbour because at rest nothing joins the two. Here the fill, the edge and the divider already draw one shape, so a tint on the neighbour would be a second signal on it, and the medium tier on one part still says which one a click acts on.
- **Menu open.** The menu part keeps its medium tier while its menu is open (`data-popup-open`); the main part stays at rest.
- **Focus.** Each part is its own button with its own focus ring, drawn above its neighbour: Tab reaches the main part, then the menu part.
- **Disabled.** Either part can be disabled on its own and takes the shared disabled look; `disabled` on `ButtonSplit` disables both.
- **Touch.** Each part keeps a Button's 44px hit area ([Hit targets](../../../../../design/foundations/spacing.md#hit-targets)): `md` parts overhang above and below, and an `lg` part is 44px tall on a touch screen. The menu part, narrower than 44px, also reaches past its end: 16px at 28px wide, 8px at 36px. End its row with the split, or keep that much room before the next control, so the next control doesn't cover the target.
- Name the group (`aria-label` on `ButtonSplit`, which is `role="group"`) and each part, and don't give the group its main part's name: the group "New agent", the main part "Create agent", the menu part "More ways to create an agent".

```example
button/compositions/split-states
```

## States

Hover, press, focus and disabled follow [States](../../../../../design/foundations/states.md): every button hovers and presses with the medium tier ([Hover and press](../../../../../design/foundations/states.md#hover-and-press)): a sticker lays `sticker-medium` over itself, a paper-colored button `fill-medium`.

- **Disabled, frameless:** a frameless icon button (`ghost` at an icon size) and an `on-frame` button only turn their icon and text `foreground-disabled`. No fill or border appears.
- **Disabled, colored:** a disabled pink, orange or red button is no longer a sticker: it takes the shared disabled look.
- **Loading:** `loading` shows the pixel spinner ([Spinner](../spinner/spinner.md)) and keeps the button's width and color. Use it for any wait a button started ([Choosing a component](../../../../../design/components/overview.md#waiting)). The button stays focusable while it waits and ignores presses ([Accessibility](#accessibility)).

## Content

- Start with a verb and name the result: Send for review, not OK or Submit. In a dialog the title names the object, so its main button says the verb alone: Create in Create channel ([Writing](../../../../../design/content/writing.md#actions-and-their-dialogs)).
- Use sentence case ([Writing](../../../../../design/content/writing.md#casing)), and repeat the button's words in the dialog it opens ([Writing](../../../../../design/content/writing.md#actions-and-their-dialogs)).
- Put an icon before the label (`data-icon="inline-start"`), and Return or an arrow after it (`data-icon="inline-end"`).
- While loading, say what is happening: Creating….
- A Button narrower than its content (given `min-w-0 max-w-full` in a card or a row) truncates its content rather than overflowing its border: give the label `truncate`, and its icons keep their size.

## Accessibility

Button wraps Base UI Button and renders a native `<button>`. For navigation, render a real link instead: `render={<a href="…" />}`.

- Give every icon-only button an `aria-label` in sentence case (Add reaction). On devices with a pointer, add a [Tooltip](../tooltip/tooltip.md) with the same name and the shortcut.
- A busy button keeps its focus. While `loading`, the button is `aria-disabled`, not natively `disabled`: natively disabling the focused button would drop focus to the page, and it would not come back when the wait ends or fails. It stays focusable and in the tab order, and it blocks its own activation: a click, Enter, Space and the form submission it would start do nothing, so the action can't run twice. A button that is `disabled` stays natively `disabled`, loading or not.
- While `loading`, the spinner is named by `loadingLabel`. Set `loadingLabel` to what is happening.
- Use `focusableWhenDisabled` when a Tooltip has to explain why an action is unavailable: the button stays focusable and keeps the disabled look.
- `ButtonSplit` is a `role="group"`; its two parts are Buttons, and the menu part takes `aria-haspopup` and `aria-expanded` from the menu trigger it renders as ([Split buttons](#split-buttons)).
