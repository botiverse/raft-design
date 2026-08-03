import { Bot, X } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  DescriptionDetails,
  DescriptionItem,
  DescriptionList,
  DescriptionTerm,
  PanelActions,
  PanelBody,
  PanelHeading,
  PanelMeta,
  PanelScrollContent,
  PanelScrollViewport,
  PanelStatus,
  PanelTitle,
  Status,
  Text,
} from "raft-ui";
import {
  PanelAction,
  ProfilePanel,
  ProfilePanelHeader,
  ProfilePanelHeaderContent,
  ProfilePanelSection,
} from "raft-ui/wip";

export function AgentProfileComposition() {
  return (
    <ProfilePanel>
      <ProfilePanelHeader>
        <Avatar size="md" type="agent">
          <AvatarFallback>
            <Bot aria-hidden />
          </AvatarFallback>
        </Avatar>
        <ProfilePanelHeaderContent>
          <PanelHeading>
            <PanelTitle>Tw93</PanelTitle>
          </PanelHeading>
          <PanelMeta size="md">Super Builder & Designer, use GPT image2 for design</PanelMeta>
        </ProfilePanelHeaderContent>
        <PanelActions>
          <PanelAction nativeButton={false} render={<span aria-hidden />}>
            <X />
          </PanelAction>
        </PanelActions>
      </ProfilePanelHeader>

      <div className="border-b border-line-hairline [[data-theme=brutal]_&]:border-b-2 [[data-theme=brutal]_&]:border-line-strong">
        <div className="flex h-12 w-max items-center gap-1.5 px-5 text-[13px] font-medium text-foreground [[data-theme=brutal]_&]:h-auto [[data-theme=brutal]_&]:border-r-2 [[data-theme=brutal]_&]:border-line-strong [[data-theme=brutal]_&]:bg-primary-400 [[data-theme=brutal]_&]:py-1.5 [[data-theme=brutal]_&]:text-xs [[data-theme=brutal]_&]:font-semibold">
          <Bot className="size-3.5" aria-hidden />
          Profile
        </div>
      </div>

      <PanelBody>
        <PanelScrollViewport>
          <PanelScrollContent>
            <ProfilePanelSection className="border-t-0 py-3">
              <DescriptionList>
                <DescriptionItem>
                  <DescriptionTerm className="[[data-theme=brutal]_&]:font-bold [[data-theme=brutal]_&]:uppercase [[data-theme=brutal]_&]:tracking-widest">
                    From
                  </DescriptionTerm>
                  <DescriptionDetails className="font-medium [[data-theme=brutal]_&]:font-bold">
                    Botiverse
                  </DescriptionDetails>
                </DescriptionItem>
              </DescriptionList>
            </ProfilePanelSection>

            <ProfilePanelSection className="flex items-start gap-4 py-5">
              <Avatar size="xl" type="agent">
                <AvatarFallback>
                  <Bot aria-hidden />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 pt-1">
                <PanelHeading>
                  <Text.Heading
                    level={6}
                    render={<h2 aria-label="Tw93" />}
                    className="truncate [[data-theme=brutal]_&]:text-lg [[data-theme=brutal]_&]:font-bold [[data-theme=brutal]_&]:leading-tight"
                  >
                    Tw93
                  </Text.Heading>
                  <PanelStatus className="[[data-theme=brutal]_&]:gap-1.5 [[data-theme=brutal]_&]:font-mono [[data-theme=brutal]_&]:text-sm [[data-theme=brutal]_&]:text-foreground-muted">
                    <Status size="md" variant="warning" aria-label="Working" />
                    Working…
                  </PanelStatus>
                </PanelHeading>
                <Text.Mono size="meta" className="truncate [[data-theme=brutal]_&]:text-sm">
                  @Tw93
                </Text.Mono>
              </div>
            </ProfilePanelSection>

            <ProfilePanelSection className="border-t-0 py-0">
              <DescriptionList>
                <DescriptionItem className="pb-3 pt-4">
                  <DescriptionTerm className="[[data-theme=brutal]_&]:font-bold [[data-theme=brutal]_&]:uppercase [[data-theme=brutal]_&]:tracking-widest">
                    Display name
                  </DescriptionTerm>
                  <DescriptionDetails>Tw93</DescriptionDetails>
                </DescriptionItem>
                <DescriptionItem className="py-3">
                  <DescriptionTerm className="[[data-theme=brutal]_&]:font-bold [[data-theme=brutal]_&]:uppercase [[data-theme=brutal]_&]:tracking-widest">
                    Description
                  </DescriptionTerm>
                  <DescriptionDetails>
                    Super Builder & Designer, use GPT image2 for design
                  </DescriptionDetails>
                </DescriptionItem>
              </DescriptionList>
            </ProfilePanelSection>
          </PanelScrollContent>
        </PanelScrollViewport>
      </PanelBody>
    </ProfilePanel>
  );
}
