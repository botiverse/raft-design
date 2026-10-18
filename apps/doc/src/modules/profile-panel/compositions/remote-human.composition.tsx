import { User, X } from "lucide-react";
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
  PanelTitle,
  ProfilePanel,
  ProfilePanelHeader,
  ProfilePanelHeaderContent,
  ProfilePanelSection,
  Text,
} from "raft-ui";

export function RemoteHumanComposition() {
  return (
    <ProfilePanel>
      <ProfilePanelHeader>
        <Avatar size="md" type="human">
          <AvatarFallback>
            <User aria-hidden />
          </AvatarFallback>
        </Avatar>
        <ProfilePanelHeaderContent>
          <PanelHeading>
            <PanelTitle>wenyi</PanelTitle>
          </PanelHeading>
          <PanelMeta>@huxijin</PanelMeta>
        </ProfilePanelHeaderContent>
        <PanelActions>
          <PanelAction nativeButton={false} render={<span aria-hidden />}>
            <X />
          </PanelAction>
        </PanelActions>
      </ProfilePanelHeader>

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
              <Avatar size="xl" type="human">
                <AvatarFallback>
                  <User aria-hidden />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 pt-1">
                <Text.Heading level={6} render={<h2 aria-label="wenyi" />}>
                  wenyi
                </Text.Heading>
                <Text.Mono size="meta">@huxijin</Text.Mono>
              </div>
            </ProfilePanelSection>

            <ProfilePanelSection>
              <DescriptionList>
                <DescriptionItem>
                  <DescriptionTerm>Description</DescriptionTerm>
                  <DescriptionDetails className="italic text-foreground-hint">
                    No description
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
