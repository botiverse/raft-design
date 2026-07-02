import { FileText, LoaderCircle } from "lucide-react";
import { Progress, ProgressIndicator, ProgressTrack } from "raft-ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function ProgressAttachmentUploadContent() {
  return (
    <div className="relative h-16 w-32 overflow-hidden border-2 border-line-strong bg-layer-panel">
      <div className="flex h-full items-center gap-2 px-2">
        <FileText className="size-4 shrink-0 text-foreground-muted" />
        <div className="min-w-0">
          <div className="truncate text-xs font-bold text-foreground-strong">report.pdf</div>
          <div className="truncate text-[10px] text-foreground-placeholder">application/pdf</div>
        </div>
      </div>
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center border-2 border-line-strong bg-layer-panel/85 px-1 text-center text-[10px] font-bold text-foreground-strong">
        <LoaderCircle className="mb-1 size-3.5 animate-spin" />
        <span>58%</span>
        <Progress
          value={58}
          variant="primary"
          size="sm"
          aria-label="Uploading report.pdf"
          className="absolute right-0 bottom-0 left-0 gap-0"
        >
          <ProgressTrack className="h-1 border-0 shadow-none">
            <ProgressIndicator />
          </ProgressTrack>
        </Progress>
      </div>
    </div>
  );
}

// @docs-source-strip-start
export function ProgressAttachmentUploadComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <ProgressAttachmentUploadContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
