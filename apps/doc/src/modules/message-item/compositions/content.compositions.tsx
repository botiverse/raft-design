import type { ReactNode } from "react";
import { Link as LinkIcon } from "lucide-react";
import { PreviewCard, PreviewCardContent, PreviewCardTrigger, Spinner } from "raft-ui";
import { MessageReference, MessageReferenceLabel, MessageReferenceMeta } from "raft-ui/wip";

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
        render={<MessageReference variant="plain" render={<a href={href} />} />}
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
        render={<MessageReference variant="highlight" render={<a href={href} />} />}
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
    <MessageReference variant={external ? "external" : "panel"} render={<a href={href} />}>
      <LinkIcon />
      <MessageReferenceLabel>{children}</MessageReferenceLabel>
      <MessageReferenceMeta>msg</MessageReferenceMeta>
    </MessageReference>
  );
}

export function MessageReferenceLoadingComposition({ children }: { children: ReactNode }) {
  return (
    <MessageReference variant="pending">
      {children}
      <Spinner size="xs" />
    </MessageReference>
  );
}

export function MessageUnavailableReferencesComposition() {
  return (
    <p>
      Unavailable references use one treatment:{" "}
      <MessageReference variant="unavailable">#archived</MessageReference>{" "}
      <MessageReference variant="unavailable">#404</MessageReference>{" "}
      <MessageReference variant="unavailable">#general:deadbeef</MessageReference>
    </p>
  );
}
