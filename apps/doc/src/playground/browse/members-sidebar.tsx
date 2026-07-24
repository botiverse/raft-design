import { GitBranch, Monitor, Users } from "lucide-react";
import type { ReactNode } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  ChatSidebarBody,
  ChatSidebarContent,
  ChatSidebarHeader,
  ChatSidebarHeaderTitle,
  ChatSidebarItem,
  ChatSidebarItemAside,
  ChatSidebarItemContent,
  ChatSidebarItemIcon,
  ChatSidebarItemStatus,
  ChatSidebarItemSubtitle,
  ChatSidebarItemTitle,
  ChatSidebarList,
  ChatSidebarRoot,
  ChatSidebarSection,
  ChatSidebarSectionChevron,
  ChatSidebarSectionCount,
  ChatSidebarSectionDisclosure,
  ChatSidebarSectionHeader,
  ChatSidebarSectionTitle,
  ConversationPanelBody,
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  Status,
} from "raft-ui";

import {
  PLAYGROUND_ACTORS,
  PLAYGROUND_MACHINES,
  getPlaygroundMachine,
  type PlaygroundActor,
} from "../mock/index.ts";
import { PLAYGROUND_PRESENCE_STATUS } from "../message/playground-presence.ts";

const agents: readonly PlaygroundActor[] = PLAYGROUND_ACTORS.filter(
  (actor) => actor.type === "agent",
);
const humans: readonly PlaygroundActor[] = PLAYGROUND_ACTORS.filter(
  (actor) => actor.type === "human",
);

