import type { ReactNode } from "react";
import { MessageSquareText } from "lucide-react";
import {
  MessageReferenceBadge,
  MessageReferenceChip,
  MessageReferenceLabel,
  MessageReferenceText,
  PreviewCard,
  PreviewCardContent,
  PreviewCardTrigger,
  type MessageReferenceTextVariant,
} from "raft-ui";

type MessageReferenceCompositionProps = {
  children: ReactNode;
  href: string;
};

type MessageMentionReferenceBaseProps = {
  children: ReactNode;
  portalContainer?: HTMLElement | null;
};

export type MessageMentionReferenceCompositionProps = MessageMentionReferenceBaseProps & {
  preview: ReactNode;
  variant?: MessageReferenceTextVariant;
};

function mentionLabel(children: ReactNode) {
  if (typeof children !== "string") return children;
  return children.startsWith("@") ? children : `@${children}`;
}

export function MessageMentionReferenceComposition({
  children,
  portalContainer,
  preview,
  variant,
}: MessageMentionReferenceCompositionProps) {
  return (
    <PreviewCard>
      <PreviewCardTrigger
        closeDelay={120}
        delay={200}
        render={
          <MessageReferenceText
            variant={variant}
            render={<button type="button" title="Preview mention" />}
          />
        }
      >
        {mentionLabel(children)}
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
    <MessageReferenceChip
      variant="accent"
      render={
        <a
          href={href}
          aria-label={typeof label === "string" ? `Open message in #${label}` : "Open message"}
        />
      }
    >
      <MessageReferenceBadge>message</MessageReferenceBadge>
      <MessageSquareText />
      <MessageReferenceLabel>{label}</MessageReferenceLabel>
    </MessageReferenceChip>
  );
}
