import { FilesPanelComposition, type FileListEntry } from "./files-panel.composition.tsx";

const FILE_TYPES: readonly FileListEntry[] = [
  {
    id: "image",
    filename: "raft-ui-mark.svg",
    size: "6 KB",
    createdAt: "Today, 10:32 AM",
    type: "image",
    thumbnailUrl: "/raft-logo.svg",
    imageFit: "contain",
  },
  {
    id: "code",
    filename: "files-panel.tsx",
    size: "8.4 KB",
    createdAt: "Today, 9:14 AM",
    type: "file",
  },
  {
    id: "pdf",
    filename: "release-checklist.pdf",
    size: "184 KB",
    createdAt: "Yesterday, 4:18 PM",
    type: "pdf",
  },
  {
    id: "archive",
    filename: "source-comparison.zip",
    size: "1.7 MB",
    createdAt: "Yesterday, 3:54 PM",
    type: "archive",
  },
  {
    id: "video",
    filename: "mobile-files-pass.mp4",
    size: "12.8 MB",
    createdAt: "Monday, 11:06 AM",
    type: "video",
  },
];

export function FilesPanelFileTypesComposition() {
  return (
    <div className="flex h-[32rem] w-full max-w-2xl overflow-hidden border border-line-subtle">
      <FilesPanelComposition files={FILE_TYPES} />
    </div>
  );
}