const memberDetailId = {
  agent: (id: string) => `agent:${id}`,
  human: (id: string) => `human:${id}`,
} as const;

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
    <ChatSidebarRoot>
      <ChatSidebarHeader>
        <ChatSidebarHeaderTitle>Members</ChatSidebarHeaderTitle>
      </ChatSidebarHeader>
      <ChatSidebarBody>
        <ChatSidebarContent>
          <ChatSidebarItem active={selectedId === "graph"} onClick={() => onSelect("graph")}>
            <ChatSidebarItemIcon aria-hidden>
              <GitBranch />
            </ChatSidebarItemIcon>
            <ChatSidebarItemTitle>Graph</ChatSidebarItemTitle>
          </ChatSidebarItem>

          <ChatSidebarSection>
            <ChatSidebarSectionHeader>
              <ChatSidebarSectionDisclosure>
                <ChatSidebarSectionChevron />
                <ChatSidebarSectionTitle>Agents</ChatSidebarSectionTitle>
                <ChatSidebarSectionCount>{agents.length}</ChatSidebarSectionCount>
              </ChatSidebarSectionDisclosure>
            </ChatSidebarSectionHeader>
            <ChatSidebarList>
              {agentGroups.map((group) => (
                <div key={group.machineId}>
                  <div
                    className={[
                      "mt-1.5 mb-0.5 flex w-full items-center gap-1.5",
                      "border-2 border-transparent px-2",
                      "text-[10px] font-mono lowercase text-foreground-icon select-none",
                      "[[data-theme=elegant]_&]:-mx-[var(--sidebar-row-inset-x,6px)]",
                      "[[data-theme=elegant]_&]:w-[calc(100%+12px)]",
                      "[[data-theme=elegant]_&]:border",
                      "[[data-theme=elegant]_&]:px-[var(--sidebar-row-inset-x,6px)]",
                    ].join(" ")}
                  >
                    <ChatSidebarItemIcon aria-hidden>
                      <Monitor />
                    </ChatSidebarItemIcon>
                    <span className="truncate">{group.machineName}</span>
                  </div>
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
            </ChatSidebarList>
          </ChatSidebarSection>

          <ChatSidebarSection>
            <ChatSidebarSectionHeader>
              <ChatSidebarSectionDisclosure>
                <ChatSidebarSectionChevron />
                <ChatSidebarSectionTitle>Humans</ChatSidebarSectionTitle>
                <ChatSidebarSectionCount>{humans.length}</ChatSidebarSectionCount>
              </ChatSidebarSectionDisclosure>
            </ChatSidebarSectionHeader>
            <ChatSidebarList>
              {humans.map((human) => (
                <MemberSidebarItem
                  key={human.id}
                  actor={human}
                  active={selectedId === memberDetailId.human(human.id)}
                  onSelect={() => onSelect(memberDetailId.human(human.id))}
                />
              ))}
            </ChatSidebarList>
          </ChatSidebarSection>
        </ChatSidebarContent>
      </ChatSidebarBody>
    </ChatSidebarRoot>
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
    <ChatSidebarItem active={active} onClick={onSelect}>
      <ChatSidebarItemIcon>
        <Avatar size="2xs" type={actor.type}>
          {actor.avatarSrc ? <AvatarImage src={actor.avatarSrc} alt="" /> : null}
          <AvatarFallback>{actor.fallback}</AvatarFallback>
        </Avatar>
      </ChatSidebarItemIcon>
      <ChatSidebarItemContent>
        <ChatSidebarItemTitle>
          {actor.name}
          {actor.isSelf ? (
            <span className="ml-1 font-normal text-foreground-icon">(you)</span>
          ) : null}
        </ChatSidebarItemTitle>
        <ChatSidebarItemSubtitle>{actor.description ?? actor.meta}</ChatSidebarItemSubtitle>
      </ChatSidebarItemContent>
      {actor.type === "agent" && presence ? (
        <ChatSidebarItemAside>
          <ChatSidebarItemStatus className="right-[calc(100%+4px)]">
            <Status
              aria-label={presence.label}
              size="sm"
              variant={presence.variant}
              pulse={presence.pulse}
            />
          </ChatSidebarItemStatus>
        </ChatSidebarItemAside>
      ) : null}
    </ChatSidebarItem>
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

  const presence = selected.presence ? PLAYGROUND_PRESENCE_STATUS[selected.presence] : null;
  const machine = selected.machineId ? getPlaygroundMachine(selected.machineId) : null;

  return (
    <ConversationPanelBody>
      <div className="flex h-full items-center justify-center p-6">
        <section className="w-full max-w-md rounded-lg border border-line-subtle bg-layer-panel p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Avatar size="lg" type={selected.type}>
              {selected.avatarSrc ? <AvatarImage src={selected.avatarSrc} alt="" /> : null}
              <AvatarFallback>{selected.fallback}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-semibold text-foreground-strong">
                {selected.name}
                {selected.isSelf ? (
                  <span className="ml-1 font-normal text-foreground-muted">(you)</span>
                ) : null}
              </h2>
              <p className="text-sm capitalize text-foreground-muted">{selected.type}</p>
            </div>
            {presence ? (
              <div className="flex items-center gap-2 text-sm text-foreground-muted">
                <Status variant={presence.variant} pulse={presence.pulse} />
                {presence.label}
              </div>
            ) : null}
          </div>
          <dl className="mt-6 grid gap-4 text-sm">
            <MemberDetailRow label="Description" value={selected.description ?? selected.meta} />
            <MemberDetailRow label="Handle" value={`@${selected.id}`} />
            {machine ? <MemberDetailRow label="Computer" value={machine.name} /> : null}
          </dl>
        </section>
      </div>
    </ConversationPanelBody>
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

function MemberDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-3 border-t border-line-subtle pt-4 first:border-t-0 first:pt-0">
      <dt className="text-foreground-icon">{label}</dt>
      <dd className="min-w-0 truncate text-foreground">{value}</dd>
    </div>
  );
}

function getSelectedMember(selectedId?: string): PlaygroundActor | undefined {
  if (!selectedId) return undefined;
  const separator = selectedId.indexOf(":");
  if (separator < 0) return undefined;
  const type = selectedId.slice(0, separator);
  const id = selectedId.slice(separator + 1);
  if (type !== "agent" && type !== "human") return undefined;
  return PLAYGROUND_ACTORS.find((actor) => actor.type === type && actor.id === id);
}
