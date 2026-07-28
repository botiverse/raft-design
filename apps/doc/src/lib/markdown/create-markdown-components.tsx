import type { Components } from "react-markdown";
import { Children, isValidElement, type ReactNode } from "react";
import { MarkdownCodeBlock, type MarkdownCodeContext } from "./markdown-code-block.tsx";
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
  MarkdownOrderedList,
  MarkdownMark,
  MarkdownParagraph,
  MarkdownRule,
  MarkdownTable,
  MarkdownTableRow,
  MarkdownTableScroll,
} from "raft-ui";

export type MarkdownCodeRenderer = (context: MarkdownCodeContext) => ReactNode;

function extractCodeText(children: ReactNode): string {
  let text = "";

  Children.forEach(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      text += child;
      return;
    }

    if (isValidElement<{ children?: ReactNode }>(child)) {
      text += extractCodeText(child.props.children);
    }
  });

  return text.replace(/\n$/, "");
}

/** Reads `language-*` off the `code` element a fenced block wraps. */
function extractCodeLanguage(children: ReactNode): string | null {
  let language: string | null = null;

  Children.forEach(children, (child) => {
    if (language || !isValidElement<{ className?: string; children?: ReactNode }>(child)) return;
    language =
      child.props.className?.match(/(?:^|\s)language-([^\s]+)/)?.[1] ??
      extractCodeLanguage(child.props.children);
  });

  return language;
}

/**
 * Default node mapping. Every entry renders a Markdown part, so consumer overrides never
 * inherit descendant styling meant for parser output.
 */
export function createMarkdownComponents(renderCode?: MarkdownCodeRenderer): Components {
  return {
    a: ({ node: _node, ...props }) => (
      <MarkdownLink {...props} target="_blank" rel="noopener noreferrer" />
    ),
    blockquote: ({ node: _node, ...props }) => <MarkdownBlockquote {...props} />,
    // Fenced blocks are intercepted at `pre`, so `code` only ever sees inline code.
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
    pre: ({ node: _node, children }) => {
      const context = {
        code: extractCodeText(children),
        language: extractCodeLanguage(children),
      };

      return renderCode ? renderCode(context) : <MarkdownCodeBlock {...context} />;
    },
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
}
