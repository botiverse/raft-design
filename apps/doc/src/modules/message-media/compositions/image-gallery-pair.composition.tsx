import { Download } from "lucide-react";
import {
  MessageImageGallery,
  MessageImageGalleryAction,
  MessageImageGalleryItem,
  MessageImageGalleryMedia,
  MessageImageGalleryPreview,
} from "raft-ui/wip";
import {
  downloadMessageFixture,
  MESSAGE_FIXTURE_IMAGE_SRC,
  openMessageFixture,
} from "#/modules/message-item/message-item.fixtures.ts";

export function MessageImageGalleryPairComposition() {
  return (
    <MessageImageGallery>
      <div className="grid grid-cols-2 gap-2">
        <MessageImageGalleryItem className="h-[128px] sm:h-[144px]">
          <MessageImageGalleryMedia>
            <img
              src={MESSAGE_FIXTURE_IMAGE_SRC}
              alt="release poster"
              className="block h-full w-full object-cover"
            />
          </MessageImageGalleryMedia>
          <MessageImageGalleryPreview aria-label="Preview image" onClick={openMessageFixture} />
          <MessageImageGalleryAction
            aria-label="Download image"
            onClick={() => downloadMessageFixture("message-image.jpg")}
          >
            <Download />
          </MessageImageGalleryAction>
        </MessageImageGalleryItem>
        <MessageImageGalleryItem className="h-[128px] sm:h-[144px]">
          <MessageImageGalleryMedia>
            <img
              src={MESSAGE_FIXTURE_IMAGE_SRC}
              alt="release poster detail"
              className="block h-full w-full object-cover"
            />
          </MessageImageGalleryMedia>
          <MessageImageGalleryPreview aria-label="Preview image" onClick={openMessageFixture} />
          <MessageImageGalleryAction
            aria-label="Download image"
            onClick={() => downloadMessageFixture("message-image.jpg")}
          >
            <Download />
          </MessageImageGalleryAction>
        </MessageImageGalleryItem>
      </div>
    </MessageImageGallery>
  );
}
