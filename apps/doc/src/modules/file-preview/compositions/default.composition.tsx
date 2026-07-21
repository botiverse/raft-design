import {
  FilePreview,
  FilePreviewBadge,
  FilePreviewCode,
  FilePreviewDocument,
  FilePreviewFile,
  FilePreviewMedia,
} from "raft-ui/wip";

import { COMPOSER_IMAGE_SRC } from "#/modules/chat-composer/composer-image.ts";
import { FilePreviewMediaIllustration } from "../file-preview-media-illustration.tsx";

export function FilePreviewDefaultComposition() {
  return (
    <div className="flex flex-wrap items-center gap-5">
      <FilePreview>
        <FilePreviewDocument />
        <FilePreviewBadge>PDF</FilePreviewBadge>
      </FilePreview>
      <FilePreview>
        <FilePreviewFile />
        <FilePreviewBadge color="amber">ZIP</FilePreviewBadge>
      </FilePreview>
      <FilePreview>
        <FilePreviewCode />
        <FilePreviewBadge color="violet">HTML</FilePreviewBadge>
      </FilePreview>
      <FilePreview>
        <FilePreviewMedia>
          <FilePreviewMediaIllustration />
        </FilePreviewMedia>
        <FilePreviewBadge color="emerald">IMG</FilePreviewBadge>
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
        <FilePreviewBadge color="blue">MP4</FilePreviewBadge>
      </FilePreview>
    </div>
  );
}
