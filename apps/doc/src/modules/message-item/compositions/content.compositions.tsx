import type { ReactNode } from "react";
import { Link as LinkIcon } from "lucide-react";
import { PreviewCard, PreviewCardContent, PreviewCardTrigger, Spinner } from "raft-ui";
import { MessageReference, MessageReferenceLabel, MessageReferenceMeta } from "raft-ui/wip";

type MessageReferenceCompositionProps = {
  children: ReactNode;
  href: string;
};

type MessageMentionReferenceBaseProps = {
  children: ReactNode;
  portalContainer?: HTMLElement | null;
};

export type MessageSelfMentionReferenceCompositionProps = MessageMentionReferenceBaseProps & {
  preview: ReactNode;
};

export type MessageMentionReferenceCompositionProps = MessageMentionReferenceBaseProps & {
  preview: ReactNode;
};

export function MessageMentionReferenceComposition({
  children,
  portalContainer,
  preview,
}: MessageMentionReferenceCompositionProps) {
  return (
    <PreviewCard>
      <PreviewCardTrigger
        closeDelay={120}
        delay={200}
        render={
          <MessageReference
            variant="plain"
            render={<button type="button" title="Preview mention" />}
          />
        }
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
  portalContainer,
  preview,
}: MessageSelfMentionReferenceCompositionProps) {
  return (
    <PreviewCard>
      <PreviewCardTrigger
        closeDelay={120}
        delay={200}
        render={
          <MessageReference
            variant="highlight"
            render={<button type="button" title="Preview current member" />}
          />
        }
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
  meta = "msg",
}: MessageReferenceCompositionProps & { external?: boolean; meta?: ReactNode }) {
  return (
    <MessageReference
      variant={external ? "external" : "panel"}
      render={
        <a
          href={href}
          rel={external ? "noreferrer" : undefined}
          target={external ? "_blank" : undefined}
        />
      }
    >
      <LinkIcon />
      <MessageReferenceLabel>{children}</MessageReferenceLabel>
      <MessageReferenceMeta>{meta}</MessageReferenceMeta>
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
      Unknown channel, task, and authority-unavailable thread references fall back to plain text:{" "}
      <span>#404</span>, <span>task #999</span>, and <span>#release-notes:unknown</span>. Only a
      resolved thread token whose route parent later disappeared keeps a non-link info chip:{" "}
      <MessageReference variant="info">#release-notes:missing-parent</MessageReference>.
    </p>
  );
}
