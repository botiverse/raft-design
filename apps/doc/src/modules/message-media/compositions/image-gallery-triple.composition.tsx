import {
  MessageImageGallery,
  MessageImageGalleryItem,
  MessageImageGalleryMedia,
  MessageImageGalleryRow,
} from "raft-ui/wip";
import { MESSAGE_FIXTURE_IMAGE_SRC } from "#/modules/message-item/message-item.fixtures.ts";

export function MessageImageGalleryTripleComposition() {
  return (
    <MessageImageGallery>
      <MessageImageGalleryRow layout="triple">
        <MessageImageGalleryItem size="dense">
          <MessageImageGalleryMedia
            src={MESSAGE_FIXTURE_IMAGE_SRC}
            alt="release poster first crop"
            geometry="normal"
          />
        </MessageImageGalleryItem>
        <MessageImageGalleryItem size="dense">
          <MessageImageGalleryMedia
            src={MESSAGE_FIXTURE_IMAGE_SRC}
            alt="release poster second crop"
            geometry="normal"
          />
        </MessageImageGalleryItem>
        <MessageImageGalleryItem size="dense">
          <MessageImageGalleryMedia
            src={MESSAGE_FIXTURE_IMAGE_SRC}
            alt="release poster third crop"
            geometry="normal"
          />
        </MessageImageGalleryItem>
      </MessageImageGalleryRow>
    </MessageImageGallery>
  );
}
