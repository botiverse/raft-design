import { createFileRoute } from "@tanstack/react-router";
import { Banner, BannerAction, BannerDescription, BannerTitle, Button } from "raft-ui";
import { CircleAlert, CircleCheck, CircleX, Info, X } from "lucide-react";

import { DocPage } from "#/components/doc-page.tsx";
import { DocNote } from "#/components/doc-note.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import {
  createCompositionPanelProps,
  createCompositionSnippetMap,
  createCompositionSourceMap,
} from "#/lib/source-comparison-code.ts";
import { BannerPlaygroundPreview } from "#/modules/banner/banner.preview.tsx";
import bannerDefaultCompositionSource from "#/modules/banner/compositions/default.composition.tsx?raw";
import bannerDestructiveCompositionSource from "#/modules/banner/compositions/destructive.composition.tsx?raw";
import bannerInfoCompositionSource from "#/modules/banner/compositions/info.composition.tsx?raw";
import bannerPreviewCompositionSource from "#/modules/banner/compositions/preview.composition.tsx?raw";
import bannerSuccessCompositionSource from "#/modules/banner/compositions/success.composition.tsx?raw";
import bannerWarningCompositionSource from "#/modules/banner/compositions/warning.composition.tsx?raw";
import {
  BANNER_SOURCE_COMPARISON_COMPOSITION,
  BANNER_SOURCE_COMPARISON_COMPOSITION_PATHS,
} from "#/modules/banner/banner.source-comparison.tsx";
import LegacyBanner from "../../../../../packages/ui/src/legacy/Banner.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;
const SOURCE_SCENES = [
  {
    label: "Auth, setup, dialogs, and settings banners",
    scenes: [
      {
        label: "DeviceLoginPage.tsx:85",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/pages/DeviceLoginPage.tsx:85",
      },
      {
        label: "OnboardingStepDialog.tsx:55",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/onboarding/OnboardingStepDialog.tsx:55",
      },
      {
        label: "ConfirmDialog.tsx:70,80",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/ConfirmDialog.tsx:70,80",
      },
      {
        label: "ActionCard.tsx:304",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/actions/ActionCard.tsx:304",
      },
      {
        label: "MemberGraphSection.tsx:704",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/settings/MemberGraphSection.tsx:704",
      },
      {
        label: "CreateTaskDialog.tsx:69",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/task/CreateTaskDialog.tsx:69",
      },
      {
        label:
          "SettingsPanel.tsx:371,476,725,792,971,1152,1341,1557,1761,1847,1936,1942,2328,2347,2503,2817,2831,2980",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/settings/SettingsPanel.tsx:371,476,725,792,971,1152,1341,1557,1761,1847,1936,1942,2328,2347,2503,2817,2831,2980",
      },
      {
        label: "AddMembersDialog.tsx:231",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/channel/AddMembersDialog.tsx:231",
      },
      {
        label: "AgentRemindersSection.tsx:129",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/AgentRemindersSection.tsx:129",
      },
      {
        label: "CommunityAgreementDialog.tsx:64",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/server/CommunityAgreementDialog.tsx:64",
      },
      {
        label: "InviteHumanDialog.tsx:110",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/member/InviteHumanDialog.tsx:110",
      },
      {
        label: "CreateJointChannelDialog.tsx:164,169",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/channel/CreateJointChannelDialog.tsx:164,169",
      },
      {
        label: "ResetAgentDialog.tsx:71,95",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/ResetAgentDialog.tsx:71,95",
      },
      {
        label: "CreateChannelDialog.tsx:222,227",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/channel/CreateChannelDialog.tsx:222,227",
      },
      {
        label: "CreateAgentDialog.tsx:320",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/CreateAgentDialog.tsx:320",
      },
      {
        label: "ReportIssueDialog.tsx:334,350",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/ReportIssueDialog.tsx:334,350",
      },
      {
        label: "EditChannelDialog.tsx:139",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/channel/EditChannelDialog.tsx:139",
      },
      {
        label: "AddMachineDialog.tsx:167,284",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/machine/AddMachineDialog.tsx:167,284",
      },
      {
        label: "AgentScopesPanel.tsx:121,176",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/AgentScopesPanel.tsx:121,176",
      },
      {
        label: "AgentDetailPanel.tsx:179,246",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/AgentDetailPanel.tsx:179,246",
      },
      {
        label: "ChatPanel.tsx:75,498",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/ChatPanel.tsx:75,498",
      },
      {
        label: "MachineDetailPanel.tsx:98,414,530,952",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/machine/MachineDetailPanel.tsx:98,414,530,952",
      },
      {
        label: "ServerSelector.tsx:56",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/auth/ServerSelector.tsx:56",
      },
      {
        label: "SocialAuthCallbackPage.tsx:141,161",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/auth/SocialAuthCallbackPage.tsx:141,161",
      },
      {
        label: "ResetPasswordPage.tsx:78",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/auth/ResetPasswordPage.tsx:78",
      },
      {
        label: "EmailVerificationPage.tsx:102",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/auth/EmailVerificationPage.tsx:102",
      },
      {
        label: "ForgotPasswordPage.tsx:64",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/auth/ForgotPasswordPage.tsx:64",
      },
      {
        label: "InviteAcceptPage.tsx:204",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/auth/InviteAcceptPage.tsx:204",
      },
      {
        label: "LoginPage.tsx:109",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/auth/LoginPage.tsx:109",
      },
      {
        label: "Sidebar.tsx:1934",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/layout/Sidebar.tsx:1934",
      },
      {
        label: "RegisterPage.tsx:66",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/auth/RegisterPage.tsx:66",
      },
      {
        label: "SOSDialog.tsx:70,96",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/SOSDialog.tsx:70,96",
      },
      {
        label: "MessageItem.tsx:1108",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/MessageItem.tsx:1108",
      },
    ],
  },
] as const;

