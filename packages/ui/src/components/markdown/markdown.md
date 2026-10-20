---
title: Markdown
summary: The styled elements a Markdown renderer maps its nodes to — headings, paragraphs, links, lists, quotes, tables, images and task checkboxes — for text people and agents write.
status: stable
aliases: [Markdown parts, Rich text, Prose, MarkdownHeading, MarkdownTable]
layer: core
category: data-display
related: [message-item, inline-code, code-block, checkbox, table]
---

# Markdown

The Markdown parts style what people and agents write in Markdown: the body of a message, a task's description, an agent's notes. raft-ui exports one part per Markdown element and no parser. Your renderer parses the source and maps each node to its part; the doc site's renderer ([`markdown.tsx`](../../../../../apps/doc/src/lib/markdown/markdown.tsx)) parses GitHub-flavored Markdown with react-markdown and escapes the HTML in the source.

```example
message-reference/compositions/mixed-long-message
```

## When to use

| Situation                                                   | Use                                                                                                            |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Text someone wrote in Markdown                              | The Markdown parts                                                                                             |
| A mention, a channel, a thread or a task inside that text   | The message's reference parts, not `MarkdownLink` ([MessageItem](../message-item/message-item.md#in-the-body)) |
| A fenced code block                                         | [CodeBlock](../code-block/code-block.md)                                                                       |
| A table the product lays out, such as usage or billing      | [Table](../table/table.md)                                                                                     |
| Text the product writes: labels, descriptions, empty states | The component that holds it, or [Text](../text/text.md)                                                        |

## Anatomy

Each part renders the element of the same name.

- `MarkdownHeading`: `h1` to `h6`, from `level`.
- `MarkdownParagraph`: a paragraph. The last one in a block has no space under it.
- `MarkdownLink`: a link in running text.
- `MarkdownMark`: a highlighted run, for a search hit.
- `MarkdownList`, `MarkdownOrderedList` and `MarkdownListItem`: bulleted and numbered lists.
- `MarkdownCheckbox`: the box of a task-list item (`- [x]`). A read-only [Checkbox](../checkbox/checkbox.md).
- `MarkdownBlockquote`: a quote.
- `MarkdownRule`: a thematic break.
- `MarkdownImage`: an image, on a transparency checkerboard.
- `MarkdownInlineCode`: code inside a sentence ([InlineCode](../inline-code/inline-code.md)), at the size of the text around it.
- `MarkdownTableScroll`, `MarkdownTable`, `MarkdownTableRow`, `MarkdownHeaderCell` and `MarkdownCell`: a table. `MarkdownTableScroll` is the container and scrolls sideways when the table is wider than the text.

| Element         | Looks                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Headings 1 to 3 | `text-title`, `text-headline` and `text-subhead`, bold                                                                                                                                                                                                                                                                                                                                                                                                       |
| Headings 4 to 6 | `text-footnote`, bold, in `foreground-muted`                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Link            | `foreground-link` with a 2px underline at 40%, the one clickable text underlined at rest ([Clickable text](../../../../../design/foundations/states.md#clickable-text)): the link blue alone is 2.75:1 against `foreground` in light mode and 1.44:1 in dark mode, below 3:1. On hover the underline is full color and the text moves 20% toward the body ink, darker in light mode and lighter in dark mode, so its contrast with the paper goes up in both |
| Search hit      | A small yellow sticker, the same as `MessageItemSearchMatch`                                                                                                                                                                                                                                                                                                                                                                                                 |
| Quote           | A 2px bar on the left, `foreground-muted` text                                                                                                                                                                                                                                                                                                                                                                                                               |
| Rule            | A `line-hairline`                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Table           | A `line-hairline` outline and dividers, `radius-container`; the header row on `fill-muted` ([Built from existing parts](../../../../../design/components/overview.md#diagrams-and-markdown-tables))                                                                                                                                                                                                                                                          |
| Image           | A `line-hairline` outline, `radius-container`, at most the width of the text                                                                                                                                                                                                                                                                                                                                                                                 |

## Behavior

- The parts add no width of their own: text wraps to its container, and a long table scrolls inside `MarkdownTableScroll` instead of widening the message.
- A task-list checkbox shows the state written in the source. People can't change it from the rendered text.

## Content

- Render what the author wrote, including Chinese text and emoji, as body text: emoji are content, not icons ([Iconography](../../../../../design/foundations/iconography.md)).

## Accessibility

- The parts are plain HTML elements, so headings, lists, quotes and tables keep their native semantics.
- `MarkdownLink` shows `focus-ring` on keyboard focus.
- `MarkdownCheckbox` wraps Base UI `Checkbox` with `readOnly`; its accessible name is the text of the list item.
- Pass the image's alt text from the source to `MarkdownImage`.

## Rules

- Escape or sanitize HTML in the source before rendering: Markdown people write must not inject markup.
- Wrap every `MarkdownTable` in `MarkdownTableScroll`, so a wide table scrolls instead of overflowing the message.
- Render fenced code as a [CodeBlock](../code-block/code-block.md), not as a styled `pre`.
- Mark a search hit with `MarkdownMark`, not with bold or a color of your own: a hit looks the same in message text, Markdown and search results ([Color](../../../../../design/foundations/color.md#meanings-of-color)).
