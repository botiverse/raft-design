import { Download, FileText, Music, Play, MessageSquare } from "lucide-react";
import { Badge, useThemeFamily, Avatar, AvatarFallback, AvatarImage } from "raft-ui";
import {
  MessageAttachmentGroup,
  MessageItem,
  MessageItemAttachments,
  MessageItemAvatarSlot,
  MessageItemBadge,
  MessageItemBadgeSeparator,
  MessageItemBody,
  MessageItemContent,
  MessageItemFooter,
  MessageItemHeader,
  MessageItemMeta,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui/wip";
import {
  MESSAGE_FIXTURE_AVATAR_SRC,
  downloadMessageFixture,
} from "#/modules/message-item/message-item.fixtures.ts";
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

export function MessageAttachmentsShowcaseComposition() {
  const theme = useThemeFamily();

  return (
    <div className="flex w-full max-w-3xl flex-col gap-4">
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="agent">
            <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
            <AvatarFallback>AP</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>App Planner</MessageItemSender>
            <MessageItemMeta>gpt-4.1</MessageItemMeta>
            <MessageItemTime>3:04 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            Here is the source parity pass for <strong>#222</strong>. Mention chip, channel link,
            task link, and markdown are rendered by the caller.
          </MessageItemBody>
          <MessageItemAttachments>
            <MessageImageGalleryPairComposition />
            <MessageVideoPreviewComposition />
            <MessageFileAttachmentsComposition />
          </MessageItemAttachments>
          <MessageItemFooter>
            <Badge
              appearance={theme === "brutal" ? "solid" : "soft"}
              variant="information"
              uppercase={false}
              title="Task #222 · In Progress"
            >
              <Play size={10} />
              <span>#222</span>
            </Badge>
            <MessageItemBadge status="unread">
              <MessageSquare />6 replies
              <MessageItemBadgeSeparator>·</MessageItemBadgeSeparator>3 new
            </MessageItemBadge>
            <MessageReactionComposition emoji="👍" count={5} reacted />
            <MessageReactionComposition emoji="👀" count={2} />
            <MessageReactionComposition emoji="🔥" count={1} failed />
          </MessageItemFooter>
        </MessageItemContent>
        <MessageRowToolbarFixture />
      </MessageItem>
      <div className="flex flex-col gap-3">
        <MessageImageGalleryPendingComposition />
        <MessageVideoPendingComposition />
        <MessageAttachmentGroup>
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
        </MessageAttachmentGroup>
      </div>
    </div>
  );
}
