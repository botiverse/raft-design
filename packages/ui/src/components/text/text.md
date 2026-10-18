---
title: Text
summary: Plain typography parts — Text.Heading, Text.Sans and Text.Mono — for text that no other component holds, in the system's two typefaces.
status: stable
aliases: [Typography, TextHeading, TextSans, TextMono, Heading]
category: content
related: [markdown, inline-code, description-list, panel]
---

# Text

Text sets a run of text that no other component holds: a name under an avatar, a size next to a file name, a line of help in a custom layout. `Text.Sans` is Space Grotesk, for what people say; `Text.Mono` is Space Mono, for what machines write; `Text.Heading` is a heading. Which typeface is for what is in [Typography](../../../../../design/foundations/typography.md#principles).

```example
text/compositions/inline-list-row
```

## When to use

| Situation                                              | Use                                                                                                                        |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Text in a layout of your own, with no component for it | Text                                                                                                                       |
| A title, a label, a description inside a component     | The component's own part: `PanelTitle`, `FieldLabel`, `DescriptionTerm`                                                    |
| Text someone wrote in Markdown                         | [Markdown](../markdown/markdown.md)                                                                                        |
| A name from code inside a sentence                     | [InlineCode](../inline-code/inline-code.md)                                                                                |
| An ID, a time or a count inside a sentence             | `Text.Mono` with `render={<span />}`, without a fill ([Typography](../../../../../design/foundations/typography.md#usage)) |

## Anatomy

- `Text.Heading` (`TextHeading`): an `h1` to `h6`, from `level`.
- `Text.Sans` (`TextSans`): a paragraph in Space Grotesk, sized by `size`: `large`, `body`, `small` or `caption`.
- `Text.Mono` (`TextMono`): a paragraph in Space Mono, sized by `size`: `code`, `meta`, `tabular` or `eyebrow`.

Each part takes a `variant` for its color. Without one, the size sets it: `foreground` for the larger sizes, `foreground-muted` for `small`, `caption` and `meta`.

```example
text/compositions/semantic-elements
```

## Variants

| Variant                                                                                | Use for                                                                                                                   |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `variant="muted"`                                                                      | Secondary text: previews, descriptions, labels (`foreground-muted`)                                                       |
| `variant="placeholder"`                                                                | Tertiary text: times, IDs, group headings, a missing value (`foreground-hint`)                                            |
| `variant="information"`, `"success"`, `"warning"`, `"danger"`, `"primary"`, `"accent"` | Text that carries its color's meaning ([Meanings of color](../../../../../design/foundations/color.md#meanings-of-color)) |
| `size="tabular"`                                                                       | Numbers in a column, with figures of equal width                                                                          |

## Content

- Follow the casing in [Typography](../../../../../design/foundations/typography.md#casing): sentence case for text, Title Case only for what people click.
- Set IDs, times, counts and sizes in `Text.Mono`, even next to Space Grotesk: `#25`, `10:24`, `24 KB`.

## Accessibility

- The parts are plain elements built with Base UI `useRender`. Use `render` to choose the element the document needs, such as a `span` inside a row, or `dt` and `dd` in a list of terms, while keeping the style.
- `level` sets both the size and the element. To keep the page's outline, set the element with `render`: `level={6}` with `render={<h2 />}` for a name under a profile avatar.

## Rules

- Don't use `size="eyebrow"`: it sets all caps, and the system doesn't use all caps outside the onboarding step label ([Typography](../../../../../design/foundations/typography.md#casing)).
- Don't use `variant="danger"` for error text. Error text is `danger-strong`, from the field's error state ([Field](../field/field.md)).
