import { FilePreview, FilePreviewBadge, FilePreviewMedia } from "raft-ui/wip";

import { COMPOSER_IMAGE_SRC } from "#/modules/chat-composer/composer-image.ts";

export function FilePreviewMediaComposition() {
  return (
    <div className="flex flex-wrap items-center gap-5">
      <FilePreview>
        <FilePreviewMedia>
          <img alt="" className="size-full object-cover" src={COMPOSER_IMAGE_SRC} />
        </FilePreviewMedia>
        <FilePreviewBadge type="png">PNG</FilePreviewBadge>
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
      <FilePreview>
        <FilePreviewMedia>
          <img alt="" className="size-full object-cover" src={COMPOSER_IMAGE_SRC} />
        </FilePreviewMedia>
        <FilePreviewBadge type="jpg">JPG</FilePreviewBadge>
      </FilePreview>
    </div>
  );
}
