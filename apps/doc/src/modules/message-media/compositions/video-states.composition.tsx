import { AlertTriangle, ArrowDownToLine, Eye } from "lucide-react";
import { Spinner } from "raft-ui";
import {
  MessageVideoPreview,
  MessageVideoPreviewAction,
  MessageVideoPreviewFailureAction,
  MessageVideoPreviewFailureContent,
  MessageVideoPreviewFailureIcon,
  MessageVideoPreviewFailureTitle,
  MessageVideoPreviewFallback,
  MessageVideoPreviewFrame,
  MessageVideoPreviewMedia,
} from "raft-ui/wip";
import { MESSAGE_FIXTURE_VIDEO_SRC } from "#/modules/message-item/message-item.fixtures.ts";

export function MessageVideoPreviewComposition() {
  return (
    <MessageVideoPreview title="demo-recording.webm">
      <MessageVideoPreviewFrame>
        <MessageVideoPreviewMedia
          aria-label="Inline video attachment"
          controls
          playsInline
          preload="metadata"
          src={MESSAGE_FIXTURE_VIDEO_SRC}
        />
        <MessageVideoPreviewAction aria-hidden render={<span />} title="Open video preview">
          <Eye />
        </MessageVideoPreviewAction>
      </MessageVideoPreviewFrame>
    </MessageVideoPreview>
  );
}

function MessageVideoPendingComposition() {
  return (
    <MessageVideoPreview aria-busy title="demo-recording.mp4">
      <MessageVideoPreviewFrame>
        <MessageVideoPreviewFallback>
          <Spinner size="md" variant="inverse" />
        </MessageVideoPreviewFallback>
        <MessageVideoPreviewAction aria-hidden render={<span />} title="Open video preview">
          <Eye />
        </MessageVideoPreviewAction>
      </MessageVideoPreviewFrame>
    </MessageVideoPreview>
  );
}

function MessageVideoPreviewFailedComposition() {
  return (
    <MessageVideoPreview title="preview.mov">
      <MessageVideoPreviewFrame>
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
      </MessageVideoPreviewFrame>
    </MessageVideoPreview>
  );
}

export function MessageVideoPreviewStatesComposition() {
  return (
    <>
      <MessageVideoPreviewComposition />
      <MessageVideoPendingComposition />
      <MessageVideoPreviewFailedComposition />
    </>
  );
}
