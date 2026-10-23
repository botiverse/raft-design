import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockBody,
  CodeBlockHeader,
  CodeBlockPre,
  CodeBlockTitle,
} from "@botiverse/raft-ui";
import { CodeCopyAction } from "#/lib/code-block/code-copy-action.tsx";

const CODE = `const message = {
  author: "Ada",
  body: "Shipped",
};`;

export function PlainCodeBlockComposition() {
  return (
    <CodeBlock>
      <CodeBlockHeader>
        <CodeBlockTitle>message.js</CodeBlockTitle>
        <CodeBlockActions>
          <CodeCopyAction code={CODE} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockBody>
        <CodeBlockPre>
          <code>{CODE}</code>
        </CodeBlockPre>
      </CodeBlockBody>
    </CodeBlock>
  );
}
