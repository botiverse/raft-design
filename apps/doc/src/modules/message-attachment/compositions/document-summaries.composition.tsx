import { Eye } from "lucide-react";
import {
  MessageAttachmentAction,
  MessageAttachmentCard,
  MessageAttachmentGroup,
  MessageAttachmentMeta,
  MessageAttachmentMetaEnd,
  MessageAttachmentMetaStart,
  MessageAttachmentSummary,
  MessageAttachmentTitle,
} from "raft-ui/wip";

const documents = [
  {
    name: "metrics.csv",
    size: "1 KB",
    summary: "24 rows · 6 columns",
  },
  {
    name: "release-notes.md",
    size: "1 KB",
    summary: null,
  },
  {
    name: "server-output.log",
    size: "8 KB",
    summary: null,
  },
  {
    name: "architecture.pdf",
    size: "1.2 MB",
    summary: null,
  },
] as const;

export function MessageAttachmentDocumentSummariesComposition() {
  return (
    <MessageAttachmentGroup>
      {documents.map((document) => (
        <MessageAttachmentCard key={document.name}>
          <MessageAttachmentTitle>{document.name}</MessageAttachmentTitle>
          {document.summary ? (
            <MessageAttachmentSummary>{document.summary}</MessageAttachmentSummary>
          ) : null}
          <MessageAttachmentMeta>
            <MessageAttachmentMetaStart>{document.size}</MessageAttachmentMetaStart>
            <MessageAttachmentMetaEnd>
              <MessageAttachmentAction
                aria-hidden
                render={<span />}
                title={`Preview ${document.name}`}
              >
                <Eye />
              </MessageAttachmentAction>
            </MessageAttachmentMetaEnd>
          </MessageAttachmentMeta>
        </MessageAttachmentCard>
      ))}
    </MessageAttachmentGroup>
  );
}
