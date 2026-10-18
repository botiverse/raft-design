import type { Components } from "react-markdown";
import { Children, isValidElement } from "react";
import type { ReactNode } from "react";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockBody,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@botiverse/raft-ui";
import { CodeCopyAction } from "#/lib/code-block/code-copy-action.tsx";
import { ShikiHighlightedCode } from "#/lib/code-block/shiki-highlighted-code.tsx";

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
 * Renders a fenced block as a highlighted code panel. Mapped to `pre` rather than `code`, so
 * the whole fence is available in one place and blocks without a language work the same way.
 */
export const MarkdownCodeFence: Components["pre"] = ({ children }) => {
  const code = extractCodeText(children);
  const language = extractCodeLanguage(children);

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
};
