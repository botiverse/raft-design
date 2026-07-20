import { CopyableCode, CopyableCodeAction, CopyableCodeRoot } from "raft-ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

const COMMAND = "curl https://api.raft.build/v1/setup --machine workstation-2";

export function CompactDetailCommandComposition() {
  return (
    <SourceComparisonPreview>
      <CopyableCodeRoot size="sm">
        <CopyableCode truncate>{COMMAND}</CopyableCode>
        <CopyableCodeAction ariaLabel="Copy computer setup command" />
      </CopyableCodeRoot>
    </SourceComparisonPreview>
  );
}
