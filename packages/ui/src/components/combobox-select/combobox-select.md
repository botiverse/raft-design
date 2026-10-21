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

ComboboxSelect is a field at the control height (44px on a phone, 32px on a desktop) that people type into to find one or a few values in a long list, on a phone as on a desktop. It is for filtering, searching a server and creating values; a field people only pick from is a [Select](../select/select.md). It takes an array of options, flat or grouped, and builds the field, the list, the chips and the empty and loading lines from it. It is exported from `@botiverse/raft-ui/wip`, and its API can change in any release.

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
| One of up to 10 values, or any value picked without typing        | [Select](../select/select.md)       |
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
- With a value chosen, the field shows its label. Focusing the field, by a click, a tap or Tab, selects that label, and the list shows every option until people type. Typing then replaces the label and filters from what was typed. With the caret after the label, typing would be added to it ("studio-mac" and "node" make "studio-macnode"), match nothing, and people would have to delete the label first. A click or tap on a field that is already focused places the caret, so the label can still be edited. With `multiple` the input holds only what people type, after the chips, so nothing is selected.
- With `multiple`, keep the list open when a value is chosen; clicking outside or Esc closes it. Typing continues after the last chip.
- An option is as tall as its content: one line is 36px, and a second line adds only its own height, with the same space above and below the text ([Forms](../../../../../design/patterns/forms.md#option-height)).
- A long option wraps to two lines, then truncates; a long chip truncates at the width of the field. Each has its whole text as its `title` while it is cut off ([Forms](../../../../../design/patterns/forms.md#long-values-in-fields)).
- With `maxTagCount`, chips beyond the count collapse into a count while the field is not focused. All of them come back on focus.
- The list grows to 16rem (256px), its 6px padding above and below included: six 36px rows and part of a seventh, which shows there are more. Then it scrolls. `listMaxHeight` (a CSS length, or pixels, measured the same way) moves that cap, and `listMaxHeight="16rem"` is the same as leaving it out. Raise it where the field has a tall space of its own below it, such as a tall bottom [Drawer](../drawer/drawer.md); lower it when the list would cover something people need to see while they choose.

### On a phone

A phone here is a touch screen narrower than the desktop layout, `(width < 48rem) and (pointer: coarse)`. ComboboxSelect is the same text field there as on a desktop, because typing is what it is for: a tap focuses it and brings up the keyboard, typing filters the list, and `create` and `remote` work in the field. There is no bottom sheet. When people only pick a value and never need to type, use a [Select](../select/select.md) instead: it opens without the keyboard.

- The list opens below the field, or above when it fits there and not below, and keeps that side while it is open. As the keyboard comes up, the address bar moves or the filtered list shrinks and grows, it gets shorter or longer on its side rather than flipping, so it never jumps.
- The input stays at 16px or more at every `size`, so iOS doesn't zoom into it.
- Inside a bottom [Drawer](../drawer/drawer.md), give the drawer room for the field and its list above the keyboard, and raise `listMaxHeight` when the drawer is tall.

```example
combobox-select/compositions/in-drawer
```

```example
combobox-select/compositions/many-options
```

This is for finding a value in a list. [Combobox](../combobox/combobox.md), the free-text field for mentions and tags, will get its own phone pattern: the input pinned at the top of a sheet or a full screen, with the suggestions between it and the keyboard.

## Content

- Write the placeholder as what to do: Choose a model.
- Write the empty line as what found nothing: No models match "zz".

## Accessibility

ComboboxSelect wraps Base UI Combobox: a text input with `role="combobox"` that controls a listbox.

- Name the field with a `FieldLabel` ([Field](../field/field.md)) whose `htmlFor` matches its `id`, or with `aria-label`.
- Left Arrow at the start of the input moves focus to the chips, and Backspace or Delete removes the focused chip. Each remove button is named after its value (Remove Bugen).
- On a phone the field is the same text input, named the same way.
- Translate these announcements with `messages` when the interface is not in English.
