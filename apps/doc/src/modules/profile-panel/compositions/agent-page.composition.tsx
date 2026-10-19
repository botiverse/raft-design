import {
  Activity,
  Archive,
  BellRing,
  Blocks,
  Bot,
  Copy,
  Cpu,
  FolderOpen,
  Link2,
  MessageSquare,
  RotateCcw,
  Square,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  Avatar,
  Badge,
  Button,
  ConversationPanelTabs,
  DescriptionDetails,
  DescriptionItem,
  DescriptionList,
  DescriptionTerm,
  PanelAction,
  PanelActions,
  PanelBody,
  PanelHeading,
  PanelMeta,
  PanelScrollContent,
  PanelScrollViewport,
  PanelTitle,
  ProfilePanel,
  ProfilePanelHeader,
  ProfilePanelHeaderContent,
  ProfilePanelSection,
  Status,
  Tabs,
  TabsLabel,
  TabsList,
  TabsTab,
  Text,
} from "@botiverse/raft-ui";

export function AgentPageComposition() {
  return (
    <ProfilePanel>
      <ProfilePanelHeader>
        <Avatar size="md" type="agent" />
        <ProfilePanelHeaderContent>
          <PanelHeading>
            <PanelTitle>Bugen</PanelTitle>
          </PanelHeading>
          <PanelMeta>@bugen</PanelMeta>
        </ProfilePanelHeaderContent>
        <PanelActions>
          <PanelAction nativeButton={false} render={<span aria-hidden />}>
            <MessageSquare />
          </PanelAction>
          <PanelAction nativeButton={false} render={<span aria-hidden />}>
            <Square />
          </PanelAction>
          <PanelAction nativeButton={false} render={<span aria-hidden />}>
            <RotateCcw />
          </PanelAction>
          <PanelAction nativeButton={false} render={<span aria-hidden />}>
            <X />
          </PanelAction>
        </PanelActions>
      </ProfilePanelHeader>

      <ConversationPanelTabs render={<Tabs defaultValue="profile" />}>
        <TabsList aria-label="Bugen">
          <TabsTab value="profile">
            <Bot />
            <TabsLabel>Profile</TabsLabel>
          </TabsTab>
          <TabsTab value="activity">
            <Activity />
            <TabsLabel>Activity</TabsLabel>
          </TabsTab>
          <TabsTab value="chat">
            <MessageSquare />
            <TabsLabel>Chat</TabsLabel>
          </TabsTab>
          <TabsTab value="reminders">
            <BellRing />
            <TabsLabel>Reminders</TabsLabel>
          </TabsTab>
          <TabsTab value="workspace">
            <FolderOpen />
            <TabsLabel>Workspace</TabsLabel>
          </TabsTab>
          <TabsTab value="apps">
            <Link2 />
            <TabsLabel>Apps</TabsLabel>
          </TabsTab>
          <TabsTab value="mcp">
            <Blocks />
            <TabsLabel>MCP</TabsLabel>
          </TabsTab>
        </TabsList>
      </ConversationPanelTabs>

      <PanelBody>
        <PanelScrollViewport>
          <PanelScrollContent>
            <ProfilePanelSection className="flex items-start gap-4 border-t-0 py-5">
              <Avatar size="xl" type="agent" />
              <div className="min-w-0 flex-1 pt-1">
                <Text.Heading level={6} render={<h2>Bugen</h2>} className="truncate" />
                <Text.Mono size="meta" className="truncate">
                  @bugen
                </Text.Mono>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Badge appearance="outline">Agent</Badge>
                  <Badge appearance="soft" variant="information">
                    <Cpu aria-hidden />
                    Claude Code
                  </Badge>
                </div>
                <div className="mt-1.5">
                  <Badge appearance="soft" variant="primary">
                    <Status aria-hidden presence="busy" />
                    Working…
                  </Badge>
                </div>
              </div>
            </ProfilePanelSection>

            <AgentPageSection title="Description">
              <Text.Sans size="small">Writes and reviews the launch-week release notes.</Text.Sans>
            </AgentPageSection>

            <AgentPageSection title="Info">
              <DescriptionList>
                <DescriptionItem>
                  <DescriptionTerm>Role</DescriptionTerm>
                  <DescriptionDetails>Writer</DescriptionDetails>
                </DescriptionItem>
                <DescriptionItem>
                  <DescriptionTerm>Computer</DescriptionTerm>
                  <DescriptionDetails>Martin's MacBook</DescriptionDetails>
                </DescriptionItem>
                <DescriptionItem>
                  <DescriptionTerm>Created</DescriptionTerm>
                  <DescriptionDetails>Oct 2, 2026</DescriptionDetails>
                </DescriptionItem>
                <DescriptionItem>
                  <DescriptionTerm>Creator</DescriptionTerm>
                  <DescriptionDetails>Martin</DescriptionDetails>
                </DescriptionItem>
              </DescriptionList>
            </AgentPageSection>

            <AgentPageSection title="Actions">
              <div className="flex flex-col gap-2">
                <Button
                  nativeButton={false}
                  render={<span />}
                  className="w-full"
                  size="lg"
                  variant="outline"
                >
                  <Square data-icon="inline-start" aria-hidden />
                  Stop Agent
                </Button>
                <Button
                  nativeButton={false}
                  render={<span />}
                  className="w-full"
                  size="lg"
                  variant="outline"
                >
                  <RotateCcw data-icon="inline-start" aria-hidden />
                  Restart / Reset
                </Button>
                <Button
                  nativeButton={false}
                  render={<span />}
                  className="w-full"
                  size="lg"
                  variant="outline"
                >
                  <Copy data-icon="inline-start" aria-hidden />
                  Copy Diagnostic Info
                </Button>
                <Button
                  nativeButton={false}
                  render={<span />}
                  className="w-full"
                  size="lg"
                  variant="danger"
                >
                  <Archive data-icon="inline-start" aria-hidden />
                  Archive Agent
                </Button>
              </div>
            </AgentPageSection>
          </PanelScrollContent>
        </PanelScrollViewport>
      </PanelBody>
    </ProfilePanel>
  );
}

function AgentPageSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <ProfilePanelSection>
      <Text.Sans render={<h3>{title}</h3>} size="small" variant="placeholder" className="mb-3" />
      {children}
    </ProfilePanelSection>
  );
}
