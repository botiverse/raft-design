---
title: ComboboxSelect
summary: A ready-made searchable select driven by an array of options, for one or a few of many values, with groups, remote search and creation.
status: experimental
aliases: []
category: inputs
related: [select, combobox, field]
---

# ComboboxSelect

ComboboxSelect is a 44px field that people type into to find one or a few values in a long list. It takes an array of options, flat or grouped, and builds the field, the list, the chips and the empty and loading lines from it. It is exported from `@botiverse/raft-ui/wip`, and its API can change in any release.

```example
combobox-select/compositions/preview
```

## When to use

The full choice between pickers is in [Choosing a component](../../../../../design/patterns/choosing-components.md#picking-something).

| Situation                                                         | Use                                 |
| ----------------------------------------------------------------- | ----------------------------------- |
| One of many values, with search                                   | ComboboxSelect                      |
| A few of many values (people, agents, labels)                     | ComboboxSelect with `multiple`      |
| Values that come from a server as people type                     | ComboboxSelect with `remote`        |
| One of up to 10 values                                            | [Select](../select/select.md)       |
| A filter over a list, or a layout the options array can't express | [Combobox](../combobox/combobox.md) |

## Variants

| Variant                  | Use for                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------- |
| Single (default)         | One value. The list shows a check mark on the current value                           |
| `multiple`               | A few values. Each chosen value becomes a chip in the field                           |
| Grouped options          | Values that belong together, such as models by provider. Group labels head each group |
| `remote` with `onSearch` | Results the caller fetches. The component shows them without filtering                |
| `create`                 | Values people can add by typing a new one                                             |

```example
combobox-select/compositions/combobox-select
```

```example
combobox-select/compositions/model-select
```

```example
combobox-select/compositions/async-search
```

## States

- **Loading:** `loading` shows a loading line in the list. Keep the list open while a choice is being saved, and show it with `loading`.
- **Not loaded yet:** `fallbackOption` gives a label to a chosen value whose option hasn't arrived, so the field stays readable.
- **Invalid:** `status="error"` or `aria-invalid` gives the field a `danger-strong` border.
- **No match:** the list says so in one line. Don't leave an empty popup.

## Behavior

- Filter the options as people type, unless `remote` is set.
- With `multiple`, keep the list open when a value is chosen; clicking outside or Esc closes it. Typing continues after the last chip.
- With `maxTagCount`, chips beyond the count collapse into a count while the field is not focused. All of them come back on focus.

## Content

- Write the placeholder as what to do: Choose a model.
- Write the empty line as what found nothing: No models match "zz".

## Accessibility

ComboboxSelect wraps Base UI Combobox: a text input with `role="combobox"` that controls a listbox.

- Name the field with a `FieldLabel` ([Field](../field/field.md)) whose `htmlFor` matches its `id`, or with `aria-label`.
- Left Arrow at the start of the input moves focus to the chips, and Backspace or Delete removes the focused chip. Each remove button is named after its value (Remove Bugen).
- Translate these announcements with `messages` when the interface is not in English.
