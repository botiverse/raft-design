import type { ReactNode } from "react";
import { Link as LinkIcon } from "lucide-react";
import { PreviewCard, PreviewCardContent, PreviewCardTrigger, Spinner } from "raft-ui";
import {
  MessageReferenceLabel,
  MessageReferenceChannelUnavailable,
  MessageReferenceLoading,
  MessageReferenceMention,
  MessageReferenceMeta,
  MessageReferencePermalink,
  MessageReferenceSelfMention,
  MessageReferenceTaskUnavailable,
  MessageReferenceThreadUnavailable,
} from "raft-ui/wip";

type MessageReferenceCompositionProps = {
  children: ReactNode;
  href: string;
  portalContainer?: HTMLElement | null;
};

export type MessageSelfMentionReferenceCompositionProps = MessageReferenceCompositionProps & {
  preview: ReactNode;
};

export type MessageMentionReferenceCompositionProps = MessageReferenceCompositionProps & {
  preview: ReactNode;
};

export function MessageMentionReferenceComposition({
  children,
  href,
  portalContainer,
  preview,
}: MessageMentionReferenceCompositionProps) {
  return (
    <PreviewCard>
      <PreviewCardTrigger
        closeDelay={120}
        delay={200}
        render={<MessageReferenceMention href={href} />}
      >
        {children}
      </PreviewCardTrigger>
      <PreviewCardContent
        sideOffset={6}
        collisionPadding={6}
        portalProps={portalContainer ? { container: portalContainer } : undefined}
        className="w-[17.5rem]"
      >
        {preview}
      </PreviewCardContent>
    </PreviewCard>
  );
}

export function MessageSelfMentionReferenceComposition({
  children,
  href,
  portalContainer,
  preview,
}: MessageSelfMentionReferenceCompositionProps) {
  return (
    <PreviewCard>
      <PreviewCardTrigger
        closeDelay={120}
        delay={200}
        render={<MessageReferenceSelfMention href={href} />}
      >
        {children}
      </PreviewCardTrigger>
      <PreviewCardContent
        sideOffset={6}
        collisionPadding={6}
        portalProps={portalContainer ? { container: portalContainer } : undefined}
        className="w-[17.5rem]"
      >
        {preview}
      </PreviewCardContent>
    </PreviewCard>
  );
}

export function MessagePermalinkReferenceComposition({
  children,
  external,
  href,
}: MessageReferenceCompositionProps & { external?: boolean }) {
  return (
    <MessageReferencePermalink external={external} href={href}>
      <LinkIcon />
      <MessageReferenceLabel>{children}</MessageReferenceLabel>
      <MessageReferenceMeta>msg</MessageReferenceMeta>
    </MessageReferencePermalink>
  );
}

export function MessageReferenceLoadingComposition({ children }: { children: ReactNode }) {
  return (
    <MessageReferenceLoading>
      {children}
      <Spinner size="xs" />
    </MessageReferenceLoading>
  );
}

export function MessageUnavailableReferencesComposition() {
  return (
    <p>
      Unavailable references retain their source treatment:{" "}
      <MessageReferenceChannelUnavailable>#archived</MessageReferenceChannelUnavailable>{" "}
      <MessageReferenceTaskUnavailable>#404</MessageReferenceTaskUnavailable>{" "}
      <MessageReferenceThreadUnavailable>#general:deadbeef</MessageReferenceThreadUnavailable>
    </p>
  );
}
