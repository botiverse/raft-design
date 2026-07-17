import { FilePreview, FilePreviewBadge, FilePreviewDocument } from "raft-ui/wip";

export function FilePreviewFormatsComposition() {
  return (
    <div className="flex flex-wrap items-center gap-5">
      <FilePreview>
        <FilePreviewDocument />
        <FilePreviewBadge>PDF</FilePreviewBadge>
      </FilePreview>
      <FilePreview>
        <FilePreviewDocument />
        <FilePreviewBadge color="blue">DOCX</FilePreviewBadge>
      </FilePreview>
      <FilePreview>
        <FilePreviewDocument />
        <FilePreviewBadge color="neutral">TXT</FilePreviewBadge>
      </FilePreview>
    </div>
  );
}
