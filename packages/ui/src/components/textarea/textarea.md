---
title: Textarea
summary: A multi-line text field for forms, at least three lines high, with an optional character counter.
status: stable
aliases: []
layer: core
category: inputs
related: [input, field, composer, scroll-area]
---

# Textarea

A textarea takes several lines of text in a form: a description, a note, instructions for an agent. It has the same ink border and states as an [Input](../input/input.md), is at least three lines of field text high (96px on a phone, 90px on a desktop), and people can drag it taller.

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

- Let people drag the textarea taller. It never gets shorter than three lines of field text.
- To make it grow with its content, use `field-sizing-content` together with a maximum height, so a long draft scrolls inside the field instead of pushing the page down. A field that scrolls is a `ScrollAreaTextarea` ([A field that scrolls](#a-field-that-scrolls)).
- Add a counter when the value has a limit. Pass the current value and the limit to `TextareaCounter`.
- Leave out the native `maxLength` when the counter shows the limit: `maxLength` stops typing at the limit, so the counter could never show that the text is over it.

## A field that scrolls

`Textarea` is a native `<textarea>`, and a native textarea that scrolls shows the platform's scrollbar: on Windows, or on a Mac set to always show scrollbars, a classic bar that takes room from the text when it appears and is drawn in the platform's colors. Most textareas are a few lines and never scroll, so `Textarea` stays native. When a field is meant to scroll, because its height is capped (`max-h-*`) or its `rows` are fixed and the text is long, such as instructions for an agent, use [`ScrollAreaTextarea`](../scroll-area/scroll-area.md#textarea) drawn as the field. A textarea can't hold raft-ui's scrollbar, so `ScrollAreaTextarea` draws it over a frame around the textarea.

```example
textarea/compositions/scrolling
```

- `textareaScrollAreaVariants()` (`@botiverse/raft-ui/wip`) gives the field's look, split over the two elements: `wrapper()` goes to `wrapperClassName` and `textarea()` to `className`. The frame draws the border, the radius, the background and the focus ring; the textarea keeps the field's type and padding. Don't copy Textarea's classes onto either by hand.
- Cap the height on the frame, `wrapper({ className: "max-h-40" })`, and let the textarea grow to it, `textarea({ className: "field-sizing-content" })`. For a field of a fixed height, pass `rows` to the textarea. The textarea never gets taller than a capped frame, so its resize grip stops at the cap as a capped Textarea's does; with no cap the frame grows with it. The field is never shorter than three lines of field text, as a Textarea, and with the same value it has the same box.
- The states are read from the textarea inside the frame: `disabled` gives the shared disabled look, and `data-invalid` the `danger-strong` border. Set `aria-invalid` beside `data-invalid` yourself: `Textarea` adds it, `ScrollAreaTextarea` passes native props through as they are.
- The scrollbar shows while the pointer is over the field or the text scrolls, and only when the text is taller than the field. It stops above the bottom corner, where the textarea's resize grip is.
- Name it as any textarea, with a `FieldLabel` whose `htmlFor` matches its `id`. `id`, `ref`, `value` and every other native prop go to the textarea, not the frame.

## Accessibility

Textarea renders a native `<textarea>`; it is not a Base UI control.

- Name it with a `FieldLabel` whose `htmlFor` matches the textarea's `id` ([Field](../field/field.md)).
- `data-invalid` also sets `aria-invalid`.
- Reference the counter from `aria-describedby` when the limit matters, so it is read with the field.
