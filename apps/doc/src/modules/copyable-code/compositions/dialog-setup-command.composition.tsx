import { CopyableCode } from "raft-ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

const COMMAND =
  "npx @botiverse/raft-daemon@latest --server-url https://api.raft.build --api-key sk_machine_0000000000000000000000000000000000000000000000000000000000000000 # Zolplay";

export function DialogSetupCommandComposition() {
  return (
    <SourceComparisonPreview>
      <CopyableCode.Root>
        <CopyableCode.Code>{COMMAND}</CopyableCode.Code>
        <CopyableCode.Action ariaLabel="Copy daemon command" />
      </CopyableCode.Root>
    </SourceComparisonPreview>
  );
}
