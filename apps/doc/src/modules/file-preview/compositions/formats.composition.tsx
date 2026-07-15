import { FilePreview, FilePreviewBadge, FilePreviewDocument } from "raft-ui/wip";

export function FilePreviewFormatsComposition() {
  return (
    <div className="flex flex-wrap items-center gap-5">
      <FilePreview>
        <FilePreviewDocument>
          <FilePreviewBadge>PDF</FilePreviewBadge>
        </FilePreviewDocument>
      </FilePreview>
      <FilePreview>
        <FilePreviewDocument>
          <FilePreviewBadge tone="blue">DOCX</FilePreviewBadge>
        </FilePreviewDocument>
      </FilePreview>
      <FilePreview>
        <FilePreviewDocument>
          <FilePreviewBadge tone="neutral">TXT</FilePreviewBadge>
        </FilePreviewDocument>
      </FilePreview>
    </div>
  );
}
