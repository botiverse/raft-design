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
} from "#/modules/message-item/message-item.fixtures.ts";

export type MessageImageGallerySingleCompositionProps = {
  alt?: string;
  name?: string;
  onDownload?: () => void;
  onPreview?: () => void;
  src?: string;
};

export function MessageImageGallerySingleComposition({
  alt = "attachment preview",
  name = "message-image.jpg",
  onDownload = () => downloadMessageFixture("message-image.jpg"),
  onPreview,
  src = MESSAGE_FIXTURE_IMAGE_SRC,
}: MessageImageGallerySingleCompositionProps = {}) {
  return (
    <MessageImageGallery>
      <div className="grid grid-cols-1 gap-2">
        <MessageImageGalleryItem
          className="inline-block w-fit max-w-[416px] justify-self-start"
          style={{ width: "min(288px, 100%)", aspectRatio: "4 / 3" }}
        >
          <MessageImageGalleryMedia>
            <img src={src} alt={alt} className="block h-full w-full object-contain" />
          </MessageImageGalleryMedia>
          {onPreview ? (
            <MessageImageGalleryPreview
              aria-label={`Preview ${name}`}
              onClick={onPreview}
              title={`Preview ${name}`}
            />
          ) : null}
          <MessageImageGalleryAction
            aria-label={`Download ${name}`}
            onClick={onDownload}
            title={`Download ${name}`}
          >
            <Download />
          </MessageImageGalleryAction>
        </MessageImageGalleryItem>
      </div>
    </MessageImageGallery>
  );
}
