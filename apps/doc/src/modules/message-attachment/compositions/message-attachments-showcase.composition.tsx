import { Download, Play, MessageSquare } from "lucide-react";
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
      <MessageAttachmentReadyComposition
        name="release-notes.md"
        meta="Markdown · 1 KB"
        primaryAction={<Download />}
        primaryActionLabel="Download release-notes.md"
        onPrimaryAction={() => downloadMessageFixture("release-notes.md")}
      />
      <MessageAttachmentReadyComposition
        name="metrics.csv"
        meta="CSV · 1 KB"
        primaryAction={<Download />}
        primaryActionLabel="Download metrics.csv"
        onPrimaryAction={() => downloadMessageFixture("metrics.csv")}
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
      <section className="flex flex-col gap-3" aria-labelledby="attachment-structural-states">
        <div>
          <h3 id="attachment-structural-states" className="text-sm font-bold text-foreground">
            Structural preview states
          </h3>
          <p className="text-xs text-foreground-muted">
            Component-only loading and failure coverage. The current sent-message flow does not emit
            upload-pending or upload-failed attachments because the composer blocks send.
          </p>
        </div>
        <MessageImageGalleryPendingComposition />
        <MessageVideoPendingComposition />
        <MessageAttachmentGroup>
          <MessageAttachmentPendingComposition name="screening.html" meta="HTML · 44 KB" />
          <MessageAttachmentFailedComposition name="preview.mov" meta="Video · 18 KB" />
          <MessageAttachmentOpeningComposition
            name="architecture.pdf"
            meta="PDF preview · 1.2 MB"
            label="Opening preview…"
          />
        </MessageAttachmentGroup>
      </section>
    </div>
  );
}
