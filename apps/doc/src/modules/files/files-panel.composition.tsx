import type { ReactNode, UIEvent } from "react";
import {
  Button,
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  FilePreview,
  FilePreviewBadge,
  FilePreviewCode,
  FilePreviewDocument,
  FilePreviewFile,
  FilePreviewMedia,
  type FilePreviewBadgeType,
} from "raft-ui";
import {
  FileAction,
  FileActions,
  FileContent,
  FileImage,
  FileMeta,
  FileMetaItem,
  FileName,
  FileRow,
  FileRowOpen,
  FilesList,
  FilesPanel,
  FilesViewport,
  FileThumbnail,
} from "raft-ui/wip";
import { Clock3, Download, ExternalLink, Paperclip } from "lucide-react";

/** Matches source ChannelFilesPanel near-bottom auto-load threshold. */
const LOAD_MORE_THRESHOLD_PX = 320;

export type FileListEntry = {
  id: string;
  filename: string;
  size: string;
  createdAt: string;
  type: "archive" | "file" | "image" | "pdf" | "video";
  thumbnailUrl?: string;
  imageFit?: "contain" | "cover";
};

export type FilesPanelCompositionProps = {
  files: readonly FileListEntry[];
  loading?: boolean;
  error?: ReactNode;
  hasMore?: boolean;
  loadingMore?: boolean;
  onDownload?: (file: FileListEntry) => void;
  onJumpToOriginal?: (file: FileListEntry) => void;
  onLoadMore?: () => void;
  onPreview?: (file: FileListEntry) => void;
};

const FILE_PREVIEW_BADGE_TYPES = new Set<string>([
  "pdf",
  "doc",
  "docx",
  "txt",
  "md",
  "csv",
  "json",
  "zip",
  "html",
  "code",
  "img",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "svg",
  "mp4",
  "mov",
]);

const FILE_TYPE_BADGE: Record<FileListEntry["type"], FilePreviewBadgeType | undefined> = {
  archive: "zip",
  file: undefined,
  image: "img",
  pdf: "pdf",
  video: "mp4",
};

export function FilesPanelComposition({
  error,
  files,
  hasMore = false,
  loading = false,
  loadingMore = false,
  onDownload,
  onJumpToOriginal,
  onLoadMore,
  onPreview,
}: FilesPanelCompositionProps) {
  const handleViewportScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!hasMore || loading || loadingMore || !onLoadMore) return;
    const target = event.currentTarget;
    if (target.scrollHeight - target.scrollTop - target.clientHeight < LOAD_MORE_THRESHOLD_PX) {
      onLoadMore();
    }
  };

  return (
    <FilesPanel aria-label="Files panel">
      <FilesViewport onScroll={handleViewportScroll}>
        {loading ? (
          <EmptyState className="h-full">
            <EmptyStateContent>
              <EmptyStateTitle>Loading files…</EmptyStateTitle>
            </EmptyStateContent>
          </EmptyState>
        ) : error ? (
          <EmptyState className="h-full" role="alert">
            <EmptyStateContent>
              <EmptyStateTitle>{error}</EmptyStateTitle>
            </EmptyStateContent>
          </EmptyState>
        ) : files.length === 0 ? (
          <EmptyState className="h-full">
            <EmptyStateIcon>
              <Paperclip aria-hidden />
            </EmptyStateIcon>
            <EmptyStateContent>
              <EmptyStateTitle>No files yet</EmptyStateTitle>
              <EmptyStateDescription>
                Attach files in Chat, or drag files into the message composer. They will appear here
                after the message is sent.
              </EmptyStateDescription>
            </EmptyStateContent>
          </EmptyState>
        ) : (
          <>
            <FilesList>
              {files.map((file) => (
                <FileListRow
                  key={file.id}
                  file={file}
                  onDownload={onDownload}
                  onJumpToOriginal={onJumpToOriginal}
                  onPreview={onPreview}
                />
              ))}
            </FilesList>
            {loadingMore || hasMore ? (
              <div className="flex justify-center p-4">
                {loadingMore ? (
                  <span className="font-mono text-xs text-foreground-placeholder">
                    Loading more files…
                  </span>
                ) : (
                  <Button variant="outline" size="sm" disabled={!onLoadMore} onClick={onLoadMore}>
                    Load more
                  </Button>
                )}
              </div>
            ) : null}
          </>
        )}
      </FilesViewport>
    </FilesPanel>
  );
}

function filePreviewBadgeType(
  filename: string,
  type: FileListEntry["type"],
): FilePreviewBadgeType | undefined {
  const extension = filename.split(".").at(-1)?.toLowerCase();
  if (extension && FILE_PREVIEW_BADGE_TYPES.has(extension)) {
    return extension as FilePreviewBadgeType;
  }
  return FILE_TYPE_BADGE[type];
}

function filePreviewLabel(filename: string) {
  const extension = filename.split(".").at(-1);
  return extension ? extension.slice(0, 4).toUpperCase() : "FILE";
}

function FileThumbnailFallback({ file }: { file: FileListEntry }) {
  const extension = file.filename.split(".").at(-1)?.toLowerCase();
  const badgeType = filePreviewBadgeType(file.filename, file.type);
  const badgeLabel = filePreviewLabel(file.filename);
  const illustration = file.thumbnailUrl ? (
    <FilePreviewMedia>
      <FileImage src={file.thumbnailUrl} alt="" fit={file.imageFit} loading="lazy" />
    </FilePreviewMedia>
  ) : file.type === "archive" ? (
    <FilePreviewFile />
  ) : file.type === "image" || file.type === "video" ? (
    <FilePreviewMedia />
  ) : extension === "html" || extension === "json" || extension === "ts" || extension === "tsx" ? (
    <FilePreviewCode />
  ) : (
    <FilePreviewDocument />
  );

  return (
    <FilePreview>
      {illustration}
      {badgeType ? (
        <FilePreviewBadge type={badgeType}>{badgeLabel}</FilePreviewBadge>
      ) : (
        <FilePreviewBadge color="neutral">{badgeLabel}</FilePreviewBadge>
      )}
    </FilePreview>
  );
}

function FileListRow({
  file,
  onDownload,
  onJumpToOriginal,
  onPreview,
}: {
  file: FileListEntry;
  onDownload?: (file: FileListEntry) => void;
  onJumpToOriginal?: (file: FileListEntry) => void;
  onPreview?: (file: FileListEntry) => void;
}) {
  return (
    <FileRow>
      <FileRowOpen disabled={!onPreview} title="Preview file" onClick={() => onPreview?.(file)}>
        <FileThumbnail>
          <FileThumbnailFallback file={file} />
        </FileThumbnail>
        <FileContent>
          <FileName>{file.filename}</FileName>
          <FileMeta>
            <FileMetaItem>{file.size}</FileMetaItem>
            <FileMetaItem>
              <Clock3 aria-hidden />
              {file.createdAt}
            </FileMetaItem>
          </FileMeta>
        </FileContent>
      </FileRowOpen>
      <FileActions>
        <FileAction
          aria-label="Jump to original message"
          title="Jump to original message"
          disabled={!onJumpToOriginal}
          onClick={() => onJumpToOriginal?.(file)}
        >
          <ExternalLink aria-hidden />
        </FileAction>
        <FileAction
          aria-label="Download file"
          title="Download file"
          disabled={!onDownload}
          onClick={() => onDownload?.(file)}
        >
          <Download aria-hidden />
        </FileAction>
      </FileActions>
    </FileRow>
  );
}
