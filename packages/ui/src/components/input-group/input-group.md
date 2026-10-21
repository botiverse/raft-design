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

## States

- Put `data-invalid` and `disabled` on `InputGroupInput`. The group draws them: a `danger-strong` border when invalid, the shared disabled look when disabled ([States](../../../../../design/foundations/states.md)).
- The focus ring goes around the whole group ([States](../../../../../design/foundations/states.md#focus)).

## Behavior

- In a search field, put an 18px search icon at the start, and a clear button at the end once there is text.
- A text addon takes at most half the group and truncates past that, with its whole text as its `title`, so there is always room to type ([Forms](../../../../../design/patterns/forms.md#long-values-in-fields)).

## Accessibility

`InputGroupInput` wraps Base UI Input; the group itself is a plain `<div>`.

- Name the input with a `FieldLabel` ([Field](../field/field.md)), or with `aria-label` on a search field that has no visible label (Search).
- Give a button addon its own `aria-label` (Clear Search).
- Text addons are not read as part of the value. When the prefix matters for understanding the value, say it in the label or the help text.
