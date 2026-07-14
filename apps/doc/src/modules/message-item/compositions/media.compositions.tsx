import type { ReactNode } from "react";
import { Download, Eye, Play } from "lucide-react";
import { Spinner } from "raft-ui";
import {
  MessageAttachmentGroup,
  MessageImageGallery,
  MessageImageGalleryAction,
  MessageImageGalleryItem,
  MessageImageGalleryMedia,
  MessageImageGalleryOverlay,
  MessageImageGalleryPreview,
  MessageImageGalleryRow,
  MessageVideoPreview,
  MessageVideoPreviewAction,
  MessageVideoPreviewFallback,
  MessageVideoPreviewFrame,
} from "raft-ui/wip";
import {
  downloadMessageFixture,
  MESSAGE_FIXTURE_IMAGE_SRC,
  openMessageFixture,
} from "#/modules/message-item/message-item.fixtures.ts";
import { MessageAttachmentReadyComposition } from "./attachment.compositions.tsx";

function MessageImageReadyItem({ single = false }: { single?: boolean }) {
  return (
    <MessageImageGalleryItem single={single}>
      <MessageImageGalleryMedia
        src={MESSAGE_FIXTURE_IMAGE_SRC}
        alt="release poster"
        className={single ? "aspect-[4/3] max-h-36" : "aspect-[4/3]"}
      />
      <MessageImageGalleryPreview aria-label="Preview image" onClick={openMessageFixture} />
      <MessageImageGalleryAction
        aria-label="Download image"
        onClick={() => downloadMessageFixture("message-image.svg")}
      >
        <Download />
      </MessageImageGalleryAction>
    </MessageImageGalleryItem>
  );
}

export function MessageImageGalleryPairComposition() {
  return (
    <MessageImageGallery>
      <MessageImageGalleryRow className="grid-cols-2">
        <MessageImageReadyItem />
        <MessageImageGalleryItem aria-busy>
          <MessageImageGalleryMedia
            src={MESSAGE_FIXTURE_IMAGE_SRC}
            alt="release poster uploading"
            className="aspect-[4/3]"
          />
          <MessageImageGalleryOverlay>
            <Spinner size="md" variant="inverse" />
          </MessageImageGalleryOverlay>
        </MessageImageGalleryItem>
      </MessageImageGalleryRow>
    </MessageImageGallery>
  );
}

export function MessageImageGallerySingleComposition({
  fit = "cover",
}: {
  fit?: "contain" | "cover";
}) {
  return (
    <MessageImageGallery>
      <MessageImageGalleryRow className="grid-cols-1">
        <MessageImageGalleryItem single>
          <MessageImageGalleryMedia
            src={MESSAGE_FIXTURE_IMAGE_SRC}
            alt="attachment preview"
            fit={fit}
            className="aspect-[4/3] max-h-36"
          />
          <MessageImageGalleryAction
            aria-label="Download image"
            onClick={() => downloadMessageFixture("message-image.svg")}
          >
            <Download />
          </MessageImageGalleryAction>
        </MessageImageGalleryItem>
      </MessageImageGalleryRow>
    </MessageImageGallery>
  );
}

export function MessageImageGalleryPendingComposition() {
  return (
    <MessageImageGallery>
      <MessageImageGalleryRow className="grid-cols-2">
        <MessageImageGalleryItem aria-busy>
          <MessageImageGalleryMedia
            src={MESSAGE_FIXTURE_IMAGE_SRC}
            alt="attachment preview uploading"
            className="aspect-[4/3]"
          />
          <MessageImageGalleryOverlay>
            <Spinner size="md" variant="inverse" />
          </MessageImageGalleryOverlay>
        </MessageImageGalleryItem>
      </MessageImageGalleryRow>
    </MessageImageGallery>
  );
}

function MessageVideoComposition({ children }: { children: ReactNode }) {
  return (
    <MessageVideoPreview title="demo-recording.mp4">
      <MessageVideoPreviewFrame>{children}</MessageVideoPreviewFrame>
    </MessageVideoPreview>
  );
}

export function MessageVideoPreviewComposition() {
  return (
    <MessageVideoComposition>
      <MessageVideoPreviewFallback>
        <Play className="size-8 text-white/80" />
      </MessageVideoPreviewFallback>
      <MessageVideoPreviewAction
        aria-label="Open demo-recording.mp4 in preview"
        onClick={openMessageFixture}
      >
        <Eye />
      </MessageVideoPreviewAction>
    </MessageVideoComposition>
  );
}

export function MessageVideoPendingComposition() {
  return (
    <MessageVideoPreview aria-busy title="demo-recording.mp4">
      <MessageVideoPreviewFrame>
        <MessageVideoPreviewFallback>
          <Spinner size="md" variant="inverse" />
        </MessageVideoPreviewFallback>
      </MessageVideoPreviewFrame>
    </MessageVideoPreview>
  );
}

export function MessageFileAttachmentComposition() {
  return (
    <MessageAttachmentReadyComposition
      name="migration.diff"
      meta="Diff · 18 KB"
      summary="+42 -7"
      primaryAction={<Download />}
      primaryActionLabel="Download migration.diff"
      onPrimaryAction={() => downloadMessageFixture("migration.diff")}
    />
  );
}

export function MessageFileAttachmentsComposition() {
  return (
    <MessageAttachmentGroup>
      <MessageFileAttachmentComposition />
      <MessageAttachmentReadyComposition
        name="screening.html"
        meta="HTML preview · 44 KB"
        primaryAction={<Download />}
        primaryActionLabel="Download screening.html"
        onPrimaryAction={() => downloadMessageFixture("screening.html")}
      />
    </MessageAttachmentGroup>
  );
}
