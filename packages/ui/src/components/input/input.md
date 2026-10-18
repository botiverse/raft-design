---
title: Input
summary: A single-line text field, 44px high with a 1.5px ink border, for typing one value.
status: stable
aliases: [TextField]
category: inputs
related: [field, input-group, textarea, select]
---

# Input

An input takes one line of text. It is 44px high, with a 1.5px ink border on `layer-card`, and it always sits in a [Field](../field/field.md) that gives it a label above and help text below. Inputs with a prefix or suffix, multi-line fields and search fields use the same box.

```example
input/compositions/preview
```

## When to use

| Situation                                                                         | Use                                         |
| --------------------------------------------------------------------------------- | ------------------------------------------- |
| One line of text: a name, an email, a URL                                         | Input                                       |
| One line with a fixed prefix or suffix (a domain, `#`, a unit), or a search field | [InputGroup](../input-group/input-group.md) |
| Several lines of text in a form                                                   | [Textarea](../textarea/textarea.md)         |
| A message to send                                                                 | [Composer](../composer/composer.md)         |
| One value from a list                                                             | [Select](../select/select.md)               |

## States

States follow [States](../../../../../design/foundations/states.md).

- **Invalid:** `data-invalid` gives the input a `danger-strong` border. The message goes in the field ([Field](../field/field.md)).
- **Disabled:** disabled wins over invalid. A disabled input keeps the disabled border, because nobody can fix it.

## Content

- Write the placeholder as an example value (e.g. Wug), in `foreground-hint`. Never use it as the label: the label stays visible above the input.

## Accessibility

Input wraps Base UI Input and renders a native `<input>`.

- Name it with a `FieldLabel` ([Field](../field/field.md)). Use `aria-label` only where no visible label fits, such as a compact toolbar.
- `data-invalid` also sets `aria-invalid`.
- Set `suppressPasswordManager` only on fields that are not credentials, where a password manager's overlay would cover the UI. Leave it off email and password fields.

## Rules

- Always draw the ink border. Don't make an input a filled gray box without one: the ink border is what marks it as a control ([Color](../../../../../design/foundations/color.md#lines)).
- Never set input text smaller than 16px: iOS zooms the page into a field with smaller text. Inputs use `text-body` ([Typography](../../../../../design/foundations/typography.md)).
- Check the value when focus leaves the input or the form is submitted ([Forms](../../../../../design/patterns/forms.md#validation)).
