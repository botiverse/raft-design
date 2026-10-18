import { PanelBody, ProfilePanel, ProfilePanelHeader, Text } from "@botiverse/raft-ui";

export function ProfilePanelLoadingComposition() {
  return (
    <ProfilePanel aria-busy="true" aria-label="Loading profile">
      <ProfilePanelHeader aria-hidden />
      <PanelBody className="flex items-center justify-center">
        <Text.Sans size="small" variant="placeholder" render={<p role="status" />}>
          Loading…
        </Text.Sans>
      </PanelBody>
    </ProfilePanel>
  );
}
