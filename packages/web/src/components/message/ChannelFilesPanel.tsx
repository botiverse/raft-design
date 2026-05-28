import { useCallback, useEffect, useRef, useState } from "react";
import { Archive, Clock3, Download, ExternalLink, File, FileText, Image, Paperclip, Video } from "lucide-react";
import api from "../../api/client";
import type { Channel } from "../../store/channelStore";
import { useAppNavigate } from "../../hooks/useAppNavigate";
import { useTimeFormatter } from "../../hooks/useTimeFormatter";
import { useImageLightboxStore } from "../../store/imageLightboxStore";
import { imageGalleryBackgroundClass } from "../../utils/imagePreviewStyles";
import AvatarListRow from "../ui/AvatarListRow";
import EmptyState from "../ui/EmptyState";
import {
  formatChannelFileSize,
  getChannelFileType,
  type ChannelFileTypeFilter,
} from "../../utils/channelFiles";

export interface ChannelFileEntry {
  id: string;
  messageId: string;
  channelId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
  thumbnailUrl?: string | null;
  createdAt: string;
  uploader: {
    type: "user" | "agent";
    id: string;
    name: string | null;
    displayName: string | null;
  };
  source: {
    type: "channel" | "thread";
    channelId: string;
    parentMessageId: string | null;
    parentMessageShortId: string | null;
  };
}

interface ChannelFilesResponse {
  files: ChannelFileEntry[];
  nextCursor: string | null;
}

interface AttachmentUrlResponse {
  url: string;
  expiresAt: string | null;
}

const FILES_PAGE_SIZE = 50;

function fileTypeIcon(type: Exclude<ChannelFileTypeFilter, "all">) {
  if (type === "image") return Image;
  if (type === "video") return Video;
  if (type === "pdf") return FileText;
  if (type === "archive") return Archive;
  return File;
}

function isPreviewableImage(file: ChannelFileEntry): boolean {
  const mimeType = file.mimeType.split(";")[0]?.trim().toLowerCase();
  if (mimeType === "image/svg+xml") return Boolean(file.thumbnailUrl);
  return mimeType?.startsWith("image/") ?? false;
}

function imageFitClass(file: ChannelFileEntry): string {
  if (!file.width || !file.height || file.width <= 0 || file.height <= 0) return "object-cover";
  const ratio = file.width / file.height;
  return ratio >= 2.2 || ratio <= 0.55 ? "object-contain" : "object-cover";
}

