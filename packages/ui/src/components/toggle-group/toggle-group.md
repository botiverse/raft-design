---
title: ToggleGroup
summary: A compact row of toggle buttons in a gray track, each one on or off on its own, or one of them or none; a pressed button is a yellow sticker.
status: stable
aliases: [Toggle buttons, Toolbar toggles]
layer: core
category: inputs
related: [segmented-control, checkbox, switch, picker-trigger-button]
---

# ToggleGroup

A toggle group is a row of buttons in a gray track that people press on and off: Bold, Italic and Underline, or a row of filters, each selectable on its own ([Built from existing parts](../../../../../design/components/overview.md#a-row-of-toggle-buttons)). With `multiple`, any number can be on; without it, one or none. A pressed button is a yellow sticker.

```example
toggle-group/compositions/formatting
```

## When to use

| Situation                                                   | Use                                                                                 |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Several options in a compact row, each on or off on its own | ToggleGroup with `multiple`                                                         |
| One option of a few, or none                                | ToggleGroup                                                                         |
| One of 2 to 4 views, and one is always selected             | [SegmentedControl](../segmented-control/segmented-control.md)                       |
| Options that are saved with a form                          | [Checkbox](../checkbox/checkbox.md)                                                 |
| One setting, applied at once                                | [Switch](../switch/switch.md)                                                       |
| Filtering a list by one of its values                       | A filter ([PickerTriggerButton](../picker-trigger-button/picker-trigger-button.md)) |

The full table is in [Choosing a component](../../../../../design/components/overview.md#picking-something).

## Anatomy

- `ToggleGroup`: the track, in `fill-muted`. Its `value` is the list of pressed items. Required.
- `ToggleGroupItem`: one 32px button, identified by its `value`. Required, at least 2.
  - An icon: optional, 16px. It can stand alone (`aria-label` required, see [Accessibility](#accessibility)).
  - `ToggleGroupLabel`: the visible label. It truncates when the row is too narrow.

## Variants

| Variant                  | Use for                                                                                         |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| `multiple`               | Options that combine: Bold and Italic can both be on                                            |
| Without `multiple`       | Options that exclude each other, where none is also an answer: an alignment that can be cleared |
| `orientation="vertical"` | A stack of toggles in a narrow column                                                           |

```example
toggle-group/compositions/alignment
```

```example
toggle-group/compositions/vertical
```

## States

| State                         | Look                                                                                                                                                                                                                                          |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Not pressed                   | `foreground-muted` text on the track; the medium tier on hover and press                                                                                                                                                                      |
| Pressed                       | A yellow sticker with a bold label ([Color](../../../../../design/foundations/color.md#stickers)). It doesn't change on hover; a press lays `sticker-medium` ([Hover and press](../../../../../design/foundations/states.md#hover-and-press)) |
| Disabled item, disabled group | `foreground-disabled` text, no reaction to hover or press ([States](../../../../../design/foundations/states.md))                                                                                                                             |

```example
toggle-group/compositions/item-disabled
```

```example
toggle-group/compositions/disabled
```

## Behavior

- A horizontal group wraps its items onto a new row when they don't fit, and never grows wider than its container.
- Pressing a pressed item turns it off, in both variants.
- Items sit 3px inside the track and 3px apart, like the segments of a [SegmentedControl](../segmented-control/segmented-control.md).
- Items are 32px high and don't extend their hit area to 44px. On touch screens that is below the [hit target](../../../../../design/foundations/spacing.md#hit-targets).

## Content

- Label each item with what it turns on, in Title Case: Bold, Numbered List ([Writing](../../../../../design/content/writing.md#casing)).

## Accessibility

- `ToggleGroup` wraps the Base UI ToggleGroup and each `ToggleGroupItem` the Base UI Toggle: every item is a button with `aria-pressed`, and the arrow keys move focus between items in the direction of `orientation`, wrapping at the ends (`loopFocus`).
- Name the group with `aria-label` after what it controls: "Text formatting", "Text alignment".
- Give every icon-only item an `aria-label` ("Align left"), and hide its icon (`aria-hidden`).

## Rules

- Don't use a toggle group to switch views or sections: one view is always shown, and a toggle group can be left with none. Use a [SegmentedControl](../segmented-control/segmented-control.md) or [Tabs](../tabs/tabs.md).
