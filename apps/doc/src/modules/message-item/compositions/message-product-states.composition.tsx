import { useState } from "react";
import { Check, FileText, Hash, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, Badge, Button } from "raft-ui";
import {
  MessageActionCard,
  MessageActionCardActions,
  MessageActionCardCompletion,
  MessageActionCardContent,
  MessageActionCardDetails,
  MessageActionCardHeader,
  MessageActionCardHint,
  MessageForwardedBundle,
  MessageForwardedBundleAttachment,
  MessageForwardedBundleAttachmentMeta,
  MessageForwardedBundleAttachmentName,
  MessageForwardedBundleAttachments,
  MessageForwardedBundleContent,
  MessageForwardedBundleCollapsedFade,
  MessageForwardedBundleFooter,
  MessageForwardedBundleHeader,
  MessageForwardedBundleHeaderCount,
  MessageForwardedBundleHeaderLabel,
  MessageForwardedBundleItem,
  MessageForwardedBundleItemAuthor,
  MessageForwardedBundleItemMeta,
  MessageForwardedBundleItems,
  MessageForwardedBundleSource,
  MessageForwardedBundleToggle,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemEmbedded,
  MessageItemHeader,
  MessageItemMeta,
  MessageItemNotice,
  MessageItemSender,
  MessageItemTime,
  MessageMarkdown,
  MessageQuotedPreview,
  MessageQuotedPreviewAttachment,
  MessageQuotedPreviewAttachments,
  MessageQuotedPreviewAuthor,
  MessageQuotedPreviewAuthorMeta,
  MessageQuotedPreviewAuthorName,
  MessageQuotedPreviewBody,
  MessageQuotedPreviewChannel,
  MessageQuotedPreviewContent,
  MessageQuotedPreviewContext,
  MessageQuotedPreviewHeader,
  MessageQuotedPreviewLoading,
  MessageQuotedPreviewLoadingAvatar,
  MessageQuotedPreviewLoadingContent,
  MessageQuotedPreviewLoadingHeader,
  MessageQuotedPreviewLoadingLine,
  MessageQuotedPreviewLoadingLines,
  MessageQuotedPreviewSeparator,
  MessageQuotedPreviewText,
  MessageQuotedPreviewTimestamp,
  MessageQuotedPreviewUnavailable,
  MessageReferenceThreadUnavailable,
} from "raft-ui/wip";

export type MessageProductStatePreviewState = "forwarded" | "quoted" | "quoted-feedback" | "action";

function ProductStateMessage({
  children,
  sender,
  time,
}: {
  children: React.ReactNode;
  sender: string;
  time: string;
}) {
  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <Avatar size="sm" type="agent">
          <AvatarFallback>AT</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>{sender}</MessageItemSender>
          <MessageItemMeta>claude-opus</MessageItemMeta>
          <MessageItemTime>{time}</MessageItemTime>
        </MessageItemHeader>
        {children}
      </MessageItemContent>
    </MessageItem>
  );
}

