import {
  MessageImageGallery,
  MessageImageGalleryItem,
  MessageImageGalleryMedia,
} from "raft-ui/wip";
import { MESSAGE_FIXTURE_IMAGE_SRC } from "#/modules/message-item/message-item.fixtures.ts";

export function MessageImageGalleryTripleComposition() {
  return (
    <MessageImageGallery>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        <MessageImageGalleryItem className="h-[112px] sm:h-[128px]">
          <MessageImageGalleryMedia>
            <img
              src={MESSAGE_FIXTURE_IMAGE_SRC}
              alt="release poster first crop"
              className="block h-full w-full object-cover"
            />
          </MessageImageGalleryMedia>
        </MessageImageGalleryItem>
        <MessageImageGalleryItem className="h-[112px] sm:h-[128px]">
          <MessageImageGalleryMedia>
            <img
              src={MESSAGE_FIXTURE_IMAGE_SRC}
              alt="release poster second crop"
              className="block h-full w-full object-cover"
            />
          </MessageImageGalleryMedia>
        </MessageImageGalleryItem>
        <MessageImageGalleryItem className="h-[112px] sm:h-[128px]">
          <MessageImageGalleryMedia>
            <img
              src={MESSAGE_FIXTURE_IMAGE_SRC}
              alt="release poster third crop"
              className="block h-full w-full object-cover"
            />
          </MessageImageGalleryMedia>
        </MessageImageGalleryItem>
      </div>
    </MessageImageGallery>
  );
}
