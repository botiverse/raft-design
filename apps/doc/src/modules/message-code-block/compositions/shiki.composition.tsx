import { MessageCodeBlock } from "raft-ui/wip";
import { ShikiHighlightedCode } from "#/lib/message-code-block/shiki-highlighted-code.tsx";

const CODE = `type Message = {
  author: string;
  body: string;
};

const message: Message = {
  author: "Ada",
  body: "Shipped",
};`;

export function ShikiMessageCodeBlockComposition() {
  return (
    <MessageCodeBlock code={CODE}>
      <ShikiHighlightedCode code={CODE} language="ts" />
    </MessageCodeBlock>
  );
}