function ChannelFileVisual({
  file,
  canPreview,
  icon: Icon,
}: {
  file: ChannelFileEntry;
  canPreview: boolean;
  icon: ReturnType<typeof fileTypeIcon>;
}) {
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);
  const src = file.thumbnailUrl || fallbackUrl;

  useEffect(() => {
    let cancelled = false;
    setFallbackUrl(null);
    if (!canPreview || file.thumbnailUrl) return () => {
      cancelled = true;
    };

    api
      .get<AttachmentUrlResponse>(`/attachments/${file.id}/url`)
      .then(({ data }) => {
        if (!cancelled) setFallbackUrl(data.url);
      })
      .catch(() => {
        if (!cancelled) setFallbackUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [canPreview, file.id, file.thumbnailUrl]);

  return (
    <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden border-2 border-black bg-white">
      {canPreview && src ? (
        <img
          src={src}
          alt=""
          className={`block h-full w-full ${imageFitClass(file)} ${imageGalleryBackgroundClass}`}
          loading="lazy"
        />
      ) : (
        <Icon size={18} />
      )}
    </span>
  );
}

async function downloadAttachment(file: ChannelFileEntry) {
  const { data } = await api.get(`/attachments/${file.id}/url?disposition=attachment`);
  const link = document.createElement("a");
  link.href = data.url;
  link.download = file.filename;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function ChannelFilesPanel({ channel }: { channel: Channel }) {
  const nav = useAppNavigate();
  const { formatShortDateTime } = useTimeFormatter();
  const loadingMoreRef = useRef(false);
  const [files, setFiles] = useState<ChannelFileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadFilesPage = useCallback(async (cursor: string | null, mode: "reset" | "append") => {
    if (mode === "append") {
      if (!cursor || loadingMoreRef.current) return;
      loadingMoreRef.current = true;
      setLoadingMore(true);
    } else {
      setLoading(true);
      setNextCursor(null);
    }
    setError(null);
    try {
      const { data } = await api.get<ChannelFilesResponse>(`/channels/${channel.id}/files`, {
        params: { limit: FILES_PAGE_SIZE, ...(cursor ? { cursor } : {}) },
      });
      const nextFiles = data.files ?? [];
      setFiles((prev) => mode === "append" ? [...prev, ...nextFiles] : nextFiles);
      setNextCursor(data.nextCursor ?? null);
    } catch {
      setError(mode === "append" ? "Could not load more files." : "Could not load files.");
    } finally {
      if (mode === "append") {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [channel.id]);

  useEffect(() => {
    let cancelled = false;
    const loadInitial = async () => {
      setLoading(true);
      setError(null);
      setNextCursor(null);
      try {
        const { data } = await api.get<ChannelFilesResponse>(`/channels/${channel.id}/files`, {
          params: { limit: FILES_PAGE_SIZE },
        });
        if (cancelled) return;
        setFiles(data.files ?? []);
        setNextCursor(data.nextCursor ?? null);
      } catch {
        if (!cancelled) setError("Could not load files.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void loadInitial();
    return () => {
      cancelled = true;
    };
  }, [channel.id]);

  const handleScroll = useCallback((target: HTMLDivElement) => {
    if (!nextCursor || loading || loadingMore) return;
    if (target.scrollHeight - target.scrollTop - target.clientHeight < 320) {
      void loadFilesPage(nextCursor, "append");
    }
  }, [loadFilesPage, loading, loadingMore, nextCursor]);

  const openSource = useCallback((file: ChannelFileEntry) => {
    if (file.source.type === "thread" && file.source.parentMessageId) {
      nav.toThreadMessage(channel.id, file.source.parentMessageId, file.messageId, channel.type === "dm" ? "dm" : "channel");
      return;
    }
    if (channel.type === "dm") nav.toDmMessage(channel.id, file.messageId);
    else nav.toMessage(channel.id, file.messageId);
  }, [channel.id, channel.type, nav]);

  // Row click opens a preview of the file itself (not the source message).
  // Images go through the shared image lightbox; everything else opens the
  // signed URL in a new tab, which lets the browser natively render PDFs,
  // text, and HTML (binary types fall back to a download). A future PR can
  // route documents through the in-message preview hook once it's extracted.
  const openPreview = useCallback(async (file: ChannelFileEntry) => {
    if (isPreviewableImage(file)) {
      useImageLightboxStore.getState().open(
        [
          {
            id: file.id,
            filename: file.filename,
            mimeType: file.mimeType,
            sizeBytes: file.sizeBytes,
            width: file.width ?? null,
            height: file.height ?? null,
            thumbnailUrl: file.thumbnailUrl ?? null,
          },
        ],
        0,
      );
      return;
    }
    try {
      const { data } = await api.get<AttachmentUrlResponse>(`/attachments/${file.id}/url`);
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch {
      // Swallow — the row's icon buttons still offer download / jump-to-message.
    }
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="min-h-0 flex-1 overflow-y-auto" onScroll={(event) => handleScroll(event.currentTarget)}>
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm font-mono text-black/40">Loading files…</div>
        ) : error ? (
          <div className="flex h-full items-center justify-center text-sm font-bold text-brutal-red">{error}</div>
        ) : files.length === 0 ? (
          <EmptyState
            className="h-full"
            icon={<Paperclip size={36} />}
            title="No files yet"
            description="Attach files in Chat, or drag files into the message composer. They will appear here after the message is sent."
          />
        ) : (
          <>
            <div className="flex flex-col gap-2 p-3">
              {files.map((file) => {
                const type = getChannelFileType(file);
                const Icon = fileTypeIcon(type);
                const canPreview = isPreviewableImage(file);
                return (
                  <AvatarListRow
                    key={file.id}
                    align="start"
                    avatar={<ChannelFileVisual file={file} canPreview={canPreview} icon={Icon} />}
                    name={file.filename}
                    subtitle={
                      <>
                        <span>{formatChannelFileSize(file.sizeBytes)}</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock3 size={12} />
                          {formatShortDateTime(file.createdAt)}
                        </span>
                      </>
                    }
                    onClick={() => void openPreview(file)}
                    buttonProps={{ title: "Preview file" }}
                    actionContent={
                      <>
                        <button
                          onClick={() => openSource(file)}
                          className="btn-brutal-sm flex size-7 items-center justify-center p-0"
                          title="Jump to original message"
                          aria-label="Jump to original message"
                        >
                          <ExternalLink size={14} />
                        </button>
                        <button
                          onClick={() => downloadAttachment(file)}
                          className="btn-brutal-sm flex size-7 items-center justify-center p-0"
                          title="Download file"
                          aria-label="Download file"
                        >
                          <Download size={14} />
                        </button>
                      </>
                    }
                  />
                );
              })}
            </div>
            {(loadingMore || nextCursor) && (
              <div className="flex justify-center p-4">
                {loadingMore ? (
                  <div className="font-mono text-xs text-black/45">Loading more files…</div>
                ) : (
                  <button
                    type="button"
                    onClick={() => void loadFilesPage(nextCursor, "append")}
                    className="btn-brutal-sm bg-white px-4 py-1.5 text-xs"
                  >
                    Load more
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
