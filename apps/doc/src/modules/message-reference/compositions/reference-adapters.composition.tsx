import type { ReactNode } from "react";
import { AtSign, MessageSquareText } from "lucide-react";
import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from "raft-ui";
import { MessageReferenceChip, MessageReferenceLabel, MessageReferenceText } from "raft-ui/wip";

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
