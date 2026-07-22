import type { MouseEvent, MouseEventHandler, ReactNode } from "react";
import { MessageSquare } from "lucide-react";
import { Spinner } from "raft-ui";
import {
  MessageAttachmentAction,
  MessageAttachmentActions,
  MessageAttachmentBody,
  MessageAttachmentCard,
  MessageAttachmentErrorOverlay,
  MessageAttachmentFrame,
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
  const action = primaryAction ?? secondaryAction;
  const actionLabel = primaryAction ? primaryActionLabel : secondaryActionLabel;
  const onAction = primaryAction ? onPrimaryAction : onSecondaryAction;
  const interactive = Boolean(action && onAction);

  const card = (
    <MessageAttachmentCard
      aria-label={interactive ? actionLabel : undefined}
      onClick={
        interactive
          ? (event) => onAction?.(event as unknown as MouseEvent<HTMLButtonElement>)
          : undefined
      }
      render={interactive ? <button type="button" /> : undefined}
    >
      <MessageAttachmentContent {...content} />
      {action ? (
        <MessageAttachmentActions>
          <MessageAttachmentAction render={<span />}>{action}</MessageAttachmentAction>
        </MessageAttachmentActions>
      ) : null}
    </MessageAttachmentCard>
  );

  if (!primaryAction || !secondaryAction || !onSecondaryAction) return card;

  return (
    <MessageAttachmentFrame>
      {card}
      <MessageAttachmentAction
        aria-label={secondaryActionLabel}
        title={secondaryActionLabel}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onSecondaryAction(event);
        }}
      >
        {secondaryAction}
      </MessageAttachmentAction>
    </MessageAttachmentFrame>
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
        <Spinner size="xs" />
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
