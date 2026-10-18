import { useCallback, useState } from "react";
import {
  FileAction,
  FileActions,
  FileContent,
  FileMeta,
  FileMetaItem,
  FileName,
  FilePreview,
  FilePreviewBadge,
  FilePreviewDocument,
  FileRow,
  FileRowOpen,
  FilesList,
  FilesPanel,
  FilesViewport,
  FileThumbnail,
} from "@botiverse/raft-ui";
import { Clock3, Download, ExternalLink } from "lucide-react";

export function FilesPanelFileRowComposition() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handlePreview = useCallback(() => {
    setLastAction("Previewed");
  }, []);

  const handleJumpToOriginal = useCallback(() => {
    setLastAction("Jumped to message");
  }, []);

  const handleDownload = useCallback(() => {
    setLastAction("Downloaded");
  }, []);

  return (
    <FilesPanel aria-label="Files panel" className="w-full max-w-2xl">
      <FilesViewport>
        <FilesList>
          <FileRow>
            <FileRowOpen title="Preview file" onClick={handlePreview}>
              <FileThumbnail>
                <FilePreview>
                  <FilePreviewDocument />
                  <FilePreviewBadge>PDF</FilePreviewBadge>
                </FilePreview>
              </FileThumbnail>
              <FileContent>
                <FileName>release-checklist.pdf</FileName>
                <FileMeta>
                  <FileMetaItem>184 KB</FileMetaItem>
                  <FileMetaItem>
                    <Clock3 aria-hidden />
                    Yesterday, 4:18 PM
                  </FileMetaItem>
                  {lastAction ? <FileMetaItem>{lastAction}</FileMetaItem> : null}
                </FileMeta>
              </FileContent>
            </FileRowOpen>
            <FileActions>
              <FileAction
                aria-label="Jump to original message"
                title="Jump to original message"
                onClick={handleJumpToOriginal}
              >
                <ExternalLink aria-hidden />
              </FileAction>
              <FileAction aria-label="Download file" title="Download file" onClick={handleDownload}>
                <Download aria-hidden />
              </FileAction>
            </FileActions>
          </FileRow>
        </FilesList>
      </FilesViewport>
    </FilesPanel>
  );
}
