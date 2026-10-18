---
title: Textarea
summary: A multi-line text field for forms, at least 96px high, with an optional character counter.
status: stable
aliases: []
category: inputs
related: [input, field, composer]
---

# Textarea

A textarea takes several lines of text in a form: a description, a note, instructions for an agent. It has the same ink border and states as an [Input](../input/input.md), is at least 96px high, and people can drag it taller.

```example
textarea/compositions/with-field
```

## When to use

| Situation                                        | Use                                 |
| ------------------------------------------------ | ----------------------------------- |
| Several lines of text that are saved with a form | Textarea                            |
| One line of text                                 | [Input](../input/input.md)          |
| A message that is sent                           | [Composer](../composer/composer.md) |

## Anatomy

- `Textarea`: the field. Required.
- `TextareaGroup`: holds the textarea and its counter. Needed only with a counter.
- `TextareaCounter`: the count and the limit, below the field at its end (72/280).

## States

- **Invalid:** `data-invalid` gives the textarea a `danger-strong` border; the message goes in the field ([Field](../field/field.md)).
- **Over the limit:** the counter turns bold `danger-strong` once the count passes the limit.
- **Disabled:** the shared disabled look ([States](../../../../../design/foundations/states.md)), and it can no longer be resized. Disabled wins over invalid.

## Behavior

- Let people drag the textarea taller. It never gets shorter than 96px.
- To make it grow with its content, use `field-sizing-content` together with a maximum height, so a long draft scrolls inside the field instead of pushing the page down.
- Add a counter when the value has a limit. Pass the current value and the limit to `TextareaCounter`.
- Leave out the native `maxLength` when the counter shows the limit: `maxLength` stops typing at the limit, so the counter could never show that the text is over it.

## Accessibility

Textarea renders a native `<textarea>`; it is not a Base UI control.

- Name it with a `FieldLabel` whose `htmlFor` matches the textarea's `id` ([Field](../field/field.md)).
- `data-invalid` also sets `aria-invalid`.
- Reference the counter from `aria-describedby` when the limit matters, so it is read with the field.
