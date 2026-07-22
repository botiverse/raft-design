import { Download, FileText, Music, Play, MessageSquare, SmilePlus } from "lucide-react";
import { Badge } from "raft-ui";
import { MessageItemExampleAvatar } from "#/modules/message-item/message-item-example-avatar.tsx";
import {
  MessageAttachmentGroup,
  MessageItem,
  MessageItemAttachments,
  MessageItemAvatarSlot,
  MessageItemBadge,
  MessageItemBadgeSeparator,
  MessageItemBody,
  MessageItemContent,
  MessageItemEmbedded,
  MessageItemFooter,
  MessageItemHeader,
  MessageItemMeta,
  MessageItemNotice,
  MessageItemSender,
  MessageItemTime,
  MessageReactionChip,
  MessageReactionGlyph,
} from "raft-ui/wip";
import { downloadMessageFixture } from "#/modules/message-item/message-item.fixtures.ts";
import { MessageReactionComposition } from "#/modules/message-item/compositions/reaction.compositions.tsx";
import { MessageRowToolbarFixture } from "#/modules/message-item/compositions/row-toolbar.composition.tsx";
import {
  MessageImageGalleryPairComposition,
  MessageImageGalleryPendingComposition,
  MessageVideoPendingComposition,
  MessageVideoPreviewComposition,
} from "#/modules/message-media/compositions/media.compositions.tsx";
import {
  MessageAttachmentFailedComposition,
  MessageAttachmentOpeningComposition,
  MessageAttachmentPendingComposition,
  MessageAttachmentReadyComposition,
} from "./attachment.compositions.tsx";

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

function RichAttachmentMessageRow() {
  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <MessageItemExampleAvatar fallback="AP" />
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>App Planner</MessageItemSender>
          <MessageItemMeta>gpt-4.1</MessageItemMeta>
          <MessageItemTime>3:04 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>
          Here is the source parity pass for <strong>#222</strong>. Mention chip, channel link, task
          link, and markdown are rendered by the caller.
        </MessageItemBody>
        <MessageItemEmbedded>
          <MessageItemNotice>Forwarded from #release-notes by Ada.</MessageItemNotice>
        </MessageItemEmbedded>
        <MessageItemAttachments>
          <MessageImageGalleryPairComposition />
          <MessageVideoPreviewComposition />
          <MessageFileAttachmentsComposition />
        </MessageItemAttachments>
        <MessageItemFooter>
          <Badge variant="information" appearance="solid" uppercase={false}>
            <Play size={10} />
            <span>#222</span>
            <span>@Ada</span>
          </Badge>
          <MessageItemBadge status="unread">
            <MessageSquare />6 replies
            <MessageItemBadgeSeparator>·</MessageItemBadgeSeparator>3 new
          </MessageItemBadge>
          <MessageReactionComposition emoji="👍" count={5} reacted />
          <MessageReactionComposition emoji="👀" count={2} />
          <MessageReactionComposition emoji="🔥" count={1} failed />
          <MessageReactionChip aria-label="Add reaction" disabled>
            <MessageReactionGlyph>
              <SmilePlus />
            </MessageReactionGlyph>
          </MessageReactionChip>
        </MessageItemFooter>
      </MessageItemContent>
      <MessageRowToolbarFixture />
    </MessageItem>
  );
}

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
