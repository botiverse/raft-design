import {
  Progress,
  ProgressHeader,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "raft-ui";

export function ProgressPreviewContent() {
  return (
    <div className="w-full max-w-sm">
      <Progress value={64} variant="primary">
        <ProgressHeader>
          <ProgressLabel>Uploading transcript</ProgressLabel>
          <ProgressValue />
        </ProgressHeader>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    </div>
  );
}
