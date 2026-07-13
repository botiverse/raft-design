import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
import { SourceProgressBar } from "./source-progress-bar.tsx";

export function ProgressRestartIndeterminateSourcePreview({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <SourceProgressBar value={null} tone="cyan" label="Restarting..." />
    </SourceComparisonPreview>
  );
}