const STATUSES = ["default", "destructive", "warning", "info", "success"] as const;
const SIZES = ["sm", "md", "lg"] as const;
const ACTION_ALIGNS = ["top", "middle"] as const;

const BannerCurrent = BANNER_SOURCE_COMPARISON_COMPOSITION;

const BANNER_COMPOSITION_RAW_SOURCES = {
  Default: bannerDefaultCompositionSource,
  Destructive: bannerDestructiveCompositionSource,
  Warning: bannerWarningCompositionSource,
  Info: bannerInfoCompositionSource,
  Success: bannerSuccessCompositionSource,
  Preview: bannerPreviewCompositionSource,
} as const;

const BANNER_COMPOSITION_SOURCES = createCompositionSourceMap(BANNER_COMPOSITION_RAW_SOURCES);

const BANNER_COMPOSITION_SNIPPET_IDS = {
  Default: "bannerDefaultComposition",
  Destructive: "bannerDestructiveComposition",
  Warning: "bannerWarningComposition",
  Info: "bannerInfoComposition",
  Success: "bannerSuccessComposition",
  Preview: "bannerPreviewComposition",
} as const;

type BannerCompositionKey = keyof typeof BANNER_COMPOSITION_SOURCES;

const SNIPPETS = {
  anatomy: `<Banner>
  <BannerTitle />
  <BannerDescription />
  <BannerAction>
    <Button />
  </BannerAction>
</Banner>`,
  statuses: `<Banner status="default">
  <Info />
  <BannerTitle>Settings synced</BannerTitle>
  <BannerDescription>Rules now apply to every project.</BannerDescription>
  <BannerAction align="top"><Button variant="ghost" size="icon-xs" aria-label="Dismiss workspace settings notice"><X /></Button></BannerAction>
</Banner>
<Banner status="destructive">
  <CircleX />
  <BannerTitle>Payment failed</BannerTitle>
  <BannerDescription>Retry to keep automations running.</BannerDescription>
  <BannerAction><Button variant="ghost" size="xs">Retry</Button></BannerAction>
</Banner>
<Banner status="warning">
  <CircleAlert />
  <BannerTitle>Invoice details missing</BannerTitle>
  <BannerDescription>Add billing email and tax ID.</BannerDescription>
  <BannerAction><Button variant="outline" size="xs">Review</Button></BannerAction>
</Banner>
<Banner status="info">
  <Info />
  <BannerTitle>Trial ends soon</BannerTitle>
  <BannerDescription>Upgrade to keep projects available.</BannerDescription>
  <BannerAction><Button variant="outline" size="xs">Upgrade</Button></BannerAction>
</Banner>
<Banner status="success">
  <CircleCheck />
  <BannerTitle>Deployment live</BannerTitle>
  <BannerDescription>Version 1.8.4 is in production.</BannerDescription>
  <BannerAction align="top"><Button variant="ghost" size="icon-xs" aria-label="Dismiss deployment notice"><X /></Button></BannerAction>
</Banner>`,
  sizes: `<Banner status="info" size="sm">
  <Info />
  <BannerTitle>Small banner</BannerTitle>
  <BannerDescription>Tight form-error banner.</BannerDescription>
  <BannerAction><Button size="icon-xs" aria-label="Dismiss"><X /></Button></BannerAction>
</Banner>
<Banner status="info" size="md">
  <Info />
  <BannerTitle>Medium banner</BannerTitle>
  <BannerDescription>Default banner.</BannerDescription>
  <BannerAction><Button size="icon-xs" aria-label="Dismiss"><X /></Button></BannerAction>
</Banner>
<Banner status="info" size="lg">
  <Info />
  <BannerTitle>Large banner</BannerTitle>
  <BannerDescription>Prominent surface banner.</BannerDescription>
  <BannerAction><Button size="icon-xs" aria-label="Dismiss"><X /></Button></BannerAction>
</Banner>`,
  composition: `<Banner status="warning">
  <CircleAlert />
  <BannerTitle>Plan limit reached</BannerTitle>
  <BannerDescription>Remove an inactive machine before adding another.</BannerDescription>
  <BannerAction align="top">
    <Button size="icon-xs" aria-label="Dismiss"><X /></Button>
  </BannerAction>
</Banner>`,
} as const;

