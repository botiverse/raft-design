import { Progress, ProgressHeader, ProgressIndicator, ProgressLabel, ProgressTrack } from "raft-ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function ProgressMachineDownloadContent() {
  return (
    <Progress value={42} variant="primary" className="w-64">
      <ProgressHeader>
        <ProgressLabel>Downloading...</ProgressLabel>
      </ProgressHeader>
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </Progress>
  );
}

// @docs-source-strip-start
export function ProgressMachineDownloadComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <ProgressMachineDownloadContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
