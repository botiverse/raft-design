---
title: Checkbox
summary: A square box for a yes or no that is saved with a form, or an option attached to an action.
status: stable
aliases: []
category: inputs
related: [switch, radio-group, field, composer]
---

# Checkbox

A checkbox is a yes or no that takes effect when the form is saved. Checked, it is an ink block with the check mark knocked out of it: it shows a value, not "you are here", so it is never yellow.

```example
checkbox/compositions/preview
```

## When to use

| Situation                                                                     | Use                                                                                            |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| A yes or no in a form that is saved: a dialog, a drawer, the wide form dialog | Checkbox                                                                                       |
| An option attached to an action, such as sending a message as a task          | Checkbox in the action's toolbar (`ComposerToolbarLabel`, [Composer](../composer/composer.md)) |
| Choosing several items in a list or a multi-select                            | Checkbox, or `CheckboxIndicator` in a row that owns the semantics                              |
| A yes or no that applies at once                                              | [Switch](../switch/switch.md)                                                                  |
| One of several answers                                                        | [RadioGroup](../radio-group/radio-group.md)                                                    |

Which controls apply at once and which are saved is in [Forms](../../../../../design/patterns/forms.md).

## Anatomy

- `Checkbox`: the 20px box, with a hidden native input that holds the state. Required.
- A label: wrap the checkbox and its text in a `<label>` (`Label`, or `FieldItem` with `FieldLabel` in a [Field](../field/field.md)).
- `CheckboxIndicator`: the box drawn on its own, with no input or role, for a row or menu item that already has checkbox semantics.

```example
checkbox/compositions/settings-group
```

## States

The checked, disabled and focus looks follow [States](../../../../../design/foundations/states.md).

- **Unchecked:** an empty box with an ink border.
- **Checked:** an ink block with the check mark knocked out.
- **Indeterminate:** an ink block with a minus, for a box that stands for a group whose items are partly checked.

```example
checkbox/compositions/indicator
```

## Behavior

- Make the whole label clickable, not only the box. A label row is 32px high, with a 44px hit area.

## Content

- Set the label in `text-callout` at weight 600.
- In a form, add a line below the label that says what happens when the box is left unchecked.

## Accessibility

Checkbox wraps Base UI Checkbox. Its hidden native input drives the checked, disabled and focus state, and the focus ring is drawn on the box ([States](../../../../../design/foundations/states.md#focus)).

- Give every checkbox a name: a wrapping `<label>`, a `FieldLabel`, or `aria-label` when there is no visible text (selecting a row).
- `CheckboxIndicator` is `aria-hidden`. The element that holds it must carry the role and the checked state.

## Rules

- Keep the box square. Don't use `shape="circle"`: round is only for switches and radios ([Shape](../../../../../design/foundations/shape.md)).
