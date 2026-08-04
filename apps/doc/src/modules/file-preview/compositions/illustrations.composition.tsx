import {
  FilePreview,
  FilePreviewBadge,
  FilePreviewCode,
  FilePreviewFile,
  FilePreviewMedia,
} from "raft-ui";

export function FilePreviewIllustrationsContent() {
  return (
    <>
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
          <span className="absolute right-0 bottom-0 left-0 h-2.5 bg-linear-to-t from-success/30 to-transparent" />
          <span className="absolute bottom-0.5 left-0.5 h-2 w-5 rounded-t-full bg-success/40" />
          <span className="absolute right-1 bottom-0.5 h-3 w-4 rounded-t-full bg-success-hover/40" />
          <span className="absolute top-1 right-1 size-1.5 rounded-full bg-warning/60" />
        </FilePreviewMedia>
        <FilePreviewBadge type="img">IMG</FilePreviewBadge>
      </FilePreview>
    </>
  );
}

// @docs-source-strip-start
export function FilePreviewIllustrationsComposition() {
  return (
    <div className="flex flex-wrap items-center gap-5">
      <FilePreviewIllustrationsContent />
    </div>
  );
}
// @docs-source-strip-end
