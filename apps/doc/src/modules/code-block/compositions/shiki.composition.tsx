import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockBody,
  CodeBlockHeader,
  CodeBlockTitle,
} from "raft-ui/wip";
import { CodeCopyAction } from "#/lib/code-block/code-copy-action.tsx";
import { ShikiHighlightedCode } from "#/lib/code-block/shiki-highlighted-code.tsx";

const CODE = `type Message = {
  author: string;
  body: string;
};

const message: Message = {
  author: "Ada",
  body: "Shipped",
};`;

export function ShikiCodeBlockComposition() {
  return (
    <CodeBlock>
      <CodeBlockHeader>
        <CodeBlockTitle>message.ts</CodeBlockTitle>
        <CodeBlockActions>
          <CodeCopyAction code={CODE} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockBody>
        <ShikiHighlightedCode code={CODE} language="ts" />
      </CodeBlockBody>
    </CodeBlock>
  );
}
