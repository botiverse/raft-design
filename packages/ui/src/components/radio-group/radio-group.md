---
title: RadioGroup
summary: A group of round options for choosing one of 2 to 5 answers that is submitted with a form, each with room for a sentence.
status: stable
aliases: [Radio]
layer: core
category: inputs
related: [checkbox, switch, select, segmented-control, field]
redirectFrom: [decisions/0016-ink-radio-dot]
---

# RadioGroup

A radio group offers 2 to 5 answers that exclude each other, each with a line that explains it: who gets notified, who can mention @everyone. The chosen answer has an ink dot. Radios and switches are the only round controls in the system.

```example
radio-group/compositions/reset-mode
```

## When to use

| Situation                                                         | Use                                                           |
| ----------------------------------------------------------------- | ------------------------------------------------------------- |
| One of 2 to 5 answers, each worth a sentence                      | RadioGroup                                                    |
| Any number of choices, when choosing is the dialog's main content | [ChoiceList](../choice-list/choice-list.md)                   |
| Another view of the same content, switched in place               | [SegmentedControl](../segmented-control/segmented-control.md) |
| One of many values, or values people search                       | [Select](../select/select.md)                                 |
| A yes or no that applies at once                                  | [Switch](../switch/switch.md)                                 |
| A yes or no saved with a form                                     | [Checkbox](../checkbox/checkbox.md)                           |

## Anatomy

- `RadioGroup`: the group. Holds the value. Required.
- `RadioGroupItem`: one answer's 20px circle with a 1.5px ink border, holding a hidden native input. Required, one per answer.
- `RadioGroupIndicator`: the 8px ink dot inside the chosen circle. `RadioGroupItem` renders it by default.
- A label: wrap each item, its label and its description in a `<label>`, a flex row with `items-start` and `gap-2` that carries the label's type. The circle centers on the label's first line by itself, 8px before it, at any min-height; don't add a `margin-top` ([Alignment](../../../../../design/foundations/alignment.md#a-control-and-its-label)).

## Variants

| Variant                | Use for                                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `appearance="default"` | A list of answers, each with a circle                                                                            |
| `appearance="none"`    | An option card that shows the choice itself: the circle is visually hidden and the card draws the selected state |

```example
radio-group/compositions/reset-mode-restored
```

## States

- **Chosen:** an ink dot, not a yellow fill. A chosen value is ink, as a checked checkbox is, so radios and checkboxes agree and yellow stays for "you are here" ([States](../../../../../design/foundations/states.md)).
- **Disabled:** the shared disabled look, for the circle and the label.

## Behavior

- Make each answer a row at least 44px high, and make the whole row clickable. In its row the circle's hit area reaches 4px past its line, half the 8px gap between answers, so a tap between two lands on the nearer; the label is the target for the rest.
- Always have one answer chosen. Choose the most common and safest answer by default.

## Content

- Set each answer's label in `text-subhead` at weight 600, and its description in `text-footnote` and `foreground-muted`.
- An answer may have two description lines when each says something people compare across the answers, such as an account's quota and then the machine itself ("Claude Max · 5h 72% left · this week 40% left", "120 GB free · 3 agents"). Each line truncates on its own; a line with nothing to say is left out, never shown empty.
- When choosing is the dialog's main content, use a [ChoiceList](../choice-list/choice-list.md), which draws what this bullet and the next describe. It keeps the answers open as a list at any count, with a filter field above it when people look for an answer they know by name (always) or choose by comparing a list longer than a glance (from 6 answers), and lets the list scroll; the whole row chooses. Its rows look like those of a list that adds several (Add Members), with the radio circle where that list has its checkbox: the same list, and the circle says only one can be chosen ([Choosing a control](../../../../../design/components/overview.md)). Filtering never clears or changes the choice: the chosen row stays visible above the filtered rows, and Confirm still uses it. The arrow keys move only among the rows that show, and a filter that matches nothing shows a short "No match" line, never an empty box.
- To open more about one answer, put a 32px frameless icon button at the end of its row, centered on the label's line, **outside** the item's `<label>`: inside it, pressing the button would also choose the answer, and a screen reader would read a button inside a radio. Name it after the answer ("Studio Mac details") and open the details in a [Popover](../popover/popover.md), which a tap opens too, not a hover card. The group stays one Tab stop, on the chosen row, moved with the arrow keys; the row buttons come after the group in the DOM, laid beside their rows (a second grid column on the same rows), and Tab reaches them in row order once it leaves the group. Under a coarse pointer the button keeps a 44px hit area, as the row does ([Touch screens](../../../../../design/patterns/responsive.md#touch-screens)).

## Accessibility

RadioGroup wraps Base UI RadioGroup, and `RadioGroupItem` wraps Base UI Radio. The group is one tab stop; the arrow keys move between answers and choose them. Each item's hidden native input drives its checked, disabled and focus state, and the focus ring is drawn on the circle ([States](../../../../../design/foundations/states.md#focus)).

- Name the group: `aria-label`, or `aria-labelledby` pointing at the visible question (Notify me about).
- Name each answer with the `<label>` around it.
