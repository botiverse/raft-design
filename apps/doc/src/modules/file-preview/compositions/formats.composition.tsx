import { FilePreview, FilePreviewBadge, FilePreviewDocument } from "@botiverse/raft-ui";

export function FilePreviewFormatsContent() {
  return (
    <>
      <FilePreview>
        <FilePreviewDocument />
        <FilePreviewBadge>PDF</FilePreviewBadge>
      </FilePreview>
      <FilePreview>
        <FilePreviewDocument />
        <FilePreviewBadge>DOCX</FilePreviewBadge>
      </FilePreview>
      <FilePreview>
        <FilePreviewDocument />
        <FilePreviewBadge>TXT</FilePreviewBadge>
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
