---
title: Combobox
summary: A searchable list of values built from parts, for filters with search and for picking a few of many values as chips.
status: stable
aliases: []
layer: core
category: inputs
related: [select, combobox-select, picker-trigger-button, field]
---

# Combobox

A combobox is a list of values that people narrow down by typing. raft-ui gives it as parts: a filter that opens a list with a search row, a field that people type into, or a field of chips for several values. For a ready-made field driven by an array of options, use [ComboboxSelect](../combobox-select/combobox-select.md).

```example
combobox/compositions/tasks-channel-filter
```

## When to use

The full choice between pickers is in [Choosing a component](../../../../../design/components/overview.md#picking-something).

| Situation                                                         | Use                                                     |
| ----------------------------------------------------------------- | ------------------------------------------------------- |
| A filter over a list with many values, such as channels           | Combobox with `ComboboxTrigger` and a search row        |
| A few of many values (people, agents, labels) as chips in a field | Combobox with `ComboboxChips`                           |
| One or a few of many values in a form, from an array of options   | [ComboboxSelect](../combobox-select/combobox-select.md) |
| One of up to 10 values                                            | [Select](../select/select.md)                           |

## Anatomy

- `Combobox`: the root. Holds the value, the typed text and the open state. Required.
- What opens the list, one of:
  - `ComboboxTrigger`: the filter button, with an icon, a label, `ComboboxTriggerCount` and `ComboboxTriggerIndicator`;
  - `ComboboxControl`: a field at the control height (44px on a phone, 32px on a desktop) with an ink border, holding `ComboboxInput`, `ComboboxClear` and `ComboboxTriggerIndicator`;
  - `ComboboxChips`: a field at least the control height, holding one `ComboboxChip` per chosen value, each with a `ComboboxChipRemove`, then `ComboboxInput`.
- `ComboboxContent`: the popup. Required.
- `ComboboxHeader`: the popup's top row, with `ComboboxLabel` and a `ComboboxClear`. `ComboboxSeparator` is the hairline under it.
- `ComboboxInputGroup`: the search row at the top of the list, holding `ComboboxInput`.
- `ComboboxList`: the scrolling list of `ComboboxItem`s, each with a `ComboboxItemIndicator` (the check mark). `ComboboxGroup` and `ComboboxGroupLabel` group them; `ComboboxRow` and `ComboboxCollection` lay out grids and nested collections.
- `ComboboxEmpty`: the line shown when nothing matches.
- `ComboboxValue`, `ComboboxPortal`, `ComboboxPopup`: lower-level parts.

## Variants

| Variant                                 | Use for                                                                                      |
| --------------------------------------- | -------------------------------------------------------------------------------------------- |
| Filter (`ComboboxTrigger`)              | Filtering a list: the look of a filter is in [Select › Filters](../select/select.md#filters) |
| Field (`ComboboxControl`)               | Typing to find one value in a form                                                           |
| Chips (`ComboboxChips` with `multiple`) | A few of many values, shown as chips in the field                                            |

```example
picker-trigger-button/compositions/combobox-filter
```

## States

- **Applied filter:** a `ComboboxTrigger` with a value fills with `info-soft` and shows the count.
- **No match:** `ComboboxEmpty` says what found nothing: No one matches "zz".
- **Focus:** a chips field rings as a whole ([States](../../../../../design/foundations/states.md#focus)); the search row in the popup takes the inset ink outline ([Elevation](../../../../../design/foundations/elevation.md#focus-ring)).

## Behavior

- Filter the list as people type.
- Show `ComboboxEmpty` when nothing matches. Never leave an empty popup open.
- With `multiple`, keep the list open when a value is chosen. Clicking outside or Esc closes it.
- Make a chosen value a 28px chip on `fill-muted`, with a remove button at its end. Typing continues after the last chip.
- Put a chip's text in an element of its own (a `<span>`): a long value truncates there, at the width of the field, with its whole text as the chip's `title`, and the remove button stays visible ([Forms](../../../../../design/patterns/forms.md#long-values-in-fields)).
- An item is as tall as its content: one line is 36px, and each further line adds only its own height, with the same space above and below the text ([Forms](../../../../../design/patterns/forms.md#option-height)).
- A long item wraps onto as many lines as it needs. The list grows to fit it up to 24rem (or the field's width, when that is wider), never past the screen less 8px on each side.
- For results that come from a server, pass `filter={null}` so the list shows them as they are, and keep the typed text controlled.

## Accessibility

Combobox wraps Base UI Combobox: a text input with `role="combobox"` that controls a listbox, with arrow-key navigation and the highlighted item announced.

- Name the input: with a `FieldLabel` ([Field](../field/field.md)), or with `aria-label` on a search row in a popup (Search Channels).
- In a chips field, each chip's remove button and the input are reachable with the keyboard. Name each remove button after its value (Remove Bugen).
- Give `ComboboxClear` a label that says what it clears when it shows only an icon.
