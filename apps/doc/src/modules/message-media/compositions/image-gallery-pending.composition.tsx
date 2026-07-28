import { Spinner } from "raft-ui";
import {
  MessageImageGallery,
  MessageImageGalleryItem,
  MessageImageGalleryMedia,
  MessageImageGalleryOverlay,
  MessageImageGalleryRow,
} from "raft-ui/wip";
import { MESSAGE_FIXTURE_IMAGE_SRC } from "#/modules/message-item/message-item.fixtures.ts";

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
