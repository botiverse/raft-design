import { FilePreview, FilePreviewBadge, FilePreviewDocument } from "raft-ui/wip";

export function FilePreviewDefaultComposition() {
  return (
    <FilePreview>
      <FilePreviewDocument>
        <FilePreviewBadge>PDF</FilePreviewBadge>
      </FilePreviewDocument>
    </FilePreview>
  );
}
