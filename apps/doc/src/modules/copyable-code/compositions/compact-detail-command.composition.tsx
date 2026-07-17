import { CopyableCode } from "raft-ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

const COMMAND = "curl https://api.raft.build/v1/setup --machine workstation-2";

export function CompactDetailCommandComposition() {
  return (
    <SourceComparisonPreview>
      <CopyableCode.Root size="sm">
        <CopyableCode.Code truncate>{COMMAND}</CopyableCode.Code>
        <CopyableCode.Action ariaLabel="Copy computer setup command" />
      </CopyableCode.Root>
    </SourceComparisonPreview>
  );
}
