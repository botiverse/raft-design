import { Download, FileText, Music } from "lucide-react";
import {
  MessageAttachmentFailedComposition,
  MessageAttachmentOpeningComposition,
  MessageAttachmentPendingComposition,
  MessageAttachmentReadyComposition,
} from "./attachment.compositions.tsx";
import {
  MessageImageGalleryPendingComposition,
  MessageVideoPendingComposition,
} from "./media.compositions.tsx";
import { RichAttachmentMessageRow } from "./row.compositions.tsx";
import { downloadMessageFixture } from "#/modules/message-item/message-item.fixtures.ts";

export function MessageAttachmentsShowcaseComposition() {
  return (
    <div className="grid w-full max-w-3xl gap-4">
      <RichAttachmentMessageRow />
      <div className="grid gap-3 md:grid-cols-2">
        <MessageImageGalleryPendingComposition />
        <MessageVideoPendingComposition />
        <MessageAttachmentOpeningComposition
          name="uploading.mov"
          meta="Uploading · 18 KB"
          label="Preparing preview"
        />
        <MessageAttachmentPendingComposition name="screening.html" meta="Diff · 18 KB" />
        <MessageAttachmentFailedComposition name="preview.mov" meta="Video · 18 KB" />
        <MessageAttachmentOpeningComposition
          name="architecture.pdf"
          meta="PDF preview · 1.2 MB"
          label="Opening preview…"
        />
        <MessageAttachmentReadyComposition
          name="recording.mp3"
          meta="Audio preview · 6.4 MB"
          primaryAction={<Music />}
          primaryActionLabel="Preview recording.mp3"
          onPrimaryAction={() => downloadMessageFixture("recording.mp3")}
          secondaryAction={<Download />}
          secondaryActionLabel="Download recording.mp3"
          onSecondaryAction={() => downloadMessageFixture("recording.mp3")}
        />
        <MessageAttachmentReadyComposition
          name="migration.diff"
          meta="Diff · 18 KB"
          primaryAction={<Download />}
          onPrimaryAction={() => downloadMessageFixture("migration.diff")}
        />
        <MessageAttachmentReadyComposition
          name="specification.docx"
          meta="Document preview · 84 KB"
          primaryAction={<FileText />}
          primaryActionLabel="Preview specification.docx"
          onPrimaryAction={() => downloadMessageFixture("specification.docx")}
        />
      </div>
    </div>
  );
}
