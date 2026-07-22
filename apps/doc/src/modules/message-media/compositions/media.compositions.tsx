import { Download, Play } from "lucide-react";
import { Spinner } from "raft-ui";
import {
  MessageImageGallery,
  MessageImageGalleryAction,
  MessageImageGalleryItem,
  MessageImageGalleryMedia,
  MessageImageGalleryOverlay,
  MessageImageGalleryPreview,
  MessageImageGalleryRow,
  MessageVideoPreview,
  MessageVideoPreviewAction,
  MessageVideoPreviewFallback,
  MessageVideoPreviewFrame,
} from "raft-ui/wip";
import {
  downloadMessageFixture,
  MESSAGE_FIXTURE_IMAGE_SRC,
  openMessageFixture,
} from "#/modules/message-item/message-item.fixtures.ts";

export function MessageImageGalleryPairComposition() {
  return (
    <MessageImageGallery>
      <MessageImageGalleryRow layout="pair">
        <MessageImageGalleryItem size="regular">
          <MessageImageGalleryMedia
            src={MESSAGE_FIXTURE_IMAGE_SRC}
            alt="release poster"
            geometry="normal"
          />
          <MessageImageGalleryPreview aria-label="Preview image" onClick={openMessageFixture} />
          <MessageImageGalleryAction
            aria-label="Download image"
            onClick={() => downloadMessageFixture("message-image.jpg")}
          >
            <Download />
          </MessageImageGalleryAction>
        </MessageImageGalleryItem>
        <MessageImageGalleryItem size="regular">
          <MessageImageGalleryMedia
            src={MESSAGE_FIXTURE_IMAGE_SRC}
            alt="release poster detail"
            geometry="normal"
          />
          <MessageImageGalleryPreview aria-label="Preview image" onClick={openMessageFixture} />
          <MessageImageGalleryAction
            aria-label="Download image"
            onClick={() => downloadMessageFixture("message-image.jpg")}
          >
            <Download />
          </MessageImageGalleryAction>
        </MessageImageGalleryItem>
      </MessageImageGalleryRow>
    </MessageImageGallery>
  );
}

export function MessageImageGallerySingleComposition({
  fit = "cover",
}: {
  fit?: "contain" | "cover";
}) {
  return (
    <MessageImageGallery>
      <MessageImageGalleryRow layout="single">
        <MessageImageGalleryItem
          size="single"
          style={{ width: "min(18rem, 100%)", aspectRatio: "4 / 3" }}
        >
          <MessageImageGalleryMedia
            src={MESSAGE_FIXTURE_IMAGE_SRC}
            alt="attachment preview"
            fit={fit}
            geometry="single"
          />
          <MessageImageGalleryAction
            aria-label="Download image"
            onClick={() => downloadMessageFixture("message-image.jpg")}
          >
            <Download />
          </MessageImageGalleryAction>
        </MessageImageGalleryItem>
      </MessageImageGalleryRow>
    </MessageImageGallery>
  );
}

export function MessageImageGalleryPendingComposition() {
  return (
    <MessageImageGallery>
      <MessageImageGalleryRow layout="single">
        <MessageImageGalleryItem
          aria-busy
          size="single"
          style={{ width: "min(18rem, 100%)", aspectRatio: "4 / 3" }}
        >
          <MessageImageGalleryMedia
            src={MESSAGE_FIXTURE_IMAGE_SRC}
            alt="attachment preview uploading"
            geometry="single"
          />
          <MessageImageGalleryOverlay>
            <Spinner size="md" variant="inverse" />
          </MessageImageGalleryOverlay>
        </MessageImageGalleryItem>
      </MessageImageGalleryRow>
    </MessageImageGallery>
  );
}

export function MessageVideoPreviewComposition() {
  return (
    <MessageVideoPreview title="Video fallback (static docs fixture)">
      <MessageVideoPreviewFrame>
        <MessageVideoPreviewFallback>
          <Play className="size-8 text-white/80" />
          <span className="sr-only">Static video fallback; no fixture media is attached.</span>
        </MessageVideoPreviewFallback>
        <MessageVideoPreviewAction
          aria-label="Download unavailable for static video fallback"
          title="No video fixture is attached"
          disabled
        >
          <Download />
        </MessageVideoPreviewAction>
      </MessageVideoPreviewFrame>
    </MessageVideoPreview>
  );
}

export function MessageVideoPendingComposition() {
  return (
    <MessageVideoPreview aria-busy title="demo-recording.mp4">
      <MessageVideoPreviewFrame>
        <MessageVideoPreviewFallback>
          <Spinner size="md" variant="inverse" />
        </MessageVideoPreviewFallback>
      </MessageVideoPreviewFrame>
    </MessageVideoPreview>
  );
}
