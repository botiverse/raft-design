import { useCallback, useEffect, useRef, useState } from "react";
import {
  Tooltip,
  TooltipTrigger,
  MessageReactionChip,
  MessageReactionCount,
  MessageReactionErrorIndicator,
  MessageReactionPickerStatic,
  MessageReactionQuickButton,
  MessageReactionTooltipContent,
  MessageReactionTooltipMeta,
  MessageReactionTooltipName,
  MessageReactionTooltipNames,
  MessageReactionTooltipNameText,
  MessageReactionTooltipSeparator,
} from "@botiverse/raft-ui";

import { MessageReactionGlyphComposition } from "./reaction-glyph.composition.tsx";
import { MESSAGE_QUICK_REACTIONS } from "#/modules/message-item/message-item.fixtures.ts";
export { MESSAGE_QUICK_REACTIONS } from "#/modules/message-item/message-item.fixtures.ts";

export type MessageReactionCompositionProps = {
  count: number;
  emoji: string;
  failed?: boolean;
  reacted?: boolean;
  title?: string;
};

const TOOLTIP_REACTION_NAMES = [
  "Atlas",
  "Ada Lovelace",
  "Grace Hopper",
  "Linus Torvalds",
  "Margaret Hamilton",
];

export function MessageQuickReactionPickerComposition() {
  const [selectedReaction, setSelectedReaction] = useState<string>();

  return (
    <MessageReactionPickerStatic>
      {MESSAGE_QUICK_REACTIONS.map((emoji) => (
        <QuickReactionButton
          key={emoji}
          emoji={emoji}
          selected={selectedReaction === emoji}
          onSelect={setSelectedReaction}
        />
      ))}
    </MessageReactionPickerStatic>
  );
}

function QuickReactionButton({
  emoji,
  selected,
  onSelect,
}: {
  emoji: string;
  selected: boolean;
  onSelect: (emoji: string) => void;
}) {
  const handleClick = useCallback(() => onSelect(emoji), [emoji, onSelect]);

  return (
    <MessageReactionQuickButton
      aria-label={`React with ${emoji}`}
      aria-pressed={selected}
      onClick={handleClick}
    >
      <MessageReactionGlyphComposition emoji={emoji} size={18} />
    </MessageReactionQuickButton>
  );
}

export function MessageReactionOverlaysComposition() {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div ref={setPortalContainer} className="grid w-full grid-cols-2 items-center">
      <div className="justify-self-center">
        <MessageQuickReactionPickerComposition />
      </div>
      <div className="justify-self-center">
        <MessageReactionTooltipComposition
          container={portalContainer}
          count={5}
          emoji="👍"
          names={TOOLTIP_REACTION_NAMES}
          open
        />
      </div>
    </div>
  );
}

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

  const handlePressedChange = useCallback(
    (pressed: boolean) => {
      if (!failed) {
        setReacted(pressed);
        return;
      }

      if (failureTimerRef.current !== null) window.clearTimeout(failureTimerRef.current);
      setFailureFlash(true);
      failureTimerRef.current = window.setTimeout(() => {
        setFailureFlash(false);
        failureTimerRef.current = null;
      }, 400);
    },
    [failed],
  );

  if (count <= 0) return null;

  return (
    <MessageReactionChip
      aria-label={label}
      pressed={reacted}
      title={title ?? label}
      onPressedChange={handlePressedChange}
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
          <MessageReactionChip aria-label={summary} pressed={reacted} onPressedChange={setReacted}>
            <MessageReactionGlyphComposition emoji={emoji} size={15} />
            <MessageReactionCount>{displayedCount}</MessageReactionCount>
          </MessageReactionChip>
        }
      />
      <MessageReactionTooltipContent container={container} side="top">
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
