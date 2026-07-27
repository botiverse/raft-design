import { Archive, Clock3, Download, ExternalLink } from "lucide-react";

export const FILES_PANEL_DEFAULT_COMPOSITION_PATH =
  "apps/doc/src/modules/files/compositions/default.composition.tsx" as const;

const SOURCE_FILES: readonly {
  filename: string;
  size: string;
  createdAt: string;
  thumbnailUrl?: string;
}[] = [
  {
    filename: "raft-ui-mark.svg",
    size: "6 KB",
    createdAt: "Today, 10:32 AM",
    thumbnailUrl: "/raft-logo.svg",
  },
  {
    filename: "source-comparison.zip",
    size: "1.7 MB",
    createdAt: "Yesterday, 3:54 PM",
  },
];

export function FilesPanelSourcePreview() {
  return (
    <div className="flex h-[32rem] w-full max-w-2xl flex-col bg-white">
      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="flex flex-col gap-2 p-3">
          {SOURCE_FILES.map((file) => (
            <div
              key={file.filename}
              className="flex w-full min-w-0 items-start gap-3 border-2 border-black/30 bg-white px-3 py-3"
            >
              <div className="flex min-w-0 flex-1 items-stretch gap-3 text-left">
                <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden border-2 border-black bg-white">
                  {file.thumbnailUrl ? (
                    <img
                      src={file.thumbnailUrl}
                      alt=""
                      className="block h-full w-full object-contain"
                    />
                  ) : (
                    <Archive aria-hidden size={18} />
                  )}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="block truncate text-sm font-bold">{file.filename}</span>
                  <span className="mt-auto flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-black/50">
                    <span>{file.size}</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 aria-hidden size={12} />
                      {file.createdAt}
                    </span>
                  </span>
                </span>
              </div>
              <span className="flex shrink-0 self-center items-center gap-1.5">
                <span className="btn-brutal-sm flex size-7 items-center justify-center p-0">
                  <ExternalLink aria-hidden size={14} />
                </span>
                <span className="btn-brutal-sm flex size-7 items-center justify-center p-0">
                  <Download aria-hidden size={14} />
                </span>
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-center p-4">
          <span className="btn-brutal-sm bg-white px-4 py-1.5 text-xs">Load more</span>
        </div>
      </div>
    </div>
  );
}
