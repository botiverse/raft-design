import { CopyableCode, CopyableCodeAction, CopyableCodeRoot } from "raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

const COMMAND = "curl https://api.raft.build/v1/setup --machine workstation-2";

export function CompactDetailCommandContent() {
  return (
    <CopyableCodeRoot size="sm">
      <CopyableCode truncate>{COMMAND}</CopyableCode>
      <CopyableCodeAction aria-label="Copy computer setup command" />
    </CopyableCodeRoot>
  );
}

// @docs-source-strip-start
export function CompactDetailCommandComposition() {
  return (
    <CompositionPreview>
      <CompactDetailCommandContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
