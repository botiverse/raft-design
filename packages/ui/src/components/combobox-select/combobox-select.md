---
title: ComboboxSelect
summary: A ready-made searchable select driven by an array of options, for one or a few of many values, with groups, remote search and creation.
status: experimental
aliases: []
layer: core
category: inputs
related: [select, combobox, field]
---

# ComboboxSelect

ComboboxSelect is a field at the control height (44px on a phone, 32px on a desktop) that people type into to find one or a few values in a long list. On a phone it opens without the keyboard: the anchored list for up to 10 values, a bottom sheet with search for more. It takes an array of options, flat or grouped, and builds the field, the list, the chips and the empty and loading lines from it. It is exported from `@botiverse/raft-ui/wip`, and its API can change in any release.

```example
combobox-select/compositions/preview
```

## When to use

The full choice between pickers is in [Choosing a component](../../../../../design/components/overview.md#picking-something).

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
- On a phone, open up to 10 values in the anchored list and more in a bottom sheet with its search row at the top ([Overlays on a phone](../../../../../design/patterns/page-structure.md#overlays-on-a-phone)). ComboboxSelect does this itself ([On a phone](#on-a-phone)).

### On a phone

A phone here is a touch screen narrower than the desktop layout, `(width < 48rem) and (pointer: coarse)`. A desktop, and any screen with a mouse or a trackpad, keeps the text field above. On a phone, picking a value needs no typing, so the field is not a text input: it shows the chosen value like a [Select](../select/select.md) trigger, and a tap opens the list without bringing up the keyboard.

- **Up to 10 values** (`sheetThreshold`, counting every option that can be chosen, flat or in groups) open the anchored list, as a Select does. It opens below the field, or above when it fits there and not below, and keeps that side while it is open: it gets shorter rather than flipping when the window changes size. Picking a value closes it.
- **More than 10 values** open a bottom sheet ([Drawer](../drawer/drawer.md)) titled with the field's label. The search input sits at its top and isn't focused, so the keyboard comes up only when someone taps it; the whole list scrolls below it, with the same options, groups and empty and loading lines as on a desktop. Picking a value closes the sheet. With `multiple`, the sheet stays open and Done in its footer closes it.
- **Creating values** (`create`) and **remote results** (`remote`) need typing, so they always open the sheet, whatever the number of values. With `create`, the sheet's input takes focus as it opens.

```example
combobox-select/compositions/many-options
```

This is only for picking from a list. [Combobox](../combobox/combobox.md), the free-text field for mentions and tags, will get its own phone pattern: the input pinned at the top of a sheet or a full screen, with the suggestions between it and the keyboard.

## Content

- Write the placeholder as what to do: Choose a model.
- Write the empty line as what found nothing: No models match "zz".

## Accessibility

ComboboxSelect wraps Base UI Combobox: a text input with `role="combobox"` that controls a listbox.

- Name the field with a `FieldLabel` ([Field](../field/field.md)) whose `htmlFor` matches its `id`, or with `aria-label`.
- Left Arrow at the start of the input moves focus to the chips, and Backspace or Delete removes the focused chip. Each remove button is named after its value (Remove Bugen).
- On a phone the field is a button with `role="combobox"`, named the same way. With up to 10 values it opens a listbox and moves focus into it; arrow keys and Enter pick a value. With more, it opens a dialog titled with the field's label (`sheetTitle`, else `aria-label`, `aria-labelledby` or the `FieldLabel`), and focus moves into the sheet; the search input is named by the title, and arrow keys and Enter pick a value from it. Esc or the close button returns focus to the field.
- Translate these announcements and the sheet's Search, Done and Close with `messages` when the interface is not in English.
