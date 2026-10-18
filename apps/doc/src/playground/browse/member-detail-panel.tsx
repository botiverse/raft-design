import { ChevronDown, ChevronLeft, CircleHelp, MessageSquare, Trash2, X } from "lucide-react";
import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  DescriptionDetails,
  DescriptionItem,
  DescriptionList,
  DescriptionTerm,
  PanelAction,
  PanelActions,
  PanelHeading,
  PanelMeta,
  PanelTitle,
  PanelScrollContent,
  PanelScrollViewport,
  ProfilePanel,
  ProfilePanelBody,
  ProfilePanelHeader,
  ProfilePanelHeaderContent,
  ProfilePanelSection,
  SidebarItem,
  SidebarItemAside,
  SidebarItemContent,
  SidebarItemIcon,
  SidebarItemSubtitle,
  SidebarItemTitle,
  Status,
  Text,
} from "@botiverse/raft-ui";
import type { PanelEdge } from "@botiverse/raft-ui";
import { cn } from "@botiverse/raft-ui/cn";

import {
  PLAYGROUND_DIRECT_MESSAGES,
  getPlaygroundActor,
  getPlaygroundHumanProfile,
  getPlaygroundMachine,
} from "../mock/index.ts";
import type { PlaygroundActor, PlaygroundMemberRole } from "../mock/index.ts";
import { PlaygroundConversationLink } from "../navigation/conversation-link.tsx";
import { PLAYGROUND_PRESENCE_STATUS } from "../message/playground-presence.ts";

const roleOrder: readonly PlaygroundMemberRole[] = ["owner", "admin", "member"];

