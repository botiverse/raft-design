---
title: Kbd
summary: A keyboard key or shortcut shown as a hint, in Space Mono inside a hairline box — in menus, tooltips, the search trigger and inputs.
status: stable
aliases: [Keyboard shortcut, Shortcut, KbdGroup]
layer: core
category: data-display
related: [dropdown-menu, context-menu, tooltip, search]
---

# Kbd

Kbd shows a key or a shortcut as a hint: ⌘K, Esc, ⌫. It is quiet metadata beside something else, never a control of its own. It is set in `text-mono-meta` and `foreground-hint`, inside a `line-hairline` box.

## When to use

| Situation                                      | Use                                                                                                                |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| The shortcut of a menu item                    | `DropdownMenuShortcut` or `ContextMenuShortcut`, which are Kbd ([DropdownMenu](../dropdown-menu/dropdown-menu.md)) |
| The shortcut of an icon button, in its tooltip | Kbd inside `TooltipContent`, after the text ([Tooltip](../tooltip/tooltip.md))                                     |
| The shortcut that opens search                 | `SearchTriggerShortcut` ([Search](../search/search.md))                                                            |
| The shortcut that focuses an input             | Kbd in an `InputGroupAddon` at the end of an [InputGroup](../input-group/input-group.md)                           |
| A key or a shortcut named in running text      | Kbd                                                                                                                |
| Code, a command or a file name                 | [InlineCode](../inline-code/inline-code.md)                                                                        |

## Anatomy

- `Kbd`: one key, or a whole shortcut written as one string (⌘C). It renders a `kbd`.
- `KbdGroup`: holds several `Kbd`, 4px apart, for a shortcut written key by key. Optional.

## Behavior

- Kbd ignores the pointer and can't be selected: a click goes to the row or the button it sits in.
- Inside a tooltip, Kbd switches to the tooltip's `foreground-on-hud` colors.

## Content

- Write modifier and editing keys as their symbols, and named keys as their names: ⌘K, ⌫, Esc. Search and tooltips write ⌘K the same way.
- Let the label beside it say what the shortcut does. Kbd is a hint, not the label.

## Accessibility

- Kbd renders the native `kbd` element and adds no role.
- Symbols are read inconsistently by screen readers. When a `KbdGroup` spells a shortcut with symbols, give it an `aria-label` that says it in words: Command K.

## Rules

- Never make Kbd clickable, and never use it as the label of a button.
- Put Kbd at the end of what it belongs to: after a menu item's label, after a tooltip's text.
