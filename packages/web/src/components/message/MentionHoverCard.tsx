import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { resolveAgentDisplayState, useAgentStore } from "../../store/agentStore";
import { useServerStore } from "../../store/serverStore";
import AvatarSlot from "../ui/AvatarSlot";
import StatusDot from "../ui/StatusDot";
import { useViewportClamp } from "../layout/useViewportClamp";

const CARD_WIDTH = 280;
const CARD_GAP = 6;

interface MentionHoverCardProps {
  anchor: HTMLElement;
  mentionType: "agent" | "user";
  mentionId: string;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}

export default function MentionHoverCard({ anchor, mentionType, mentionId, onPointerEnter, onPointerLeave }: MentionHoverCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(anchor);

  // Keep the triggerRef in sync if the anchor element changes (rare — anchor
  // identity is stable per hover, but be defensive).
  useEffect(() => {
    triggerRef.current = anchor;
  }, [anchor]);

  const agent = useAgentStore((s) => (mentionType === "agent" ? s.agents.find((a) => a.id === mentionId) : undefined));
  const activityState = useAgentStore((s) => (mentionType === "agent" ? s.agentActivities[mentionId] : undefined));
  const displayState = mentionType === "agent" ? resolveAgentDisplayState(agent, activityState) : null;
  const member = useServerStore((s) => (mentionType === "user" ? s.members.find((m) => m.userId === mentionId) : undefined));

  const { style: clampStyle } = useViewportClamp({
    triggerRef,
    popoverRef: cardRef,
    placement: "vertical-smart",
    open: true,
    gutter: CARD_GAP,
  });

  const content = useMemo(() => {
    if (mentionType === "agent") {
      if (!agent) return null;
      const displayName = agent.displayName || agent.name;
      return (
        <>
          <div className="flex items-start gap-3 px-3 pt-3 pb-2">
            <AvatarSlot context="mention-card" type="agent" agentAvatarUrl={agent.avatarUrl} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-bold text-black">{displayName}</span>
                <StatusDot activity={displayState?.activity ?? "offline"} size="sm" />
                <span className="truncate text-xs text-black/60 font-mono">
                  {displayState?.activityText ?? "Offline"}
                </span>
              </div>
              <div className="truncate font-mono text-xs text-black/60">@{agent.name}</div>
            </div>
          </div>
          {agent.description ? (
            <div className="truncate border-t-2 border-black px-3 py-2 text-xs text-black/70" title={agent.description}>
              {agent.description}
            </div>
          ) : null}
        </>
      );
    }

    if (!member) return null;
    const displayName = member.displayName || member.name;
    return (
      <>
        <div className="flex items-start gap-3 px-3 pt-3 pb-2">
          <AvatarSlot context="mention-card" type="human" humanAvatarUrl={member.avatarUrl} gravatarHash={member.gravatarHash} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold text-black">{displayName}</div>
            <div className="truncate font-mono text-xs text-black/60">@{member.name}</div>
          </div>
        </div>
        {member.description ? (
          <div className="truncate border-t-2 border-black px-3 py-2 text-xs text-black/70" title={member.description}>
            {member.description}
          </div>
        ) : null}
      </>
    );
  }, [mentionType, agent, displayState, member]);

  if (!content) return null;

  const style: React.CSSProperties = {
    ...clampStyle,
    width: CARD_WIDTH,
    zIndex: 60,
  };

  return createPortal(
    <div
      ref={cardRef}
      role="tooltip"
      className="card-brutal overflow-hidden"
      style={style}
      onMouseEnter={onPointerEnter}
      onMouseLeave={onPointerLeave}
    >
      {content}
    </div>,
    document.body
  );
}
