import type { ReactNode } from "react";
import { AtSign, Link as LinkIcon, MessageSquareText } from "lucide-react";
import { PreviewCard, PreviewCardContent, PreviewCardTrigger, Spinner } from "raft-ui";
import {
  MessageReferenceChip,
  MessageReferenceLabel,
  MessageReferenceMeta,
  MessageReferencePending,
  MessageReferenceText,
} from "raft-ui/wip";

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
        render={<MessageReferenceText render={<button type="button" title="Preview mention" />} />}
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
          <MessageReferenceChip
            variant="primary"
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

export function MessageTargetReferenceComposition({
  children,
  href,
}: MessageReferenceCompositionProps) {
  const label = typeof children === "string" ? children.replace(/^#/, "") : children;

  return (
    <MessageReferenceChip variant="accent" render={<a href={href} />}>
      <MessageSquareText size={12} />
      <MessageReferenceLabel>{label}</MessageReferenceLabel>
    </MessageReferenceChip>
  );
}

export function MessagePermalinkReferenceComposition({
  children,
  external,
  href,
  meta = "msg",
}: MessageReferenceCompositionProps & { external?: boolean; meta?: ReactNode }) {
  return (
    <MessageReferenceChip
      variant={external ? "link" : "muted"}
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
    </MessageReferenceChip>
  );
}

export function MessageReferenceLoadingComposition({ children }: { children: ReactNode }) {
  return (
    <MessageReferencePending>
      {children}
      <Spinner size="xs" />
    </MessageReferencePending>
  );
}

export function MessageUnavailableReferencesComposition() {
  return (
    <p>
      Unknown channel, task, and authority-unavailable thread references fall back to plain text:{" "}
      <span>#404</span>, <span>task #999</span>, and <span>#release-notes:unknown</span>. Only a
      resolved thread token whose route parent later disappeared keeps a non-link info chip:{" "}
      <MessageReferenceChip variant="info">#release-notes:missing-parent</MessageReferenceChip>.
    </p>
  );
}