export function ForwardedBundleMessageComposition() {
  const [opened, setOpened] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <ProductStateMessage sender="Atlas" time="2:24 PM">
      <MessageItemBody>Forwarded 4 messages</MessageItemBody>
      <MessageItemEmbedded>
        <MessageForwardedBundle data-testid="forwarded-bundle-card">
          <MessageForwardedBundleHeader>
            <div className="flex min-w-0 items-center gap-2">
              <MessageForwardedBundleHeaderLabel>Forwarded</MessageForwardedBundleHeaderLabel>
              <MessageForwardedBundleHeaderCount>4 messages</MessageForwardedBundleHeaderCount>
            </div>
            <MessageForwardedBundleSource
              data-testid="forwarded-bundle-source-label"
              title="Open source message"
              onClick={() => setOpened(true)}
            >
              from release-notes
            </MessageForwardedBundleSource>
          </MessageForwardedBundleHeader>
          <MessageForwardedBundleItems
            className={expanded ? undefined : "max-h-[144px] overflow-hidden sm:max-h-[180px]"}
          >
            <MessageForwardedBundleItem data-testid="forwarded-bundle-item">
              <MessageForwardedBundleItemMeta>
                <MessageForwardedBundleItemAuthor>@Ada</MessageForwardedBundleItemAuthor>
                <span aria-hidden>·</span>
                <time dateTime="2026-07-15T06:05:00.000Z">Jul 15, 2:05 PM</time>
              </MessageForwardedBundleItemMeta>
              <MessageForwardedBundleContent>
                <MessageMarkdown>
                  <p>Rollout is clear for the message reference migration.</p>
                </MessageMarkdown>
              </MessageForwardedBundleContent>
            </MessageForwardedBundleItem>
            <MessageForwardedBundleItem data-testid="forwarded-bundle-item">
              <MessageForwardedBundleItemMeta>
                <MessageForwardedBundleItemAuthor>@Will</MessageForwardedBundleItemAuthor>
                <span aria-hidden>·</span>
                <time dateTime="2026-07-15T06:09:00.000Z">Jul 15, 2:09 PM</time>
              </MessageForwardedBundleItemMeta>
              <MessageForwardedBundleContent>
                <MessageMarkdown>
                  <p>Keep the source case with its attachment context.</p>
                </MessageMarkdown>
              </MessageForwardedBundleContent>
              <MessageForwardedBundleAttachments>
                <MessageForwardedBundleAttachment>
                  <FileText size={12} />
                  <MessageForwardedBundleAttachmentName>
                    release-notes.md
                  </MessageForwardedBundleAttachmentName>
                  <MessageForwardedBundleAttachmentMeta>
                    · MARKDOWN
                  </MessageForwardedBundleAttachmentMeta>
                </MessageForwardedBundleAttachment>
              </MessageForwardedBundleAttachments>
            </MessageForwardedBundleItem>
            <MessageForwardedBundleItem data-testid="forwarded-bundle-item">
              <MessageForwardedBundleItemMeta>
                <MessageForwardedBundleItemAuthor>@Mia</MessageForwardedBundleItemAuthor>
                <span aria-hidden>·</span>
                <time dateTime="2026-07-15T06:12:00.000Z">Jul 15, 2:12 PM</time>
              </MessageForwardedBundleItemMeta>
              <MessageForwardedBundleContent>
                <MessageMarkdown>
                  <p>Keep the original context available to reviewers.</p>
                </MessageMarkdown>
              </MessageForwardedBundleContent>
            </MessageForwardedBundleItem>
            <MessageForwardedBundleItem data-testid="forwarded-bundle-item">
              <MessageForwardedBundleItemMeta>
                <MessageForwardedBundleItemAuthor>@Nia</MessageForwardedBundleItemAuthor>
                <span aria-hidden>·</span>
                <time dateTime="2026-07-15T06:16:00.000Z">Jul 15, 2:16 PM</time>
              </MessageForwardedBundleItemMeta>
              <MessageForwardedBundleContent>
                <MessageMarkdown>
                  <p>Follow the same message state contract in the thread.</p>
                </MessageMarkdown>
              </MessageForwardedBundleContent>
            </MessageForwardedBundleItem>
            {!expanded ? <MessageForwardedBundleCollapsedFade /> : null}
          </MessageForwardedBundleItems>
          <MessageForwardedBundleFooter>
            <MessageForwardedBundleToggle onClick={() => setExpanded((current) => !current)}>
              {expanded ? "Collapse" : "Show all 4 messages"}
            </MessageForwardedBundleToggle>
          </MessageForwardedBundleFooter>
        </MessageForwardedBundle>
        {opened ? <MessageItemNotice>Opened source message.</MessageItemNotice> : null}
      </MessageItemEmbedded>
    </ProductStateMessage>
  );
}

