import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockBody,
  CodeBlockHeader,
  CodeBlockTitle,
} from "raft-ui";
import { AnimatedCodeCopyAction } from "#/lib/code-block/code-copy-action.tsx";
import { ShikiHighlightedCode } from "#/lib/code-block/shiki-highlighted-code.tsx";

const CODE = `export function messagePreview(message: Message) {
  return message.body.slice(0, 80).trimEnd();
}`;

export function AnimatedCopyCodeBlockComposition() {
  return (
    <CodeBlock>
      <CodeBlockHeader>
        <CodeBlockTitle>message-preview.ts</CodeBlockTitle>
        <CodeBlockActions>
          <AnimatedCodeCopyAction code={CODE} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockBody>
        <ShikiHighlightedCode code={CODE} language="ts" />
      </CodeBlockBody>
    </CodeBlock>
  );
}
