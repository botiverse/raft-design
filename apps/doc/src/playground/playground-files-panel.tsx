import { useState } from "react";
import {
  FilesPanelComposition,
  type FileListEntry,
} from "#/compositions/files/files-panel-composition.tsx";
import {
  getPlaygroundFiles,
  type PlaygroundChannel,
  type PlaygroundChannelId,
  type PlaygroundFile,
} from "./mock/index.ts";

const PAGE_SIZE = 2;

export function PlaygroundFilesPanel({
  channel,
  onJumpToOriginal,
}: {
  channel: PlaygroundChannel;
  onJumpToOriginal: () => void;
}) {
  const files = getPlaygroundFiles(channel.id as PlaygroundChannelId);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visibleFiles = files.slice(0, visibleCount).map(toFileListEntry);

  return (
    <FilesPanelComposition
      files={visibleFiles}
      hasMore={visibleCount < files.length}
      onLoadMore={() => setVisibleCount((count) => Math.min(files.length, count + PAGE_SIZE))}
      onPreview={(file) => {
        const source = files.find((item) => item.id === file.id);
        if (source) window.open(source.previewUrl, "_blank", "noopener,noreferrer");
      }}
      onJumpToOriginal={onJumpToOriginal}
      onDownload={(file) => {
        const source = files.find((item) => item.id === file.id);
        if (!source) return;
        const link = document.createElement("a");
        link.href = source.previewUrl;
        link.download = source.filename;
        link.rel = "noopener";
        link.click();
      }}
    />
  );
}

function toFileListEntry(file: PlaygroundFile): FileListEntry {
  return {
    id: file.id,
    filename: file.filename,
    size: file.size,
    createdAt: file.createdAt,
    type: file.type,
    thumbnailUrl: file.thumbnailUrl,
    imageFit: file.imageFit,
  };
}
