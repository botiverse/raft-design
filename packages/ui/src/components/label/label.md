---
title: Label
summary: A standalone form label in the field-label style, with optional markers for a required or optional value and a line of secondary text.
status: stable
aliases: [LabelAsterisk, LabelOptional, LabelSub]
category: inputs
related: [field, checkbox, radio-group, switch, input]
---

# Label

Label is a `label` element in the style of a field label: `text-footnote`, semibold, in `foreground-muted`. Use it where a control needs a label but isn't in a [Field](../field/field.md); inside a field, `FieldLabel` is the label and wires itself to the control.

## When to use

| Situation                                                           | Use                                                              |
| ------------------------------------------------------------------- | ---------------------------------------------------------------- |
| A control in a form: an input, a textarea, a select                 | `FieldLabel` in a [Field](../field/field.md)                     |
| A checkbox, radio or switch with its label beside it, in a form     | `FieldItem` in a [Field](../field/field.md)                      |
| A label for a control outside a field, such as a checkbox in a list | Label                                                            |
| The title of a selectable option card                               | `CardTitle` in a [Card](../card/card.md) with `variant="option"` |

## Anatomy

- `Label`: the label. Its text says what the control holds. Required.
- `LabelOptional`: the optional marker after the text, "(optional)", in `foreground-hint`.
- `LabelAsterisk`: a required marker, an asterisk in `foreground-hint`.
- `LabelSub`: any other secondary text after the label, in `foreground-hint` at regular weight.

The markers are also `Label.Optional`, `Label.Asterisk` and `Label.Sub`. `FieldLabel` draws the same two markers through its `optional` and `required` props.

## Variants

| Variant               | Use for                                                    |
| --------------------- | ---------------------------------------------------------- |
| `size="md"` (default) | Labels in forms and settings                               |
| `size="sm"`           | Dense layouts where the default is too large for the space |

## States

- **Disabled:** `disabled` turns the label and its markers `foreground-disabled` and sets `aria-disabled`. It doesn't disable the control: disable that too.

## Content

- Write the label as a noun for what the control holds, in sentence case: Email address ([Writing](../../../../../design/foundations/writing.md#casing)).
- Mark optional fields with `LabelOptional` ([Forms](../../../../../design/patterns/forms.md#fields)).

## Accessibility

- Label renders a native `label`. Connect it to its control with `htmlFor` and the control's `id`, or wrap the control in it.
- The markers are read as part of the label: "Middle name (optional)".
