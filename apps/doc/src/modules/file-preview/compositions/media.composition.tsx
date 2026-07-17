import { FilePreview, FilePreviewBadge, FilePreviewMedia } from "raft-ui/wip";

const POSTER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%239ac7ed'/%3E%3Cpath d='M0 24 9 15l6 5 5-7 12 11v8H0Z' fill='%2349788f'/%3E%3Ccircle cx='23' cy='9' r='3' fill='%23f8d56b'/%3E%3C/svg%3E";

export function FilePreviewMediaComposition() {
  return (
    <div className="flex flex-wrap items-center gap-5">
      <FilePreview>
        <FilePreviewMedia>
          <img alt="" className="size-full object-cover" src={POSTER} />
        </FilePreviewMedia>
        <FilePreviewBadge color="emerald">PNG</FilePreviewBadge>
      </FilePreview>
      <FilePreview>
        <FilePreviewMedia>
          <video
            className="size-full object-cover"
            muted
            playsInline
            poster={POSTER}
            preload="metadata"
          />
        </FilePreviewMedia>
        <FilePreviewBadge color="violet">MP4</FilePreviewBadge>
      </FilePreview>
      <FilePreview>
        <FilePreviewMedia>
          <img alt="" className="size-full object-cover" src={POSTER} />
        </FilePreviewMedia>
        <FilePreviewBadge color="amber">JPG</FilePreviewBadge>
      </FilePreview>
    </div>
  );
}
