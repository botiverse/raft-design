import { type MarkdownCodeRenderer } from "#/lib/markdown/create-markdown-components.tsx";
import { MarkdownCodeBlock } from "#/lib/markdown/markdown-code-block.tsx";
import { CodeCopyAction } from "#/lib/code-block/code-copy-action.tsx";
import { ShikiHighlightedCode } from "#/lib/code-block/shiki-highlighted-code.tsx";

/** Highlighted code frame for Markdown fences, shared by docs compositions and Playground. */
export const renderShikiCodeBlock: MarkdownCodeRenderer = ({ code, language }) => (
  <MarkdownCodeBlock code={code} language={language} actions={<CodeCopyAction code={code} />}>
    <ShikiHighlightedCode code={code} language={language} />
  </MarkdownCodeBlock>
);
