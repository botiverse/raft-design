import { Spinner } from "raft-ui";
import {
  MessageImageGallery,
  MessageImageGalleryItem,
  MessageImageGalleryMedia,
  MessageImageGalleryOverlay,
} from "raft-ui";
import { MESSAGE_FIXTURE_IMAGE_SRC } from "#/modules/message-item/message-item.fixtures.ts";

const PENDING_ITEM_STYLE = { width: "min(288px, 100%)", aspectRatio: "4 / 3" };

export function MessageImageGalleryPendingComposition() {
  return (
    <MessageImageGallery>
      <div className="grid grid-cols-1 gap-2">
        <MessageImageGalleryItem
          aria-busy
          className="inline-block w-fit max-w-[416px] justify-self-start"
          style={PENDING_ITEM_STYLE}
        >
          <MessageImageGalleryMedia>
            <img
              src={MESSAGE_FIXTURE_IMAGE_SRC}
              alt="attachment preview uploading"
              className="block size-full  object-contain"
            />
          </MessageImageGalleryMedia>
          <MessageImageGalleryOverlay>
            <Spinner size="md" variant="inverse" />
          </MessageImageGalleryOverlay>
        </MessageImageGalleryItem>
      </div>
    </MessageImageGallery>
  );
}
