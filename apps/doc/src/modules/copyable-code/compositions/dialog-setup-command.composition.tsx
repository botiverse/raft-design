import { CopyableCode, CopyableCodeAction, CopyableCodeRoot } from "raft-ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

const COMMAND =
  "npx @botiverse/raft-daemon@latest --server-url https://api.raft.build --api-key sk_machine_0000000000000000000000000000000000000000000000000000000000000000 # Zolplay";

export function DialogSetupCommandContent() {
  return (
    <CopyableCodeRoot>
      <CopyableCode>{COMMAND}</CopyableCode>
      <CopyableCodeAction ariaLabel="Copy daemon command" />
    </CopyableCodeRoot>
  );
}

// @docs-source-strip-start
export function DialogSetupCommandComposition() {
  return (
    <SourceComparisonPreview>
      <DialogSetupCommandContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
