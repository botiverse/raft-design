import type { ReactNode } from "react";
import {
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
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
  FilesError,
  FilesList,
  FilesLoading,
  FilesLoadMore,
  FilesLoadMoreAction,
  FilesLoadMoreStatus,
  FilesPanel,
  FilesViewport,
  FileVisual,
} from "raft-ui/wip";
import {
  Archive,
  Clock3,
  Download,
  ExternalLink,
  File,
  FileText,
  Image,
  Paperclip,
  Video,
} from "lucide-react";

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

const FILE_ICONS = {
  archive: Archive,
  file: File,
  image: Image,
  pdf: FileText,
  video: Video,
} as const;

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
  return (
    <FilesPanel aria-label="Files panel">
      <FilesViewport>
        {loading ? (
          <FilesLoading>Loading files…</FilesLoading>
        ) : error ? (
          <FilesError>{error}</FilesError>
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
              <FilesLoadMore>
                {loadingMore ? (
                  <FilesLoadMoreStatus>Loading more files…</FilesLoadMoreStatus>
                ) : (
                  <FilesLoadMoreAction disabled={!onLoadMore} onClick={onLoadMore}>
                    Load more
                  </FilesLoadMoreAction>
                )}
              </FilesLoadMore>
            ) : null}
          </>
        )}
      </FilesViewport>
    </FilesPanel>
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
  const Icon = FILE_ICONS[file.type];
  return (
    <FileRow>
      <FileRowOpen disabled={!onPreview} title="Preview file" onClick={() => onPreview?.(file)}>
        <FileVisual>
          {file.thumbnailUrl ? (
            <FileImage src={file.thumbnailUrl} alt="" fit={file.imageFit} loading="lazy" />
          ) : (
            <Icon aria-hidden />
          )}
        </FileVisual>
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
