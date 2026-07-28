import { CodeBlock, CodeBlockActions, CodeBlockBody } from "raft-ui";
import { CodeCopyAction } from "#/lib/code-block/code-copy-action.tsx";
import { ShikiHighlightedCode } from "#/lib/code-block/shiki-highlighted-code.tsx";

const CODE = `export function formatAuthor(message: Message) {
  return message.author.trim() || "Unknown";
}`;

export function WithoutHeaderCodeBlockComposition() {
  return (
    <CodeBlock>
      <CodeBlockBody>
        <CodeBlockActions>
          <CodeCopyAction code={CODE} />
        </CodeBlockActions>
        <ShikiHighlightedCode code={CODE} language="ts" />
      </CodeBlockBody>
    </CodeBlock>
  );
}
