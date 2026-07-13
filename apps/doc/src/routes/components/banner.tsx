import { createFileRoute } from "@tanstack/react-router";
import {
  Banner,
  BannerAction,
  BannerDescription,
  BannerTitle,
  Button,
  type BannerActionProps,
  type BannerProps,
} from "raft-ui";
import { CircleAlert, CircleCheck, CircleX, Grid2X2, Info, X } from "lucide-react";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocNote } from "#/components/doc-note.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import {
  createCompositionPanelProps,
  createCompositionSnippetMap,
  createCompositionSourceMap,
} from "#/lib/source-comparison-code.ts";
import bannerIconTitleCompositionSource from "#/compositions/banner/icon-title-composition.tsx?raw";
import bannerIconlessWarningCompositionSource from "#/compositions/banner/iconless-warning-composition.tsx?raw";
import bannerLargeActionsCompositionSource from "#/compositions/banner/large-actions-composition.tsx?raw";
import {
  BANNER_SOURCE_COMPARISON_COMPOSITION,
  BANNER_SOURCE_COMPARISON_COMPOSITION_PATHS,
} from "#/compositions/banner-source-comparison.tsx";
import LegacyBanner from "../../../../../packages/ui/src/legacy/Banner.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "statuses", title: "Statuses" },
  { id: "sizes", title: "Sizes" },
  { id: "composition", title: "Composition" },
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

const STATUS_ICON = {
  default: Info,
  destructive: CircleX,
  warning: CircleAlert,
  info: Info,
  success: CircleCheck,
} as const;

const BannerCurrent = BANNER_SOURCE_COMPARISON_COMPOSITION;

const BANNER_COMPOSITION_RAW_SOURCES = {
  IconTitle: bannerIconTitleCompositionSource,
  IconlessWarning: bannerIconlessWarningCompositionSource,
  LargeActions: bannerLargeActionsCompositionSource,
} as const;

const BANNER_COMPOSITION_SOURCES = createCompositionSourceMap(BANNER_COMPOSITION_RAW_SOURCES);

const BANNER_COMPOSITION_SNIPPET_IDS = {
  IconTitle: "bannerIconTitleComposition",
  IconlessWarning: "bannerIconlessWarningComposition",
  LargeActions: "bannerLargeActionsComposition",
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
  sourceDefault: `<Banner intent="warning">
  Please fix the highlighted fields.
</Banner>`,
  currentDefault: `<Banner status="warning">
  <BannerDescription>Please fix the highlighted fields.</BannerDescription>
</Banner>`,
  sourceIcon: `<Banner intent="destructive" withIcon title="Delete server">
  This can't be undone.
</Banner>`,
  currentIcon: `<Banner status="destructive">
  <CircleX />
  <BannerTitle>Delete server</BannerTitle>
  <BannerDescription>This can't be undone.</BannerDescription>
</Banner>`,
  sourceActions: `<Banner
  intent="info"
  density="lg"
  withIcon
  actions={<button aria-label="Dismiss"><X /></button>}
>
  You're on the free plan.
</Banner>`,
  currentActions: `<Banner status="info" size="lg">
  <Info />
  <BannerDescription>You're on the free plan.</BannerDescription>
  <BannerAction><button aria-label="Dismiss"><X /></button></BannerAction>
</Banner>`,
} as const;

type PlaygroundValues = {
  status: BannerProps["status"];
  size: NonNullable<BannerProps["size"]>;
  actionAlign: NonNullable<BannerActionProps["align"]>;
  withIcon: boolean;
  withTitle: boolean;
  withActions: boolean;
};

const PROPS: readonly PropRow[] = [
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
    name: "render",
    type: "ReactElement | (props, state) => ReactElement",
    description: "Base UI render hook for changing the root element.",
  },
  {
    name: "...props",
    type: "HTMLAttributes<HTMLDivElement>",
    description: "Native div attributes.",
  },
];

const PART_PROPS: readonly PropRow[] = [
  {
    name: "Icon",
    type: "ReactNode",
    description: "Place an icon as a direct Banner child. The root normalizes SVG size.",
  },
  {
    name: "BannerTitle",
    type: "div props",
    description: "Optional bold heading.",
  },
  {
    name: "BannerDescription",
    type: "div props",
    description: "Message/content slot. Its font size follows the root size.",
  },
  {
    name: "BannerAction",
    type: "div props",
    description: "Trailing slot, pinned right.",
  },
  {
    name: "BannerAction.align",
    type: ACTION_ALIGNS.map((align) => `"${align}"`).join(" | "),
    default: '"middle"',
    description: "Aligns actions to the title row top or vertically centered across the banner.",
  },
];

