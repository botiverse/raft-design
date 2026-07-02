import { Progress, ProgressHeader, ProgressIndicator, ProgressLabel, ProgressTrack } from "raft-ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function ProgressRestartIndeterminateContent() {
  return (
    <Progress value={null} variant="information" className="w-64">
      <ProgressHeader>
        <ProgressLabel>Restarting...</ProgressLabel>
      </ProgressHeader>
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </Progress>
  );
}

// @docs-source-strip-start
export function ProgressRestartIndeterminateComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <ProgressRestartIndeterminateContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
