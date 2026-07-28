import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockBody,
  CodeBlockHeader,
  CodeBlockTitle,
} from "raft-ui/wip";
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
        <pre>
          <code>{CODE}</code>
        </pre>
      </CodeBlockBody>
    </CodeBlock>
  );
}