function DismissIconButton() {
  return (
    <button
      type="button"
      aria-label="Dismiss"
      className="inline-flex size-6 shrink-0 items-center justify-center border-2 border-black bg-white text-black transition-transform hover:-translate-y-0.5 hover:shadow-[var(--source-shadow-hover)] [&>svg]:size-3.5"
    >
      <X />
    </button>
  );
}

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
      headerAction={
        <Button
          render={<a href="/components/banner/matrix" target="_blank" rel="noreferrer" />}
          variant="ghost"
          size="sm"
        >
          Matrix
          <Grid2X2 data-icon="inline-end" />
        </Button>
      }
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <ComponentPlayground<PlaygroundValues>
          defaultValues={{
            status: "warning",
            size: "md",
            actionAlign: "middle",
            withIcon: true,
            withTitle: false,
            withActions: false,
          }}
          controls={[
            { name: "status", label: "Status", type: "select", options: STATUSES },
            { name: "size", label: "Size", type: "select", options: SIZES },
            { name: "actionAlign", label: "Action align", type: "select", options: ACTION_ALIGNS },
            { name: "withIcon", label: "With icon", type: "boolean" },
            { name: "withTitle", label: "With title", type: "boolean" },
            { name: "withActions", label: "With actions", type: "boolean" },
          ]}
          render={(values) => {
            const Icon = STATUS_ICON[values.status];
            return (
              <Banner status={values.status} size={values.size} className="w-[28rem]">
                {values.withIcon ? <Icon /> : null}
                {values.withTitle ? <BannerTitle>Review required</BannerTitle> : null}
                <BannerDescription>This action can&rsquo;t be undone.</BannerDescription>
                {values.withActions ? (
                  <BannerAction align={values.actionAlign}>
                    <Button size="icon-xs" aria-label="Dismiss">
                      <X />
                    </Button>
                  </BannerAction>
                ) : null}
              </Banner>
            );
          }}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="statuses" title="Statuses" showThemeSwitcher>
        <Example html={code.statuses}>
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
        </Example>
      </DocSection>

      <DocSection id="sizes" title="Sizes" showThemeSwitcher>
        <div className="space-y-4">
          <DocNote>
            Banners stay iconless by default, matching the dominant inline pattern. Compose a direct
            icon child for the heavier warning surfaces.
          </DocNote>
          <Example html={code.sizes}>
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
          </Example>
        </div>
      </DocSection>

      <DocSection id="composition" title="Composition" showThemeSwitcher>
        <Example html={code.composition}>
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
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <PropsTable rows={PROPS} />
          <PropsTable rows={PART_PROPS} />
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          sourceScenes={SOURCE_SCENES}
          layout="grid"
          items={[
            {
              label: "Iconless warning",
              status: "difference",
              note: "Visual output matches. Source intent maps to current status, and body content moves into BannerDescription.",
              source: (
                <LegacyBanner intent="warning">Please fix the highlighted fields.</LegacyBanner>
              ),
              brutal: <BannerCurrent.IconlessWarning />,
              elegant: <BannerCurrent.IconlessWarning />,
              elegantDark: <BannerCurrent.IconlessWarning />,
              ...bannerComposition("IconlessWarning"),
            },
            {
              label: "Icon + title",
              status: "difference",
              note: "The conventional source withIcon/title props are now a direct icon child and BannerTitle slot.",
              source: (
                <LegacyBanner intent="destructive" withIcon title="Delete server">
                  This can&rsquo;t be undone.
                </LegacyBanner>
              ),
              brutal: <BannerCurrent.IconTitle />,
              elegant: <BannerCurrent.IconTitle />,
              elegantDark: <BannerCurrent.IconTitle />,
              ...bannerComposition("IconTitle"),
            },
            {
              label: "Large + actions",
              status: "difference",
              note: 'Source density="lg" maps to size="lg". The action slot is now composed as BannerAction.',
              source: (
                <LegacyBanner intent="info" density="lg" withIcon actions={<DismissIconButton />}>
                  You&rsquo;re on the free plan.
                </LegacyBanner>
              ),
              brutal: <BannerCurrent.LargeActions />,
              elegant: <BannerCurrent.LargeActions />,
              elegantDark: <BannerCurrent.LargeActions />,
              ...bannerComposition("LargeActions"),
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
