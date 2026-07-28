import { useState } from "react";
import { ArrowDownToLine, Eye, MessageSquare } from "lucide-react";
import { Spinner } from "raft-ui";
import {
  MessageAttachmentAction,
  MessageAttachmentCommentSummary,
  MessageAttachmentContent,
  MessageAttachmentDiffAddition,
  MessageAttachmentDiffDeletion,
  MessageAttachmentDiffSummary,
  MessageAttachmentGroup,
  MessageAttachmentMeta,
  MessageAttachmentMetaDetail,
  MessageAttachmentMetaLabel,
  MessageAttachmentTitle,
} from "raft-ui/wip";
import {
  MESSAGE_FIXTURE_AUDIO_SRC,
  downloadMessageFixture,
} from "#/modules/message-item/message-item.fixtures.ts";
import {
  MessageAttachmentPendingComposition,
  MessageAttachmentReadyComposition,
} from "./attachment.compositions.tsx";

function MessageHtmlPreviewAttachmentComposition() {
  const [opening, setOpening] = useState(false);

  return (
    <MessageAttachmentReadyComposition
      name="screening.html"
      meta="44 KB"
      loading={opening}
      primaryAction={opening ? <Spinner size="xs" /> : <Eye aria-hidden />}
      primaryActionLabel="Preview screening.html"
      onPrimaryAction={opening ? undefined : () => setOpening(true)}
    />
  );
}

export function MessageFileAttachmentComposition() {
  return (
    <MessageAttachmentReadyComposition
      name="migration.diff"
      meta="18 KB"
      primaryAction={<ArrowDownToLine />}
      primaryActionLabel="Download migration.diff"
      onPrimaryAction={() => downloadMessageFixture("migration.diff")}
    >
      <MessageAttachmentDiffSummary>
        <MessageAttachmentDiffAddition>+42</MessageAttachmentDiffAddition>
        <MessageAttachmentDiffDeletion>-7</MessageAttachmentDiffDeletion>
      </MessageAttachmentDiffSummary>
    </MessageAttachmentReadyComposition>
  );
}

function MessageAudioAttachmentComposition() {
  return (
    <MessageAttachmentContent>
      <MessageAttachmentTitle>message-preview.wav</MessageAttachmentTitle>
      <MessageAttachmentMeta>
        <MessageAttachmentMetaLabel>4 KB</MessageAttachmentMetaLabel>
        <MessageAttachmentMetaDetail>
          <MessageAttachmentAction
            aria-label="Preview message-preview.wav"
            onClick={() => window.open(MESSAGE_FIXTURE_AUDIO_SRC, "_blank", "noopener,noreferrer")}
            title="Preview message-preview.wav"
          >
            <Eye aria-hidden />
          </MessageAttachmentAction>
          <MessageAttachmentAction
            aria-label="Download message-preview.wav"
            onClick={() => downloadMessageFixture("message-preview.wav")}
            title="Download message-preview.wav"
          >
            <ArrowDownToLine aria-hidden />
          </MessageAttachmentAction>
        </MessageAttachmentMetaDetail>
      </MessageAttachmentMeta>
    </MessageAttachmentContent>
  );
}

function MessageCommentedMarkdownAttachmentComposition() {
  return (
    <MessageAttachmentReadyComposition
      name="release-notes.md"
      meta="1 KB"
      primaryAction={<ArrowDownToLine />}
      primaryActionLabel="Download release-notes.md"
      onPrimaryAction={() => downloadMessageFixture("release-notes.md")}
    >
      <MessageAttachmentCommentSummary>
        <MessageSquare />6
      </MessageAttachmentCommentSummary>
    </MessageAttachmentReadyComposition>
  );
}

export function MessageFileAttachmentsComposition() {
  return (
    <MessageAttachmentGroup>
      <MessageFileAttachmentComposition />
      <MessageHtmlPreviewAttachmentComposition />
      <MessageAudioAttachmentComposition />
      <MessageCommentedMarkdownAttachmentComposition />
      <MessageAttachmentReadyComposition
        name="metrics.csv"
        meta="1 KB"
        primaryAction={<ArrowDownToLine />}
        primaryActionLabel="Download metrics.csv"
        onPrimaryAction={() => downloadMessageFixture("metrics.csv")}
      />
    </MessageAttachmentGroup>
  );
}

export function MessageFileAttachmentStatesComposition() {
  return (
    <MessageAttachmentGroup>
      <MessageFileAttachmentComposition />
      <MessageHtmlPreviewAttachmentComposition />
      <MessageAudioAttachmentComposition />
      <MessageCommentedMarkdownAttachmentComposition />
      <MessageAttachmentPendingComposition name="metrics.csv" meta="1 KB" />
    </MessageAttachmentGroup>
  );
}
