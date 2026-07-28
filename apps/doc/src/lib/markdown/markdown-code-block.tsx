import type { ReactNode } from "react";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockBody,
  CodeBlockHeader,
  CodeBlockTitle,
} from "raft-ui";

export type MarkdownCodeContext = {
  code: string;
  language: string | null;
};

export type MarkdownCodeBlockProps = MarkdownCodeContext & {
  /** Trailing header controls, such as a copy button. */
  actions?: ReactNode;
  /** Highlighted body. Defaults to the raw code in a plain `pre`. */
  children?: ReactNode;
};

/** Fenced code frame for Markdown. Highlighting and actions stay consumer-owned. */
export function MarkdownCodeBlock({ actions, children, code, language }: MarkdownCodeBlockProps) {
  return (
    <CodeBlock>
      <CodeBlockHeader>
        {language ? <CodeBlockTitle>{language}</CodeBlockTitle> : null}
        {actions ? <CodeBlockActions>{actions}</CodeBlockActions> : null}
      </CodeBlockHeader>
      <CodeBlockBody>
        {children ?? (
          <pre>
            <code>{code}</code>
          </pre>
        )}
      </CodeBlockBody>
    </CodeBlock>
  );
}
