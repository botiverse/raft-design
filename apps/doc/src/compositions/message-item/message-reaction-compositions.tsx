import { useState } from "react";
import { Tooltip, TooltipTrigger } from "raft-ui";
import {
  MessageReactionChip,
  MessageReactionCount,
  MessageReactionErrorIndicator,
  MessageReactionGlyph,
  MessageReactionTooltipContent,
  MessageReactionTooltipMeta,
  MessageReactionTooltipName,
  MessageReactionTooltipNames,
  MessageReactionTooltipNameText,
  MessageReactionTooltipSeparator,
} from "raft-ui/wip";

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
  const count = initialCount + Number(reacted) - Number(initiallyReacted);
  const label = failed ? `${emoji} ${count}. Reaction failed` : `${emoji} ${count}`;

  return (
    <MessageReactionChip
      aria-pressed={reacted}
      aria-label={label}
      disabled={failed}
      title={title ?? label}
      onClick={() => setReacted((current) => !current)}
    >
      <MessageReactionGlyph emoji={emoji} size={15} />
      <MessageReactionCount>{count}</MessageReactionCount>
      {failed ? (
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
  const visibleNames = names.slice(0, 5);
  const remainingCount = Math.max(0, names.length - visibleNames.length);
  const summary = `${visibleNames.join(", ")}${
    remainingCount ? ` and ${remainingCount} more` : ""
  } reacted with ${emoji}`;

  return (
    <Tooltip open={open}>
      <TooltipTrigger
        render={
          <MessageReactionChip render={<span role="img" tabIndex={0} />} aria-label={summary}>
            <MessageReactionGlyph emoji={emoji} size={15} />
            <MessageReactionCount>{count}</MessageReactionCount>
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
