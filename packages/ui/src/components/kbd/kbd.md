---
title: Kbd
summary: A keyboard key in Space Mono inside a cap, one key per cap: sm as a hint in menus, tooltips, the search trigger and inputs, md where the keys are the content, as in a list of shortcuts.
status: stable
aliases: [Keyboard shortcut, Shortcut, KbdGroup, KbdShortcut]
layer: core
category: data-display
related: [dropdown-menu, context-menu, tooltip, search]
---

# Kbd

Kbd shows a keyboard key in a cap, one key per cap. At `sm`, the default, it is quiet metadata beside something else: a menu item, a tooltip, the search trigger. At `md` the keys are the content, as in a list of shortcuts. `KbdShortcut` draws a whole shortcut from key names, for the platform the page runs on. Kbd is never a control of its own.

```example
kbd/compositions/sizes
```

## When to use

| Situation                                                                                | Use                                                                                                              |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| A list of shortcuts, where the keys are the content: a shortcuts panel, help, onboarding | `KbdShortcut` at `size="md"`                                                                                     |
| The shortcut of an icon button, in its tooltip                                           | `KbdShortcut` at `sm`, inside `TooltipContent` after the text ([Tooltip](../tooltip/tooltip.md))                 |
| The shortcut that opens search                                                           | `SearchTriggerShortcut` ([Search](../search/search.md))                                                          |
| The shortcut that focuses an input                                                       | Kbd at `sm` in an `InputGroupAddon` at the end of an [InputGroup](../input-group/input-group.md)                 |
| A key or a shortcut named in running text                                                | `KbdShortcut` at `sm`                                                                                            |
| The shortcut of a menu item                                                              | `DropdownMenuShortcut` or `ContextMenuShortcut`, with no cap ([DropdownMenu](../dropdown-menu/dropdown-menu.md)) |
| Code, a command or a file name                                                           | [InlineCode](../inline-code/inline-code.md)                                                                      |

## Anatomy

- `Kbd`: one key in a cap. It renders a `kbd`.
- `KbdGroup`: holds several `Kbd`, 4px apart, for a shortcut written key by key, such as one that exists on one platform only. Hide it (`aria-hidden`) and say the shortcut in words in a visually hidden span beside it.
- `KbdShortcut`: a whole shortcut from key names, `keys={["mod", "shift", "enter"]}`. It renders a `KbdGroup` of caps, one per key, and the shortcut in words for a screen reader. It is exported from `@botiverse/raft-ui/wip` while its API settles.

```example
kbd/compositions/group
```

## Sizes

| Size                  | Use for                                                                                                                                                                                                                                                                                                                                  |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `size="sm"` (default) | A shortcut beside something else: a tooltip, the search trigger, an input addon, running text. `text-mono-meta` in `foreground-hint`, inside a `line-hairline` with a 3px radius, with no fill. A bare Kbd is as tall as the text's line, 16px on a phone and 18px on a desktop; inside a `KbdShortcut` and a tooltip every cap is 16px. |
| `size="md"`           | A list of shortcuts, where the keys are what the person reads. A 24px cap in Space Mono at the `text-mono-code` size, `foreground-muted` on `fill-muted` inside a `line-hairline`: 13px mono sits level with a 14px label beside it.                                                                                                     |

`md` uses `radius-sticker`, the radius of inline marks ([Shape](../../../../../design/foundations/shape.md)). `sm` keeps the 3px radius it has always had, so the hints already in menus, tooltips and search don't change. The line is 1px, not the ink border: Kbd is not a control.

## Shortcuts from key names

Write the keys by name and let `KbdShortcut` draw them. It reads the platform once on the client (`useKeyboardPlatform`) and draws `other` on the server and while hydrating, so a server-rendered page shows Ctrl on a Mac until it hydrates. Pass `platform="mac"` or `platform="other"` where the platform is known, and in docs and tests.

```example
kbd/compositions/platforms
```

| Key name                          | macOS                            | Windows and Linux | Said as (macOS / other) |
| --------------------------------- | -------------------------------- | ----------------- | ----------------------- |
| `mod`                             | Command icon                     | Ctrl              | Command / Control       |
| `meta`, `cmd`, `command`          | Command icon                     | Win               | Command / Windows       |
| `ctrl`, `control`                 | Control icon (`chevron-up`)      | Ctrl              | Control                 |
| `alt`, `opt`, `option`            | Option icon                      | Alt               | Option / Alt            |
| `shift`                           | Shift icon (`arrow-big-up`)      | Shift             | Shift                   |
| `enter`, `return`                 | Return icon (`corner-down-left`) | Enter             | Return / Enter          |
| `backspace`                       | Delete icon (`delete`)           | Backspace         | Delete / Backspace      |
| `delete`, `del`                   | Del                              | Del               | Forward Delete / Delete |
| `escape`, `esc`                   | Esc                              | Esc               | Escape                  |
| `tab`, `space`                    | Tab, Space                       | Tab, Space        | Tab, Space              |
| `up`, `down`, `left`, `right`     | Arrow icons                      | Arrow icons       | Up Arrow…               |
| A single character: `k`, `1`, `/` | K, 1, /                          | K, 1, /           | K, 1, Slash             |
| `f1` … `f24`                      | F1 … F24                         | F1 … F24          | F1 … F24                |

