---
title: Text
summary: Plain typography parts — Text.Heading, Text.Sans and Text.Mono — for text that no other component holds, in the system's two typefaces.
status: stable
aliases: [Typography, TextHeading, TextSans, TextMono, Heading]
layer: core
category: data-display
related: [markdown, inline-code, description-list, panel]
---

# Text

Text sets a run of text that no other component holds: a name under an avatar, a size next to a file name, a helper line in a custom layout (as a `HelperText`, with `variant="muted"`). `Text.Sans` is Space Grotesk, for what people say; `Text.Mono` is Space Mono, for what machines write; `Text.Heading` is a heading. Which typeface is for what is in [Typography](../../../../../design/foundations/typography.md#principles).

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
- `Text.Sans` (`TextSans`): a paragraph in Space Grotesk, sized by `size`: `large`, `body`, `small`, `caption` or `group`, the heading of a group of rows or a section in a panel (`text-footnote` at 700, `foreground-hint`, as in [Typography](../../../../../design/foundations/typography.md)).
- `Text.Mono` (`TextMono`): a paragraph in Space Mono, sized by `size`: `code`, `meta` or `tabular`.

Each part takes a `variant` for its color. Without one, the size sets it: `foreground` for every Sans size but `group`, and for Mono `code` and `tabular`; `foreground-hint` for Mono `meta` (a note: a time, an ID, a count) and for `group`. `small` and `caption` were `foreground-muted` before raft-ui's `HelperText` release, and `meta` too: a size never makes text grey now, since grey text is helper text.

```example
text/compositions/semantic-elements
```

## Variants

| Variant                                                                                | Use for                                                                                                                                                                                                                                                 |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variant="muted"`                                                                      | A helper line (`foreground-muted`). Takes only a `HelperText` as its children, made with `helperText(content, { why, about })`, and renders `data-why` and `data-about` ([Writing › Helper text](../../../../../design/content/writing.md#helper-text)) |
| `variant="note"`                                                                       | Notes: times, IDs, counts, a missing value (`foreground-hint`). Was `placeholder`; `codemods/helper-text-renames.mjs` renames it                                                                                                                        |
| `variant="information"`, `"success"`, `"warning"`, `"danger"`, `"primary"`, `"accent"` | Text that carries its color's meaning ([Meanings of color](../../../../../design/foundations/color.md#meanings-of-color))                                                                                                                               |
| `size="tabular"`                                                                       | Numbers in a column, with figures of equal width                                                                                                                                                                                                        |

```example
text/compositions/tones
```

- A color tone is its family's `-strong` ink, the shade made for text: `information` is `info-strong`, `accent` `attention-strong`, `success` `success-strong`, `warning` `warning-strong` and `danger` `danger-strong`. Each is at least 4.5:1 on the canvas, the sidebar, a card and a popover, in both modes and every theme (`text.tones.test.tsx`). They were the sticker colors `success`, `warning` and `danger`, which are fills for ink type: as text on white they were 1.64:1, 2.03:1 and 2.76:1. `accent` was `attention-700`, 8.0:1 on white but 2.15:1 on the dark canvas.
- `variant="primary"` is `brand-strong`, the brand's shade for text: 8.9:1 on white and 12.5:1 on the dark canvas. It used `brand-700`, which was 3.1:1 (APCA Lc 22) on the dark canvas, and which no theme reached, so it stayed yellow-brown in Boring Gray. Yellow text is the brand, not a signal (a signal is a yellow sticker: [Themes](../../../../../design/foundations/themes.md#signals)), so it grays with Boring Gray.

- The props are a union on `variant`: with `"muted"` the children are a `HelperText`, with any other tone any children. A tone chosen at runtime (`variant={quiet ? "muted" : "default"}`) fits neither, so split the two cases: a helper line and a line of data are different text.
- `Text.Heading` has no `muted`: a heading is never helper text.

## Content

- Follow the casing in [Typography](../../../../../design/foundations/typography.md#casing): sentence case for all text, what people click included.
- Set IDs, times, counts and sizes in `Text.Mono`, even next to Space Grotesk: `#25`, `10:24`, `24 KB`.

## Accessibility

- The parts are plain elements built with Base UI `useRender`. Use `render` to choose the element the document needs, such as a `span` inside a row, or `dt` and `dd` in a list of terms, while keeping the style.
- `level` sets both the size and the element. To keep the page's outline, set the element with `render`: `level={6}` with `render={<h2 />}` for a name under a profile avatar.

## Rules

- Head a section with `Text.Sans size="group"`, in sentence case. Don't set a small label in Space Mono or in all caps: nothing in the product is in all caps ([Typography](../../../../../design/foundations/typography.md#casing)).
- Don't colour words with a sticker colour or a palette step (`text-warning`, `text-success`, `text-danger`, `text-attention-700`): take a tone, or its `-strong` token in a layout of your own. The sticker colours are for fills and the icons on them ([Color › Contrast](../../../../../design/foundations/color.md#contrast)).
- Don't use `variant="danger"` for a field's error. It has the same `danger-strong` ink, but an error belongs to its field's error state, which also marks the field invalid ([Field](../field/field.md)).
