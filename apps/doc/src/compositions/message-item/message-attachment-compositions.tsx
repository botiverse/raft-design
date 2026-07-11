import type { MouseEventHandler, ReactNode } from "react";
import { MessageSquare } from "lucide-react";
import { Spinner } from "raft-ui";
import {
  MessageAttachmentAction,
  MessageAttachmentActions,
  MessageAttachmentBody,
  MessageAttachmentCard,
  MessageAttachmentErrorOverlay,
  MessageAttachmentLoadingBar,
  MessageAttachmentMeta,
  MessageAttachmentMetaDetail,
  MessageAttachmentMetaSeparator,
  MessageAttachmentPendingIndicator,
  MessageAttachmentSummary,
  MessageAttachmentTitle,
} from "raft-ui/wip";

type MessageAttachmentContentProps = {
  name: string;
  meta?: string;
  summary?: ReactNode;
  commentCount?: number;
};

function MessageAttachmentContent({
  commentCount,
  meta,
  name,
  summary,
}: MessageAttachmentContentProps) {
  return (
    <>
      <MessageAttachmentBody>
        <MessageAttachmentTitle>{name}</MessageAttachmentTitle>
        {meta || commentCount ? (
          <MessageAttachmentMeta>
            {meta}
            {commentCount ? (
              <MessageAttachmentMetaDetail>
                {meta ? <MessageAttachmentMetaSeparator>·</MessageAttachmentMetaSeparator> : null}
                <MessageSquare />
                {commentCount}
              </MessageAttachmentMetaDetail>
            ) : null}
          </MessageAttachmentMeta>
        ) : null}
      </MessageAttachmentBody>
      {summary ? <MessageAttachmentSummary>{summary}</MessageAttachmentSummary> : null}
    </>
  );
}

export type MessageAttachmentReadyCompositionProps = MessageAttachmentContentProps & {
  primaryAction?: ReactNode;
  onPrimaryAction?: MouseEventHandler<HTMLButtonElement>;
  primaryActionLabel?: string;
  secondaryAction?: ReactNode;
  onSecondaryAction?: MouseEventHandler<HTMLButtonElement>;
  secondaryActionLabel?: string;
};

export function MessageAttachmentReadyComposition({
  primaryAction,
  onPrimaryAction,
  primaryActionLabel = "Preview attachment",
  secondaryAction,
  onSecondaryAction,
  secondaryActionLabel = "Download attachment",
  ...content
}: MessageAttachmentReadyCompositionProps) {
  return (
    <MessageAttachmentCard>
      <MessageAttachmentContent {...content} />
      {primaryAction || secondaryAction ? (
        <MessageAttachmentActions>
          {secondaryAction ? (
            <MessageAttachmentAction
              aria-label={secondaryActionLabel}
              disabled={!onSecondaryAction}
              onClick={onSecondaryAction}
            >
              {secondaryAction}
            </MessageAttachmentAction>
          ) : null}
          {primaryAction ? (
            <MessageAttachmentAction
              aria-label={primaryActionLabel}
              disabled={!onPrimaryAction}
              onClick={onPrimaryAction}
            >
              {primaryAction}
            </MessageAttachmentAction>
          ) : null}
        </MessageAttachmentActions>
      ) : null}
    </MessageAttachmentCard>
  );
}

export type MessageAttachmentOpeningCompositionProps = MessageAttachmentContentProps & {
  label?: ReactNode;
};

export function MessageAttachmentOpeningComposition({
  label = "Opening preview…",
  ...content
}: MessageAttachmentOpeningCompositionProps) {
  return (
    <MessageAttachmentCard aria-busy>
      <MessageAttachmentContent {...content} />
      <MessageAttachmentLoadingBar>
        <Spinner size="sm" />
        <span className="truncate">{label}</span>
      </MessageAttachmentLoadingBar>
    </MessageAttachmentCard>
  );
}

export type MessageAttachmentPendingCompositionProps = MessageAttachmentContentProps;

export function MessageAttachmentPendingComposition(
  content: MessageAttachmentPendingCompositionProps,
) {
  return (
    <MessageAttachmentCard aria-busy>
      <MessageAttachmentContent {...content} />
      <MessageAttachmentPendingIndicator>
        <Spinner size="sm" />
      </MessageAttachmentPendingIndicator>
    </MessageAttachmentCard>
  );
}

export type MessageAttachmentFailedCompositionProps = MessageAttachmentContentProps & {
  label?: ReactNode;
};

export function MessageAttachmentFailedComposition({
  label = "Preview unavailable",
  ...content
}: MessageAttachmentFailedCompositionProps) {
  return (
    <MessageAttachmentCard aria-invalid>
      <MessageAttachmentContent {...content} />
      <MessageAttachmentErrorOverlay>{label}</MessageAttachmentErrorOverlay>
    </MessageAttachmentCard>
  );
}