- Write `mod` for the platform's command key, ⌘ on a Mac and Ctrl elsewhere. Write `ctrl` only for the literal Control key, and `meta` only for the literal Command key, which is the Windows key on Windows and Linux.
- Names are case-insensitive, and `KeyboardEvent.key` values work as names: `ArrowUp`, `Control`, `Meta`, `Escape`, `" "` for Space. An alias sorts as the modifier it names.
- Two names for one key on a platform draw one cap, and log a warning in development: `["mod", "ctrl", "k"]` is Ctrl K on Windows and Linux. An empty name is skipped, with a warning too.
- Modifiers are drawn in the platform's order, whatever order you write them in: ⌃ ⌥ ⇧ ⌘ on macOS (Apple's order), so `["mod", "shift", "enter"]` draws ⇧ ⌘ ↩; Ctrl, Alt, Shift on Windows and Linux. The other keys follow in the order written.
- On macOS, modifiers, Return, Delete and the arrows are Lucide icons, at 14px in `md` and 12px in `sm`, centered in the cap. The fallback fonts that draw ⌘ ⇧ ↩ give each a different size and baseline.
- Esc is the word Esc on every platform: Lucide has no Escape icon, and ⎋ is not widely recognized.
- ASCII letters are uppercase; other characters stay as written (ß stays ß, which uppercases to two letters). Letters and words are one font size, trimmed to cap height (`text-box: trim-both cap alphabetic`), so they center on the same line as the icons. Firefox has no `text-box` yet: there the text centers on its line box, about 1px off the icons.

## Spacing and shape

- One key per cap, never a "+" inside a cap. Caps in a group sit 4px apart.
- In a `KbdShortcut`, every cap at a size is one height, 24px at `md` and 16px at `sm`, and at least as wide, so a single key is square. An icon cap has no side padding for that reason. A bare `sm` Kbd keeps the height of its line and its side padding.
- In a list row, put the shortcut at the trailing edge, centered on the row, at least 16px from the text.

Show alternatives as two `KbdShortcut` joined by a "/" in `foreground-hint`, 6px on each side at `md` and 4px at `sm`, with a visually hidden "or" for a screen reader. `KbdShortcut` takes one shortcut, so you write the separator:

```example
kbd/compositions/shortcuts-panel
```

## Behavior

- Kbd ignores the pointer and can't be selected: a click goes to the row or the button it sits in.
- Inside a tooltip, `sm` caps switch to the tooltip's `foreground-on-hud` colors. The tooltip sets the 6px gap before a Kbd or a `KbdGroup`, not before each cap in a group. Never put `md` in a tooltip: the tooltip forces the `sm` metrics but keeps `md`'s fill.

## Menus

A menu draws its shortcut with no cap, as native menus do: `DropdownMenuShortcut` and `ContextMenuShortcut` are a bare `sm` Kbd. They take the shortcut as a string; write it the platform's way (⌘⇧C on a Mac, Ctrl+Shift+C elsewhere), where a "+" is fine because there is no cap to put it in.

## Content

- Let the label beside the shortcut say what it does. Kbd is a hint, not the label.

## Accessibility

- Kbd renders the native `kbd` element and adds no role.
- `KbdShortcut` hides its caps (`aria-hidden`) and says the shortcut in words in a visually hidden span, in the order the caps are drawn: "Shift Command Return" on a Mac, "Control Shift Enter" elsewhere. The words are English; pass `label` with the product's own words in another language.
- Never rely on `aria-label` on a `kbd` or a `span`: they have no role, so screen readers ignore the name. A Kbd or `KbdGroup` you write by hand with symbols is hidden (`aria-hidden`) and followed by a visually hidden span (`sr-only`) that says it in words: Command K. Symbols are read inconsistently by screen readers.
- Between alternatives, hide the "/" and add a visually hidden "or".

## Rules

- Never make Kbd clickable, and never use it as the label of a button.
- Put Kbd at the end of what it belongs to: after a menu item's label, after a tooltip's text.
- Write key names, never glyphs or "+", when you use `KbdShortcut`: the platform picks the drawing.
- Use `md` only where the keys are the content. Beside a label in a tooltip, a menu or a field, `md` outweighs the label it serves.
