import {
  FileAction,
  FileActions,
  FileContent,
  FileImage,
  FileMeta,
  FileMetaItem,
  FileName,
  FilePreview,
  FilePreviewBadge,
  FilePreviewCode,
  FilePreviewDocument,
  FilePreviewFile,
  FilePreviewMedia,
  FileRow,
  FileRowOpen,
  FilesList,
  FilesPanel,
  FilesViewport,
  FileThumbnail,
} from "raft-ui";
import { Clock3, Download, ExternalLink } from "lucide-react";

export function FilesPanelFileTypesComposition() {
  return (
    <div className="flex h-[32rem] w-full max-w-2xl overflow-hidden border border-line-muted">
      <FilesPanel aria-label="Files panel">
        <FilesViewport>
          <FilesList>
            <FileRow>
              <FileRowOpen disabled title="Preview file">
                <FileThumbnail>
                  <FilePreview>
                    <FilePreviewMedia>
                      <FileImage src="/raft-logo.svg" alt="" fit="contain" loading="lazy" />
                    </FilePreviewMedia>
                    <FilePreviewBadge type="svg">SVG</FilePreviewBadge>
                  </FilePreview>
                </FileThumbnail>
                <FileContent>
                  <FileName>raft-ui-mark.svg</FileName>
                  <FileMeta>
                    <FileMetaItem>6 KB</FileMetaItem>
                    <FileMetaItem>
                      <Clock3 aria-hidden />
                      Today, 10:32 AM
                    </FileMetaItem>
                  </FileMeta>
                </FileContent>
              </FileRowOpen>
              <FileActions>
                <FileAction
                  aria-label="Jump to original message"
                  title="Jump to original message"
                  disabled
                >
                  <ExternalLink aria-hidden />
                </FileAction>
                <FileAction aria-label="Download file" title="Download file" disabled>
                  <Download aria-hidden />
                </FileAction>
              </FileActions>
            </FileRow>

            <FileRow>
              <FileRowOpen disabled title="Preview file">
                <FileThumbnail>
                  <FilePreview>
                    <FilePreviewCode />
                    <FilePreviewBadge color="neutral">TSX</FilePreviewBadge>
                  </FilePreview>
                </FileThumbnail>
                <FileContent>
                  <FileName>files-panel.tsx</FileName>
                  <FileMeta>
                    <FileMetaItem>8.4 KB</FileMetaItem>
                    <FileMetaItem>
                      <Clock3 aria-hidden />
                      Today, 9:14 AM
                    </FileMetaItem>
                  </FileMeta>
                </FileContent>
              </FileRowOpen>
              <FileActions>
                <FileAction
                  aria-label="Jump to original message"
                  title="Jump to original message"
                  disabled
                >
                  <ExternalLink aria-hidden />
                </FileAction>
                <FileAction aria-label="Download file" title="Download file" disabled>
                  <Download aria-hidden />
                </FileAction>
              </FileActions>
            </FileRow>

            <FileRow>
              <FileRowOpen disabled title="Preview file">
                <FileThumbnail>
                  <FilePreview>
                    <FilePreviewDocument />
                    <FilePreviewBadge type="pdf">PDF</FilePreviewBadge>
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
                  </FileMeta>
                </FileContent>
              </FileRowOpen>
              <FileActions>
                <FileAction
                  aria-label="Jump to original message"
                  title="Jump to original message"
                  disabled
                >
                  <ExternalLink aria-hidden />
                </FileAction>
                <FileAction aria-label="Download file" title="Download file" disabled>
                  <Download aria-hidden />
                </FileAction>
              </FileActions>
            </FileRow>

            <FileRow>
              <FileRowOpen disabled title="Preview file">
                <FileThumbnail>
                  <FilePreview>
                    <FilePreviewFile />
                    <FilePreviewBadge type="zip">ZIP</FilePreviewBadge>
                  </FilePreview>
                </FileThumbnail>
                <FileContent>
                  <FileName>source-comparison.zip</FileName>
                  <FileMeta>
                    <FileMetaItem>1.7 MB</FileMetaItem>
                    <FileMetaItem>
                      <Clock3 aria-hidden />
                      Yesterday, 3:54 PM
                    </FileMetaItem>
                  </FileMeta>
                </FileContent>
              </FileRowOpen>
              <FileActions>
                <FileAction
                  aria-label="Jump to original message"
                  title="Jump to original message"
                  disabled
                >
                  <ExternalLink aria-hidden />
                </FileAction>
                <FileAction aria-label="Download file" title="Download file" disabled>
                  <Download aria-hidden />
                </FileAction>
              </FileActions>
            </FileRow>

            <FileRow>
              <FileRowOpen disabled title="Preview file">
                <FileThumbnail>
                  <FilePreview>
                    <FilePreviewMedia />
                    <FilePreviewBadge type="mp4">MP4</FilePreviewBadge>
                  </FilePreview>
                </FileThumbnail>
                <FileContent>
                  <FileName>mobile-files-pass.mp4</FileName>
                  <FileMeta>
                    <FileMetaItem>12.8 MB</FileMetaItem>
                    <FileMetaItem>
                      <Clock3 aria-hidden />
                      Monday, 11:06 AM
                    </FileMetaItem>
                  </FileMeta>
                </FileContent>
              </FileRowOpen>
              <FileActions>
                <FileAction
                  aria-label="Jump to original message"
                  title="Jump to original message"
                  disabled
                >
                  <ExternalLink aria-hidden />
                </FileAction>
                <FileAction aria-label="Download file" title="Download file" disabled>
                  <Download aria-hidden />
                </FileAction>
              </FileActions>
            </FileRow>
          </FilesList>
        </FilesViewport>
      </FilesPanel>
    </div>
  );
}
