import { Download, Play, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage, Badge, Spinner, useThemeFamily } from "raft-ui";
import {
  MessageAttachmentAction,
  MessageAttachmentActions,
  MessageAttachmentBody,
  MessageAttachmentCard,
  MessageAttachmentGroup,
  MessageAttachmentLoadingBar,
  MessageAttachmentMeta,
  MessageAttachmentMetaLabel,
  MessageAttachmentPendingIndicator,
  MessageAttachmentSummary,
  MessageAttachmentTitle,
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
  MessageVideoPreviewFailedComposition,
  MessageVideoPendingComposition,
  MessageVideoPreviewComposition,
} from "#/modules/message-media/compositions/media.compositions.tsx";

export function MessageFileAttachmentComposition() {
  return (
    <MessageAttachmentCard
      aria-label="Download migration.diff"
      render={<button type="button" />}
      onClick={() => downloadMessageFixture("migration.diff")}
    >
      <MessageAttachmentBody>
        <MessageAttachmentTitle>migration.diff</MessageAttachmentTitle>
        <MessageAttachmentSummary>+42 -7</MessageAttachmentSummary>
        <MessageAttachmentMeta>
          <MessageAttachmentMetaLabel>Diff · 18 KB</MessageAttachmentMetaLabel>
        </MessageAttachmentMeta>
      </MessageAttachmentBody>
      <MessageAttachmentActions>
        <MessageAttachmentAction render={<span />}>
          <Download />
        </MessageAttachmentAction>
      </MessageAttachmentActions>
    </MessageAttachmentCard>
  );
}

export function MessageFileAttachmentsComposition() {
  return (
    <MessageAttachmentGroup>
      <MessageFileAttachmentComposition />
      <MessageAttachmentCard
        aria-label="Download screening.html"
        render={<button type="button" />}
        onClick={() => downloadMessageFixture("screening.html")}
      >
        <MessageAttachmentBody>
          <MessageAttachmentTitle>screening.html</MessageAttachmentTitle>
          <MessageAttachmentMeta>
            <MessageAttachmentMetaLabel>HTML preview · 44 KB</MessageAttachmentMetaLabel>
          </MessageAttachmentMeta>
        </MessageAttachmentBody>
        <MessageAttachmentActions>
          <MessageAttachmentAction render={<span />}>
            <Download />
          </MessageAttachmentAction>
        </MessageAttachmentActions>
      </MessageAttachmentCard>
      <MessageAttachmentCard
        aria-label="Download release-notes.md"
        render={<button type="button" />}
        onClick={() => downloadMessageFixture("release-notes.md")}
      >
        <MessageAttachmentBody>
          <MessageAttachmentTitle>release-notes.md</MessageAttachmentTitle>
          <MessageAttachmentMeta>
            <MessageAttachmentMetaLabel>Markdown · 1 KB</MessageAttachmentMetaLabel>
          </MessageAttachmentMeta>
        </MessageAttachmentBody>
        <MessageAttachmentActions>
          <MessageAttachmentAction render={<span />}>
            <Download />
          </MessageAttachmentAction>
        </MessageAttachmentActions>
      </MessageAttachmentCard>
      <MessageAttachmentCard
        aria-label="Download metrics.csv"
        render={<button type="button" />}
        onClick={() => downloadMessageFixture("metrics.csv")}
      >
        <MessageAttachmentBody>
          <MessageAttachmentTitle>metrics.csv</MessageAttachmentTitle>
          <MessageAttachmentMeta>
            <MessageAttachmentMetaLabel>CSV · 1 KB</MessageAttachmentMetaLabel>
          </MessageAttachmentMeta>
        </MessageAttachmentBody>
        <MessageAttachmentActions>
          <MessageAttachmentAction render={<span />}>
            <Download />
          </MessageAttachmentAction>
        </MessageAttachmentActions>
      </MessageAttachmentCard>
    </MessageAttachmentGroup>
  );
}

export function MessageAttachmentsShowcaseComposition() {
  const theme = useThemeFamily();

  return (
    <div className="w-full max-w-3xl">
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
            <MessageImageGalleryPendingComposition />
            <MessageVideoPreviewComposition />
            <MessageVideoPendingComposition />
            <MessageAttachmentGroup>
              <MessageFileAttachmentComposition />
              <MessageAttachmentCard
                aria-label="Download screening.html"
                render={<button type="button" />}
                onClick={() => downloadMessageFixture("screening.html")}
              >
                <MessageAttachmentBody>
                  <MessageAttachmentTitle>screening.html</MessageAttachmentTitle>
                  <MessageAttachmentMeta>
                    <MessageAttachmentMetaLabel>HTML preview · 44 KB</MessageAttachmentMetaLabel>
                  </MessageAttachmentMeta>
                </MessageAttachmentBody>
                <MessageAttachmentActions>
                  <MessageAttachmentAction render={<span />}>
                    <Download />
                  </MessageAttachmentAction>
                </MessageAttachmentActions>
              </MessageAttachmentCard>
              <MessageAttachmentCard
                aria-label="Download release-notes.md"
                render={<button type="button" />}
                onClick={() => downloadMessageFixture("release-notes.md")}
              >
                <MessageAttachmentBody>
                  <MessageAttachmentTitle>release-notes.md</MessageAttachmentTitle>
                  <MessageAttachmentMeta>
                    <MessageAttachmentMetaLabel>Markdown · 1 KB</MessageAttachmentMetaLabel>
                  </MessageAttachmentMeta>
                </MessageAttachmentBody>
                <MessageAttachmentActions>
                  <MessageAttachmentAction render={<span />}>
                    <Download />
                  </MessageAttachmentAction>
                </MessageAttachmentActions>
              </MessageAttachmentCard>
              <MessageAttachmentCard aria-busy>
                <MessageAttachmentBody>
                  <MessageAttachmentTitle>metrics.csv</MessageAttachmentTitle>
                  <MessageAttachmentMeta>
                    <MessageAttachmentMetaLabel>CSV · 1 KB</MessageAttachmentMetaLabel>
                  </MessageAttachmentMeta>
                </MessageAttachmentBody>
                <MessageAttachmentPendingIndicator>
                  <Spinner size="sm" />
                </MessageAttachmentPendingIndicator>
              </MessageAttachmentCard>
              <MessageVideoPreviewFailedComposition />
              <MessageAttachmentCard aria-busy>
                <MessageAttachmentBody>
                  <MessageAttachmentTitle>architecture.pdf</MessageAttachmentTitle>
                  <MessageAttachmentMeta>
                    <MessageAttachmentMetaLabel>PDF preview · 1.2 MB</MessageAttachmentMetaLabel>
                  </MessageAttachmentMeta>
                </MessageAttachmentBody>
                <MessageAttachmentLoadingBar>
                  <Spinner size="xs" />
                  <span className="truncate">Opening preview…</span>
                </MessageAttachmentLoadingBar>
              </MessageAttachmentCard>
            </MessageAttachmentGroup>
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
    </div>
  );
}
