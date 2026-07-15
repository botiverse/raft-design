import { useState } from "react";
import { AlertTriangle, Copy, Download, Eye, MessageSquare, Pencil, Quote } from "lucide-react";
import { Avatar, AvatarFallback, Status } from "raft-ui";
import {
  MessageAttachmentGroup,
  MessageImageGallery,
  MessageImageGalleryAction,
  MessageImageGalleryItem,
  MessageImageGalleryMedia,
  MessageImageGalleryPreview,
  MessageImageGalleryRow,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemAvatarStatus,
  MessageItemBadge,
  MessageItemBadgeSeparator,
  MessageItemBody,
  MessageItemContent,
  MessageItemFooter,
  MessageItemHeader,
  MessageItemMeta,
  MessageItemNotice,
  MessageItemSender,
  MessageItemTime,
  MessageMarkdown,
  MessageReferenceComment,
  MessageVideoPreview,
  MessageVideoPreviewFallback,
} from "raft-ui/wip";
import { MessageAttachmentReadyComposition } from "./attachment.compositions.tsx";
import {
  MESSAGE_FIXTURE_IMAGE_SRC,
  downloadMessageFixture,
} from "#/modules/message-item/message-item.fixtures.ts";
import { MessageTextSelectionComposition } from "./selection.compositions.tsx";

function SourceStateRow({ children }: { children: React.ReactNode }) {
  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <Avatar size="sm" type="agent">
          <AvatarFallback>AT</AvatarFallback>
        </Avatar>
        <MessageItemAvatarStatus>
          <Status size="xs" variant="success" />
        </MessageItemAvatarStatus>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Atlas</MessageItemSender>
          <MessageItemMeta>claude-opus</MessageItemMeta>
          <MessageItemTime>2:31 PM</MessageItemTime>
        </MessageItemHeader>
        {children}
      </MessageItemContent>
    </MessageItem>
  );
}

function AttachmentCommentReferenceRow() {
  const [jumped, setJumped] = useState(false);

  return (
    <SourceStateRow>
      <div className="mb-0.5">
        <MessageReferenceComment
          href="#attachment-comment"
          onClick={(event) => {
            event.preventDefault();
            setJumped(true);
          }}
          title="Jump to the message with architecture.pdf · L12"
        >
          <MessageSquare size={12} />
          <span>re: architecture.pdf · L12</span>
        </MessageReferenceComment>
      </div>
      <MessageMarkdown>
        <blockquote>
          This paragraph needs the deployment-owner decision before the document can be approved.
        </blockquote>
      </MessageMarkdown>
      <MessageItemBody>Added the owner note to the review thread.</MessageItemBody>
      {jumped ? <MessageItemNotice>Jumped to the annotated attachment.</MessageItemNotice> : null}
    </SourceStateRow>
  );
}

function ThreadDraftReplyStates() {
  return (
    <SourceStateRow>
      <MessageItemBody>
        Draft state remains visible even before the first reply is sent.
      </MessageItemBody>
      <MessageItemFooter>
        <MessageItemBadge>
          <Pencil className="text-foreground-muted" />
          <span className="text-foreground-muted">draft</span>
        </MessageItemBadge>
        <MessageItemBadge status="unread">
          <MessageSquare />
          <span>3 replies</span>
          <MessageItemBadgeSeparator>·</MessageItemBadgeSeparator>
          <span>1 new</span>
          <MessageItemBadgeSeparator>·</MessageItemBadgeSeparator>
          <Pencil className="text-foreground-muted" />
          <span className="text-foreground-muted">draft</span>
        </MessageItemBadge>
      </MessageItemFooter>
    </SourceStateRow>
  );
}

function MultiImageAttachmentState() {
  return (
    <MessageImageGallery>
      <MessageImageGalleryRow className="grid-cols-2 md:grid-cols-3 h-28 sm:h-32">
        {["review-a", "review-b", "review-c"].map((id) => (
          <MessageImageGalleryItem key={id}>
            <MessageImageGalleryMedia src={MESSAGE_FIXTURE_IMAGE_SRC} alt={`Attachment ${id}`} />
            <MessageImageGalleryPreview aria-label={`Preview ${id}`} />
            <MessageImageGalleryAction
              aria-label={`Download ${id}`}
              onClick={() => downloadMessageFixture(`${id}.svg`)}
            >
              <Download />
            </MessageImageGalleryAction>
          </MessageImageGalleryItem>
        ))}
      </MessageImageGalleryRow>
    </MessageImageGallery>
  );
}

function AttachmentFailureStates() {
  return (
    <MessageAttachmentGroup>
      <MultiImageAttachmentState />
      <MessageVideoPreview aria-invalid title="codec-unavailable.mov">
        <MessageVideoPreviewFallback>
          <div className="flex max-w-[16rem] flex-col items-center gap-2 px-4 text-center text-xs font-bold">
            <AlertTriangle size={24} />
            <span>This video may use a codec this browser cannot preview.</span>
            <span className="inline-flex items-center gap-1 text-white/75">
              <Download size={13} />
              Download to view
            </span>
          </div>
        </MessageVideoPreviewFallback>
      </MessageVideoPreview>
      <MessageAttachmentReadyComposition
        name="diagram.png"
        meta="Image preview · 186 KB"
        primaryAction={<Eye />}
        primaryActionLabel="Preview diagram.png"
        onPrimaryAction={() => downloadMessageFixture("diagram.png")}
      />
    </MessageAttachmentGroup>
  );
}

function TextSelectionState() {
  const [quoted, setQuoted] = useState("");

  return (
    <div className="grid gap-2">
      <MessageTextSelectionComposition onQuote={setQuoted}>
        <p className="max-w-[65ch] text-sm text-foreground">
          Select this sentence to expose the source Quote and Copy menu, without making text
          selection a message-row concern.
        </p>
      </MessageTextSelectionComposition>
      {quoted ? (
        <p className="inline-flex items-center gap-1 text-xs text-foreground-muted" role="status">
          <Quote size={12} /> Quoted selection: {quoted}
        </p>
      ) : (
        <p className="inline-flex items-center gap-1 text-xs text-foreground-muted">
          <Copy size={12} /> Select text to inspect the contextual actions.
        </p>
      )}
    </div>
  );
}

/**
 * Source-visible variants that depend on caller-owned data or interaction state.
 * The composition deliberately renders their DOM and interaction affordances without
 * reproducing source navigation, attachment fetches, or selection-store wiring.
 */
export function MessageSourceVisibleStatesComposition() {
  return (
    <div className="grid w-full max-w-3xl gap-6">
      <AttachmentCommentReferenceRow />
      <ThreadDraftReplyStates />
      <SourceStateRow>
        <MessageItemBody>
          Attachment grids, fallbacks, and preview failures preserve their row context.
        </MessageItemBody>
        <AttachmentFailureStates />
      </SourceStateRow>
      <TextSelectionState />
    </div>
  );
}
