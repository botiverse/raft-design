import {
  Progress,
  ProgressHeader,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "raft-ui";

export function EmbeddedProgressComposition() {
  return (
    <div className="w-full max-w-sm space-y-2 rounded-md border border-line-hairline p-3">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="min-w-0 truncate">example-document.txt</span>
        <span className="shrink-0 text-foreground-muted">Processing</span>
      </div>
      <Progress value={48} size="sm" variant="information">
        <ProgressHeader>
          <ProgressLabel>Processing example-document.txt</ProgressLabel>
          <ProgressValue />
        </ProgressHeader>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    </div>
  );
}
