import { createFileRoute, Link } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { AgentProfileComposition } from "#/modules/profile-panel/compositions/agent-profile.composition.tsx";
import agentProfileCompositionSource from "#/modules/profile-panel/compositions/agent-profile.composition.tsx?raw";
import { ProfilePanelLoadingComposition } from "#/modules/profile-panel/compositions/loading.composition.tsx";
import profilePanelLoadingCompositionSource from "#/modules/profile-panel/compositions/loading.composition.tsx?raw";
import { MemberDetailComposition } from "#/modules/profile-panel/compositions/member-detail.composition.tsx";
import memberDetailCompositionSource from "#/modules/profile-panel/compositions/member-detail.composition.tsx?raw";
import { RemoteHumanComposition } from "#/modules/profile-panel/compositions/remote-human.composition.tsx";
import remoteHumanCompositionSource from "#/modules/profile-panel/compositions/remote-human.composition.tsx?raw";
import { ProfilePanelSkeletonComposition } from "#/modules/profile-panel/compositions/skeleton.composition.tsx";
import profilePanelSkeletonCompositionSource from "#/modules/profile-panel/compositions/skeleton.composition.tsx?raw";
import { MemberDetailComparisonComposition } from "#/modules/profile-panel/member-detail.comparison.tsx";
import { MemberDetailSourcePreview } from "#/modules/profile-panel/member-detail.source-preview.tsx";

const MEMBER_DETAIL_COMPOSITION_PATH =
  "apps/doc/src/modules/profile-panel/compositions/member-detail.composition.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SOURCE_SCENES = [
  {
    label: "Slock profile panel",
    scenes: [
      {
        label: "ProfilePanel.tsx",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/profile/ProfilePanel.tsx",
      },
      {
        label: "HumanDetailPanel.tsx",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/member/HumanDetailPanel.tsx",
      },
    ],
  },
] as const;

const SNIPPETS = {
  anatomy: `import {
  Avatar,
  Badge,
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
  SidebarItem,
  Text,
} from "raft-ui";
import {
  ProfilePanel,
  ProfilePanelHeader,
  ProfilePanelHeaderContent,
  ProfilePanelSection,
} from "raft-ui/wip";

<ProfilePanel>
  <ProfilePanelHeader>
    <Avatar />
    <ProfilePanelHeaderContent>
      <PanelHeading>
        <PanelTitle />
      </PanelHeading>
      <PanelMeta />
    </ProfilePanelHeaderContent>
    <PanelActions>
      <PanelAction />
    </PanelActions>
  </ProfilePanelHeader>
  <PanelBody>
    <PanelScrollViewport>
      <PanelScrollContent>
        <ProfilePanelSection>
          <Avatar />
          <Text.Heading />
          <Text.Mono />
        </ProfilePanelSection>
        <ProfilePanelSection>
          <DescriptionList>
            <DescriptionItem>
              <DescriptionTerm />
              <DescriptionDetails>
                <Badge />
              </DescriptionDetails>
            </DescriptionItem>
          </DescriptionList>
        </ProfilePanelSection>
        <ProfilePanelSection>
          <SidebarItem />
        </ProfilePanelSection>
      </PanelScrollContent>
    </PanelScrollViewport>
  </PanelBody>
</ProfilePanel>`,
  memberDetailComposition: memberDetailCompositionSource,
  profilePanelLoadingComposition: profilePanelLoadingCompositionSource,
  profilePanelSkeletonComposition: profilePanelSkeletonCompositionSource,
  remoteHumanComposition: remoteHumanCompositionSource,
  agentProfileComposition: agentProfileCompositionSource,
} as const;

const PROFILE_PANEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "PanelProps",
    description:
      "Profile-detail specialization of Panel. Owns the full-height frame and profile surface without changing Panel scrolling behavior.",
  },
];

const PROFILE_PANEL_HEADER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "PanelHeaderProps",
    description:
      "Profile identity header with the profile-specific Elegant separator and inline padding.",
  },
];

const PROFILE_PANEL_HEADER_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "PanelHeaderContentProps",
    description:
      "Profile identity stack that keeps the name and secondary description vertically arranged across themes.",
  },
];

const PROFILE_PANEL_SECTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "PanelSectionProps",
    description:
      "Profile content section with profile-specific Elegant spacing and separator color.",
  },
];

