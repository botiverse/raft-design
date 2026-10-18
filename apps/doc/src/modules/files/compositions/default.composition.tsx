import { useCallback, useState } from "react";

import { FilesPanelComposition } from "./files-panel.composition.tsx";
import type { FileListEntry } from "./files-panel.composition.tsx";

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
  filename: "project-assets.zip",
  size: "1.7 MB",
  createdAt: "Yesterday, 3:54 PM",
  type: "archive",
};

export function FilesPanelDefaultComposition() {
  const [files, setFiles] = useState(INITIAL_FILES);
  const [announcement, setAnnouncement] = useState("Ready");
  const hasMore = files.length === INITIAL_FILES.length;

  const handleDownload = useCallback((file: FileListEntry) => {
    setAnnouncement(`Download: ${file.filename}`);
  }, []);

  const handleJumpToOriginal = useCallback((file: FileListEntry) => {
    setAnnouncement(`Jump to original: ${file.filename}`);
  }, []);

  const handlePreview = useCallback((file: FileListEntry) => {
    setAnnouncement(`Preview: ${file.filename}`);
  }, []);

  const handleLoadMore = useCallback(() => {
    setFiles((current) => [...current, MORE_FILE]);
    setAnnouncement(`Loaded ${MORE_FILE.filename}`);
  }, []);

  return (
    <div className="flex h-[32rem] w-full max-w-2xl flex-col overflow-hidden border border-line-hairline">
      <FilesPanelComposition
        files={files}
        hasMore={hasMore}
        onDownload={handleDownload}
        onJumpToOriginal={handleJumpToOriginal}
        onLoadMore={handleLoadMore}
        onPreview={handlePreview}
      />
      <p
        aria-live="polite"
        className="border-t border-line-hairline bg-fill-muted px-4 py-2 text-xs text-foreground-muted"
      >
        {announcement}
      </p>
    </div>
  );
}
