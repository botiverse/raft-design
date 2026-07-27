import type { Components } from "react-markdown";
import { MessageMarkdownAdapter } from "#/lib/message-markdown/message-markdown-adapter.tsx";
import { MESSAGE_FIXTURE_IMAGE_SRC } from "#/modules/message-item/message-item.fixtures.ts";

export function createMessageMarkdownSource(imageSrc: string) {
  return `# Heading 1

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

![markdown embed](${imageSrc})

Here is the loader I landed — no highlighting, just the mono block.

\`\`\`ts
const tokens = load();
console.log(tokens.layerPanel);
\`\`\``;
}

export const MESSAGE_MARKDOWN_SOURCE = createMessageMarkdownSource(MESSAGE_FIXTURE_IMAGE_SRC);

export const MESSAGE_MARKDOWN_COMPARISON_SOURCE = `The current renderer keeps **bold**, _emphasis_, and \`inline code\` inside the message row.

> Markdown remains bounded by the message content column.

\`\`\`ts
const theme = "brutal";
\`\`\``;

export type MessageMarkdownCompositionProps = {
  /** Docs-only source adapter; product adapters may replace nodes with domain components. */
  components?: Components;
  imageSrc?: string;
  source?: string;
};

export function MessageMarkdownComposition({
  components,
  imageSrc = MESSAGE_FIXTURE_IMAGE_SRC,
  source,
}: MessageMarkdownCompositionProps = {}) {
  return (
    <MessageMarkdownAdapter
      source={source ?? createMessageMarkdownSource(imageSrc)}
      components={components}
    />
  );
}

export function MessageMarkdownShowcaseComposition() {
  return <MessageMarkdownComposition />;
}