export function MemberDetailPanel({
  actor,
  edge = "inset",
  onBack,
  onClose,
  onSelectActor,
}: {
  actor: PlaygroundActor;
  edge?: PanelEdge;
  onBack: () => void;
  onClose: () => void;
  onSelectActor: (actor: PlaygroundActor) => void;
}) {
  const humanProfile = actor.type === "human" ? getPlaygroundHumanProfile(actor) : null;
  const [role, setRole] = useState<PlaygroundMemberRole>(humanProfile?.role ?? "member");
  const [roleHelpVisible, setRoleHelpVisible] = useState(false);
  const [removed, setRemoved] = useState(false);
  const directMessage = PLAYGROUND_DIRECT_MESSAGES.find(
    (conversation) => conversation.otherActorId === actor.id,
  );
  const machine = actor.machineId ? getPlaygroundMachine(actor.machineId) : null;
  const createdAgents = humanProfile
    ? humanProfile.createdAgentIds.map((actorId) => getPlaygroundActor(actorId))
    : [];
  const handle = humanProfile?.handle ?? actor.id;
  const canChangeRole = !actor.isSelf && !removed;
  const toggleRoleHelp = useCallback(() => setRoleHelpVisible((visible) => !visible), []);
  const handleRemove = useCallback(() => setRemoved(true), []);

  return (
    <ProfilePanel edge={edge}>
      <ProfilePanelHeader>
        <Button
          variant="outline"
          size="icon-sm"
          className="md:hidden"
          aria-label="Back to Members"
          onClick={onBack}
        >
          <ChevronLeft aria-hidden />
        </Button>
        <Avatar size="md" type={actor.type}>
          {actor.avatarSrc ? <AvatarImage src={actor.avatarSrc} alt="" /> : null}
          <AvatarFallback>{actor.fallback}</AvatarFallback>
        </Avatar>
        <ProfilePanelHeaderContent>
          <PanelHeading>
            <PanelTitle>{actor.name}</PanelTitle>
          </PanelHeading>
          <PanelMeta>@{handle}</PanelMeta>
        </ProfilePanelHeaderContent>
        <PanelActions>
          {directMessage ? (
            <PanelAction
              aria-label={`Message ${actor.name}`}
              render={<PlaygroundConversationLink conversation={directMessage} />}
            >
              <MessageSquare aria-hidden />
            </PanelAction>
          ) : (
            <PanelAction aria-label={`No direct message available for ${actor.name}`} disabled>
              <MessageSquare aria-hidden />
            </PanelAction>
          )}
          <PanelAction
            className="max-md:hidden"
            aria-label="Close member details"
            onClick={onClose}
          >
            <X aria-hidden />
          </PanelAction>
        </PanelActions>
      </ProfilePanelHeader>

      <ProfilePanelBody>
        <PanelScrollViewport>
          <PanelScrollContent>
            <ProfilePanelSection className="flex items-start gap-4 border-t-0 py-5">
              <Avatar size="xl" type={actor.type}>
                {actor.avatarSrc ? <AvatarImage src={actor.avatarSrc} alt="" /> : null}
                <AvatarFallback>{actor.fallback}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 pt-1">
                <div className="flex min-w-0 items-center gap-2">
                  <Text.Heading level={6} render={<h1>{actor.name}</h1>} className="truncate" />
                  {actor.isSelf ? (
                    <Text.Sans
                      render={<span />}
                      size="caption"
                      variant="placeholder"
                      className="shrink-0"
                    >
                      (you)
                    </Text.Sans>
                  ) : null}
                  {removed ? (
                    <Badge appearance="solid" variant="muted">
                      Removed
                    </Badge>
                  ) : null}
                </div>
                <Text.Mono size="meta" className="truncate">
                  @{handle}
                </Text.Mono>
              </div>
            </ProfilePanelSection>

            <MemberDetailSection title="Description" compactTitle>
              {actor.description ? (
                <Text.Sans size="small" variant="default">
                  {actor.description}
                </Text.Sans>
              ) : (
                <Text.Sans size="small" variant="placeholder" className="italic">
                  No description
                </Text.Sans>
              )}
            </MemberDetailSection>

            <MemberDetailSection title="Info">
              <DescriptionList className="grid gap-3">
                {humanProfile ? (
                  <>
                    <DescriptionItem>
                      <DescriptionTerm>
                        Role
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          className="text-foreground-muted"
                          aria-label="Explain member roles"
                          aria-pressed={roleHelpVisible}
                          onClick={toggleRoleHelp}
                        >
                          <CircleHelp aria-hidden />
                        </Button>
                      </DescriptionTerm>
                      <DescriptionDetails className="grid justify-items-start gap-1.5">
                        <Badge
                          render={
                            canChangeRole ? (
                              <button
                                type="button"
                                aria-label={`Change role from ${role}`}
                                onClick={() => {
                                  const currentIndex = roleOrder.indexOf(role);
                                  setRole(
                                    roleOrder[(currentIndex + 1) % roleOrder.length] ?? "member",
                                  );
                                }}
                              />
                            ) : undefined
                          }
                          appearance="outline"
                          variant={removed ? "muted" : "default"}
                          className={cn(
                            canChangeRole &&
                              "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-line-strong focus-visible:ring-offset-1",
                          )}
                        >
                          {removed ? "Removed" : role[0]?.toUpperCase() + role.slice(1)}
                          {canChangeRole ? <ChevronDown aria-hidden className="size-3" /> : null}
                        </Badge>
                        {roleHelpVisible ? (
                          <span className="max-w-xs text-xs text-foreground-muted" role="status">
                            Owners manage the workspace; admins manage members; members collaborate.
                          </span>
                        ) : null}
                      </DescriptionDetails>
                    </DescriptionItem>
                    <DescriptionItem>
                      <DescriptionTerm>Email</DescriptionTerm>
                      <DescriptionDetails className="break-all font-mono">
                        {humanProfile.email}
                      </DescriptionDetails>
                    </DescriptionItem>
                    <DescriptionItem>
                      <DescriptionTerm>Joined</DescriptionTerm>
                      <DescriptionDetails className="font-mono">
                        {humanProfile.joinedAt}
                      </DescriptionDetails>
                    </DescriptionItem>
                  </>
                ) : (
                  <>
                    <DescriptionItem>
                      <DescriptionTerm>Type</DescriptionTerm>
                      <DescriptionDetails className="capitalize">{actor.type}</DescriptionDetails>
                    </DescriptionItem>
                    {machine ? (
                      <DescriptionItem>
                        <DescriptionTerm>Computer</DescriptionTerm>
                        <DescriptionDetails>{machine.name}</DescriptionDetails>
                      </DescriptionItem>
                    ) : null}
                    {actor.presence ? (
                      <DescriptionItem>
                        <DescriptionTerm>Status</DescriptionTerm>
                        <DescriptionDetails className="capitalize">
                          {actor.presence}
                        </DescriptionDetails>
                      </DescriptionItem>
                    ) : null}
                  </>
                )}
              </DescriptionList>
            </MemberDetailSection>

            {humanProfile ? (
              <MemberDetailSection title="Created agents" count={createdAgents.length}>
                {createdAgents.length > 0 ? (
                  <div className="grid gap-2">
                    {createdAgents.map((createdAgent) => (
                      <CreatedAgentItem
                        key={createdAgent.id}
                        agent={createdAgent}
                        onSelectActor={onSelectActor}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm italic text-foreground-hint">No created agents</p>
                )}
              </MemberDetailSection>
            ) : null}

            {humanProfile && !actor.isSelf && !removed ? (
              <MemberDetailSection title="Actions">
                <AlertDialog>
                  <AlertDialogTrigger
                    render={<Button variant="danger" size="lg" className="w-full" />}
                  >
                    <Trash2 data-icon="inline-start" aria-hidden />
                    Remove Member
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Member</AlertDialogTitle>
                      <AlertDialogClose />
                    </AlertDialogHeader>
                    <AlertDialogBody>
                      <p className="m-0 text-sm leading-5 text-foreground-muted">
                        Remove <strong className="text-foreground">{actor.name}</strong> from this
                        mock workspace?
                      </p>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                      <AlertDialogCancel size="md">Cancel</AlertDialogCancel>
                      <AlertDialogClose variant="danger" size="md" onClick={handleRemove}>
                        Remove Member
                      </AlertDialogClose>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </MemberDetailSection>
            ) : null}
          </PanelScrollContent>
        </PanelScrollViewport>
      </ProfilePanelBody>
    </ProfilePanel>
  );
}

function MemberDetailSection({
  children,
  compactTitle = false,
  count,
  title,
}: {
  children: ReactNode;
  compactTitle?: boolean;
  count?: number;
  title: string;
}) {
  return (
    <ProfilePanelSection>
      <Text.Mono
        render={
          <h2>
            {title}
            {count === undefined ? null : (
              <span className="font-mono text-foreground-hint">{count}</span>
            )}
          </h2>
        }
        size="eyebrow"
        className={cn("flex items-baseline gap-2", compactTitle ? "mb-1" : "mb-3")}
      />
      {children}
    </ProfilePanelSection>
  );
}

function CreatedAgentItem({
  agent,
  onSelectActor,
}: {
  agent: PlaygroundActor;
  onSelectActor: (actor: PlaygroundActor) => void;
}) {
  const presence = agent.presence ? PLAYGROUND_PRESENCE_STATUS[agent.presence] : null;
  const handleClick = useCallback(() => onSelectActor(agent), [agent, onSelectActor]);

  return (
    <SidebarItem onClick={handleClick}>
      <SidebarItemIcon className="size-8">
        <Avatar size="sm" type="agent">
          {agent.avatarSrc ? <AvatarImage src={agent.avatarSrc} alt="" /> : null}
          <AvatarFallback>{agent.fallback}</AvatarFallback>
        </Avatar>
      </SidebarItemIcon>
      <SidebarItemContent>
        <SidebarItemTitle>{agent.name}</SidebarItemTitle>
        <SidebarItemSubtitle>{agent.meta}</SidebarItemSubtitle>
      </SidebarItemContent>
      {presence ? (
        <SidebarItemAside>
          <Status aria-label={presence.label} size="md" variant={presence.variant} />
        </SidebarItemAside>
      ) : null}
    </SidebarItem>
  );
}
