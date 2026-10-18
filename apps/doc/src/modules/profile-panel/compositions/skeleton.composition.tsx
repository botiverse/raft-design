import {
  PanelBody,
  PanelScrollContent,
  PanelScrollViewport,
  ProfilePanel,
  ProfilePanelHeader,
  ProfilePanelHeaderContent,
  ProfilePanelSection,
  Skeleton,
} from "@botiverse/raft-ui";

export function ProfilePanelSkeletonComposition() {
  return (
    <ProfilePanel aria-busy="true" aria-label="Loading profile">
      <ProfilePanelHeader>
        <Skeleton variant="circle" className="size-9" />
        <ProfilePanelHeaderContent className="gap-1 md:gap-1">
          <Skeleton variant="line" className="w-24" />
          <Skeleton variant="line" className="h-2.5 w-32" />
        </ProfilePanelHeaderContent>
      </ProfilePanelHeader>

      <PanelBody>
        <PanelScrollViewport>
          <PanelScrollContent>
            <ProfilePanelSection className="flex items-start gap-4 border-t-0 py-5">
              <Skeleton variant="circle" className="size-16" />
              <div className="grid min-w-0 flex-1 gap-2 pt-1">
                <Skeleton variant="line" className="w-32" />
                <Skeleton variant="line" className="h-2.5 w-24" />
              </div>
            </ProfilePanelSection>

            <ProfilePanelSection className="grid gap-3">
              <Skeleton variant="line" className="h-2.5 w-24" />
              <Skeleton variant="line" className="w-full" />
              <Skeleton variant="line" className="w-3/4" />
            </ProfilePanelSection>

            <ProfilePanelSection className="grid gap-4">
              <Skeleton variant="line" className="h-2.5 w-14" />
              <div className="grid gap-2">
                <Skeleton variant="line" className="w-20" />
                <Skeleton variant="block" className="h-6 w-16" />
              </div>
              <div className="grid gap-2">
                <Skeleton variant="line" className="w-16" />
                <Skeleton variant="line" className="w-44" />
              </div>
            </ProfilePanelSection>
          </PanelScrollContent>
        </PanelScrollViewport>
      </PanelBody>
    </ProfilePanel>
  );
}