const BANNER_PROPS: readonly PropRow[] = [
  {
    name: "status",
    type: STATUSES.map((status) => `"${status}"`).join(" | "),
    description:
      'Drives the surface color. Source intent="..." maps to destructive / warning / info / success; default covers neutral banners.',
  },
  {
    name: "size",
    type: SIZES.map((size) => `"${size}"`).join(" | "),
    default: '"md"',
    description:
      "Controls padding, icon size, title size, description size, and action affordance.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Native div attributes plus render. Place an optional SVG icon as a direct child; the root normalizes its size.",
  },
];

const BANNER_TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Optional bold heading.",
  },
];

const BANNER_DESCRIPTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Message/content slot. Its font size follows the root size.",
  },
];

const BANNER_ACTION_PROPS: readonly PropRow[] = [
  {
    name: "align",
    type: ACTION_ALIGNS.map((align) => `"${align}"`).join(" | "),
    default: '"middle"',
    description: "Aligns actions to the title row top or vertically centered across the banner.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Trailing slot, pinned right.",
  },
];

export const Route = createFileRoute("/components/banner")({
  component: BannerDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        ...createCompositionSnippetMap(BANNER_COMPOSITION_SOURCES, BANNER_COMPOSITION_SNIPPET_IDS),
      },
    }),
});

