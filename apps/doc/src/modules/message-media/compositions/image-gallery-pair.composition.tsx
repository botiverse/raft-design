import { Download } from "lucide-react";
import {
  MessageImageGallery,
  MessageImageGalleryAction,
  MessageImageGalleryItem,
  MessageImageGalleryMedia,
  MessageImageGalleryPreview,
  MessageImageGalleryRow,
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