export function QuotedPreviewMessageComposition() {
  const [opened, setOpened] = useState(false);

  return (
    <ProductStateMessage sender="Ada" time="2:25 PM">
      <MessageItemBody>Quoting the final decision from the release thread.</MessageItemBody>
      <MessageItemEmbedded>
        <MessageQuotedPreview
          render={<button type="button" />}
          data-testid="quoted-message-card"
          onClick={() => setOpened(true)}
        >
          <MessageQuotedPreviewContent>
            <MessageQuotedPreviewHeader>
              <MessageQuotedPreviewContext>
                <MessageQuotedPreviewChannel>
                  <Hash size={11} />
                  release-notes
                </MessageQuotedPreviewChannel>
                <MessageQuotedPreviewSeparator>·</MessageQuotedPreviewSeparator>
                <MessageQuotedPreviewAuthor>
                  <Avatar size="xs" type="agent">
                    <AvatarFallback>AT</AvatarFallback>
                  </Avatar>
                  <MessageQuotedPreviewAuthorName>Atlas</MessageQuotedPreviewAuthorName>
                  <MessageQuotedPreviewAuthorMeta>
                    Design-system agent
                  </MessageQuotedPreviewAuthorMeta>
                </MessageQuotedPreviewAuthor>
                <MessageQuotedPreviewSeparator>·</MessageQuotedPreviewSeparator>
                <MessageQuotedPreviewChannel>
                  <MessageSquare size={10} />
                  Thread
                </MessageQuotedPreviewChannel>
              </MessageQuotedPreviewContext>
              <MessageQuotedPreviewTimestamp>Jul 15 · 2:14 PM</MessageQuotedPreviewTimestamp>
            </MessageQuotedPreviewHeader>
            <MessageQuotedPreviewBody>
              <MessageQuotedPreviewText>
                The implementation should preserve Brutal markup before any Elegant treatment is
                added.
              </MessageQuotedPreviewText>
              <MessageQuotedPreviewAttachments>
                <MessageQuotedPreviewAttachment>2 attachments</MessageQuotedPreviewAttachment>
              </MessageQuotedPreviewAttachments>
            </MessageQuotedPreviewBody>
          </MessageQuotedPreviewContent>
        </MessageQuotedPreview>
        {opened ? <MessageItemNotice>Opened quoted message.</MessageItemNotice> : null}
      </MessageItemEmbedded>
    </ProductStateMessage>
  );
}

export function QuotedPreviewFeedbackComposition() {
  const [retried, setRetried] = useState(false);

  return (
    <ProductStateMessage sender="Atlas" time="2:26 PM">
      <MessageItemBody>
        The linked thread is{" "}
        <MessageReferenceThreadUnavailable>
          unavailable or deleted
        </MessageReferenceThreadUnavailable>
        .
      </MessageItemBody>
      <MessageItemEmbedded>
        <MessageQuotedPreviewLoading data-testid="quoted-message-card-loading">
          <MessageQuotedPreviewLoadingHeader />
          <MessageQuotedPreviewLoadingContent>
            <MessageQuotedPreviewLoadingAvatar />
            <MessageQuotedPreviewLoadingLines>
              <MessageQuotedPreviewLoadingLine className="w-32" />
              <MessageQuotedPreviewLoadingLine className="w-full" />
              <MessageQuotedPreviewLoadingLine className="w-3/4" />
            </MessageQuotedPreviewLoadingLines>
          </MessageQuotedPreviewLoadingContent>
        </MessageQuotedPreviewLoading>
        <MessageQuotedPreviewUnavailable
          render={<button type="button" />}
          data-testid="quoted-message-card-unavailable"
          onClick={() => setRetried(true)}
        >
          <MessageQuotedPreviewContent>Message unavailable</MessageQuotedPreviewContent>
        </MessageQuotedPreviewUnavailable>
        {retried ? <MessageItemNotice>Retry requested.</MessageItemNotice> : null}
      </MessageItemEmbedded>
    </ProductStateMessage>
  );
}

export function ActionCardMessageComposition() {
  const [executed, setExecuted] = useState(false);

  return (
    <ProductStateMessage sender="Atlas" time="2:27 PM">
      <MessageItemBody>
        <MessageActionCard>
          <MessageActionCardContent>
            <MessageActionCardHeader>
              <span>Create the release review channel</span>
              {executed ? (
                <Badge variant="success" uppercase className="ml-auto">
                  <Check size={10} className="shrink-0" />
                  <span className="shrink-0">Done</span>
                </Badge>
              ) : null}
            </MessageActionCardHeader>
            <MessageActionCardDetails>
              #release-review · private · Atlas, Ada, and Will
            </MessageActionCardDetails>
            <MessageActionCardHint>
              Suggested after the launch checklist was approved.
            </MessageActionCardHint>
            {executed ? (
              <MessageActionCardCompletion>
                Committed by <span className="font-bold">Will</span>
              </MessageActionCardCompletion>
            ) : (
              <MessageActionCardActions>
                <Button size="sm" variant="accent" onClick={() => setExecuted(true)}>
                  Create channel
                </Button>
              </MessageActionCardActions>
            )}
          </MessageActionCardContent>
        </MessageActionCard>
      </MessageItemBody>
    </ProductStateMessage>
  );
}

export function MessageProductStatePreview({ state }: { state: MessageProductStatePreviewState }) {
  if (state === "forwarded") return <ForwardedBundleMessageComposition />;
  if (state === "quoted") return <QuotedPreviewMessageComposition />;
  if (state === "quoted-feedback") return <QuotedPreviewFeedbackComposition />;
  return <ActionCardMessageComposition />;
}
