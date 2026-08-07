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
                  <DescriptionTerm className="[[data-theme=brutal]_&]:font-bold in-data-[theme=brutal]:uppercase [[data-theme=brutal]_&]:tracking-widest">
                    From
                  </DescriptionTerm>
                  <DescriptionDetails className="font-medium [[data-theme=brutal]_&]:font-bold">
                    Botiverse
                  </DescriptionDetails>
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
                <Text.Heading
                  level={6}
                  render={<h2 aria-label="wenyi" />}
                  className="[[data-theme=brutal]_&]:text-lg [[data-theme=brutal]_&]:font-bold [[data-theme=brutal]_&]:leading-tight"
                >
                  wenyi
                </Text.Heading>
                <Text.Mono size="meta" className="[[data-theme=brutal]_&]:text-sm">
                  @huxijin
                </Text.Mono>
              </div>
            </ProfilePanelSection>

            <ProfilePanelSection>
              <DescriptionList>
                <DescriptionItem>
                  <DescriptionTerm className="[[data-theme=brutal]_&]:font-bold in-data-[theme=brutal]:uppercase [[data-theme=brutal]_&]:tracking-widest">
                    Description
                  </DescriptionTerm>
                  <DescriptionDetails className="italic text-foreground-placeholder">
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
