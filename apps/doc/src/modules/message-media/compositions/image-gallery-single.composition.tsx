import { Download } from "lucide-react";
import {
  MessageImageGallery,
  MessageImageGalleryAction,
  MessageImageGalleryItem,
  MessageImageGalleryMedia,
  MessageImageGalleryRow,
} from "raft-ui/wip";
import {
  downloadMessageFixture,
  MESSAGE_FIXTURE_IMAGE_SRC,
} from "#/modules/message-item/message-item.fixtures.ts";

export function MessageImageGallerySingleComposition() {
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
            fit="contain"
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
