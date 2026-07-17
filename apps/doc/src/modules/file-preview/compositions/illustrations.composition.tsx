import {
  FilePreview,
  FilePreviewBadge,
  FilePreviewCode,
  FilePreviewFile,
  FilePreviewMedia,
} from "raft-ui/wip";

import { FilePreviewMediaIllustration } from "../file-preview-media-illustration.tsx";

export function FilePreviewIllustrationsComposition() {
  return (
    <div className="flex flex-wrap items-center gap-5">
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
    </div>
  );
}
