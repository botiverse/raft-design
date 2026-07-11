import {
  Avatar,
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
  type StatusProps,
} from "raft-ui";
import { User } from "lucide-react";
import { MessageItemAvatarSlot, MessageItemAvatarStatus } from "raft-ui/wip";

import { PLAYGROUND_ACTORS } from "./mock/index.ts";

export type PlaygroundAvatarVariant = "member" | "agent";

export type PlaygroundAgentStatus =
  | "online"
  | "thinking"
  | "working"
  | "error"
  | "offline"
  | "external";

const STATUS_CONFIG: Record<
  PlaygroundAgentStatus,
  { variant: NonNullable<StatusProps["variant"]>; pulse?: boolean }
> = {
  online: { variant: "success" },
  thinking: { variant: "primary", pulse: true },
  working: { variant: "primary", pulse: true },
  error: { variant: "warning" },
  offline: { variant: "default" },
  external: { variant: "information" },
};

const STATUS_LABEL: Record<PlaygroundAgentStatus, string> = {
  online: "Online",
  thinking: "Thinking…",
  working: "Working…",
  error: "Error",
  offline: "Offline",
  external: "External",
};

const PROFILE_ACTIVITY_ROWS: {
  time: string;
  status: { variant: NonNullable<StatusProps["variant"]>; pulse?: boolean };
  text: string;
}[] = [
  {
    time: "08:32:14",
    status: { variant: "primary", pulse: true },
    text: "Running visual regression suite",
  },
  { time: "08:31:02", status: { variant: "information" }, text: "Read tokens/colors.css" },
  {
    time: "08:30:41",
    status: { variant: "primary", pulse: true },
    text: "Thinking about token contract",
  },
];

const MUTED_META = "truncate font-mono text-xs text-foreground-muted";

function PlaygroundAvatarContent({
  sender,
  isAgent,
  compactHumanIcon = false,
}: {
  sender: string;
  isAgent: boolean;
  compactHumanIcon?: boolean;
}) {
  const actor = PLAYGROUND_ACTORS.find((candidate) => candidate.name === sender);
  if (actor && "avatarSrc" in actor && actor.avatarSrc)
    return <AvatarImage src={actor.avatarSrc} alt="" />;
  return (
    <AvatarFallback className={!isAgent && compactHumanIcon ? "[&>svg]:!size-4" : undefined}>
      {isAgent ? undefined : <User aria-hidden />}
    </AvatarFallback>
  );
}

// Profile hover-card body — composed with PreviewCard slots (same anatomy as
// docs PreviewCardMentionComposition). Agent variant adds status + recent activity.
export function ProfileCardBody({
  variant,
  sender,
  meta,
  status = "offline",
}: {
  variant: PlaygroundAvatarVariant;
  sender: string;
  meta?: string;
  status?: PlaygroundAgentStatus;
}) {
  const isAgent = variant === "agent";
  const handle = `@${sender.toLowerCase().replace(/[^a-z0-9]+/g, "")}`;
  return (
    <>
      <PreviewCardHeader>
        <Avatar size="lg" type={isAgent ? "agent" : "human"}>
          <PlaygroundAvatarContent sender={sender} isAgent={isAgent} />
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <PreviewCardTitle>{sender}</PreviewCardTitle>
            {isAgent ? (
              <>
                <Status
                  aria-hidden
                  size="sm"
                  variant={STATUS_CONFIG[status].variant}
                  pulse={STATUS_CONFIG[status].pulse}
                />
                <span className={MUTED_META}>{STATUS_LABEL[status]}</span>
              </>
            ) : null}
          </div>
          <div className={MUTED_META}>{handle}</div>
        </div>
      </PreviewCardHeader>
      {meta ? (
        <>
          <PreviewCardSeparator />
          <PreviewCardDescription title={meta}>{meta}</PreviewCardDescription>
        </>
      ) : null}
      {isAgent ? (
        <>
          <PreviewCardSeparator />
          <div className="px-3 py-2">
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-foreground-muted">
              Recent activity
            </div>
            <div className="space-y-1.5">
              {PROFILE_ACTIVITY_ROWS.map((row) => (
                <div
                  key={row.time}
                  className="flex min-w-0 items-center gap-1.5 overflow-hidden text-xs"
                >
                  <span className="shrink-0 whitespace-nowrap font-mono text-[10px] text-foreground-muted">
                    {row.time}
                  </span>
                  <Status
                    aria-hidden
                    size="sm"
                    variant={row.status.variant}
                    pulse={row.status.pulse}
                    className="shrink-0"
                  />
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
 * PreviewCard is composed at the call site (not inside Avatar) — same pattern as
 * slock MessageItem / MentionLink / MemberGraphSection.
 */
export function PlaygroundMessageAvatar({
  variant,
  status = "offline",
  deactivated,
  sender,
  meta,
}: {
  variant: PlaygroundAvatarVariant;
  status?: PlaygroundAgentStatus;
  deactivated?: boolean;
  sender?: string;
  meta?: string;
}) {
  const isAgent = variant === "agent";

  const avatar = (
    <Avatar
      size="md"
      type={isAgent ? "agent" : "human"}
      className={cn(deactivated && "opacity-60 grayscale")}
    >
      <PlaygroundAvatarContent sender={sender ?? ""} isAgent={isAgent} compactHumanIcon />
      {isAgent && !deactivated ? (
        <MessageItemAvatarStatus
          title={STATUS_LABEL[status]}
          render={
            <Status
              aria-hidden
              size="lg"
              variant={STATUS_CONFIG[status].variant}
              pulse={STATUS_CONFIG[status].pulse}
            />
          }
        />
      ) : null}
    </Avatar>
  );

  // Deactivated / removed senders have no profile card in source.
  if (deactivated || !sender) {
    return <MessageItemAvatarSlot>{avatar}</MessageItemAvatarSlot>;
  }

  return (
    <MessageItemAvatarSlot>
      <PreviewCard>
        <PreviewCardTrigger delay={200} closeDelay={120} render={<button type="button" />}>
          {avatar}
        </PreviewCardTrigger>
        <PreviewCardContent sideOffset={6} collisionPadding={6} className="w-[17.5rem]">
          <ProfileCardBody variant={variant} sender={sender} meta={meta} status={status} />
        </PreviewCardContent>
      </PreviewCard>
    </MessageItemAvatarSlot>
  );
}
