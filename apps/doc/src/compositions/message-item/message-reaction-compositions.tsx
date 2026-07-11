import { useEffect, useRef, useState } from "react";
import { Tooltip, TooltipTrigger } from "raft-ui";
import {
  MessageReactionChip,
  MessageReactionCount,
  MessageReactionErrorIndicator,
  MessageReactionTooltipContent,
  MessageReactionTooltipMeta,
  MessageReactionTooltipName,
  MessageReactionTooltipNames,
  MessageReactionTooltipNameText,
  MessageReactionTooltipSeparator,
} from "raft-ui/wip";
import { MessageReactionGlyphComposition } from "./message-reaction-glyph-composition.tsx";

export const MESSAGE_QUICK_REACTIONS = ["👍", "❤️", "🎉", "👀", "🔥", "😂", "✅"] as const;

export type MessageReactionCompositionProps = {
  count: number;
  emoji: string;
  failed?: boolean;
  reacted?: boolean;
  title?: string;
};

export function MessageReactionComposition({
  count: initialCount,
  emoji,
  failed = false,
  reacted: initiallyReacted = false,
  title,
}: MessageReactionCompositionProps) {
  const [reacted, setReacted] = useState(initiallyReacted);
  const [failureFlash, setFailureFlash] = useState(false);
  const failureTimerRef = useRef<number | null>(null);
  const count = initialCount + Number(reacted) - Number(initiallyReacted);
  const label = failureFlash
    ? `${emoji} ${count}. Reaction failed`
    : title
      ? `${emoji} reaction from ${title}`
      : `${emoji} ${count}`;

  useEffect(() => {
    return () => {
      if (failureTimerRef.current !== null) window.clearTimeout(failureTimerRef.current);
    };
  }, []);

  const handleClick = () => {
    if (!failed) {
      setReacted((current) => !current);
      return;
    }

    if (failureTimerRef.current !== null) window.clearTimeout(failureTimerRef.current);
    setFailureFlash(true);
    failureTimerRef.current = window.setTimeout(() => {
      setFailureFlash(false);
      failureTimerRef.current = null;
    }, 400);
  };

  if (count <= 0) return null;

  return (
    <MessageReactionChip
      aria-pressed={reacted}
      aria-label={label}
      title={title ?? label}
      onClick={handleClick}
    >
      <MessageReactionGlyphComposition emoji={emoji} size={15} />
      <MessageReactionCount>{count}</MessageReactionCount>
      {failureFlash ? (
        <MessageReactionErrorIndicator>Reaction failed</MessageReactionErrorIndicator>
      ) : null}
    </MessageReactionChip>
  );
}

export type MessageReactionTooltipCompositionProps = {
  container?: HTMLElement | null;
  count: number;
  emoji: string;
  names: readonly string[];
  open?: boolean;
};

export function MessageReactionTooltipComposition({
  container,
  count,
  emoji,
  names,
  open,
}: MessageReactionTooltipCompositionProps) {
  const [reacted, setReacted] = useState(false);
  const visibleNames = names.slice(0, 5);
  const remainingCount = Math.max(0, names.length - visibleNames.length);
  const summary = `${visibleNames.join(", ")}${
    remainingCount ? ` and ${remainingCount} more` : ""
  } reacted with ${emoji}`;

  const displayedCount = count + Number(reacted);

  return (
    <Tooltip open={open}>
      <TooltipTrigger
        render={
          <MessageReactionChip
            aria-pressed={reacted}
            aria-label={summary}
            onClick={() => setReacted((current) => !current)}
          >
            <MessageReactionGlyphComposition emoji={emoji} size={15} />
            <MessageReactionCount>{displayedCount}</MessageReactionCount>
          </MessageReactionChip>
        }
      />
      <MessageReactionTooltipContent container={container} side="bottom">
        <MessageReactionTooltipNames>
          {visibleNames.map((name, index) => (
            <MessageReactionTooltipName key={name}>
              <MessageReactionTooltipNameText>{name}</MessageReactionTooltipNameText>
              {index < visibleNames.length - 1 || remainingCount > 0 ? (
                <MessageReactionTooltipSeparator>,&nbsp;</MessageReactionTooltipSeparator>
              ) : null}
            </MessageReactionTooltipName>
          ))}
          {remainingCount ? (
            <MessageReactionTooltipMeta>+{remainingCount} more</MessageReactionTooltipMeta>
          ) : null}
        </MessageReactionTooltipNames>
      </MessageReactionTooltipContent>
    </Tooltip>
  );
}
