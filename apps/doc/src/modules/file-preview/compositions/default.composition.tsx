import {
  FilePreview,
  FilePreviewBadge,
  FilePreviewCode,
  FilePreviewDocument,
  FilePreviewFile,
  FilePreviewMedia,
} from "raft-ui";

import { COMPOSER_IMAGE_SRC } from "#/modules/chat-composer/composer-image.ts";
import { FilePreviewMediaIllustration } from "../file-preview-media-illustration.tsx";

export function FilePreviewDefaultComposition() {
  return (
    <div className="flex flex-wrap items-center gap-5">
      <FilePreview>
        <FilePreviewDocument />
        <FilePreviewBadge type="pdf">PDF</FilePreviewBadge>
      </FilePreview>
      <FilePreview>
        <FilePreviewFile />
        <FilePreviewBadge type="zip">ZIP</FilePreviewBadge>
      </FilePreview>
      <FilePreview>
        <FilePreviewCode />
        <FilePreviewBadge type="html">HTML</FilePreviewBadge>
      </FilePreview>
      <FilePreview>
        <FilePreviewMedia>
          <FilePreviewMediaIllustration />
        </FilePreviewMedia>
        <FilePreviewBadge type="img">IMG</FilePreviewBadge>
      </FilePreview>
      <FilePreview>
        <FilePreviewMedia>
          <video
            className="size-full object-cover"
            muted
            playsInline
            poster={COMPOSER_IMAGE_SRC}
            preload="metadata"
          />
        </FilePreviewMedia>
        <FilePreviewBadge type="mp4">MP4</FilePreviewBadge>
      </FilePreview>
    </div>
  );
}
