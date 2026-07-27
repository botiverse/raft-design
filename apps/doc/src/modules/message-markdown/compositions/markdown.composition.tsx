import type { Components, Options } from "react-markdown";
import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { Checkbox } from "raft-ui";
import {
  MessageCodeBlock,
  MessageInlineCode,
  MessageMarkdown,
  MessageMarkdownTableScroll,
} from "raft-ui/wip";
import { MESSAGE_FIXTURE_IMAGE_SRC } from "#/modules/message-item/message-item.fixtures.ts";
import { markdownSanitizeSchema } from "../markdown-sanitize-schema.ts";
import { remarkAutolinkBareUrls } from "../remark-autolink-bare-urls.ts";

type PluggableList = NonNullable<Options["remarkPlugins"]>;

const DEFAULT_REMARK_PLUGINS: PluggableList = [remarkGfm, remarkAutolinkBareUrls, remarkBreaks];
const DEFAULT_REHYPE_PLUGINS: PluggableList = [[rehypeSanitize, markdownSanitizeSchema]];

function isBlockCode(node?: { position?: { start?: { line?: number }; end?: { line?: number } } }) {
  const startLine = node?.position?.start?.line;
  const endLine = node?.position?.end?.line;
  return startLine !== undefined && endLine !== undefined && startLine !== endLine;
}

const MESSAGE_MARKDOWN_COMPONENTS: Components = {
  pre: ({ node: _node, children, ...props }) => (
    <MessageCodeBlock {...props}>{children}</MessageCodeBlock>
  ),
  code: ({ node, children, className, ...props }) => {
    if (className || isBlockCode(node)) {
      return (
        <code {...props} className={className}>
          {children}
        </code>
      );
    }

    return <MessageInlineCode {...props}>{children}</MessageInlineCode>;
  },
  table: ({ node: _node, children, ...props }) => (
    <MessageMarkdownTableScroll>
      <table {...props}>{children}</table>
    </MessageMarkdownTableScroll>
  ),
  input: ({ node: _node, type, checked, disabled: _disabled, ...props }) => {
    if (type !== "checkbox") return <input {...props} type={type} checked={checked} />;

    return (
      <Checkbox
        variant="primary"
        checked={checked === true}
        readOnly
        className="mr-1.5 align-middle"
      />
    );
  },
  a: ({ node: _node, href, children, ...props }) => (
    <a {...props} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

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

export const MESSAGE_CODE_BLOCK_SOURCE = `Here is the loader I landed — no highlighting, just the mono block.

\`\`\`ts
const tokens = load();
console.log(tokens.layerPanel);
\`\`\``;

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
  const markdownComponents = useMemo(
    () =>
      components ? { ...MESSAGE_MARKDOWN_COMPONENTS, ...components } : MESSAGE_MARKDOWN_COMPONENTS,
    [components],
  );

  return (
    <MessageMarkdown>
      <ReactMarkdown
        remarkPlugins={DEFAULT_REMARK_PLUGINS}
        rehypePlugins={DEFAULT_REHYPE_PLUGINS}
        components={markdownComponents}
      >
        {source ?? createMessageMarkdownSource(imageSrc)}
      </ReactMarkdown>
    </MessageMarkdown>
  );
}

export function MessageCodeBlockComposition() {
  return <MessageMarkdownComposition source={MESSAGE_CODE_BLOCK_SOURCE} />;
}

export function MessageMarkdownShowcaseComposition() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-5">
      <MessageMarkdownComposition />
      <MessageCodeBlockComposition />
    </div>
  );
}
