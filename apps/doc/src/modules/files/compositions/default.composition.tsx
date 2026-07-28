import { useState } from "react";

import { FilesPanelComposition, type FileListEntry } from "./files-panel.composition.tsx";

const INITIAL_FILES: readonly FileListEntry[] = [
  {
    id: "raft-ui-mark",
    filename: "raft-ui-mark.svg",
    size: "6 KB",
    createdAt: "Today, 10:32 AM",
    type: "image",
    thumbnailUrl: "/raft-logo.svg",
    imageFit: "contain",
  },
  {
    id: "migration-notes",
    filename: "state-ownership-migration-notes.md",
    size: "2.1 KB",
    createdAt: "Today, 9:14 AM",
    type: "file",
  },
  {
    id: "release-checklist",
    filename: "release-checklist.pdf",
    size: "184 KB",
    createdAt: "Yesterday, 4:18 PM",
    type: "pdf",
  },
];

const MORE_FILE: FileListEntry = {
  id: "source-archive",
  filename: "source-comparison.zip",
  size: "1.7 MB",
  createdAt: "Yesterday, 3:54 PM",
  type: "archive",
};

export function FilesPanelDefaultComposition() {
  const [files, setFiles] = useState(INITIAL_FILES);
  const [announcement, setAnnouncement] = useState("Ready");
  const hasMore = files.length === INITIAL_FILES.length;

  const describeAction = (action: string, file: FileListEntry) => {
    setAnnouncement(`${action}: ${file.filename}`);
  };

  return (
    <div className="flex h-[32rem] w-full max-w-2xl flex-col overflow-hidden border border-line-subtle">
      <FilesPanelComposition
        files={files}
        hasMore={hasMore}
        onDownload={(file) => describeAction("Download", file)}
        onJumpToOriginal={(file) => describeAction("Jump to original", file)}
        onLoadMore={() => {
          setFiles((current) => [...current, MORE_FILE]);
          setAnnouncement(`Loaded ${MORE_FILE.filename}`);
        }}
        onPreview={(file) => describeAction("Preview", file)}
      />
      <p
        aria-live="polite"
        className="border-t border-line-subtle bg-layer-muted px-4 py-2 text-xs text-foreground-muted"
      >
        {announcement}
      </p>
    </div>
  );
}
