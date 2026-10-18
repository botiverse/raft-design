import { FilePreview, FilePreviewBadge, FilePreviewMedia } from "@botiverse/raft-ui";

import { COMPOSER_IMAGE_SRC } from "#/modules/chat-composer/composer-image.ts";

export function FilePreviewMediaContent() {
  return (
    <>
      <FilePreview>
        <FilePreviewMedia>
          <img alt="" className="size-full object-cover" src={COMPOSER_IMAGE_SRC} />
        </FilePreviewMedia>
        <FilePreviewBadge>PNG</FilePreviewBadge>
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
        <FilePreviewBadge>MP4</FilePreviewBadge>
      </FilePreview>
      <FilePreview>
        <FilePreviewMedia>
          <img alt="" className="size-full object-cover" src={COMPOSER_IMAGE_SRC} />
        </FilePreviewMedia>
        <FilePreviewBadge>JPG</FilePreviewBadge>
      </FilePreview>
    </>
  );
}

// @docs-source-strip-start
export function FilePreviewMediaComposition() {
  return (
    <div className="flex flex-wrap items-center gap-5">
      <FilePreviewMediaContent />
    </div>
  );
}
// @docs-source-strip-end
