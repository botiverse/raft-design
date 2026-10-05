import { useCallback, useState } from "react";
import { CopyableCode, CopyableCodeAction, CopyableCodeRoot } from "raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

const COMMAND = "raft login --token $RAFT_TOKEN";

export function CopyFailureCompositionContent() {
  const [copyFailed, setCopyFailed] = useState(false);

  const handleCopy = useCallback(() => {
    setCopyFailed(false);
  }, []);

  const handleCopyError = useCallback(() => {
    setCopyFailed(true);
  }, []);

  return (
    <div className="grid w-full gap-2">
      <CopyableCodeRoot size="sm" onCopy={handleCopy} onError={handleCopyError}>
        <CopyableCode truncate>{COMMAND}</CopyableCode>
        <CopyableCodeAction aria-label="Copy login command" />
      </CopyableCodeRoot>
      {copyFailed ? (
        <p role="status" className="text-xs text-foreground-muted">
          Copy failed — select the command and copy it manually.
        </p>
      ) : null}
    </div>
  );
}

// @docs-source-strip-start
export function CopyFailureComposition() {
  return (
    <CompositionPreview>
      <CopyFailureCompositionContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
