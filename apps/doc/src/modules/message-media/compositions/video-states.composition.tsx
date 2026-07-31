import { AlertTriangle, ArrowDownToLine } from "lucide-react";
import { Spinner } from "raft-ui";
import {
  MessageVideoPreview,
  MessageVideoPreviewAction,
  MessageVideoPreviewFailureAction,
  MessageVideoPreviewFailureContent,
  MessageVideoPreviewFailureIcon,
  MessageVideoPreviewFailureTitle,
  MessageVideoPreviewFallback,
  MessageVideoPreviewMedia,
} from "raft-ui/wip";
import {
  MESSAGE_FIXTURE_VIDEO_SRC,
  downloadMessageFixture,
} from "#/modules/message-item/message-item.fixtures.ts";

export type MessageVideoPreviewCompositionProps = {
  name?: string;
  onDownload?: () => void;
  src?: string;
};

export function MessageVideoPreviewComposition({
  name = "demo-recording.webm",
  onDownload = () => downloadMessageFixture("demo-recording.webm"),
  src = MESSAGE_FIXTURE_VIDEO_SRC,
}: MessageVideoPreviewCompositionProps = {}) {
  return (
    <MessageVideoPreview title={name}>
      <MessageVideoPreviewMedia
        aria-label={`Play ${name}`}
        controls
        playsInline
        preload="metadata"
        src={src}
      />
      <MessageVideoPreviewAction
        aria-label={`Download ${name}`}
        title={`Download ${name}`}
        onClick={onDownload}
      >
        <ArrowDownToLine />
      </MessageVideoPreviewAction>
    </MessageVideoPreview>
  );
}

function MessageVideoPendingComposition() {
  return (
    <MessageVideoPreview aria-busy title="demo-recording.mp4">
      <MessageVideoPreviewFallback>
        <Spinner size="md" variant="inverse" />
      </MessageVideoPreviewFallback>
    </MessageVideoPreview>
  );
}

function MessageVideoPreviewFailedComposition() {
  return (
    <MessageVideoPreview title="demo-recording.webm">
      <MessageVideoPreviewFallback>
        <MessageVideoPreviewFailureContent>
          <MessageVideoPreviewFailureIcon>
            <AlertTriangle />
          </MessageVideoPreviewFailureIcon>
          <MessageVideoPreviewFailureTitle>
            This video may use a codec this browser cannot preview.
          </MessageVideoPreviewFailureTitle>
          <MessageVideoPreviewFailureAction
            onClick={() => downloadMessageFixture("demo-recording.webm")}
          >
            <ArrowDownToLine />
            Download to view
          </MessageVideoPreviewFailureAction>
        </MessageVideoPreviewFailureContent>
      </MessageVideoPreviewFallback>
    </MessageVideoPreview>
  );
}

export function MessageVideoPreviewStatesComposition() {
  return (
    <div className="space-y-2">
      <MessageVideoPreviewComposition />
      <MessageVideoPendingComposition />
      <MessageVideoPreviewFailedComposition />
    </div>
  );
}
