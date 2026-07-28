import type { Components } from "react-markdown";
import {
  MarkdownBlockquote,
  MarkdownCell,
  MarkdownCheckbox,
  MarkdownHeaderCell,
  MarkdownHeading,
  MarkdownImage,
  MarkdownInlineCode,
  MarkdownLink,
  MarkdownList,
  MarkdownListItem,
  MarkdownMark,
  MarkdownOrderedList,
  MarkdownParagraph,
  MarkdownRule,
  MarkdownTable,
  MarkdownTableRow,
  MarkdownTableScroll,
} from "raft-ui";

/**
 * Default node mapping. Every entry renders a Markdown part, so consumer overrides never
 * inherit descendant styling meant for parser output. Override any entry through
 * `Markdown`'s `components` prop. Fenced code is not mapped here: override `pre` with a
 * renderer of your own.
 */
export const MARKDOWN_COMPONENTS: Components = {
  a: ({ node: _node, ...props }) => (
    <MarkdownLink {...props} target="_blank" rel="noopener noreferrer" />
  ),
  blockquote: ({ node: _node, ...props }) => <MarkdownBlockquote {...props} />,
  code: ({ node: _node, ...props }) => <MarkdownInlineCode {...props} />,
  h1: ({ node: _node, ...props }) => <MarkdownHeading level={1} {...props} />,
  h2: ({ node: _node, ...props }) => <MarkdownHeading level={2} {...props} />,
  h3: ({ node: _node, ...props }) => <MarkdownHeading level={3} {...props} />,
  h4: ({ node: _node, ...props }) => <MarkdownHeading level={4} {...props} />,
  h5: ({ node: _node, ...props }) => <MarkdownHeading level={5} {...props} />,
  h6: ({ node: _node, ...props }) => <MarkdownHeading level={6} {...props} />,
  hr: ({ node: _node, ...props }) => <MarkdownRule {...props} />,
  img: ({ node: _node, ...props }) => <MarkdownImage {...props} />,
  input: ({ node: _node, checked, disabled: _disabled, type, ...props }) => {
    if (type !== "checkbox") return <input {...props} type={type} checked={checked} />;

    return <MarkdownCheckbox checked={checked === true} />;
  },
  li: ({ node: _node, ...props }) => <MarkdownListItem {...props} />,
  mark: ({ node: _node, ...props }) => <MarkdownMark {...props} />,
  ol: ({ node: _node, ...props }) => <MarkdownOrderedList {...props} />,
  p: ({ node: _node, ...props }) => <MarkdownParagraph {...props} />,
  table: ({ node: _node, ...props }) => (
    <MarkdownTableScroll>
      <MarkdownTable {...props} />
    </MarkdownTableScroll>
  ),
  td: ({ node: _node, ...props }) => <MarkdownCell {...props} />,
  th: ({ node: _node, ...props }) => <MarkdownHeaderCell {...props} />,
  tr: ({ node: _node, ...props }) => <MarkdownTableRow {...props} />,
  ul: ({ node: _node, ...props }) => <MarkdownList {...props} />,
};
