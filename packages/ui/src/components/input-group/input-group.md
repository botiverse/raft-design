---
title: InputGroup
summary: An input with a fixed prefix, suffix, icon or button inside the same bordered box, such as a domain, a unit or a search icon.
status: stable
aliases: []
layer: core
category: inputs
related: [input, field, search]
---

# InputGroup

An input group puts fixed text, an icon or a button inside an input's box: a domain before a server's address, a unit after a budget, a search icon before a query. The box, its border and its states belong to the group, so the input and its addons read as one control.

## When to use

| Situation                                                            | Use                            |
| -------------------------------------------------------------------- | ------------------------------ |
| A value with a fixed prefix or suffix: `raft.build/`, `#`, USD / day | InputGroup                     |
| A search field                                                       | InputGroup with a search icon  |
| An input with an action inside it, such as clearing or copying       | InputGroup with a button addon |
| A plain value                                                        | [Input](../input/input.md)     |
| A search across the server                                           | [Search](../search/search.md)  |

## Anatomy

- `InputGroup`: the bordered box. Required.
- `InputGroupAddon`: an icon or a button at the start or end (`align`).
- `InputGroupAddon.Text`: fixed text at the start or end, in Space Mono and `foreground-hint`.
- `InputGroupInput`: the input itself, without a border of its own. Required.

## Variants

| Variant                     | Use for                                                                                                                      |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Addon `variant="default"`   | A light mark inside the field: a search icon, a keyboard hint, a clear button                                                |
| Addon `variant="container"` | Part of the value's structure: a protocol, a domain, a unit. It sits on `fill-muted`, separated from the input by a hairline |

## Sizes

| Size           | Use for                                                                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lg` (default) | A field on its own: a form, a dialog, a settings page. The control height, 44px on a phone and a touch screen, 34px with a mouse                   |
| `md`           | A field in a toolbar or a filter row, beside `md` buttons, filter triggers or a view switch. 32px on a phone and a touch screen, 34px with a mouse |

```example
input-group/compositions/filter-row
```

- In a toolbar or a filter row, give the field the row's button height with `size="md"`. A 44px field beside 32px filter triggers and a view switch reads taller and heavier than the rest of the row on a touch screen (xxchan, 2026-11-06, #proj-workspace:68999338); with a mouse both are 34px, so nothing changes there ([Spacing](../../../../../design/foundations/spacing.md#heights)).
- By touch an `md` field keeps a 44px tap area the way a 32px Button does: its input reaches 6px past the box above and below, plus the border. A tap on its addons doesn't reach past the box.
- A Button in an `md` field's end addon is the field's height less 6px above and below: 20px by touch, 22px with a mouse. Its text stays 16px by touch, so iOS doesn't zoom into it on focus.

## States

- Put `data-invalid` and `disabled` on `InputGroupInput`. The group draws them: a `danger-strong` border when invalid, the shared disabled look when disabled ([States](../../../../../design/foundations/states.md)).
- The focus ring goes around the whole group ([States](../../../../../design/foundations/states.md#focus)).

## Behavior

- In a search field, put an 18px search icon at the start, and a clear button at the end once there is text.
- A Button in an end addon is a control embedded in the field: 22px on a desktop and 32px on a phone, with `radius-chip` and a 16px icon. When it is the addon's last child it sits 6px from the field's end, as far as from its top and bottom; put a hint such as Esc before it, not after ([Shape](../../../../../design/foundations/shape.md#inside-a-frame)).
- A text addon takes at most half the group and truncates past that, with its whole text as its `title`, so there is always room to type ([Forms](../../../../../design/patterns/forms.md#long-values-in-fields)).

## Accessibility

`InputGroupInput` wraps Base UI Input; the group itself is a plain `<div>`.

- Name the input with a `FieldLabel` ([Field](../field/field.md)), or with `aria-label` on a search field that has no visible label (Search).
- Give a button addon its own `aria-label` (Clear search).
- Text addons are not read as part of the value. When the prefix matters for understanding the value, say it in the label or the help text.
