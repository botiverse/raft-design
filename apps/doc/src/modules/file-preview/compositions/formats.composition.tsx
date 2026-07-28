import { FilePreview, FilePreviewBadge, FilePreviewDocument } from "raft-ui";

export function FilePreviewFormatsContent() {
  return (
    <>
      <FilePreview>
        <FilePreviewDocument />
        <FilePreviewBadge type="pdf">PDF</FilePreviewBadge>
      </FilePreview>
      <FilePreview>
        <FilePreviewDocument />
        <FilePreviewBadge type="docx">DOCX</FilePreviewBadge>
      </FilePreview>
      <FilePreview>
        <FilePreviewDocument />
        <FilePreviewBadge type="txt">TXT</FilePreviewBadge>
      </FilePreview>
    </>
  );
}

// @docs-source-strip-start
export function FilePreviewFormatsComposition() {
  return (
    <div className="flex flex-wrap items-center gap-5">
      <FilePreviewFormatsContent />
    </div>
  );
}
// @docs-source-strip-end
