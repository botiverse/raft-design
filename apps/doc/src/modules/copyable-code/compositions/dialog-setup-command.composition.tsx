import { CopyableCode, CopyableCodeAction, CopyableCodeRoot } from "raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
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
    <CompositionPreview>
      <DialogSetupCommandContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
