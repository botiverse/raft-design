import { FilePreviewBadge } from "raft-ui";

export function FilePreviewInlineBadgeComposition() {
  return (
    <div className="grid gap-2 text-sm text-foreground">
      <div className="flex items-center gap-2">
        <FilePreviewBadge placement="inline">PDF</FilePreviewBadge>
        <span>quarterly-report.pdf</span>
      </div>
      <div className="flex items-center gap-2">
        <FilePreviewBadge placement="inline">ZIP</FilePreviewBadge>
        <span>design-assets.zip</span>
      </div>
    </div>
  );
}
