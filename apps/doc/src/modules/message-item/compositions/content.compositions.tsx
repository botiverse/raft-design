import type { ReactNode } from "react";
import { AtSign, MessageSquareText } from "lucide-react";
import { PreviewCard, PreviewCardContent, PreviewCardTrigger, Spinner } from "raft-ui";
import { MessageReference, MessageReferenceLabel } from "raft-ui/wip";

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
  const label = typeof children === "string" ? children.replace(/^@/, "") : children;
  return (
    <PreviewCard>
      <PreviewCardTrigger
        closeDelay={120}
        delay={200}
        render={
          <MessageReference
            variant="mention"
            render={<button type="button" title="Preview mention" />}
          />
        }
      >
        <AtSign size={12} />
        {label}
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
  const label = typeof children === "string" ? children.replace(/^@/, "") : children;
  return (
    <PreviewCard>
      <PreviewCardTrigger
        closeDelay={120}
        delay={200}
        render={
          <MessageReference
            variant="self"
            render={<button type="button" title="Preview current member" />}
          />
        }
      >
        <AtSign size={12} />
        {label}
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
  href,
}: MessageReferenceCompositionProps) {
  return (
    <MessageReference variant="conversation" render={<a href={href} />}>
      <MessageSquareText />
      <MessageReferenceLabel>{children}</MessageReferenceLabel>
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
      <span>#404</span>, <span>task #999</span>, and <span>#release-notes:unknown</span>. A resolved
      thread token whose route parent later disappeared stays visibly unavailable:{" "}
      <MessageReference variant="unavailable">#release-notes:missing-parent</MessageReference>.
    </p>
  );
}
