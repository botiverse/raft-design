---
title: RadioGroup
summary: A group of round options for choosing one of 2 to 5 answers that is submitted with a form, each with room for a sentence.
status: stable
aliases: [Radio]
category: inputs
related: [checkbox, switch, select, segmented-control, field]
---

# RadioGroup

A radio group offers 2 to 5 answers that exclude each other, each with a line that explains it: who gets notified, who can mention @everyone. The chosen answer has an ink dot. Radios and switches are the only round controls in the system.

```example
radio-group/compositions/reset-mode
```

## When to use

| Situation                                           | Use                                                           |
| --------------------------------------------------- | ------------------------------------------------------------- |
| One of 2 to 5 answers, each worth a sentence        | RadioGroup                                                    |
| Another view of the same content, switched in place | [SegmentedControl](../segmented-control/segmented-control.md) |
| One of many values, or values people search         | [Select](../select/select.md)                                 |
| A yes or no that applies at once                    | [Switch](../switch/switch.md)                                 |
| A yes or no saved with a form                       | [Checkbox](../checkbox/checkbox.md)                           |

## Anatomy

- `RadioGroup`: the group. Holds the value. Required.
- `RadioGroupItem`: one answer's 20px circle with a 1.5px ink border, holding a hidden native input. Required, one per answer.
- `RadioGroupIndicator`: the 8px ink dot inside the chosen circle. `RadioGroupItem` renders it by default.
- A label: wrap each item, its label and its description in a `<label>`.

## Variants

| Variant                | Use for                                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `appearance="default"` | A list of answers, each with a circle                                                                            |
| `appearance="none"`    | An option card that shows the choice itself: the circle is visually hidden and the card draws the selected state |

```example
radio-group/compositions/reset-mode-restored
```

## States

- **Chosen:** an ink dot. A chosen value is ink, not yellow ([States](../../../../../design/foundations/states.md)).
- **Disabled:** the shared disabled look, for the circle and the label.

## Behavior

- Make each answer a row at least 44px high, and make the whole row clickable.
- Always have one answer chosen. Choose the most common and safest answer by default.

## Content

- Set each answer's label in `text-subhead` at weight 600, and its description in `text-footnote` and `foreground-muted`.

## Accessibility

RadioGroup wraps Base UI RadioGroup, and `RadioGroupItem` wraps Base UI Radio. The group is one tab stop; the arrow keys move between answers and choose them. Each item's hidden native input drives its checked, disabled and focus state, and the focus ring is drawn on the circle ([States](../../../../../design/foundations/states.md#focus)).

- Name the group: `aria-label`, or `aria-labelledby` pointing at the visible question (Notify me about).
- Name each answer with the `<label>` around it.
