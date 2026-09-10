import { GitBranch, Monitor, Users } from "lucide-react";
import type { ReactNode } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  SidebarBody,
  SidebarContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarHeaderTitle,
  SidebarItem,
  SidebarItemAside,
  SidebarItemContent,
  SidebarItemIcon,
  SidebarItemStatus,
  SidebarItemSubtitle,
  SidebarItemTitle,
  SidebarList,
  SidebarRoot,
  SidebarSection,
  SidebarSectionChevron,
  SidebarSectionCount,
  SidebarSectionDisclosure,
  SidebarSectionHeader,
  SidebarSectionTitle,
  ConversationPanelBody,
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  Status,
} from "raft-ui";

import { PLAYGROUND_ACTORS, PLAYGROUND_MACHINES, getPlaygroundMachine } from "../mock/index.ts";
import type { PlaygroundActor } from "../mock/index.ts";
import { PLAYGROUND_PRESENCE_STATUS } from "../message/playground-presence.ts";
import { getSelectedMember, memberDetailId } from "./member-selection.ts";

const agents: readonly PlaygroundActor[] = PLAYGROUND_ACTORS.filter(
  (actor) => actor.type === "agent",
);
const humans: readonly PlaygroundActor[] = PLAYGROUND_ACTORS.filter(
  (actor) => actor.type === "human",
);

type AgentGroup = {
  machineId: string;
  machineName: string;
  agents: readonly PlaygroundActor[];
};

const agentGroups = agents.reduce<AgentGroup[]>((groups, agent) => {
  const machineId = agent.machineId ?? "unassigned";
  const existingGroup = groups.find((group) => group.machineId === machineId);
  if (existingGroup) {
    existingGroup.agents = [...existingGroup.agents, agent];
    return groups;
  }

  groups.push({
    machineId,
    machineName: agent.machineId ? getPlaygroundMachine(agent.machineId).name : "No computer",
    agents: [agent],
  });
  return groups;
}, []);

export function MembersSidebar({
  selectedId,
  onSelect,
}: {
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <SidebarRoot>
      <SidebarHeader>
        <SidebarHeaderTitle>Members</SidebarHeaderTitle>
      </SidebarHeader>
      <SidebarBody>
        <SidebarContent>
          <SidebarItem active={selectedId === "graph"} onClick={() => onSelect("graph")}>
            <SidebarItemIcon aria-hidden>
              <GitBranch />
            </SidebarItemIcon>
            <SidebarItemTitle>Graph</SidebarItemTitle>
          </SidebarItem>

          <SidebarSection>
            <SidebarSectionHeader>
              <SidebarSectionDisclosure>
                <SidebarSectionChevron />
                <SidebarSectionTitle>Agents</SidebarSectionTitle>
                <SidebarSectionCount>{agents.length}</SidebarSectionCount>
              </SidebarSectionDisclosure>
            </SidebarSectionHeader>
            <SidebarList>
              {agentGroups.map((group) => (
                <div key={group.machineId}>
                  <SidebarGroupLabel
                    className={[
                      "mt-1.5 mb-0.5 flex w-full items-center gap-1.5 py-0",
                      "border-2 border-transparent px-2",
                      "text-[10px] font-mono font-normal tracking-normal lowercase text-foreground-icon select-none",
                      "[[data-theme=elegant]_&]:-mx-[var(--sidebar-row-inset-x,6px)]",
                      "[[data-theme=elegant]_&]:w-[calc(100%+12px)]",
                      "[[data-theme=elegant]_&]:border",
                      "[[data-theme=elegant]_&]:px-[var(--sidebar-row-inset-x,6px)]",
                    ].join(" ")}
                  >
                    <SidebarItemIcon aria-hidden>
                      <Monitor />
                    </SidebarItemIcon>
                    <span className="truncate">{group.machineName}</span>
                  </SidebarGroupLabel>
                  {group.agents.map((agent) => (
                    <MemberSidebarItem
                      key={agent.id}
                      actor={agent}
                      active={selectedId === memberDetailId.agent(agent.id)}
                      onSelect={() => onSelect(memberDetailId.agent(agent.id))}
                    />
                  ))}
                </div>
              ))}
            </SidebarList>
          </SidebarSection>

          <SidebarSection>
            <SidebarSectionHeader>
              <SidebarSectionDisclosure>
                <SidebarSectionChevron />
                <SidebarSectionTitle>Humans</SidebarSectionTitle>
                <SidebarSectionCount>{humans.length}</SidebarSectionCount>
              </SidebarSectionDisclosure>
            </SidebarSectionHeader>
            <SidebarList>
              {humans.map((human) => (
                <MemberSidebarItem
                  key={human.id}
                  actor={human}
                  active={selectedId === memberDetailId.human(human.id)}
                  onSelect={() => onSelect(memberDetailId.human(human.id))}
                />
              ))}
            </SidebarList>
          </SidebarSection>
        </SidebarContent>
      </SidebarBody>
    </SidebarRoot>
  );
}

function MemberSidebarItem({
  actor,
  active,
  onSelect,
}: {
  actor: PlaygroundActor;
  active: boolean;
  onSelect: () => void;
}) {
  const presence = actor.presence ? PLAYGROUND_PRESENCE_STATUS[actor.presence] : null;

  return (
    <SidebarItem active={active} onClick={onSelect}>
      <SidebarItemIcon>
        <Avatar size="2xs" type={actor.type}>
          {actor.avatarSrc ? <AvatarImage src={actor.avatarSrc} alt="" /> : null}
          <AvatarFallback>{actor.fallback}</AvatarFallback>
        </Avatar>
      </SidebarItemIcon>
      <SidebarItemContent>
        <SidebarItemTitle>
          {actor.name}
          {actor.isSelf ? (
            <span className="ml-1 font-normal text-foreground-icon">(you)</span>
          ) : null}
        </SidebarItemTitle>
        <SidebarItemSubtitle>{actor.description ?? actor.meta}</SidebarItemSubtitle>
      </SidebarItemContent>
      {actor.type === "agent" && presence ? (
        <SidebarItemAside>
          <SidebarItemStatus>
            <Status aria-label={presence.label} variant={presence.variant} pulse={presence.pulse} />
          </SidebarItemStatus>
        </SidebarItemAside>
      ) : null}
    </SidebarItem>
  );
}

export function MembersDetailView({ selectedId }: { selectedId?: string }) {
  const selected = getSelectedMember(selectedId);

  if (selectedId === "graph") {
    return (
      <MemberDetailLayout icon={<GitBranch aria-hidden />} title="Member graph">
        Explore how {humans.length} humans and {agents.length} agents are connected across{" "}
        {PLAYGROUND_MACHINES.length} computers in this workspace.
      </MemberDetailLayout>
    );
  }

  if (!selected) {
    return (
      <MemberDetailLayout icon={<Users aria-hidden />} title="Members">
        Select a human or agent to inspect their identity, presence, description, and computer.
      </MemberDetailLayout>
    );
  }

  return (
    <MemberDetailLayout icon={<Users aria-hidden />} title={selected.name}>
      Select the member again to open their full profile.
    </MemberDetailLayout>
  );
}

function MemberDetailLayout({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <ConversationPanelBody>
      <EmptyState className="min-h-full">
        <EmptyStateContent>
          <EmptyStateIcon>{icon}</EmptyStateIcon>
          <EmptyStateTitle>{title}</EmptyStateTitle>
          <EmptyStateDescription>{children}</EmptyStateDescription>
        </EmptyStateContent>
      </EmptyState>
    </ConversationPanelBody>
  );
}
