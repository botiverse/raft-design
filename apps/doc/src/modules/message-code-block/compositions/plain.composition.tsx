import { MessageCodeBlock } from "raft-ui/wip";

const CODE = `const message = {
  author: "Ada",
  body: "Shipped",
};`;

export function PlainMessageCodeBlockComposition() {
  return (
    <MessageCodeBlock code={CODE}>
      <pre>
        <code>{CODE}</code>
      </pre>
    </MessageCodeBlock>
  );
}
