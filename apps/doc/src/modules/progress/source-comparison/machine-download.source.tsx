import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
import { SourceProgressBar } from "./source-progress-bar.tsx";

export function ProgressMachineDownloadSourcePreview({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <SourceProgressBar value={42} tone="pink" label="Downloading..." />
    </SourceComparisonPreview>
  );
}
