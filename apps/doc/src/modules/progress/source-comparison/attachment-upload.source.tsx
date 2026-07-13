import { FileText, LoaderCircle } from "lucide-react";
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";

export function ProgressAttachmentUploadSourcePreview({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <div className="relative h-16 w-32 overflow-hidden border-2 border-black bg-white">
        <div className="flex h-full items-center gap-2 px-2">
          <FileText className="size-4 shrink-0 text-black/70" />
          <div className="min-w-0">
            <div className="truncate text-xs font-bold text-black">report.pdf</div>
            <div className="truncate text-[10px] text-black/50">application/pdf</div>
          </div>
        </div>
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center border-2 border-black bg-white/85 px-1 text-center text-[10px] font-bold text-black">
          <LoaderCircle className="mb-1 size-3.5 animate-spin" />
          <span>58%</span>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-black/15">
            <div className="h-full bg-brutal-pink" style={{ width: "58%" }} />
          </div>
        </div>
      </div>
    </SourceComparisonPreview>
  );
}
