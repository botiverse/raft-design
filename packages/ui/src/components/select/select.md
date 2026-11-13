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

A select is a field at the control height with an ink border, like an input: 44px on a phone, 34px on a desktop. Clicking it opens a list of values; the current value has a check mark. Use it to store a value. When choosing starts an action instead, use a menu.

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
- `SelectTrigger`: the field that opens the list. Required. With `fit` it is as wide as its longest option ([As wide as its longest option](#as-wide-as-its-longest-option)).
- `SelectValue`: the chosen value in the trigger, or the placeholder.
- `SelectIcon`: the chevron at the trigger's end.
- `SelectContent`: the list's popup, positioned next to the trigger. Required.
- `SelectList`: the scrolling list of items.
- `SelectItem`: one value, with `SelectItemText` and `SelectItemIndicator` (the check mark). `SelectItemLeading` holds an icon or avatar before the text. `SelectItemDescription` is an optional second line under the text.
- `SelectGroup` and `SelectGroupLabel`: a group of values under a small heading. `SelectSeparator` is a hairline between groups; it meets the popup's edge on both sides ([Comfort](../../../../../design/foundations/comfort.md#separators)), and the list never scrolls sideways for it. The list is a [ScrollArea](../scroll-area/scroll-area.md): its overlay scrollbar takes no room from the options and looks the same on every platform (a Windows scrollbar no longer narrows the list or draws arrows).
- `SelectActionItem`: an action row at the end of the list, after a `SelectSeparator`, such as Show all runtimes. It is not a value; see [List actions](#list-actions).
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

- Make a filter 32px high (34px with a mouse, the control height), with a 44px hit area.
- Outline a filter that is not applied with `line-seam`. Fill an applied filter with `info-soft` and show how many values it has.
- Put a `ghost` Clear all button after the filters.
- When the filters don't fit beside the search, give them a line of their own that scrolls sideways, at every width ([FitToolbar](../fit-toolbar/fit-toolbar.md#behavior) `overflow="scroll"`; [The toolbar over a list](../../../../../design/patterns/responsive.md#the-toolbar-over-a-list)): the applied ones first and always in view, with their labels, and Clear all, as a `ghost` × icon button, the only thing pinned at the line's end. A filter row that wraps pushes the list down, while one that scrolls keeps every filter one swipe away (stdrc, 2026-11-10, #wg-task-v2:8a7ae237; it replaces the earlier rule that a phone's filter row fits two lines). The sort stays on the first line and drops its words before the filters do: its icon stays and fills `info-soft` while it differs from the default. The sort and Clear all keep their words as the accessible name ("Sort: Recently updated", "Clear filters"). The filters keep their values, since the value is what tells people which view they are in.
- Open the same list as any picker: single or multiple, with search when there are many values.

#### Which filter button

A filter button either shows the current value or always says Filter. How often people change the filter, and why, decides which:

| The filter                                                                                                                                                                         | Use                                                                                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| People change it often while they work, or its value is what the view is about: a sort, a channel, an assignee, the filters of a task list                                         | A button that shows the current value (Relevance, #launch-week), filled `info-soft` once applied. The value is always in sight, and a glance tells people which view they are in |
| A page with many filters, more than 3 or 4, that people mostly leave unused; or one that people change seldom, by personal habit, and come back to: Unread or Mentions in Activity | A button that always says Filter, and beside it a [FilterChip](../filter-chip/filter-chip.md) that names the active filter. The × resets it to the default                       |

```example
filter-chip/compositions/filter-button
```

The Filter button and its chip:

- Make the button say Filter, with a filter icon and the chevron, whatever is chosen. It stays outlined: the chip carries the applied look, so the button never fills.
- Open a menu with one radio item per filter, the default first ([DropdownMenu](../dropdown-menu/dropdown-menu.md) with radio items); a filter that is a scope rather than a read state, such as Pinned, goes after a separator. Choosing applies it at once.
- Show the chip only while the filter differs from its default. Its × resets the filter in one step, without opening the menu.
- Remember the choice on the device, per place (per server, per channel): people who set it by habit expect to find it as they left it. A filter whose value is the point of the view goes in the address instead, so the view can be shared ([Tasks](../../../../../design/patterns/tasks.md#filters)).
- Use it for a page with many filters, more than 3 or 4, that people mostly leave unused, or for one filter with a few values set by habit. A few filters that people do use, or many values, take buttons that show their values, so people can see every applied one at once. Polaris shows only 2 or 3 promoted filters and puts the rest behind Add filter; Stripe's More filters and Jira's More do the same (Jasper, 2026-11-10, #proj-raft-ui:f9756e85).

## States

- **No value:** `SelectValue` shows the placeholder in `foreground-hint`.
- **Invalid:** `data-invalid` on the trigger gives it a `danger-strong` border.
- The trigger is a field, so it doesn't hover; a press lays the medium tier ([Hover and press](../../../../../design/foundations/states.md#hover-and-press)).
- **Disabled** and the hover highlight in the list follow [States](../../../../../design/foundations/states.md).

## Behavior

- Make the list as wide as the field, at least 220px. A longer option widens it up to 24rem, never past the screen less 8px on each side, and then wraps to two lines and truncates ([Forms](../../../../../design/patterns/forms.md#long-values-in-fields)).
- The selected value in the trigger stays on one line and truncates; its whole text is the `title` while it is cut off.
- Align a filter's list with the filter's left edge, and with its right edge when there is no room. How every popup is positioned is in [Elevation](../../../../../design/foundations/elevation.md#popups).
- The list keeps clear of the frame insets: where a shell keeps part of the window for itself (`--raft-frame-inset-top`, `--raft-frame-inset-start`, `--raft-frame-inset-end`), it stops 8px from that part, not from the window's edge ([Page structure](../../../../../design/patterns/page-structure.md#frame-insets)). The web sets none.
- In a phone sheet or a drawer the list stays under the sheet's head while one side of the field has room for about four rows; `collisionBoundary="clipping-ancestors"` opts it out ([Dialog](../dialog/dialog.md#popups-in-a-sheet)).
- Open the same list on a phone. Don't replace it with a bottom sheet: a bottom sheet is for going somewhere ([Choosing a component](../../../../../design/components/overview.md#overlays)).
- With `multiple`, keep the list open when a value is chosen. Clicking outside or Esc closes it.
- With `multiple`, put a box before each item (`CheckboxIndicator` in `SelectItemLeading`), ink when chosen ([Checkbox](../checkbox/checkbox.md)). The trigger shows the chosen values, or a count (3 selected) when they don't fit.

### As wide as its longest option

At the end of a settings row, a select is as wide as its longest option, at least 11rem and at most 20rem ([Forms › A setting's row](../../../../../design/patterns/forms.md#a-settings-row)). Give its trigger `fit`:

```example
select/compositions/fit
```

- The width comes from every label in `items` and from the placeholder, never from the value, so it stays the same whichever value is chosen. A trigger as wide as its value would shrink to a short one, and the end of the row would jump with each choice.
- Past 20rem the value ends in an ellipsis, with its whole text as the `title`; the list still shows every option whole. An option that needs more usually repeats the setting: say it once in the row's description.
- Pass `items` to `Select` and put a `SelectValue` in the trigger. The trigger lays every label out in the value's place, invisible and 0px high, so it takes its width with no script; screen readers skip those copies, they take no focus, and a text label is drawn from an attribute (`::after`), so the browser's find in page doesn't count it. Without `items` there is nothing to measure, and a `fit` trigger stays at its least, 11rem: if one looks too narrow, check that its `Select` has `items`.
- A select in a form keeps the field's width, without `fit`.

### List actions

A list action changes what the list shows, never the value. Show all runtimes, at the end of a list that starts with the runtimes most people use, is one: it adds the rest to the same list.

```example
select/compositions/list-action
```

- Put it last, after a `SelectSeparator`, one per list. It is `foreground-muted`, so it reads as a step, not a choice, and highlights like an item, inset the same.
- The arrow keys and typeahead reach it like an item. Enter, Space or a click runs `onAction`; the value, the check mark and `onValueChange` stay as they were.
- The list stays open, since the action changes what it shows. Set `closeOnAction` only when the action leaves the list, such as opening a dialog to add a runtime.
- When it has shown everything, remove it, or turn it into Show fewer. Items it adds above it keep the highlight on the row, so the next arrow key goes on from there.
- An action that does something else (Manage runtimes, Add) is not part of choosing a value: put it beside the select, or use a [DropdownMenu](../dropdown-menu/dropdown-menu.md).

## Content

- Group values by kind (Agents, People) with `SelectGroupLabel`.
- Put secondary information (a runtime, a role, presence) at the end of the item, in `foreground-hint`.
- Put a short explanation of what a value means (what a model is good at, what a level does) on a second line, in `SelectItemDescription`. Don't repeat the label in another form, such as its id in lowercase: a line that says nothing new only makes the list taller.

```example
select/compositions/descriptions
```

An item is as tall as its content, and its padding is constant ([Forms](../../../../../design/patterns/forms.md#option-height)): one line is 36px, and a wrapped label or a description adds only its own height, with the one-line item's space above and below the text. `SelectItemDescription` sits beside `SelectItemText`, not inside it, so the trigger shows only the label. With a `SelectItemLeading`, the description starts under the label, past the icon.

- Put the empty choice first when there is one, as with Unassigned ([Tasks](../../../../../design/patterns/tasks.md#filters)).

## Accessibility

Select wraps Base UI Select: a button that opens a listbox, with typeahead and arrow-key navigation.

- Name the select with a `FieldLabel` ([Field](../field/field.md)), a `SelectLabel`, or `aria-label` on the trigger.
- In a multi-select, the box before each item is decorative; Base UI states the selection with `aria-selected`.
- `SelectActionItem` is an option to assistive technology, as the arrow keys reach it, but it is never selected: `aria-selected` stays false. It takes no `aria-expanded`, which ARIA does not allow on an option: its label says what it does, and the options it adds are counted in the list.
- `SelectItemDescription` is the option's accessible description: the item is named by `SelectItemText` alone and points `aria-describedby` at the description, so a screen reader reads the label, then the description, each once.