function BannerDoc() {
  const code = Route.useLoaderData();
  const bannerComposition = (key: BannerCompositionKey) =>
    createCompositionPanelProps({
      code,
      key,
      paths: BANNER_SOURCE_COMPARISON_COMPOSITION_PATHS,
      snippetIds: BANNER_COMPOSITION_SNIPPET_IDS,
      sources: BANNER_COMPOSITION_SOURCES,
    });

  return (
    <DocPage
      title="Banner"
      description="An inline banner / callout / alert composed from a status-driven root and slot parts."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <BannerPlaygroundPreview
          code={code.bannerPreviewComposition}
          collapsedCode={code.bannerPreviewCompositionBody}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage" showThemeSwitcher>
        <div className="space-y-10">
          <DocSubsection parentId="usage" id="statuses" title="Statuses">
            <Preview>
              <Preview.Canvas>
                <div className="flex w-[28rem] flex-col gap-3">
                  <Banner status="default">
                    <Info />
                    <BannerTitle>Settings synced</BannerTitle>
                    <BannerDescription>Rules now apply to every project.</BannerDescription>
                    <BannerAction align="top">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Dismiss workspace settings notice"
                      >
                        <X />
                      </Button>
                    </BannerAction>
                  </Banner>
                  <Banner status="destructive">
                    <CircleX />
                    <BannerTitle>Payment failed</BannerTitle>
                    <BannerDescription>Retry to keep automations running.</BannerDescription>
                    <BannerAction>
                      <Button variant="ghost" size="xs">
                        Retry
                      </Button>
                    </BannerAction>
                  </Banner>
                  <Banner status="warning">
                    <CircleAlert />
                    <BannerTitle>Invoice details missing</BannerTitle>
                    <BannerDescription>Add billing email and tax ID.</BannerDescription>
                    <BannerAction>
                      <Button variant="outline" size="xs">
                        Review
                      </Button>
                    </BannerAction>
                  </Banner>
                  <Banner status="info">
                    <Info />
                    <BannerTitle>Trial ends soon</BannerTitle>
                    <BannerDescription>Upgrade to keep projects available.</BannerDescription>
                    <BannerAction>
                      <Button variant="outline" size="xs">
                        Upgrade
                      </Button>
                    </BannerAction>
                  </Banner>
                  <Banner status="success">
                    <CircleCheck />
                    <BannerTitle>Deployment live</BannerTitle>
                    <BannerDescription>Version 1.8.4 is in production.</BannerDescription>
                    <BannerAction align="top">
                      <Button variant="ghost" size="icon-xs" aria-label="Dismiss deployment notice">
                        <X />
                      </Button>
                    </BannerAction>
                  </Banner>
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.statuses} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="sizes" title="Sizes">
            <DocNote>
              Banners stay iconless by default, matching the dominant inline pattern. Compose a
              direct icon child for the heavier warning surfaces.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <div className="flex w-[28rem] flex-col gap-3">
                  <Banner status="info" size="sm">
                    <Info />
                    <BannerTitle>Small banner</BannerTitle>
                    <BannerDescription>Tight form-error banner.</BannerDescription>
                    <BannerAction>
                      <Button size="icon-xs" aria-label="Dismiss">
                        <X />
                      </Button>
                    </BannerAction>
                  </Banner>
                  <Banner status="info" size="md">
                    <Info />
                    <BannerTitle>Medium banner</BannerTitle>
                    <BannerDescription>Default banner.</BannerDescription>
                    <BannerAction>
                      <Button size="icon-xs" aria-label="Dismiss">
                        <X />
                      </Button>
                    </BannerAction>
                  </Banner>
                  <Banner status="info" size="lg">
                    <Info />
                    <BannerTitle>Large banner</BannerTitle>
                    <BannerDescription>Prominent surface banner.</BannerDescription>
                    <BannerAction>
                      <Button size="icon-xs" aria-label="Dismiss">
                        <X />
                      </Button>
                    </BannerAction>
                  </Banner>
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.sizes} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="composition" title="Composition">
            <Preview>
              <Preview.Canvas>
                <div className="w-[28rem]">
                  <Banner status="warning">
                    <CircleAlert />
                    <BannerTitle>Plan limit reached</BannerTitle>
                    <BannerDescription>
                      Remove an inactive machine before adding another.
                    </BannerDescription>
                    <BannerAction align="top">
                      <Button size="icon-xs" aria-label="Dismiss">
                        <X />
                      </Button>
                    </BannerAction>
                  </Banner>
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.composition} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-root" title="Banner">
            <PropsTable rows={BANNER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-title" title="BannerTitle">
            <PropsTable rows={BANNER_TITLE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-description" title="BannerDescription">
            <PropsTable rows={BANNER_DESCRIPTION_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-action" title="BannerAction">
            <PropsTable rows={BANNER_ACTION_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          sourceScenes={SOURCE_SCENES}
          layout="grid"
          items={[
            {
              label: "Default",
              status: "new",
              note: 'Source has no default intent. Current status="default" covers neutral banners.',
              source: null,
              brutal: <BannerCurrent.Default />,
              elegant: <BannerCurrent.Default />,
              elegantDark: <BannerCurrent.Default />,
              ...bannerComposition("Default"),
            },
            {
              label: "Destructive",
              status: "difference",
              note: 'Source intent="destructive" maps to status="destructive". withIcon/title become a direct icon child and BannerTitle.',
              source: (
                <LegacyBanner intent="destructive" withIcon title="Delete server">
                  This can&rsquo;t be undone.
                </LegacyBanner>
              ),
              brutal: <BannerCurrent.Destructive />,
              elegant: <BannerCurrent.Destructive />,
              elegantDark: <BannerCurrent.Destructive />,
              ...bannerComposition("Destructive"),
            },
            {
              label: "Warning",
              status: "difference",
              note: 'Source intent="warning" maps to status="warning". withIcon/title become a direct icon child and BannerTitle.',
              source: (
                <LegacyBanner intent="warning" withIcon title="Invoice details missing">
                  Add billing email and tax ID.
                </LegacyBanner>
              ),
              brutal: <BannerCurrent.Warning />,
              elegant: <BannerCurrent.Warning />,
              elegantDark: <BannerCurrent.Warning />,
              ...bannerComposition("Warning"),
            },
            {
              label: "Info",
              status: "difference",
              note: 'Source intent="info" maps to status="info". withIcon/title become a direct icon child and BannerTitle.',
              source: (
                <LegacyBanner intent="info" withIcon title="Trial ends soon">
                  Upgrade to keep projects available.
                </LegacyBanner>
              ),
              brutal: <BannerCurrent.Info />,
              elegant: <BannerCurrent.Info />,
              elegantDark: <BannerCurrent.Info />,
              ...bannerComposition("Info"),
            },
            {
              label: "Success",
              status: "difference",
              note: 'Source intent="success" maps to status="success". withIcon/title become a direct icon child and BannerTitle.',
              source: (
                <LegacyBanner intent="success" withIcon title="Deployment live">
                  Version 1.8.4 is in production.
                </LegacyBanner>
              ),
              brutal: <BannerCurrent.Success />,
              elegant: <BannerCurrent.Success />,
              elegantDark: <BannerCurrent.Success />,
              ...bannerComposition("Success"),
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
