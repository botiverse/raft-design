import {
  FilePreview,
  FilePreviewBadge,
  FilePreviewImage,
  FilePreviewMedia,
  FilePreviewVideo,
} from "raft-ui/wip";

const POSTER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%239ac7ed'/%3E%3Cpath d='M0 24 9 15l6 5 5-7 12 11v8H0Z' fill='%2349788f'/%3E%3Ccircle cx='23' cy='9' r='3' fill='%23f8d56b'/%3E%3C/svg%3E";

export function FilePreviewMediaComposition() {
  return (
    <div className="flex flex-wrap items-center gap-5">
      <FilePreview>
        <FilePreviewImage alt="" src={POSTER} />
        <FilePreviewBadge tone="emerald">PNG</FilePreviewBadge>
      </FilePreview>
      <FilePreview>
        <FilePreviewVideo aria-label="Video thumbnail" poster={POSTER} />
        <FilePreviewBadge tone="violet">MP4</FilePreviewBadge>
      </FilePreview>
      <FilePreview>
        <FilePreviewMedia>
          <span className="flex size-full items-center justify-center bg-accent-100 text-xs font-semibold text-accent-700">
            +
          </span>
        </FilePreviewMedia>
        <FilePreviewBadge tone="amber">SVG</FilePreviewBadge>
      </FilePreview>
    </div>
  );
}
