---
title: PickerTriggerButton
summary: The compact 32px button that opens a Select or Combobox as a filter above a list, outlined until the filter is applied and filled once it is.
status: stable
aliases: [Filter, Filter button, Filter trigger]
category: inputs
related: [select, combobox, combobox-select, button]
---

# PickerTriggerButton

PickerTriggerButton is the button of a filter: a compact 32px trigger that opens the list of a [Select](../select/select.md) or a [Combobox](../combobox/combobox.md) above the list it filters. It has no state of its own. It is rendered as the select's or combobox's trigger, which keeps opening, focus, keyboard navigation and selection.

```example
picker-trigger-button/compositions/select-filter
```

## When to use

| Situation                                     | Use                                                                     |
| --------------------------------------------- | ----------------------------------------------------------------------- |
| Filtering a list by one value or a few values | PickerTriggerButton, rendered as a `SelectTrigger` or `ComboboxTrigger` |
| Picking a value in a form                     | The select's own 44px field ([Select](../select/select.md))             |
| A list of actions                             | A menu ([DropdownMenu](../dropdown-menu/dropdown-menu.md))              |
| A row of options, each on or off on its own   | [ToggleGroup](../toggle-group/toggle-group.md)                          |

The full choice between pickers is in [Choosing a component](../../../../../design/patterns/choosing-components.md#picking-something). How a filter looks, how many values it shows and where Clear All goes are in [Select › Filters](../select/select.md#filters).

## Anatomy

PickerTriggerButton is one part. Pass it as `render` to `SelectTrigger` or `ComboboxTrigger`, and put the trigger's usual parts inside, in this order:

- A leading icon: optional, 14px.
- The value: `SelectValue`, or the chosen label for a combobox. Required.
- `ComboboxTriggerCount`: how many values an applied combobox filter has. Optional.
- The indicator: `SelectIcon` or `ComboboxTriggerIndicator`, a chevron in `foreground-hint`.

```example
picker-trigger-button/compositions/combobox-filter
```

## States

| State                      | Look                                                                                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Not applied                | `foreground-muted` text inside a `line-seam` outline                                                                                                |
| Applied (`data-has-value`) | `info-soft` fill, `foreground` text, no outline ([States](../../../../../design/foundations/states.md#usage): an active filter is selected content) |
| Invalid (`data-invalid`)   | A `danger-strong` outline                                                                                                                           |
| Disabled                   | Follows [States](../../../../../design/foundations/states.md#usage): `fill-muted`, `foreground-disabled` text                                       |

- `ComboboxTrigger` sets `data-has-value` when the combobox has a value. A `SelectTrigger` always holds a value, so it never sets it: pass `data-has-value` yourself when the filter differs from its default.

## Behavior

- The list opens next to the trigger, as every popup does ([Elevation](../../../../../design/foundations/elevation.md#popups)); its width and alignment are in [Select › Behavior](../select/select.md#behavior).
- The trigger keeps its height and doesn't wrap or truncate: a long value makes it wider.

## Content

- Show the current value, not the filter's name, once a value is chosen: Relevance, #launch-week. Before that, show the filter's name: Channel, Assignee.
- The general rules for labels are in [Writing](../../../../../design/foundations/writing.md#casing).

## Accessibility

- PickerTriggerButton wraps the Base UI Button. The select or combobox it is rendered for adds the trigger's role, `aria-expanded` and the popup relationship.
- Its accessible name is its text. When the text is only the value (Relevance), add an `aria-label` that also names the filter ("Sort: Relevance"), because the value alone doesn't say what it changes.
- Hide the leading icon and the chevron from assistive technology (`aria-hidden`).
- Name the search row of a combobox filter with `aria-label` ("Search channels").

## Rules

- Use PickerTriggerButton only for filters. A picker in a form uses the select's own 44px field with an ink border, like the inputs around it.
- Don't open a menu of actions from it: it always opens a list of values.
- Don't style an applied filter yourself. Set `data-has-value` and let the component fill it.
