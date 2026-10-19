import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
  PreviewCard,
  PreviewCardContent,
  PreviewCardDescription,
  PreviewCardHeader,
  PreviewCardSeparator,
  PreviewCardTitle,
  PreviewCardTrigger,
  Status,
  cn,
  MessageItemAvatarSlot,
} from "@botiverse/raft-ui";
import type { StatusProps } from "@botiverse/raft-ui";
import { User } from "lucide-react";
import type { ReactNode } from "react";

import { getPlaygroundActor } from "../mock/index.ts";
import type { PlaygroundActorId } from "../mock/index.ts";
import { PLAYGROUND_PRESENCE_STATUS } from "./playground-presence.ts";

const USER_ICON_STYLE = { width: "1rem", height: "1rem" };

export type PlaygroundAvatarVariant = "member" | "agent";

export type PlaygroundAgentStatus =
  | "online"
  | "idle"
  | "thinking"
  | "working"
  | "error"
  | "offline"
  | "external";

const STATUS_CONFIG: Record<
  PlaygroundAgentStatus,
  { variant: NonNullable<StatusProps["variant"]> }
> = {
  online: PLAYGROUND_PRESENCE_STATUS.online,
  idle: PLAYGROUND_PRESENCE_STATUS.idle,
  thinking: { variant: "primary" },
  working: PLAYGROUND_PRESENCE_STATUS.working,
  error: { variant: "warning" },
  offline: PLAYGROUND_PRESENCE_STATUS.offline,
  external: { variant: "information" },
};

const STATUS_LABEL: Record<PlaygroundAgentStatus, string> = {
  online: PLAYGROUND_PRESENCE_STATUS.online.label,
  idle: PLAYGROUND_PRESENCE_STATUS.idle.label,
  thinking: "Thinking…",
  working: PLAYGROUND_PRESENCE_STATUS.working.label,
  error: "Error",
  offline: PLAYGROUND_PRESENCE_STATUS.offline.label,
  external: "External",
};

const PROFILE_ACTIVITY_ROWS: {
  time: string;
  status: { variant: NonNullable<StatusProps["variant"]> };
  text: string;
}[] = [
  {
    time: "08:32:14",
    status: { variant: "primary" },
    text: "Running visual regression suite",
  },
  { time: "08:31:02", status: { variant: "information" }, text: "Read tokens/colors.css" },
  {
    time: "08:30:41",
    status: { variant: "primary" },
    text: "Thinking about token contract",
  },
];

const MUTED_META = "truncate font-mono text-xs text-foreground-muted";

function PlaygroundAvatarContent({
  actorId,
  children,
}: {
  actorId: PlaygroundActorId;
  children?: ReactNode;
}) {
  const actor = getPlaygroundActor(actorId);
  const isAgent = actor.type === "agent";
  if (actor.avatarSrc) return <AvatarImage src={actor.avatarSrc} alt="" />;
  return (
    <AvatarFallback>{isAgent ? undefined : (children ?? <User aria-hidden />)}</AvatarFallback>
  );
}

// Profile hover-card body — composed with PreviewCard slots (same anatomy as
// docs PreviewCardMentionComposition). Agent variant adds status + recent activity.
export function ProfileCardBody({
  actorId,
  status = "offline",
}: {
  actorId: PlaygroundActorId;
  status?: PlaygroundAgentStatus;
}) {
  const actor = getPlaygroundActor(actorId);
  const isAgent = actor.type === "agent";
  const handle = `@${actor.id}`;
  return (
    <>
      <PreviewCardHeader>
        <Avatar size="lg" type={isAgent ? "agent" : "human"}>
          <PlaygroundAvatarContent actorId={actorId} />
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <PreviewCardTitle>{actor.name}</PreviewCardTitle>
            {isAgent ? (
              <>
                <Status aria-hidden size="sm" variant={STATUS_CONFIG[status].variant} />
                <span className={MUTED_META}>{STATUS_LABEL[status]}</span>
              </>
            ) : null}
          </div>
          <div className={MUTED_META}>{handle}</div>
        </div>
      </PreviewCardHeader>
      {actor.meta ? (
        <>
          <PreviewCardSeparator />
          <PreviewCardDescription title={actor.meta}>{actor.meta}</PreviewCardDescription>
        </>
      ) : null}
      {isAgent ? (
        <>
          <PreviewCardSeparator />
          <div className="px-3 py-2">
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-foreground-muted">
              Recent activity
            </div>
            <div className="stack-y-1.5">
              {PROFILE_ACTIVITY_ROWS.map((row) => (
                <div
                  key={row.time}
                  className="flex min-w-0 items-center gap-1.5 overflow-hidden text-xs"
                >
                  <span className="shrink-0 whitespace-nowrap font-mono text-[10px] text-foreground-muted">
                    {row.time}
                  </span>
                  <Status aria-hidden size="sm" variant={row.status.variant} className="shrink-0" />
                  <span className="min-w-0 flex-1 truncate text-foreground/70" title={row.text}>
                    {row.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}

/**
 * Message-row avatar with source-parity profile PreviewCard on hover.
 * PreviewCard is composed at the call site (not inside Avatar) — the same pattern
 * the Raft web app uses for message rows, mentions and member lists.
 */
export function PlaygroundMessageAvatar({
  actorId,
  status = "offline",
  deactivated,
}: {
  actorId: PlaygroundActorId;
  status?: PlaygroundAgentStatus;
  deactivated?: boolean;
}) {
  const actor = getPlaygroundActor(actorId);
  const isAgent = actor.type === "agent";

  const avatar = (
    <Avatar
      size="md"
      type={isAgent ? "agent" : "human"}
      className={cn(deactivated && "opacity-60 grayscale")}
    >
      <PlaygroundAvatarContent actorId={actorId}>
        <User aria-hidden size={16} style={USER_ICON_STYLE} />
      </PlaygroundAvatarContent>
      {isAgent && !deactivated ? (
        <AvatarBadge
          title={STATUS_LABEL[status]}
          render={<Status aria-hidden variant={STATUS_CONFIG[status].variant} />}
        />
      ) : null}
    </Avatar>
  );

  // Deactivated / removed senders have no profile card in source.
  if (deactivated) {
    return <MessageItemAvatarSlot>{avatar}</MessageItemAvatarSlot>;
  }

  return (
    <MessageItemAvatarSlot>
      <PreviewCard>
        <PreviewCardTrigger delay={200} closeDelay={120} render={<button type="button" />}>
          {avatar}
        </PreviewCardTrigger>
        <PreviewCardContent sideOffset={6} collisionPadding={6} className="w-[17.5rem]">
          <ProfileCardBody actorId={actorId} status={status} />
        </PreviewCardContent>
      </PreviewCard>
    </MessageItemAvatarSlot>
  );
}
