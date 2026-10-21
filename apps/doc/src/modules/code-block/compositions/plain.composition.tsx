import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockBody,
  CodeBlockHeader,
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
        <pre tabIndex={0} aria-label="Code">
          <code>{CODE}</code>
        </pre>
      </CodeBlockBody>
    </CodeBlock>
  );
}
