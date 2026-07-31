import { useState, type ReactNode } from "react";
import { ArrowDownToLine, Eye, MessageSquare } from "lucide-react";
import { Spinner } from "raft-ui";
import {
  MessageAttachmentAction,
  MessageAttachmentCommentSummary,
  MessageAttachmentCard,
  MessageAttachmentDiffAddition,
  MessageAttachmentDiffDeletion,
  MessageAttachmentDiffSummary,
  MessageAttachmentGroup,
  MessageAttachmentMeta,
  MessageAttachmentMetaEnd,
  MessageAttachmentMetaStart,
  MessageAttachmentSummary,
  MessageAttachmentTitle,
} from "raft-ui/wip";
import {
  MESSAGE_FIXTURE_AUDIO_SRC,
  downloadMessageFixture,
} from "#/modules/message-item/message-item.fixtures.ts";

function MessageHtmlPreviewAttachmentComposition() {
  const [opening, setOpening] = useState(false);

  return (
    <MessageAttachmentCard aria-busy={opening || undefined}>
      <MessageAttachmentTitle>screening.html</MessageAttachmentTitle>
      <MessageAttachmentMeta>
        <MessageAttachmentMetaStart>44 KB</MessageAttachmentMetaStart>
        <MessageAttachmentMetaEnd>
          {opening ? (
            <Spinner size="xs" />
          ) : (
            <MessageAttachmentAction
              aria-label="Preview screening.html"
              title="Preview screening.html"
              onClick={() => setOpening(true)}
            >
              <Eye aria-hidden />
            </MessageAttachmentAction>
          )}
        </MessageAttachmentMetaEnd>
      </MessageAttachmentMeta>
    </MessageAttachmentCard>
  );
}

function MessageFileAttachmentComposition() {
  return (
    <MessageAttachmentCard>
      <MessageAttachmentTitle>migration.diff</MessageAttachmentTitle>
      <MessageAttachmentSummary render={<MessageAttachmentDiffSummary />}>
        <span>2 files · 5 hunks</span>
        <MessageAttachmentDiffAddition>+42</MessageAttachmentDiffAddition>
        <MessageAttachmentDiffDeletion>-7</MessageAttachmentDiffDeletion>
      </MessageAttachmentSummary>
      <MessageAttachmentMeta>
        <MessageAttachmentMetaStart>18 KB</MessageAttachmentMetaStart>
        <MessageAttachmentMetaEnd>
          <MessageAttachmentAction
            aria-label="Download migration.diff"
            title="Download migration.diff"
            onClick={() => downloadMessageFixture("migration.diff")}
          >
            <ArrowDownToLine />
          </MessageAttachmentAction>
        </MessageAttachmentMetaEnd>
      </MessageAttachmentMeta>
    </MessageAttachmentCard>
  );
}

export type MessageAudioAttachmentCompositionProps = {
  meta?: ReactNode;
  name?: string;
  onDownload?: () => void;
  onPreview?: () => void;
};

export function MessageAudioAttachmentComposition({
  meta,
  name = "message-preview.wav",
  onDownload = () => downloadMessageFixture("message-preview.wav"),
  onPreview = () => window.open(MESSAGE_FIXTURE_AUDIO_SRC, "_blank", "noopener,noreferrer"),
}: MessageAudioAttachmentCompositionProps = {}) {
  return (
    <MessageAttachmentCard>
      <MessageAttachmentTitle>{name}</MessageAttachmentTitle>
      <MessageAttachmentMeta>
        {meta ? <MessageAttachmentMetaStart>{meta}</MessageAttachmentMetaStart> : null}
        <MessageAttachmentMetaEnd>
          <MessageAttachmentAction
            aria-label={`Preview ${name}`}
            onClick={onPreview}
            title={`Preview ${name}`}
          >
            <Eye aria-hidden />
          </MessageAttachmentAction>
          <MessageAttachmentAction
            aria-label={`Download ${name}`}
            onClick={onDownload}
            title={`Download ${name}`}
          >
            <ArrowDownToLine aria-hidden />
          </MessageAttachmentAction>
        </MessageAttachmentMetaEnd>
      </MessageAttachmentMeta>
    </MessageAttachmentCard>
  );
}

