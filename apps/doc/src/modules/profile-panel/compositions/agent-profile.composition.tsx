import { Bot, X } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
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
  PanelActivity,
  PanelTitle,
  ProfilePanel,
  ProfilePanelHeader,
  ProfilePanelHeaderContent,
  ProfilePanelSection,
  Status,
  Text,
} from "raft-ui";

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

      <div className="border-b border-line-hairline">
        <div className="flex h-12 w-max items-center gap-1.5 px-5 text-[13px] font-medium text-foreground">
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
                  <DescriptionTerm>From</DescriptionTerm>
                  <DescriptionDetails className="font-medium">Botiverse</DescriptionDetails>
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
                  <Text.Heading level={6} render={<h2 aria-label="Tw93" />} className="truncate">
                    Tw93
                  </Text.Heading>
                  <PanelActivity>
                    <Status size="md" variant="warning" aria-label="Working" />
                    Working…
                  </PanelActivity>
                </PanelHeading>
                <Text.Mono size="meta" className="truncate">
                  @Tw93
                </Text.Mono>
              </div>
            </ProfilePanelSection>

            <ProfilePanelSection className="border-t-0 py-0">
              <DescriptionList>
                <DescriptionItem className="pb-3 pt-4">
                  <DescriptionTerm>Display name</DescriptionTerm>
                  <DescriptionDetails>Tw93</DescriptionDetails>
                </DescriptionItem>
                <DescriptionItem className="py-3">
                  <DescriptionTerm>Description</DescriptionTerm>
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
