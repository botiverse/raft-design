---
title: Field
summary: The label, help text and error around a form control, wired to it for assistive technology.
status: stable
aliases: []
layer: core
category: inputs
related: [input, input-group, textarea, select, checkbox, radio-group, switch]
---

# Field

A field puts a label above a form control and help text below it, and replaces the help text with an error when the value is invalid. Every input, textarea and select in a form sits in a field.

```example
field/compositions/preview
```

## When to use

| Situation                                                   | Use                                                                                      |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| A labeled control in a form: an input, a textarea, a select | Field                                                                                    |
| A checkbox, radio or switch with its label beside it        | Field with `FieldItem`                                                                   |
| A setting row with a switch                                 | A settings row ([ListRow](../list-row/list-row.md)) with a [Switch](../switch/switch.md) |
| A section of a large form, with a heading and a description | [FormSection](../form-section/form-section.md)                                           |

## Anatomy

- `Field`: the column that holds the parts. Required.
- `FieldLabel`: the label, above the control. Required unless the control has its own accessible name.
- The control: [Input](../input/input.md), [InputGroup](../input-group/input-group.md), [Textarea](../textarea/textarea.md), [Select](../select/select.md) or `FieldControl` for another native control.
- `FieldDescription`: help text below the control. Optional.
- `FieldError`: the error, in place of the help text. Shown only while the field is invalid.
- `FieldItem`: a row that puts a checkbox, radio or switch beside its label and description, 8px apart. It centres the control on the label's first line by moving it, so the row keeps its height: a switch overhangs the label's line rather than making the row taller. It works from its own line height, so **give it the same `size` as the label**: `<FieldItem size="sm">` with `<FieldLabel size="sm">`. A mismatch leaves the control 1px off ([Alignment](../../../../../design/foundations/alignment.md#a-control-and-its-label)).
- `FieldValidity`: read access to the field's validity state, for custom messages.

## Variants

| Variant                | Use for                                                          |
| ---------------------- | ---------------------------------------------------------------- |
| `FieldLabel` default   | Form fields                                                      |
| `FieldLabel size="sm"` | Dense layouts where the default label is too large for the space |

```example
field/compositions/compact-label
```

## States

```example
field/compositions/error
```

- **Invalid:** set `invalid` on `Field` and `data-invalid` on the control. The control's border turns `danger-strong`, and `FieldError` takes the place of `FieldDescription`, in `danger-strong`. When to check and how the message reads are in [Forms](../../../../../design/patterns/forms.md#validation).
- **Disabled:** `disabled` on `Field` turns the label, help text and error `foreground-disabled`.

## Content

Where the label and help text go is in [Forms](../../../../../design/patterns/forms.md#fields).

- Keep the label visible at all times. Don't use a floating label or a placeholder in its place.
- Write the label in sentence case: Agent name.
- Mark an optional field with `optional`, which adds "(optional)". Don't mark required fields: marking the optional ones is enough.
- Make the help text one line about what the value is for: Shown in chat and on tasks.
- Make the error say how to fix the value, with a correct example: Use lowercase and dashes: launch-week ([Writing](../../../../../design/content/writing.md#do-and-dont)).
- A label, help text or error of any length wraps, and breaks inside a word that is wider than the line, so it never pushes the field, a dialog or the screen wider. `FieldItem` lets its label column shrink for the same reason ([Forms](../../../../../design/patterns/forms.md#long-values-in-fields)).

## Accessibility

Field wraps Base UI Field. It connects the label, the description and the error to a Base UI control (Input, Select, Checkbox, Switch, RadioGroup) and passes the field's invalid and disabled state to it.

- Give `FieldLabel` an `htmlFor` that matches the control's `id` when the control is not a Base UI one, such as [Textarea](../textarea/textarea.md), and point `aria-describedby` at the description.
- `FieldError` has `role="alert"`, so the error is announced when it appears.
