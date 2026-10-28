---
title: FilterChip
summary: The filter in effect, as an info-soft chip beside a Filter button that always says Filter, with an × that resets the filter to its default.
status: experimental
aliases: [Active filter, Applied filter chip, Removable chip]
layer: core
category: inputs
related: [picker-trigger-button, dropdown-menu, select, combobox]
---

# FilterChip

FilterChip names the filter in effect beside a Filter button that always says Filter. It has the applied filter's look, an `info-soft` fill as high as the button, and an × that resets the filter to its default. It shows only while the filter differs from the default. Use it with the Filter button pattern ([Select › Which filter button](../select/select.md#which-filter-button)) for a filter that people change seldom and set by habit, such as Unread or Mentions in Activity.

```example
filter-chip/compositions/filter-button
```

## When to use

| Situation                                                                                                                  | Use                                                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| A filter people change seldom and set by personal habit, kept for them per place                                           | FilterChip beside a Filter button that always says Filter                                                               |
| A filter people change often while they work, or one whose value is the point of the view (a sort, a channel, an assignee) | A filter button that shows the current value ([PickerTriggerButton](../picker-trigger-button/picker-trigger-button.md)) |
| A chosen value in a field of several (people, labels)                                                                      | The combobox's own chips ([Combobox](../combobox/combobox.md))                                                          |
| A label that is not removable                                                                                              | [Badge](../badge/badge.md)                                                                                              |

## Anatomy

- `FilterChip`: the chip. Required.
- A leading icon: optional, 14px, the same icon as the filter's item in the menu.
- `FilterChipLabel`: the filter's name, as in the menu (Unread). Required.
- `FilterChipRemove`: the × that resets the filter to its default. Required.

Put the chip right after the Filter button, 8px from it, in the same row.

## States

- The chip has no hover of its own: only the × hovers and presses, with the medium fill ([Hover and press](../../../../../design/foundations/states.md#hover-and-press)).
- The × shows a keyboard focus ring inside its own box, because the chip is too tight for a ring outside it.

## Behavior

- Render the chip only while the filter differs from its default. At the default, the Filter button stands alone.
- Pressing × resets the filter to its default in one step, without opening the menu. The chip then goes away.
- The chip is as high as the Filter button, 32px, on a phone too. The × is 24px, 4px from the chip's end; on a touch screen its hit area reaches 44px, a transparent `::after` 10px past it on every side ([Accessibility › Hit targets](../../../../../design/foundations/accessibility.md#hit-targets)). Its ink sits further in than the icon's at the start: like the × on a tag ([Alignment › Chips](../../../../../design/foundations/alignment.md#chips)), it keeps its inset rather than its ink distance.
- When the row is narrow, the label truncates and the icon and × stay.

## Content

- Name the filter exactly as its item in the menu does: Unread, Mentions, Pinned. Don't add the word Filter or a verb.
- Name the × by what it does, in its `aria-label`: Clear Filter, or Show All when the default is All.

## Accessibility

- FilterChip and FilterChipLabel are plain text. The chip has no role: a screen reader reads its label among the row's text.
- FilterChipRemove wraps the Base UI Button and requires `aria-label`, because it shows only a glyph.
- The × removes itself. In its press handler, move focus to the Filter button, so the keyboard stays in the row instead of falling to the page.
- Hide the leading icon from assistive technology (`aria-hidden`).

## Rules

- Use FilterChip only beside a Filter button that always says Filter: a filter button that shows the value already names the filter, and a chip would say it twice.
- Show one chip per Filter button, for the one filter it applied.
- Don't make the chip itself a button. The Filter button changes the filter; the × only resets it.
