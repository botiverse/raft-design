---
title: Select
summary: A field that opens a list of values and shows the one chosen, for picking one of up to 10 values or a few of several.
status: stable
aliases: []
layer: core
category: inputs
related: [combobox, combobox-select, dropdown-menu, radio-group, field, picker-trigger-button]
---

# Select

A select is a 44px field with an ink border, like an input. Clicking it opens a list of values; the current value has a check mark. Use it to store a value. When choosing starts an action instead, use a menu.

## When to use

The full choice between pickers is in [Choosing a component](../../../../../design/components/overview.md#picking-something).

| Situation                                             | Use                                                                                            |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| One of up to 10 values                                | Select                                                                                         |
| A few of several values                               | Select with `multiple`                                                                         |
| One or a few of many values, with search              | [ComboboxSelect](../combobox-select/combobox-select.md) or [Combobox](../combobox/combobox.md) |
| One of 2 to 5 answers, each worth a sentence          | [RadioGroup](../radio-group/radio-group.md)                                                    |
| Choosing starts an action rather than storing a value | [DropdownMenu](../dropdown-menu/dropdown-menu.md)                                              |
| Filtering a list                                      | Select or Combobox opened from a filter; see [Filters](#filters)                               |

## Anatomy

- `Select`: the root. Holds the value and the open state. Required.
- `SelectTrigger`: the field that opens the list. Required.
- `SelectValue`: the chosen value in the trigger, or the placeholder.
- `SelectIcon`: the chevron at the trigger's end.
- `SelectContent`: the list's popup, positioned next to the trigger. Required.
- `SelectList`: the scrolling list of items.
- `SelectItem`: one value, with `SelectItemText` and `SelectItemIndicator` (the check mark). `SelectItemLeading` holds an icon or avatar before the text. `SelectItemDescription` is an optional second line under the text.
- `SelectGroup` and `SelectGroupLabel`: a group of values under a small heading. `SelectSeparator` is a hairline between groups.
- `SelectLabel`: a label for the select when it is not in a [Field](../field/field.md).
- `SelectScrollUpArrow`, `SelectScrollDownArrow`, `SelectPortal`, `SelectPopup`: lower-level parts for custom popups.

## Variants

| Variant            | Use for                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| `chrome="default"` | A select outside a form, such as in a settings row or a toolbar                                         |
| `chrome="field"`   | A select in a form, beside inputs: its value and options use the field's type, so they match the inputs |
| `multiple`         | A few of several values                                                                                 |

### Filters

A filter is a Select or a [Combobox](../combobox/combobox.md) opened from a [PickerTriggerButton](../picker-trigger-button/picker-trigger-button.md) above a list.

```example
picker-trigger-button/compositions/select-filter
```

- Make a filter 32px high, with a 44px hit area.
- Outline a filter that is not applied with `line-seam`. Fill an applied filter with `info-soft` and show how many values it has.
- Put a `ghost` Clear All button after the filters.
- Open the same list as any picker: single or multiple, with search when there are many values.

## States

- **No value:** `SelectValue` shows the placeholder in `foreground-hint`.
- **Invalid:** `data-invalid` on the trigger gives it a `danger-strong` border.
- **Disabled** and the hover highlight in the list follow [States](../../../../../design/foundations/states.md).

## Behavior

- Make the list as wide as the field. Align a filter's list with the filter's left edge, and with its right edge when there is no room. How every popup is positioned is in [Elevation](../../../../../design/foundations/elevation.md#popups).
- Open the same list on a phone. Don't replace it with a bottom sheet: a bottom sheet is for going somewhere, such as switching server ([Choosing a component](../../../../../design/components/overview.md#overlays)).
- With `multiple`, keep the list open when a value is chosen. Clicking outside or Esc closes it.
- With `multiple`, put a box before each item (`CheckboxIndicator` in `SelectItemLeading`), ink when chosen ([Checkbox](../checkbox/checkbox.md)). The trigger shows the chosen values, or a count (3 selected) when they don't fit.

## Content

- Group values by kind (Agents, People) with `SelectGroupLabel`.
- Put secondary information (a runtime, a role, presence) at the end of the item, in `foreground-hint`.
- Put a short explanation of what a value means (what a model is good at, what a level does) on a second line, in `SelectItemDescription`. Don't repeat the label in another form, such as its id in lowercase: a line that says nothing new only makes the list taller.

```example
select/compositions/descriptions
```

An item is as tall as its content. One line keeps the 36px minimum; with a description it grows, keeping 6px above and below its text, so two-line items never touch. `SelectItemDescription` sits beside `SelectItemText`, not inside it, so the trigger shows only the label.

- Put the empty choice first when there is one, as with Unassigned ([Tasks](../../../../../design/patterns/tasks.md#filters)).

## Accessibility

Select wraps Base UI Select: a button that opens a listbox, with typeahead and arrow-key navigation.

- Name the select with a `FieldLabel` ([Field](../field/field.md)), a `SelectLabel`, or `aria-label` on the trigger.
- In a multi-select, the box before each item is decorative; Base UI states the selection with `aria-selected`.