function MessageCommentedMarkdownAttachmentComposition() {
  return (
    <MessageAttachmentCard>
      <MessageAttachmentTitle>release-notes.md</MessageAttachmentTitle>
      <MessageAttachmentSummary render={<MessageAttachmentCommentSummary />}>
        <MessageSquare />6
      </MessageAttachmentSummary>
      <MessageAttachmentMeta>
        <MessageAttachmentMetaStart>1 KB</MessageAttachmentMetaStart>
        <MessageAttachmentMetaEnd>
          <MessageAttachmentAction
            aria-label="Download release-notes.md"
            title="Download release-notes.md"
            onClick={() => downloadMessageFixture("release-notes.md")}
          >
            <ArrowDownToLine />
          </MessageAttachmentAction>
        </MessageAttachmentMetaEnd>
      </MessageAttachmentMeta>
    </MessageAttachmentCard>
  );
}

function MessagePendingCsvAttachmentComposition() {
  return (
    <MessageAttachmentCard aria-busy>
      <MessageAttachmentTitle>metrics.csv</MessageAttachmentTitle>
      <MessageAttachmentSummary>24 rows · 6 columns</MessageAttachmentSummary>
      <MessageAttachmentMeta>
        <MessageAttachmentMetaStart>1 KB</MessageAttachmentMetaStart>
        <MessageAttachmentMetaEnd>
          <Spinner size="xs" />
        </MessageAttachmentMetaEnd>
      </MessageAttachmentMeta>
    </MessageAttachmentCard>
  );
}

function MessageCsvAttachmentComposition() {
  return (
    <MessageAttachmentCard>
      <MessageAttachmentTitle>metrics.csv</MessageAttachmentTitle>
      <MessageAttachmentSummary>24 rows · 6 columns</MessageAttachmentSummary>
      <MessageAttachmentMeta>
        <MessageAttachmentMetaStart>1 KB</MessageAttachmentMetaStart>
        <MessageAttachmentMetaEnd>
          <MessageAttachmentAction
            aria-label="Download metrics.csv"
            title="Download metrics.csv"
            onClick={() => downloadMessageFixture("metrics.csv")}
          >
            <ArrowDownToLine />
          </MessageAttachmentAction>
        </MessageAttachmentMetaEnd>
      </MessageAttachmentMeta>
    </MessageAttachmentCard>
  );
}

function MessageGenericAttachmentComposition() {
  return (
    <MessageAttachmentCard>
      <MessageAttachmentTitle>archive.zip</MessageAttachmentTitle>
      <MessageAttachmentMeta>
        <MessageAttachmentMetaStart>12 KB</MessageAttachmentMetaStart>
        <MessageAttachmentMetaEnd>
          <MessageAttachmentAction
            aria-label="Download archive.zip"
            title="Download archive.zip"
            onClick={() => downloadMessageFixture("archive.zip")}
          >
            <ArrowDownToLine />
          </MessageAttachmentAction>
        </MessageAttachmentMetaEnd>
      </MessageAttachmentMeta>
    </MessageAttachmentCard>
  );
}

export function MessageFileAttachmentsComposition() {
  return (
    <MessageAttachmentGroup>
      <MessageFileAttachmentComposition />
      <MessageHtmlPreviewAttachmentComposition />
      <MessageAudioAttachmentComposition meta="4 KB" />
      <MessageCommentedMarkdownAttachmentComposition />
      <MessageCsvAttachmentComposition />
      <MessageGenericAttachmentComposition />
    </MessageAttachmentGroup>
  );
}

export function MessageFileAttachmentStatesComposition() {
  return (
    <MessageAttachmentGroup>
      <MessageFileAttachmentComposition />
      <MessageHtmlPreviewAttachmentComposition />
      <MessageAudioAttachmentComposition meta="4 KB" />
      <MessageCommentedMarkdownAttachmentComposition />
      <MessagePendingCsvAttachmentComposition />
      <MessageGenericAttachmentComposition />
    </MessageAttachmentGroup>
  );
}
