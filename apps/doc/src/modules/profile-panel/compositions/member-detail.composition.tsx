import { ChevronDown, CircleHelp, MessageSquare, Trash2, X } from "lucide-react";
import type { ReactNode } from "react";
import {
  Avatar,
  AvatarFallback,
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
  PanelBody,
  PanelScrollContent,
  PanelScrollViewport,
  SidebarItem,
  SidebarItemAside,
  SidebarItemContent,
  SidebarItemIcon,
  SidebarItemSubtitle,
  SidebarItemTitle,
  Status,
  Text,
} from "raft-ui";
import {
  ProfilePanel,
  ProfilePanelHeader,
  ProfilePanelHeaderContent,
  ProfilePanelSection,
} from "raft-ui/wip";

export function MemberDetailComposition() {
  return (
    <ProfilePanel>
      <ProfilePanelHeader>
        <Avatar size="md" type="human">
          <AvatarFallback>CC</AvatarFallback>
        </Avatar>
        <ProfilePanelHeaderContent>
          <PanelHeading>
            <PanelTitle>CaliCastle</PanelTitle>
          </PanelHeading>
          <PanelMeta>@CaliCastle</PanelMeta>
        </ProfilePanelHeaderContent>
        <PanelActions>
          <PanelAction nativeButton={false} render={<span aria-hidden />}>
            <MessageSquare />
          </PanelAction>
          <PanelAction nativeButton={false} render={<span aria-hidden />}>
            <X />
          </PanelAction>
        </PanelActions>
      </ProfilePanelHeader>

      <PanelBody>
        <PanelScrollViewport>
          <PanelScrollContent>
            <ProfilePanelSection className="flex items-start gap-4 border-t-0 py-5">
              <Avatar size="xl" type="human">
                <AvatarFallback>CC</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 pt-1">
                <Text.Heading
                  level={6}
                  render={<h2>CaliCastle</h2>}
                  className="truncate [[data-theme=brutal]_&]:text-lg [[data-theme=brutal]_&]:font-bold [[data-theme=brutal]_&]:leading-tight"
                />
                <Text.Mono size="meta" className="truncate [[data-theme=brutal]_&]:text-sm">
                  @CaliCastle
                </Text.Mono>
              </div>
            </ProfilePanelSection>

            <MemberDetailSection title="Description" compactTitle>
              <Text.Sans size="small" variant="placeholder" className="italic">
                No description
              </Text.Sans>
            </MemberDetailSection>

            <MemberDetailSection title="Info">
              <DescriptionList className="grid gap-3">
                <DescriptionItem>
                  <DescriptionTerm>
                    Role
                    <CircleHelp
                      className="size-3 shrink-0 text-foreground-icon [[data-theme=brutal]_&]:text-black/35"
                      aria-hidden
                    />
                  </DescriptionTerm>
                  <DescriptionDetails>
                    <Badge appearance="outline">
                      Owner
                      <ChevronDown aria-hidden className="size-3" />
                    </Badge>
                  </DescriptionDetails>
                </DescriptionItem>
                <DescriptionItem>
                  <DescriptionTerm>Email</DescriptionTerm>
                  <DescriptionDetails className="break-all font-mono">
                    cali@zolplay.com
                  </DescriptionDetails>
                </DescriptionItem>
                <DescriptionItem>
                  <DescriptionTerm>Joined</DescriptionTerm>
                  <DescriptionDetails className="font-mono">May 27, 2026</DescriptionDetails>
                </DescriptionItem>
              </DescriptionList>
            </MemberDetailSection>

            <MemberDetailSection title="Created agents" count={1}>
              <SidebarItem
                disabled
                className="[[data-theme=brutal]_&]:border-line-subtle [[data-theme=brutal]_&]:px-3 [[data-theme=brutal]_&]:py-2"
              >
                <SidebarItemIcon className="size-8">
                  <Avatar size="sm" type="agent">
                    <AvatarFallback>DX</AvatarFallback>
                  </Avatar>
                </SidebarItemIcon>
                <SidebarItemContent>
                  <SidebarItemTitle>Dex</SidebarItemTitle>
                  <SidebarItemSubtitle>External agent</SidebarItemSubtitle>
                </SidebarItemContent>
                <SidebarItemAside>
                  <Status aria-label="Online" size="md" variant="success" />
                </SidebarItemAside>
              </SidebarItem>
            </MemberDetailSection>

            <MemberDetailSection title="Actions">
              <Button
                nativeButton={false}
                render={<span />}
                className="w-full"
                size="lg"
                variant="danger"
              >
                <Trash2 data-icon="inline-start" aria-hidden />
                Remove Member
              </Button>
            </MemberDetailSection>
          </PanelScrollContent>
        </PanelScrollViewport>
      </PanelBody>
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
          <h3>
            {title}
            {count === undefined ? null : (
              <span className="font-mono text-foreground-placeholder [[data-theme=brutal]_&]:text-black/40">
                {count}
              </span>
            )}
          </h3>
        }
        size="eyebrow"
        className={[
          "flex items-baseline gap-2",
          "[[data-theme=brutal]_&]:text-xs [[data-theme=brutal]_&]:font-bold [[data-theme=brutal]_&]:tracking-widest [[data-theme=brutal]_&]:text-black/60",
          compactTitle ? "mb-1" : "mb-3",
        ].join(" ")}
      />
      {children}
    </ProfilePanelSection>
  );
}
