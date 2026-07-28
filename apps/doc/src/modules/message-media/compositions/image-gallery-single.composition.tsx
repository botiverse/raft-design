import { Download } from "lucide-react";
import {
  MessageImageGallery,
  MessageImageGalleryAction,
  MessageImageGalleryItem,
  MessageImageGalleryMedia,
} from "raft-ui/wip";
import {
  downloadMessageFixture,
  MESSAGE_FIXTURE_IMAGE_SRC,
} from "#/modules/message-item/message-item.fixtures.ts";

export function MessageImageGallerySingleComposition() {
  return (
    <MessageImageGallery>
      <div className="grid grid-cols-1 gap-2">
        <MessageImageGalleryItem
          className="inline-block w-fit max-w-[416px] justify-self-start"
          style={{ width: "min(288px, 100%)", aspectRatio: "4 / 3" }}
        >
          <MessageImageGalleryMedia>
            <img
              src={MESSAGE_FIXTURE_IMAGE_SRC}
              alt="attachment preview"
              className="block h-full w-full object-contain"
            />
          </MessageImageGalleryMedia>
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
