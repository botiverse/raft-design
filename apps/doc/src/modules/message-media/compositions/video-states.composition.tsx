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

export function MessageVideoPreviewComposition() {
  return (
    <MessageVideoPreview title="demo-recording.webm">
      <MessageVideoPreviewMedia
        aria-label="Inline video attachment"
        controls
        playsInline
        preload="metadata"
        src={MESSAGE_FIXTURE_VIDEO_SRC}
      />
      <MessageVideoPreviewAction
        aria-label="Download demo-recording.webm"
        title="Download demo-recording.webm"
        onClick={() => downloadMessageFixture("demo-recording.webm")}
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
      <MessageVideoPreviewAction
        aria-label="Download demo-recording.mp4"
        disabled
        title="Available once the upload finishes"
      >
        <ArrowDownToLine />
      </MessageVideoPreviewAction>
    </MessageVideoPreview>
  );
}

function MessageVideoPreviewFailedComposition() {
  return (
    <MessageVideoPreview title="preview.mov">
      <MessageVideoPreviewFallback>
        <MessageVideoPreviewFailureContent>
          <MessageVideoPreviewFailureIcon>
            <AlertTriangle />
          </MessageVideoPreviewFailureIcon>
          <MessageVideoPreviewFailureTitle>
            This video may use a codec this browser cannot preview.
          </MessageVideoPreviewFailureTitle>
          <MessageVideoPreviewFailureAction>
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