export const Route = createFileRoute("/components/profile-panel")({
  component: ProfilePanelDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function ProfilePanelDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="ProfilePanel"
      description="Profile-detail layout for members, people, and agents, built from the shared Panel foundation."
      toc={TOC}
      articleClassName="max-w-none"
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview>
          <Preview.Canvas>
            <div className="h-[42rem] w-full max-w-[32rem] overflow-hidden border border-line bg-layer-panel">
              <MemberDetailComposition />
            </div>
          </Preview.Canvas>
          <Preview.Code
            html={code.memberDetailComposition}
            collapsedHtml={code.memberDetailCompositionBody}
          />
        </Preview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <p>
          ProfilePanel owns only profile-specific framing. It reuses the body and contained-scroll
          parts documented by <Link to="/components/panel">Panel</Link>, while the caller composes
          entity data with Avatar, DescriptionList, Badge, SidebarItem, and other UI components.
        </p>
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} collapsedHtml={code.anatomyBody} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-10">
          <DocSubsection parentId="usage" id="loading" title="Loading">
            <Preview>
              <Preview.Canvas>
                <div className="h-[28rem] w-full max-w-[32rem] overflow-hidden border border-line bg-layer-panel">
                  <ProfilePanelLoadingComposition />
                </div>
              </Preview.Canvas>
              <Preview.Code
                html={code.profilePanelLoadingComposition}
                collapsedHtml={code.profilePanelLoadingCompositionBody}
              />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="skeleton" title="Skeleton">
            <Preview>
              <Preview.Canvas>
                <div className="h-[32rem] w-full max-w-[32rem] overflow-hidden border border-line bg-layer-panel">
                  <ProfilePanelSkeletonComposition />
                </div>
              </Preview.Canvas>
              <Preview.Code
                html={code.profilePanelSkeletonComposition}
                collapsedHtml={code.profilePanelSkeletonCompositionBody}
              />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="remote-human" title="Remote human">
            <Preview>
              <Preview.Canvas>
                <div className="h-[28rem] w-full max-w-[32rem] overflow-hidden border border-line bg-layer-panel">
                  <RemoteHumanComposition />
                </div>
              </Preview.Canvas>
              <Preview.Code
                html={code.remoteHumanComposition}
                collapsedHtml={code.remoteHumanCompositionBody}
              />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="remote-agent-profile" title="Remote agent profile">
            <Preview>
              <Preview.Canvas>
                <div className="h-[36rem] w-full max-w-[32rem] overflow-hidden border border-line bg-layer-panel">
                  <AgentProfileComposition />
                </div>
              </Preview.Canvas>
              <Preview.Code
                html={code.agentProfileComposition}
                collapsedHtml={code.agentProfileCompositionBody}
              />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-profile-panel" title="ProfilePanel">
            <PropsTable rows={PROFILE_PANEL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-profile-panel-header" title="ProfilePanelHeader">
            <PropsTable rows={PROFILE_PANEL_HEADER_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-profile-panel-header-content"
            title="ProfilePanelHeaderContent"
          >
            <PropsTable rows={PROFILE_PANEL_HEADER_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-profile-panel-section" title="ProfilePanelSection">
            <PropsTable rows={PROFILE_PANEL_SECTION_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          items={[
            {
              label: "Member detail panel",
              status: "difference",
              note: "Source mixed entity data, permissions, routing, and panel DOM. Current uses ProfilePanel for profile chrome, keeps workflow state with the consumer, and intentionally replaces the source role editor and related-agent row with the shared Badge and SidebarItem components.",
              sourceScenes: SOURCE_SCENES,
              source: (
                <SourceThemeScope className="flex w-full justify-center">
                  <MemberDetailSourcePreview />
                </SourceThemeScope>
              ),
              brutal: <MemberDetailComparisonComposition />,
              elegant: <MemberDetailComparisonComposition />,
              elegantDark: <MemberDetailComparisonComposition />,
              compositionCode: code.memberDetailComposition,
              compositionCollapsedCode: code.memberDetailCompositionBody,
              compositionPath: MEMBER_DETAIL_COMPOSITION_PATH,
              compositionSource: memberDetailCompositionSource,
              previewClassName: "px-2 py-4",
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
