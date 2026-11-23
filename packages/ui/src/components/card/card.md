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

| Situation                                                            | Use                                                                                                                                                                                                    |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| One subject on a page, with a title and its own content or controls  | Card                                                                                                                                                                                                   |
| A setting that turns a feature on, with its configuration under it   | Card with `variant="inset"`: a switch when the feature works without the fields, a checkbox and one Save when it needs them ([Forms](../../../../../design/patterns/forms.md#settings-saved-together)) |
| A choice among a few options in a form, where each option is a block | Card with `variant="option"`, holding a [Checkbox](../checkbox/checkbox.md) or a radio                                                                                                                 |
| A group of rows: settings, members, agents                           | `ListRowGroup` ([ListRow](../list-row/list-row.md))                                                                                                                                                    |
| Properties of one item, label and value                              | [DescriptionList](../description-list/description-list.md)                                                                                                                                             |
| A part of a large form                                               | [FormSection](../form-section/form-section.md)                                                                                                                                                         |
| A column of the main area                                            | [Panel](../panel/panel.md)                                                                                                                                                                             |
| A task, a file on a message, a person or an app's item on hover      | [TaskCard](../task-card/task-card.md), [MessageAttachment](../message-attachment/message-attachment.md), [PreviewCard](../preview-card/preview-card.md)                                                |

## Anatomy

- `Card`: the container. Required.
- `CardHeader`: the top row. It lays out the parts below in a grid.
  - `CardLeading`: an icon, avatar or switch before the title, spanning the title and description rows. Optional.
  - `CardTitle`: the title. Optional, but most cards have one.
  - `CardTrailing`: a status, badge or switch at the end of the title row. Optional.
  - `CardDescription`: a helper line under the title, in `text-callout` and `foreground-muted`, only for a consequence (`consequence`), who sees it or whom it affects (`audience`), or how to recover (`recovery`). It takes only a `HelperText`, made with `helperText(content, { why, about })`, and renders its `why` and `about` as `data-why` and `data-about` ([Writing › Helper text](../../../../../design/content/writing.md#helper-text)). Optional.
  - `CardSubtitle`: data under the title in the description's place, such as a handle ("@ada") or a time and place ("Public beta · Thursday at 10:00"), in `text-callout` and the base ink. Optional.
- `CardContent`: the body. Optional.
- `CardFooter`: a helper note about the whole card, with its icon or link inside it, in `text-caption` and `foreground-hint`, with a hairline above it. It takes only a `HelperText`, made with `helperText(content, { why, about })`, and renders its `why` and `about` as `data-why` and `data-about`, like `CardDescription`; data such as an owner or an updated time goes at the end of `CardContent`. Optional.

## Variants

| Variant             | Use for                                                                                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variant="default"` | A card on its own, or one with little inside it                                                                                                                     |
| `variant="inset"`   | A card that holds many controls or nested components: a hairline separates the header and each `CardContent`                                                        |
| `variant="option"`  | An option inside a form: `radius-control`, the field border (1.5px `line-field`) and a title at the size of a field label, so it doesn't outrank the label above it |

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

- Write the title in sentence case: Release readiness ([Writing](../../../../../design/content/writing.md#casing)).
- Give a card a description only when it has a consequence its title doesn't say, who sees it, or how to recover. A line on what the card is for ("Receive selected Raft events at a webhook") is cut; where it stands is data, in `CardSubtitle`.
- Use the footer for a helper note about the whole card, such as who gets its alerts, with a link to read more. Put a card-level action at the end of `CardContent` instead.

## Accessibility

Card renders a `div` and adds no semantics.

- Render `CardTitle` as a heading at the level the page needs, with `render`: `render={<h3 />}`.
- When a `Switch` or `Checkbox` in `CardLeading` or `CardTrailing` is named by the title, give the title an `id` and point the control's `aria-labelledby` at it.
- For an `option` card, render the whole card as a `label` (`render={<label />}`) so a click anywhere on it toggles the control.

## Rules

- Keep cards flat. Only things that float cast a shadow ([Elevation](../../../../../design/foundations/elevation.md)); the open comment card is lifted ([Comment](../comment/comment.md)).
- Don't put a card inside a card. An action inside a section is an ordinary row, with the description on the left and the button on the right ([Forms](../../../../../design/patterns/forms.md#the-large-form-dialog)).
- Use `line-hairline` for every line inside a card; it is content, not a region ([Color](../../../../../design/foundations/color.md#lines)).
- Don't attach a progress bar or a colored band to a card's edge ([Shape](../../../../../design/foundations/shape.md#nothing-on-the-edge-of-a-rounded-container)).
- Apply a switch in a card at once, without a Save button ([Forms](../../../../../design/patterns/forms.md#settings-that-apply-at-once)).
