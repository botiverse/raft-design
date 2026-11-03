import { TextWrap } from "lucide-react";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockBody,
  CodeBlockHeader,
  CodeBlockPre,
  CodeBlockTitle,
} from "@botiverse/raft-ui";
import { CodeBlockWrapToggle } from "@botiverse/raft-ui/wip";
import { CodeCopyAction } from "#/lib/code-block/code-copy-action.tsx";

const CODE = `curl -X POST https://api.raft.chat/v1/channels/launch-crew/messages -H "Authorization: Bearer $RAFT_TOKEN" -d '{"body":"Deploy finished"}'
{"id":"msg_7Hq2","channel":"launch-crew","status":"delivered"}`;

export function WrapCodeBlockComposition() {
  return (
    <div className="w-full max-w-sm">
      <CodeBlock defaultWrap>
        <CodeBlockHeader>
          <CodeBlockTitle>bash</CodeBlockTitle>
          <CodeBlockActions>
            <CodeBlockWrapToggle title="Don't Wrap Lines" aria-label="Don't Wrap Lines">
              <TextWrap className="size-3.5" aria-hidden />
            </CodeBlockWrapToggle>
            <CodeCopyAction code={CODE} />
          </CodeBlockActions>
        </CodeBlockHeader>
        <CodeBlockBody>
          <CodeBlockPre aria-label="bash code">
            <code>{CODE}</code>
          </CodeBlockPre>
        </CodeBlockBody>
      </CodeBlock>
    </div>
  );
}
