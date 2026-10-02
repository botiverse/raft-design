import { ArrowDownToLine } from "lucide-react";
import {
  MessageAttachmentAction,
  MessageAttachmentCard,
  MessageAttachmentGroup,
  MessageAttachmentMeta,
  MessageAttachmentMetaEnd,
  MessageAttachmentMetaStart,
  MessageAttachmentSummary,
  MessageAttachmentTitle,
} from "raft-ui";
import { downloadMessageFixture } from "#/modules/message-item/message-item.fixtures.ts";

function downloadMetrics() {
  downloadMessageFixture("metrics.csv");
}

function downloadReleaseNotes() {
  downloadMessageFixture("release-notes.md");
}

function downloadScreening() {
  downloadMessageFixture("screening.html");
}

function downloadArchitecture() {
  downloadMessageFixture("architecture.pdf");
}

export function MessageAttachmentDocumentSummariesComposition() {
  return (
    <MessageAttachmentGroup>
      <MessageAttachmentCard>
        <MessageAttachmentTitle>metrics.csv</MessageAttachmentTitle>
        <MessageAttachmentSummary>24 rows · 6 columns</MessageAttachmentSummary>
        <MessageAttachmentMeta>
          <MessageAttachmentMetaStart>1 KB</MessageAttachmentMetaStart>
          <MessageAttachmentMetaEnd>
            <MessageAttachmentAction
              aria-label="Download metrics.csv"
              title="Download metrics.csv"
              onClick={downloadMetrics}
            >
              <ArrowDownToLine />
            </MessageAttachmentAction>
          </MessageAttachmentMetaEnd>
        </MessageAttachmentMeta>
      </MessageAttachmentCard>

      <MessageAttachmentCard>
        <MessageAttachmentTitle>release-notes.md</MessageAttachmentTitle>
        <MessageAttachmentMeta>
          <MessageAttachmentMetaStart>1 KB</MessageAttachmentMetaStart>
          <MessageAttachmentMetaEnd>
            <MessageAttachmentAction
              aria-label="Download release-notes.md"
              title="Download release-notes.md"
              onClick={downloadReleaseNotes}
            >
              <ArrowDownToLine />
            </MessageAttachmentAction>
          </MessageAttachmentMetaEnd>
        </MessageAttachmentMeta>
      </MessageAttachmentCard>

      <MessageAttachmentCard>
        <MessageAttachmentTitle>screening.html</MessageAttachmentTitle>
        <MessageAttachmentMeta>
          <MessageAttachmentMetaStart>44 KB</MessageAttachmentMetaStart>
          <MessageAttachmentMetaEnd>
            <MessageAttachmentAction
              aria-label="Download screening.html"
              title="Download screening.html"
              onClick={downloadScreening}
            >
              <ArrowDownToLine />
            </MessageAttachmentAction>
          </MessageAttachmentMetaEnd>
        </MessageAttachmentMeta>
      </MessageAttachmentCard>

      <MessageAttachmentCard>
        <MessageAttachmentTitle>architecture.pdf</MessageAttachmentTitle>
        <MessageAttachmentMeta>
          <MessageAttachmentMetaStart>1.2 MB</MessageAttachmentMetaStart>
          <MessageAttachmentMetaEnd>
            <MessageAttachmentAction
              aria-label="Download architecture.pdf"
              title="Download architecture.pdf"
              onClick={downloadArchitecture}
            >
              <ArrowDownToLine />
            </MessageAttachmentAction>
          </MessageAttachmentMetaEnd>
        </MessageAttachmentMeta>
      </MessageAttachmentCard>
    </MessageAttachmentGroup>
  );
}
