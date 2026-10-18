import { Download } from "lucide-react";
import {
  MessageImageGallery,
  MessageImageGalleryAction,
  MessageImageGalleryItem,
  MessageImageGalleryMedia,
  MessageImageGalleryPreview,
} from "@botiverse/raft-ui";
import {
  downloadMessageFixture,
  MESSAGE_FIXTURE_IMAGE_SRC,
} from "#/modules/message-item/message-item.fixtures.ts";

const SINGLE_ITEM_STYLE = { width: "min(288px, 100%)", aspectRatio: "4 / 3" };

function downloadImage() {
  downloadMessageFixture("message-image.jpg");
}

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
  onDownload = downloadImage,
  onPreview,
  src = MESSAGE_FIXTURE_IMAGE_SRC,
}: MessageImageGallerySingleCompositionProps = {}) {
  return (
    <MessageImageGallery>
      <div className="grid grid-cols-1 gap-2">
        <MessageImageGalleryItem
          className="inline-block w-fit max-w-[416px] justify-self-start"
          style={SINGLE_ITEM_STYLE}
        >
          <MessageImageGalleryMedia>
            <img src={src} alt={alt} className="block size-full  object-contain" />
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
