import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  FilesPanelComposition,
  type FileListEntry,
} from "#/modules/files/files-panel.composition.tsx";
import {
  getPlaygroundFiles,
  PLAYGROUND_SERVER_SLUG,
  requirePlaygroundFile,
  type PlaygroundChannelRecord,
  type PlaygroundFile,
} from "./mock/index.ts";
import { usePlaygroundNavigation } from "./playground-navigation-state.tsx";

const PAGE_SIZE = 2;

export function PlaygroundFilesPanel({ channel }: { channel: PlaygroundChannelRecord }) {
  const navigate = useNavigate();
  const { selectPanelTab } = usePlaygroundNavigation();
  const channelId = channel.id;
  const files = getPlaygroundFiles(channelId);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visibleFiles = files.slice(0, visibleCount).map(toFileListEntry);

  return (
    <FilesPanelComposition
      files={visibleFiles}
      hasMore={visibleCount < files.length}
      onLoadMore={() => setVisibleCount((count) => Math.min(files.length, count + PAGE_SIZE))}
      onPreview={(file) => {
        const source = requirePlaygroundFile(file.id);
        window.open(source.previewUrl, "_blank", "noopener,noreferrer");
      }}
      onJumpToOriginal={(file) => {
        const source = requirePlaygroundFile(file.id);
        selectPanelTab("chat");
        void navigate({
          to: "/playground/s/$serverSlug/channel/$channelId",
          params: { channelId, serverSlug: PLAYGROUND_SERVER_SLUG },
          search: { thread: source.sourceMessageId },
        });
      }}
      onDownload={(file) => {
        const source = requirePlaygroundFile(file.id);
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
