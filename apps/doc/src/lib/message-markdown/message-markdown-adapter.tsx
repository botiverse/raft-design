import type { Components, Options } from "react-markdown";
import { Children, isValidElement, useMemo, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import {
  Checkbox,
  CodeBlock,
  CodeBlockActions,
  CodeBlockBody,
  CodeBlockHeader,
  CodeBlockTitle,
} from "raft-ui";
import { MessageInlineCode, MessageMarkdown, MessageMarkdownTableScroll } from "raft-ui/wip";
import { CodeCopyAction } from "#/lib/code-block/code-copy-action.tsx";
import { ShikiHighlightedCode } from "#/lib/code-block/shiki-highlighted-code.tsx";
import { markdownSanitizeSchema } from "./markdown-sanitize-schema.ts";
import { remarkAutolinkBareUrls } from "./remark-autolink-bare-urls.ts";

type PluggableList = NonNullable<Options["remarkPlugins"]>;

const DEFAULT_REMARK_PLUGINS: PluggableList = [remarkGfm, remarkAutolinkBareUrls, remarkBreaks];
const DEFAULT_REHYPE_PLUGINS: NonNullable<Options["rehypePlugins"]> = [
  [rehypeSanitize, markdownSanitizeSchema],
];

function isBlockCode(node?: { position?: { start?: { line?: number }; end?: { line?: number } } }) {
  const startLine = node?.position?.start?.line;
  const endLine = node?.position?.end?.line;
  return startLine !== undefined && endLine !== undefined && startLine !== endLine;
}

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

function languageFromClassName(className?: string) {
  return className?.match(/(?:^|\s)language-([^\s]+)/)?.[1] ?? null;
}

const DEFAULT_COMPONENTS: Components = {
  pre: ({ node: _node, children }) => <>{children}</>,
  code: ({ node, children, className, ...props }) => {
    if (className || isBlockCode(node)) {
      const code = extractCodeText(children);
      const language = languageFromClassName(className);

      return (
        <CodeBlock>
          <CodeBlockHeader>
            {language ? <CodeBlockTitle>{language}</CodeBlockTitle> : null}
            <CodeBlockActions>
              <CodeCopyAction code={code} />
            </CodeBlockActions>
          </CodeBlockHeader>
          <CodeBlockBody>
            <ShikiHighlightedCode code={code} language={language} />
          </CodeBlockBody>
        </CodeBlock>
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

export type MessageMarkdownAdapterProps = {
  additionalRemarkPlugins?: PluggableList;
  components?: Components;
  source: string;
};

/**
 * Shared Markdown runtime for docs compositions and product-shaped Playground consumers.
 * Consumers may add remark transforms and override individual rendered nodes.
 */
export function MessageMarkdownAdapter({
  additionalRemarkPlugins,
  components,
  source,
}: MessageMarkdownAdapterProps) {
  const markdownComponents = useMemo(
    () => (components ? { ...DEFAULT_COMPONENTS, ...components } : DEFAULT_COMPONENTS),
    [components],
  );
  const remarkPlugins = useMemo(
    () =>
      additionalRemarkPlugins
        ? [...DEFAULT_REMARK_PLUGINS, ...additionalRemarkPlugins]
        : DEFAULT_REMARK_PLUGINS,
    [additionalRemarkPlugins],
  );

  return (
    <MessageMarkdown>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={DEFAULT_REHYPE_PLUGINS}
        components={markdownComponents}
      >
        {source}
      </ReactMarkdown>
    </MessageMarkdown>
  );
}
