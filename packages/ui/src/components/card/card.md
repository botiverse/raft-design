---
title: Card
summary: A white container with a hairline that groups one subject on a page — a header with a title and description, content and a footer — or makes a selectable option inside a form.
status: stable
aliases: []
layer: core
category: layout
related: [list-row, form-section, description-list, panel, checkbox, radio-group]
---

# Card

A card groups one subject on a page: a title and a line of description, the content that belongs to it, and an optional footer note. It sits flat on the page, on `layer-card` with a `line-hairline` outline and `radius-container`, and casts no shadow. Its `option` variant is a selectable choice inside a form.

```example
card/compositions/project-summary
```

## When to use

| Situation                                                            | Use                                                                                                                                                     |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| One subject on a page, with a title and its own content or controls  | Card                                                                                                                                                    |
| A setting that turns a feature on, with its configuration under it   | Card with `variant="inset"`                                                                                                                             |
| A choice among a few options in a form, where each option is a block | Card with `variant="option"`, holding a [Checkbox](../checkbox/checkbox.md) or a radio                                                                  |
| A group of rows: settings, members, agents                           | `ListRowGroup` ([ListRow](../list-row/list-row.md))                                                                                                     |
| Properties of one item, label and value                              | [DescriptionList](../description-list/description-list.md)                                                                                              |
| A part of a large form                                               | [FormSection](../form-section/form-section.md)                                                                                                          |
| A column of the main area                                            | [Panel](../panel/panel.md)                                                                                                                              |
| A task, a file on a message, a person on hover                       | [TaskCard](../task-card/task-card.md), [MessageAttachment](../message-attachment/message-attachment.md), [PreviewCard](../preview-card/preview-card.md) |

## Anatomy

- `Card`: the container. Required.
- `CardHeader`: the top row. It lays out the parts below in a grid.
  - `CardLeading`: an icon, avatar or switch before the title, spanning the title and description rows. Optional.
  - `CardTitle`: the title. Optional, but most cards have one.
  - `CardTrailing`: a status, badge or switch at the end of the title row. Optional.
  - `CardDescription`: one line under the title, in `text-callout` and `foreground-muted`. Optional.
- `CardContent`: the body. Optional.
- `CardFooter`: a supporting note or a link, in `text-caption` and `foreground-hint`, with a hairline above it. Optional.

## Variants

| Variant             | Use for                                                                                                                                              |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variant="default"` | A card on its own, or one with little inside it                                                                                                      |
| `variant="inset"`   | A card that holds many controls or nested components: a hairline separates the header and each `CardContent`                                         |
| `variant="option"`  | An option inside a form: `radius-control`, the 1.5px field border and a title at the size of a field label, so it doesn't outrank the label above it |

```example
card/compositions/workspace-mode
```

```example
card/compositions/dense-settings
```

```example
checkbox/compositions/selection
```

## Content

- Write the title in sentence case: Release readiness ([Writing](../../../../../design/foundations/writing.md#casing)).
- Write the description as one line on what the card is for or where it stands.
- Use the footer for a note about the whole card, such as where to read more. Put a card-level action at the end of `CardContent` instead.

## Accessibility

Card renders a `div` and adds no semantics.

- Render `CardTitle` as a heading at the level the page needs, with `render`: `render={<h3 />}`.
- When a `Switch` or `Checkbox` in `CardLeading` or `CardTrailing` is named by the title, give the title an `id` and point the control's `aria-labelledby` at it.
- For an `option` card, render the whole card as a `label` (`render={<label />}`) so a click anywhere on it toggles the control.

## Rules

- Keep cards flat. Only things that float cast a shadow ([Elevation](../../../../../design/foundations/elevation.md)).
- Don't put a card inside a card. An action inside a section is an ordinary row, with the description on the left and the button on the right ([Forms](../../../../../design/patterns/forms.md#the-large-form-dialog)).
- Use `line-hairline` for every line inside a card; it is content, not a region ([Color](../../../../../design/foundations/color.md#lines)).
- Don't attach a progress bar or a colored band to a card's edge ([Shape](../../../../../design/foundations/shape.md#nothing-on-the-edge-of-a-rounded-container)).
- Apply a switch in a card at once, without a Save button ([Forms](../../../../../design/patterns/forms.md#settings-that-apply-at-once)).
