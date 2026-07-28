import {
  MessageImageGallery,
  MessageImageGalleryItem,
  MessageImageGalleryMedia,
} from "raft-ui/wip";

export function MessageImageGalleryGeometryComposition() {
  return (
    <MessageImageGallery>
      <div className="grid grid-cols-1 gap-2">
        <MessageImageGalleryItem className="h-[128px] sm:h-[144px]">
          <MessageImageGalleryMedia>
            <img
              src="/raft-logo.svg"
              alt="Wide Raft logo fixture"
              className="block h-full w-full object-contain"
            />
          </MessageImageGalleryMedia>
        </MessageImageGalleryItem>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <MessageImageGalleryItem className="h-[128px] sm:h-[144px]">
          <MessageImageGalleryMedia>
            <img
              src="/message-fixtures/tall-diagram.svg"
              alt="Tall diagram fixture"
              className="block h-full w-full object-contain"
            />
          </MessageImageGalleryMedia>
        </MessageImageGalleryItem>
      </div>
    </MessageImageGallery>
  );
}
