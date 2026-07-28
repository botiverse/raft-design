import { COMPOSER_IMAGE_SRC } from "#/modules/chat-composer/composer-image.ts";

/** Exhaustive Markdown input covering every node the renderer supports. */
export const MARKDOWN_SOURCE = `# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

Inline: **bold**, _italic_, ~~strikethrough~~, \`inline code\`, plus escaped \\*literal\\* asterisks.

First line
hard-break second line.

[Labeled link](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a) and an autolink https://github.com/botiverse/slock, plus email <contact@raft.build>.

部署成功 🎉 完成 — emoji and CJK render as plain body text.

Raw user HTML is escaped as text: &lt;span&gt;not message markup&lt;/span&gt;.

- Unordered item
- Nested list
  - child bullet

1. Ordered one
2. Ordered two

- [x] completed task-list item
- [ ] open task-list item

> Blockquote wraps at the same line height.

---

| Token | Surface |
| --- | --- |
| layer-panel | panel |
| line-strong | border |

![markdown embed](${COMPOSER_IMAGE_SRC})

Here is the loader I landed — no highlighting, just the mono block.

\`\`\`ts
const tokens = load();
console.log(tokens.layerPanel);
\`\`\``;
