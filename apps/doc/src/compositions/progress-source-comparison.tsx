import { FileText, LoaderCircle } from "lucide-react";
import { SourceComparisonPreview } from "./source-comparison-preview.tsx";
import { ProgressAttachmentUploadComposition } from "./progress/attachment-upload-composition.tsx";
import { ProgressMachineDownloadComposition } from "./progress/machine-download-composition.tsx";
import { ProgressRestartIndeterminateComposition } from "./progress/restart-indeterminate-composition.tsx";

type SourceProgressBarTone = "pink" | "cyan" | "lime" | "orange";

const SOURCE_PROGRESS_STYLE = `
@keyframes doc-source-progress-indeterminate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(300%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .doc-source-progress-indeterminate {
    animation: none;
  }
}
`;

const sourceProgressStyle = (
  <style href="doc-progress-source-comparison" precedence="default">
    {SOURCE_PROGRESS_STYLE}
  </style>
);

const SOURCE_TONE_CLASS: Record<SourceProgressBarTone, string> = {
  pink: "bg-brutal-pink",
  cyan: "bg-brutal-cyan",
  lime: "bg-brutal-lime",
  orange: "bg-brutal-orange",
};

export const PROGRESS_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  AttachmentUpload: "apps/doc/src/compositions/progress/attachment-upload-composition.tsx",
  MachineDownload: "apps/doc/src/compositions/progress/machine-download-composition.tsx",
  RestartIndeterminate: "apps/doc/src/compositions/progress/restart-indeterminate-composition.tsx",
} as const;

export const PROGRESS_SOURCE_COMPARISON_COMPOSITION = {
  AttachmentUpload: ProgressAttachmentUploadComposition,
  MachineDownload: ProgressMachineDownloadComposition,
  RestartIndeterminate: ProgressRestartIndeterminateComposition,
} as const;

function SourceProgressBar({
  value,
  tone = "pink",
  label,
  showPercent,
}: {
  value?: number | null;
  tone?: SourceProgressBarTone;
  label?: string;
  showPercent?: boolean;
}) {
  const indeterminate = value === null || value === undefined || Number.isNaN(value);
  const pct = indeterminate ? 0 : Math.max(0, Math.min(100, value));

  return (
    <div className="w-64">
      {(label || (showPercent && !indeterminate)) && (
        <div className="mb-1 flex items-center justify-between text-xs font-mono text-black/60">
          {label ? <span className="truncate">{label}</span> : <span />}
          {showPercent && !indeterminate ? (
            <span className="shrink-0">{Math.round(pct)}%</span>
          ) : null}
        </div>
      )}
      <div className="h-4 w-full overflow-hidden border-2 border-black bg-white shadow-brutal-sm">
        {sourceProgressStyle}
        <div
          className={`h-full ${SOURCE_TONE_CLASS[tone]} ${
            indeterminate
              ? "doc-source-progress-indeterminate w-2/5 [animation:doc-source-progress-indeterminate_1.1s_ease-in-out_infinite]"
              : "transition-all duration-100"
          }`}
          style={indeterminate ? undefined : { width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function ProgressMachineDownloadSourcePreview({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <SourceProgressBar value={42} tone="pink" label="Downloading..." />
    </SourceComparisonPreview>
  );
}

export function ProgressRestartIndeterminateSourcePreview({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <SourceProgressBar value={null} tone="cyan" label="Restarting..." />
    </SourceComparisonPreview>
  );
}

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

export const PROGRESS_SOURCE_COMPARISON_SOURCE = {
  AttachmentUpload: ProgressAttachmentUploadSourcePreview,
  MachineDownload: ProgressMachineDownloadSourcePreview,
  RestartIndeterminate: ProgressRestartIndeterminateSourcePreview,
} as const;
