import { useMemo } from "react";
import type { ReactNode } from "react";
import { Link } from "lucide-react";
import {
  MessageReferenceChip,
  MessageReferenceLabel,
  MessageReferenceText,
  PreviewCard,
  PreviewCardContent,
  PreviewCardTrigger,
} from "@botiverse/raft-ui";
import type { MessageReferenceTextVariant } from "@botiverse/raft-ui";

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
  const portalProps = useMemo(
    () => (portalContainer ? { container: portalContainer } : undefined),
    [portalContainer],
  );

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
        portalProps={portalProps}
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
  const label = children;

  return (
    <MessageReferenceChip
      variant="link"
      render={
        <a
          href={href}
          aria-label={typeof label === "string" ? `Open message in ${label}` : "Open message"}
        />
      }
    >
      <Link />
      <MessageReferenceLabel>{label}</MessageReferenceLabel>
    </MessageReferenceChip>
  );
}
