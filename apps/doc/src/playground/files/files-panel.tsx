import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { FilesPanelComposition } from "#/modules/files/compositions/files-panel.composition.tsx";
import type { FileListEntry } from "#/modules/files/compositions/files-panel.composition.tsx";
import {
  getPlaygroundFiles,
  PLAYGROUND_SERVER_SLUG,
  requirePlaygroundFile,
} from "../mock/index.ts";
import type { PlaygroundChannelRecord, PlaygroundFile } from "../mock/index.ts";
import { usePlaygroundNavigation } from "../navigation/use-playground-navigation.ts";

/** Matches source ChannelFilesPanel `FILES_PAGE_SIZE`. */
const FILES_PAGE_SIZE = 50;

export function PlaygroundFilesPanel({ channel }: { channel: PlaygroundChannelRecord }) {
  const navigate = useNavigate();
  const { selectPanelTab } = usePlaygroundNavigation();
  const channelId = channel.id;
  const files = getPlaygroundFiles(channelId);
  const loadingMoreRef = useRef(false);
  const [visibleCount, setVisibleCount] = useState(() => Math.min(FILES_PAGE_SIZE, files.length));
  const [loadingMore, setLoadingMore] = useState(false);
  const visibleFiles = files.slice(0, visibleCount).map(toFileListEntry);
  const hasMore = visibleCount < files.length;

  useEffect(() => {
    loadingMoreRef.current = false;
    setLoadingMore(false);
    setVisibleCount(Math.min(FILES_PAGE_SIZE, files.length));
  }, [channelId, files.length]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    // Yield so the Load more status can paint before the next page appends.
    window.setTimeout(() => {
      setVisibleCount((count) => Math.min(files.length, count + FILES_PAGE_SIZE));
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }, 120);
  }, [files.length, hasMore]);

  return (
    <FilesPanelComposition
      files={visibleFiles}
      hasMore={hasMore}
      loadingMore={loadingMore}
      onLoadMore={loadMore}
      onPreview={(file) => {
        const source = requirePlaygroundFile(file.id);
        window.open(source.previewUrl, "_blank", "noopener,noreferrer");
      }}
      onJumpToOriginal={(file) => {
        const source = requirePlaygroundFile(file.id);
        selectPanelTab("chat");
        if (channel.kind === "dm") {
          void navigate({
            to: "/playground/s/$serverSlug/dm/$dmId",
            params: { dmId: channel.id, serverSlug: PLAYGROUND_SERVER_SLUG },
            search: { thread: source.sourceMessageId },
          });
          return;
        }

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
