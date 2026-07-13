import type { ReactNode } from "react";
import { Download } from "lucide-react";
import {
  MessageAttachmentFailedComposition,
  MessageAttachmentOpeningComposition,
  MessageAttachmentPendingComposition,
  MessageAttachmentReadyComposition,
} from "./attachment.compositions.tsx";
import {
  MessageFileAttachmentComposition,
  MessageImageGalleryPairComposition,
  MessageImageGalleryPendingComposition,
  MessageImageGallerySingleComposition,
  MessageVideoPendingComposition,
  MessageVideoPreviewComposition,
} from "./media.compositions.tsx";
import {
  MessageQuickReactionPickerComposition,
  MessageReactionComposition,
  MessageReactionOverlaysComposition,
} from "./reaction.compositions.tsx";
import {
  ActiveMessageRow,
  AuthoredMessageRow,
  ConsecutiveMessageRow,
  ContextMenuMessageRow,
  RemovedSenderMessageRow,
  RichAttachmentMessageRow,
  SavedToolbarMessageRow,
  SearchMatchMessageRow,
  SelectedMessageRow,
  ThreadArchiveEventRow,
} from "./row.compositions.tsx";
import { MessageRowToolbarFixture } from "./row-toolbar.composition.tsx";
import { downloadMessageFixture } from "#/modules/message-item/message-item.fixtures.ts";

function MatrixSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid min-w-0 gap-2">
      <h3 className="font-mono text-[10px] leading-none font-bold text-foreground/45 uppercase">
        {title}
      </h3>
      <div className="grid min-w-0 gap-2">{children}</div>
    </section>
  );
}

function MatrixCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid min-w-0 gap-1.5 border border-line-muted bg-layer-panel px-2 py-2">
      <span className="font-mono text-[10px] leading-none font-bold text-foreground/45">
        {label}
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function MessageItemStateMatrix() {
  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
      <MatrixSection title="row chrome">
        <MatrixCell label="authored row">
          <AuthoredMessageRow />
        </MatrixCell>
        <MatrixCell label="MessageItemActive">
          <ActiveMessageRow />
        </MatrixCell>
        <MatrixCell label="MessageItemSearchMatch">
          <SearchMatchMessageRow />
        </MatrixCell>
        <MatrixCell label="compact continuation">
          <ConsecutiveMessageRow />
        </MatrixCell>
      </MatrixSection>

      <MatrixSection title="selection and sender">
        <MatrixCell label="selection checkbox checked">
          <SelectedMessageRow />
        </MatrixCell>
        <MatrixCell label="sender state removed">
          <RemovedSenderMessageRow />
        </MatrixCell>
        <MatrixCell label="system event">
          <ThreadArchiveEventRow />
        </MatrixCell>
        <MatrixCell label="context-menu active row">
          <ContextMenuMessageRow />
        </MatrixCell>
      </MatrixSection>

      <MatrixSection title="toolbar and aggregate rows">
        <MatrixCell label="toolbar interactive">
          <MessageRowToolbarFixture />
        </MatrixCell>
        <MatrixCell label="saved indicator + saved action">
          <SavedToolbarMessageRow />
        </MatrixCell>
        <MatrixCell label="rich attachment row">
          <RichAttachmentMessageRow />
        </MatrixCell>
      </MatrixSection>

      <MatrixSection title="reactions">
        <MatrixCell label="reaction neutral">
          <MessageReactionComposition emoji="👍" count={3} />
        </MatrixCell>
        <MatrixCell label="reaction pressed">
          <MessageReactionComposition emoji="🔥" count={3} reacted />
        </MatrixCell>
        <MatrixCell label="reaction failure">
          <MessageReactionComposition emoji="❤️" count={3} failed />
        </MatrixCell>
        <MatrixCell label="quick reaction panel">
          <MessageQuickReactionPickerComposition />
        </MatrixCell>
        <MatrixCell label="reaction tooltip">
          <MessageReactionOverlaysComposition />
        </MatrixCell>
      </MatrixSection>

      <MatrixSection title="media attachments">
        <MatrixCell label="image pair">
          <MessageImageGalleryPairComposition />
        </MatrixCell>
        <MatrixCell label="image single cover">
          <MessageImageGallerySingleComposition />
        </MatrixCell>
        <MatrixCell label="image contain">
          <MessageImageGallerySingleComposition fit="contain" />
        </MatrixCell>
        <MatrixCell label="image pending">
          <MessageImageGalleryPendingComposition />
        </MatrixCell>
        <MatrixCell label="video preview">
          <MessageVideoPreviewComposition />
        </MatrixCell>
        <MatrixCell label="video pending">
          <MessageVideoPendingComposition />
        </MatrixCell>
      </MatrixSection>

      <MatrixSection title="file attachments">
        <MatrixCell label="attachment card">
          <MessageFileAttachmentComposition />
        </MatrixCell>
        <MatrixCell label="attachment loading">
          <MessageAttachmentOpeningComposition
            name="uploading.mov"
            meta="Uploading · 18 KB"
            label="Preparing preview"
          />
        </MatrixCell>
        <MatrixCell label="attachment pending">
          <MessageAttachmentPendingComposition name="screening.html" meta="Diff · 18 KB" />
        </MatrixCell>
        <MatrixCell label="attachment failed">
          <MessageAttachmentFailedComposition name="preview.mov" meta="Video · 18 KB" />
        </MatrixCell>
        <MatrixCell label="attachment action">
          <MessageAttachmentReadyComposition
            name="migration.diff"
            meta="Diff · 18 KB"
            primaryAction={<Download />}
            onPrimaryAction={() => downloadMessageFixture("migration.diff")}
          />
        </MatrixCell>
      </MatrixSection>
    </div>
  );
}
