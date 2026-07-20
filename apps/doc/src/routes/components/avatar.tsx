import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "raft-ui";
import { Check } from "lucide-react";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
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
import { SIZES, SIZE_OPTIONS } from "#/modules/avatar/avatar.constants.ts";
import { AvatarPlaygroundPreview } from "#/modules/avatar/avatar.preview.tsx";
import avatarIdentityResolutionCompositionSource from "#/modules/avatar/compositions/identity-resolution.composition.tsx?raw";
import avatarPanelHeaderCompositionSource from "#/modules/avatar/compositions/panel-header.composition.tsx?raw";
import avatarScaleCompositionSource from "#/modules/avatar/compositions/scale.composition.tsx?raw";
import {
  AVATAR_SOURCE_COMPARISON_COMPOSITION,
  AVATAR_SOURCE_COMPARISON_COMPOSITION_PATHS,
} from "#/modules/avatar/avatar.source-comparison.tsx";
import LegacyAvatarSlot from "../../../../../packages/ui/src/legacy/AvatarSlot.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-differences", title: "Source differences" },
  { id: "source-comparison", title: "Source comparison" },
] as const;
const SOURCE_SCENES = [
  {
    label: "Avatar identity surfaces",
    scenes: [
      {
        label: "PaletteAuditPage.tsx:297,303,394,415,421",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/pages/PaletteAuditPage.tsx:297,303,394,415,421",
      },
      {
        label: "HumanDetailPanel.tsx:199,258,264,520",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/member/HumanDetailPanel.tsx:199,258,264,520",
      },
      {
        label: "MessageItem.tsx:1302,1328",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/MessageItem.tsx:1302,1328",
      },
      {
        label: "AgentDetailPanel.tsx:980,987,1189,1297,1767,1773",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/AgentDetailPanel.tsx:980,987,1189,1297,1767,1773",
      },
      {
        label: "Sidebar.tsx:1072,1106,1145,1644,1646,1857",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/layout/Sidebar.tsx:1072,1106,1145,1644,1646,1857",
      },
      {
        label: "MessageInput.tsx:245,255",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/MessageInput.tsx:245,255",
      },
      {
        label: "MentionHoverCard.tsx:50,76",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/MentionHoverCard.tsx:50,76",
      },
      {
        label: "ChannelMembers.tsx:291,315",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/ChannelMembers.tsx:291,315",
      },
      {
        label: "ChatPanel.tsx:663,676",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/ChatPanel.tsx:663,676",
      },
      {
        label: "SavedPanel.tsx:120,122",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/saved/SavedPanel.tsx:120,122",
      },
      {
        label: "LiveAgentActivityBar.tsx:50",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/layout/LiveAgentActivityBar.tsx:50",
      },
      {
        label: "QuotedMessageCard.tsx:51,54",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/ui/cards/QuotedMessageCard.tsx:51,54",
      },
      {
        label: "ConversationPreviewCard.tsx:99,101",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/ui/cards/ConversationPreviewCard.tsx:99,101",
      },
      {
        label: "MemberGraphSection.tsx:110,119,174,181",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/settings/MemberGraphSection.tsx:110,119,174,181",
      },
      {
        label: "CreateChannelDialog.tsx:323,349",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/channel/CreateChannelDialog.tsx:323,349",
      },
      {
        label: "TasksPanel.tsx:409",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/task/TasksPanel.tsx:409",
      },
      "SearchPage.tsx:669,671,757,958,964,970,979",
      {
        label: "ChannelMemberList.tsx:60",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/channel/ChannelMemberList.tsx:60",
      },
      {
        label: "CreateJointChannelDialog.tsx:276,301",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/channel/CreateJointChannelDialog.tsx:276,301",
      },
    ],
  },
  {
    label: "Gravatar wrapper",
    scenes: [
      {
        label: "AvatarSlot.tsx:239",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/ui/AvatarSlot.tsx:239",
      },
      {
        label: "GravatarAvatar.tsx:33",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/member/GravatarAvatar.tsx:33",
      },
    ],
  },
] as const;

const SAMPLE_AGENT_PIXEL =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' shape-rendering='crispEdges'><rect width='64' height='64' fill='%2327CCF3'/><rect x='8' y='0' width='48' height='8' fill='%23141111'/><rect x='0' y='8' width='8' height='24' fill='%23141111'/><rect x='56' y='8' width='8' height='24' fill='%23141111'/><rect x='8' y='32' width='48' height='8' fill='%23141111'/><rect x='16' y='16' width='8' height='8' fill='%23FFFFFF'/><rect x='40' y='16' width='8' height='8' fill='%23FFFFFF'/><rect x='16' y='48' width='8' height='16' fill='%23141111'/><rect x='40' y='48' width='8' height='16' fill='%23141111'/></svg>";
const AVATAR_PHOTOS = [
  "https://unsplash.com/photos/n4KewLKFOZw/download?force=true&w=160&h=160&fit=crop&crop=faces",
  "https://unsplash.com/photos/H6FbE_vxaxQ/download?force=true&w=160&h=160&fit=crop&crop=faces",
  "https://unsplash.com/photos/mxwcEIqJ63Y/download?force=true&w=160&h=160&fit=crop&crop=faces",
  "https://unsplash.com/photos/8CEKQlmnf50/download?force=true&w=160&h=160&fit=crop&crop=faces",
] as const;

// Representative steps for the badge auto-scale demo (badges below sm render as dots).
const BADGE_SCALE_SIZES = ["xl", "lg", "md", "sm"] as const;

const LEGACY_CONTEXTS = [
  "profile-tile",
  "account-tile",
  "mention-card",
  "panel-header",
  "surface-list",
  "members-row",
  "creator-link",
  "compact-list",
  "sidebar-list",
  "preview-mini",
] as const;

const LEGACY_CONTEXT_MARKERS = {
  "profile-tile": {
    label: "kept",
    className: "border-success-base/40 bg-success-base/10 text-success-dark",
  },
  "account-tile": {
    label: "dropped",
    className: "border-warning-base/40 bg-warning-base/10 text-warning-dark",
  },
  "mention-card": {
    label: "kept",
    className: "border-success-base/40 bg-success-base/10 text-success-dark",
  },
  "panel-header": {
    label: "kept",
    className: "border-success-base/40 bg-success-base/10 text-success-dark",
  },
  "surface-list": {
    label: "kept",
    className: "border-success-base/40 bg-success-base/10 text-success-dark",
  },
  "members-row": {
    label: "dropped",
    className: "border-warning-base/40 bg-warning-base/10 text-warning-dark",
  },
  "creator-link": {
    label: "dropped",
    className: "border-warning-base/40 bg-warning-base/10 text-warning-dark",
  },
  "compact-list": {
    label: "kept",
    className: "border-success-base/40 bg-success-base/10 text-success-dark",
  },
  "sidebar-list": {
    label: "kept",
    className: "border-success-base/40 bg-success-base/10 text-success-dark",
  },
  "preview-mini": {
    label: "kept",
    className: "border-success-base/40 bg-success-base/10 text-success-dark",
  },
} as const;

const SOURCE_SIZE_ROWS = [
  {
    context: "profile-tile",
    sourceFrame: "64px frame, 2px border",
    sourceInner: "agent 60 / human 60 / icon 32",
    current: "xl / 64px",
    reason: "This is a stable profile/detail scale, not a one-off layout adjustment.",
    implementation: 'Use <Avatar size="xl">; image/fallback fills the 64px frame.',
  },
  {
    context: "account-tile",
    sourceFrame: "56px frame, 2px border",
    sourceInner: "agent 52 / human 52 / icon 24",
    current: "No exact public step",
    reason:
      "Only existed for account settings density, so keeping it would expose a layout-specific size as public API.",
    implementation:
      "Use lg inside compact account rows or xl for profile emphasis; let the row/card own surrounding spacing.",
  },
  {
    context: "mention-card",
    sourceFrame: "48px frame, 2px border",
    sourceInner: "agent 44 / human 44 / icon 24",
    current: "lg / 48px",
    reason: "Mention cards and identity popovers share this visual weight.",
    implementation: 'Use <Avatar size="lg"> inside hover-card or identity header compositions.',
  },
  {
    context: "panel-header",
    sourceFrame: "36px frame, 2px border",
    sourceInner: "agent 32 / human 32 / icon 18",
    current: "md / 36px",
    reason: "Panel headers need a distinct step between list rows and mention cards.",
    implementation: 'Use <Avatar size="md"> in PanelHeader visual/icon slots.',
  },
  {
    context: "surface-list",
    sourceFrame: "32px frame, 2px border",
    sourceInner: "agent 28 / human 28 / icon 16",
    current: "sm / 32px",
    reason: "This is the common list-row avatar size across source callsites.",
    implementation: 'Use <Avatar size="sm"> for list item leading media.',
  },
  {
    context: "members-row",
    sourceFrame: "28px frame, 1px border",
    sourceInner: "agent 26 / human 24 / icon 14",
    current: "No exact public step",
    reason:
      "It was a narrow density correction for member rows and sits too close to both sm and xs.",
    implementation:
      "Use sm when the row has normal text rhythm; use xs when the member avatar is secondary metadata.",
  },
  {
    context: "creator-link",
    sourceFrame: "22px frame, 1px border",
    sourceInner: "agent 20 / human 20 / icon 12",
    current: "No exact public step",
    reason: "It belongs to inline link composition, not the avatar primitive scale.",
    implementation:
      "Use xs and tune the link's gap/line-height in the parent composition instead of adding a 22px avatar size.",
  },
  {
    context: "sidebar-list",
    sourceFrame: "18px frame, 1px border",
    sourceInner: "agent 16 / human 16 / icon 10",
    current: "2xs / 18px",
    reason:
      "Sidebar and DM rows need exact source density, so this stays a public compact step on the t-shirt scale.",
    implementation: 'Use <Avatar size="2xs"> inside ChatSidebarItemIcon.',
  },
  {
    context: "compact-list",
    sourceFrame: "20px frame, 1px border",
    sourceInner: "agent 18 / human 18 / icon 12",
    current: "xs / 20px",
    reason: "This is the reusable compact size for dense rows and metadata.",
    implementation: 'Use <Avatar size="xs"> for compact rows and dense metadata.',
  },
  {
    context: "preview-mini",
    sourceFrame: "14px frame, 1px border",
    sourceInner: "agent 14 / human 14 / icon 10",
    current: "3xs / 14px",
    reason: "Inline previews need a true miniature avatar rather than shrinking xs ad hoc.",
    implementation: 'Use <Avatar size="3xs"> in quoted/preview chip compositions.',
  },
] as const;

const SOURCE_DIFFERENCE_ROWS = [
  {
    area: "API surface",
    source: "AvatarSlot(context, type, agentAvatarUrl, humanAvatarUrl, gravatarHash, email)",
    current: "Avatar(size, type) plus AvatarImage, AvatarFallback, AvatarBadge children",
  },
  {
    area: "Identity lookup",
    source: "AgentAvatar and GravatarAvatar are resolved inside AvatarSlot.",
    current: "Callers resolve URLs; Avatar only owns image/fallback rendering state.",
  },
  {
    area: "Size model",
    source: "Ten callsite contexts, including 56px, 28px, 22px, and 18px one-offs.",
    current: "Seven public sizes: xl, lg, md, sm, xs, 2xs, 3xs.",
  },
  {
    area: "Inner sizing",
    source: "Each context carries separate agent pixel, gravatar, and placeholder icon numbers.",
    current: "Fallback, icon, badge, and border scale from the parent size.",
  },
  {
    area: "Theme surface",
    source: "Brutal square frame with role background and black border.",
    current:
      "Theme-aware frame: brutal keeps square border; elegant uses the avatar family surface.",
  },
  {
    area: "Extra parts",
    source: "No badge or group primitive in AvatarSlot.",
    current: "Badge and group are first-class composition parts.",
  },
] as const;

const SNIPPETS = {
  anatomy: `<Avatar>
  <AvatarImage />
  <AvatarFallback />
  <AvatarBadge />
</Avatar>`,
  image: `import { Avatar, AvatarImage, AvatarFallback } from "raft-ui";

// App-domain code still resolves agent pixel art, uploaded images, and Gravatar.
// Avatar only receives an image src plus fallback content.
<Avatar size="sm" type="agent">
  <AvatarImage src={agentPixelSrc} alt="Atlas" />
  <AvatarFallback />
</Avatar>

<Avatar size="sm" type="agent">
  <AvatarImage src={avatarPhotoUrls[0]} alt="Atlas" />
  <AvatarFallback />
</Avatar>

<Avatar size="sm" type="human">
  <AvatarImage src={avatarPhotoUrls[1]} alt="Ada" />
  <AvatarFallback />
</Avatar>

<Avatar size="sm" type="human">
  <AvatarFallback />
</Avatar>`,
  badge: `import { Avatar, AvatarFallback, AvatarBadge } from "raft-ui";
import { Check } from "lucide-react";

<div className="flex items-end gap-4">
  <Avatar size="xl" type="agent">
    <AvatarImage src={avatarPhotoUrls[0]} alt="Atlas" />
    <AvatarFallback />
    <AvatarBadge />
  </Avatar>
  <Avatar size="xl" type="human">
    <AvatarImage src={avatarPhotoUrls[1]} alt="Ada" />
    <AvatarFallback />
    <AvatarBadge className="bg-info-base">
      <Check />
    </AvatarBadge>
  </Avatar>
</div>

<div className="flex items-end gap-4">
  {(["xl", "lg", "md", "sm"] as const).map((size, index) => (
    <Avatar key={size} size={size} type="agent">
      <AvatarImage src={avatarPhotoUrls[index % avatarPhotoUrls.length]} alt="" />
      <AvatarFallback />
      <AvatarBadge />
    </Avatar>
  ))}
</div>`,
  group: `import { Avatar, AvatarGroup, AvatarGroupCount } from "raft-ui";

<AvatarGroup>
  {avatarPhotoUrls.slice(0, 3).map((src, index) => (
    <Avatar key={src} size="sm" type={index === 1 ? "human" : "agent"}>
      <AvatarImage src={src} alt="" />
      <AvatarFallback />
    </Avatar>
  ))}
  <AvatarGroupCount size="sm">+3</AvatarGroupCount>
</AvatarGroup>`,
  sizes: `{(["xl", "lg", "md", "sm", "xs", "2xs", "3xs"] as const).map((size, index) => (
  <Avatar key={size} size={size} type="agent">
    <AvatarImage src={avatarPhotoUrls[index % avatarPhotoUrls.length]} alt="" />
    <AvatarFallback />
  </Avatar>
))}`,
  migrationSizes: `// Source contexts collapsed into public sizes:
<Avatar size="xl" type="agent" />  // profile-tile
<Avatar size="lg" type="agent" />  // mention-card
<Avatar size="md" type="agent" />  // panel-header
<Avatar size="sm" type="agent" />  // surface-list
<Avatar size="xs" type="agent" />  // compact-list
<Avatar size="2xs" type="agent" /> // sidebar-list
<Avatar size="3xs" type="agent" /> // preview-mini`,
  sourceContexts: `const SPEC = {
  "profile-tile": { size: "size-16", border: "border-2", agentPixel: 60, gravatarSize: 60, placeholderIcon: 32 },
  "account-tile": { size: "size-14", border: "border-2", agentPixel: 52, gravatarSize: 52, placeholderIcon: 24 },
  "mention-card": { size: "size-12", border: "border-2", agentPixel: 44, gravatarSize: 44, placeholderIcon: 24 },
  "panel-header": { size: "size-9", border: "border-2", agentPixel: 32, gravatarSize: 32, placeholderIcon: 18 },
  "surface-list": { size: "size-8", border: "border-2", agentPixel: 28, gravatarSize: 28, placeholderIcon: 16 },
  "members-row": { size: "size-7", border: "border", agentPixel: 26, gravatarSize: 24, placeholderIcon: 14 },
  "creator-link": { size: "size-[22px]", border: "border", agentPixel: 20, gravatarSize: 20, placeholderIcon: 12 },
  "compact-list": { size: "size-5", border: "border", agentPixel: 18, gravatarSize: 18, placeholderIcon: 12 },
  "sidebar-list": { size: "size-[18px]", border: "border", agentPixel: 16, gravatarSize: 16, placeholderIcon: 10 },
  "preview-mini": { size: "size-[14px]", border: "border", agentPixel: 14, gravatarSize: 14, placeholderIcon: 10 },
}`,
  sourceIdentity: `// Source owned identity resolution inside AvatarSlot:
// agentAvatarUrl -> AgentAvatar
// humanPlaceholder -> static User icon
// humanAvatarUrl -> uploaded human image
// gravatarHash/email -> GravatarAvatar
<AvatarSlot context="surface-list" type="agent" agentAvatarUrl={agent.avatarUrl} />
<AvatarSlot context="surface-list" type="human" humanAvatarUrl={human.avatarUrl} gravatarHash={human.gravatarHash} />`,
} as const;

const AVATAR_PROPS: readonly PropRow[] = [
  {
    name: "size",
    type: SIZE_OPTIONS.map((s) => `"${s}"`).join(" | "),
    description: "Fixes the frame size and border width (xl 64px down to 3xs 14px).",
  },
  {
    name: "type",
    type: '"agent" | "human"',
    description:
      "Role-keyed bg: agent → cyan, human → lavender (+ text-black for the placeholder).",
  },
  {
    name: "children",
    type: "ReactNode",
    description:
      "Composed parts: AvatarImage, AvatarFallback, AvatarBadge. Defaults to a placeholder AvatarFallback when empty.",
  },
  {
    name: "...props",
    type: "Base UI Avatar.Root.Props",
    description: "Native span attributes (className for positioning, etc.).",
  },
];

const PART_PROPS: readonly PropRow[] = [
  {
    name: "AvatarImage",
    type: "Base UI Avatar.Image.Props",
    description:
      "Managed image part. Fills the frame and reveals fallback while loading or on error.",
  },
  {
    name: "AvatarFallback",
    type: "Base UI Avatar.Fallback.Props",
    description: "Fallback part. Defaults to the scaled User icon when no children are passed.",
  },
  {
    name: "AvatarBadge",
    type: 'ComponentProps<"span">',
    description: "Bottom-right badge slot. Auto-scales from the parent avatar size.",
  },
  {
    name: "AvatarGroup",
    type: 'ComponentProps<"div">',
    description: "Overlapping avatar stack.",
  },
  {
    name: "AvatarGroupCount",
    type: 'ComponentProps<"span"> & { size: AvatarSize }',
    description: "Trailing +N chip. Its size should match the sibling avatars.",
  },
];

const AvatarCurrent = AVATAR_SOURCE_COMPARISON_COMPOSITION;

const AVATAR_COMPOSITION_RAW_SOURCES = {
  IdentityResolution: avatarIdentityResolutionCompositionSource,
  PanelHeader: avatarPanelHeaderCompositionSource,
  Scale: avatarScaleCompositionSource,
} as const;

const AVATAR_COMPOSITION_SOURCES = createCompositionSourceMap(AVATAR_COMPOSITION_RAW_SOURCES);

const AVATAR_COMPOSITION_SNIPPET_IDS = {
  IdentityResolution: "avatarIdentityResolutionComposition",
  PanelHeader: "avatarPanelHeaderComposition",
  Scale: "avatarScaleComposition",
} as const;

type AvatarCompositionKey = keyof typeof AVATAR_COMPOSITION_SOURCES;

export const Route = createFileRoute("/components/avatar")({
  component: AvatarDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        ...createCompositionSnippetMap(AVATAR_COMPOSITION_SOURCES, AVATAR_COMPOSITION_SNIPPET_IDS),
      },
    }),
});

function AvatarDoc() {
  const code = Route.useLoaderData();
  const avatarComposition = (key: AvatarCompositionKey) =>
    createCompositionPanelProps({
      code,
      key,
      paths: AVATAR_SOURCE_COMPARISON_COMPOSITION_PATHS,
      snippetIds: AVATAR_COMPOSITION_SNIPPET_IDS,
      sources: AVATAR_COMPOSITION_SOURCES,
    });

  return (
    <DocPage
      title="Avatar"
      description="A black-bordered avatar frame with a role-keyed background, managed image, and placeholder."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <AvatarPlaygroundPreview />
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
          <DocSubsection parentId="usage" id="image" title="Avatar image">
            <DocNote>
              Source <code>AvatarSlot</code> parsed <code>pixel:*</code>, uploaded human avatars,
              and Gravatar inside the component. Current <code>Avatar</code> keeps that app-domain
              resolution outside: callers pass a resolved image to <code>AvatarImage</code>, or
              leave <code>AvatarFallback</code> visible for placeholders and load failures.
            </DocNote>
            <Example html={code.image}>
              <div className="flex flex-wrap items-end gap-5">
                <IdentityAvatarExample label="Agent pixel">
                  <Avatar size="sm" type="agent">
                    <AvatarImage src={SAMPLE_AGENT_PIXEL} alt="Atlas" />
                    <AvatarFallback />
                  </Avatar>
                </IdentityAvatarExample>
                <IdentityAvatarExample label="Agent image">
                  <Avatar size="sm" type="agent">
                    <AvatarImage src={AVATAR_PHOTOS[0]} alt="Atlas" />
                    <AvatarFallback />
                  </Avatar>
                </IdentityAvatarExample>
                <IdentityAvatarExample label="Human image">
                  <Avatar size="sm" type="human">
                    <AvatarImage src={AVATAR_PHOTOS[1]} alt="Ada" />
                    <AvatarFallback />
                  </Avatar>
                </IdentityAvatarExample>
                <IdentityAvatarExample label="Human placeholder">
                  <Avatar size="sm" type="human">
                    <AvatarFallback />
                  </Avatar>
                </IdentityAvatarExample>
              </div>
            </Example>
          </DocSubsection>

          <DocSubsection parentId="usage" id="badge" title="Badge">
            <DocNote>
              The badge auto-scales with the avatar's <code>size</code> via its{" "}
              <code>data-size</code> + <code>group/avatar</code> hook. Frame, border weight, and
              inner icon all track the step.
            </DocNote>
            <Example html={code.badge} previewClassName="!min-h-56 flex-col gap-8">
              <div className="flex items-end gap-4">
                <Avatar size="xl" type="agent">
                  <AvatarImage src={AVATAR_PHOTOS[0]} alt="Atlas" />
                  <AvatarFallback />
                  <AvatarBadge />
                </Avatar>
                <Avatar size="xl" type="human">
                  <AvatarImage src={AVATAR_PHOTOS[1]} alt="Ada" />
                  <AvatarFallback />
                  <AvatarBadge className="bg-info-base">
                    <Check />
                  </AvatarBadge>
                </Avatar>
              </div>
              <div className="flex items-end gap-4">
                {BADGE_SCALE_SIZES.map((size, index) => (
                  <Avatar key={size} size={size} type="agent">
                    <AvatarImage src={AVATAR_PHOTOS[index % AVATAR_PHOTOS.length]} alt="" />
                    <AvatarFallback />
                    <AvatarBadge />
                  </Avatar>
                ))}
              </div>
            </Example>
          </DocSubsection>

          <DocSubsection parentId="usage" id="group" title="Group">
            <Example html={code.group}>
              <AvatarGroup>
                {AVATAR_PHOTOS.slice(0, 3).map((src, index) => (
                  <Avatar key={src} size="sm" type={index === 1 ? "human" : "agent"}>
                    <AvatarImage src={src} alt="" />
                    <AvatarFallback />
                  </Avatar>
                ))}
                <AvatarGroupCount size="sm">+3</AvatarGroupCount>
              </AvatarGroup>
            </Example>
          </DocSubsection>

          <DocSubsection parentId="usage" id="sizes" title="Sizes">
            <Example html={code.sizes}>
              <div className="flex flex-wrap items-end gap-4">
                {SIZES.map(({ size, context, px }, index) => (
                  <div key={size} className="flex flex-col items-center gap-1.5">
                    <Avatar size={size} type="agent">
                      <AvatarImage src={AVATAR_PHOTOS[index % AVATAR_PHOTOS.length]} alt="" />
                      <AvatarFallback />
                    </Avatar>
                    <span className="font-mono text-black/70 text-xs">{size}</span>
                    <span className="text-[10px] text-black/40">
                      {context} · {px}px
                    </span>
                  </div>
                ))}
              </div>
            </Example>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-root" title="Avatar">
            <PropsTable rows={AVATAR_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-parts" title="Parts">
            <PropsTable rows={PART_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="source-differences" title="Source differences" showThemeSwitcher={false}>
        <div className="space-y-8">
          <DocNote>
            Source <code>AvatarSlot</code> was a product-specific identity slot. Current{" "}
            <code>Avatar</code> is the reusable UI primitive: it keeps the frame, theme, image,
            fallback, badge, and group behavior, while app-domain lookup stays outside. Dropped
            exact sizes are handled by parent compositions, not by leaking every source callsite
            density into the public avatar API.
          </DocNote>
          <SourceDifferenceTable />
          <SourceSizeTable />
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          sourceScenes={SOURCE_SCENES}
          layout="grid"
          items={[
            {
              label: "API shape",
              status: "difference",
              note: "Source AvatarSlot combined frame, context sizing, and app-domain identity lookup props. Current keeps only the frame primitive and exposes image/fallback as compound parts.",
              source: <LegacyAvatarPanelHeaderPreview />,
              brutal: <AvatarCurrent.PanelHeader />,
              elegant: <AvatarCurrent.PanelHeader />,
              elegantDark: <AvatarCurrent.PanelHeader />,
              ...avatarComposition("PanelHeader"),
            },
            {
              label: "Context scale",
              status: "difference",
              note: <ContextScaleNote />,
              source: <LegacyAvatarScalePreview />,
              brutal: <AvatarCurrent.Scale />,
              elegant: <AvatarCurrent.Scale />,
              elegantDark: <AvatarCurrent.Scale />,
              ...avatarComposition("Scale"),
            },
            {
              label: "Identity resolution",
              status: "difference",
              note: "Source routed AgentAvatar and GravatarAvatar inside AvatarSlot. Current delegates URL resolution to callers, then uses Base UI AvatarImage/Fallback for loading and error states.",
              source: <LegacyAvatarIdentityPreview />,
              brutal: <AvatarCurrent.IdentityResolution />,
              elegant: <AvatarCurrent.IdentityResolution />,
              elegantDark: <AvatarCurrent.IdentityResolution />,
              ...avatarComposition("IdentityResolution"),
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}

function LegacyAvatarPanelHeaderPreview() {
  return <LegacyAvatarSlot context="panel-header" type="human" humanAvatarUrl={AVATAR_PHOTOS[1]} />;
}

function IdentityAvatarExample({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      {children}
      <span className="font-mono text-[10px] text-black/50">{label}</span>
    </div>
  );
}

function LegacyAvatarScalePreview() {
  return (
    <div className="flex flex-wrap items-end gap-4">
      {LEGACY_CONTEXTS.map((context) => {
        const marker = LEGACY_CONTEXT_MARKERS[context];

        return (
          <div key={context} className="flex flex-col items-center gap-1.5">
            <LegacyAvatarSlot context={context} type="agent" />
            <span className="max-w-20 text-center font-mono text-[10px] leading-tight text-black/70">
              {context}
            </span>
            <span
              className={[
                "rounded-sm border px-1 py-0.5 font-mono text-[8px] leading-none uppercase",
                marker.className,
              ].join(" ")}
            >
              {marker.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function LegacyAvatarIdentityPreview() {
  return (
    <div className="flex items-center gap-4">
      <LegacyAvatarSlot context="surface-list" type="agent" />
      <LegacyAvatarSlot context="surface-list" type="human" humanPlaceholder />
      <LegacyAvatarSlot context="surface-list" type="human" humanAvatarUrl={AVATAR_PHOTOS[1]} />
    </div>
  );
}

function SourceDifferenceTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line-subtle text-foreground-muted">
            <th className="py-2 pr-6 font-medium">Area</th>
            <th className="py-2 pr-6 font-medium">Source</th>
            <th className="py-2 font-medium">Current</th>
          </tr>
        </thead>
        <tbody>
          {SOURCE_DIFFERENCE_ROWS.map((row) => (
            <tr key={row.area} className="border-b border-line-subtle align-top">
              <td className="py-3 pr-6 font-medium text-foreground-strong">{row.area}</td>
              <td className="py-3 pr-6 text-foreground-muted">{row.source}</td>
              <td className="py-3 text-foreground-muted">{row.current}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ContextScaleNote() {
  return (
    <>
      Source has ten context sizes. Current keeps seven public sizes. Kept:{" "}
      <code>profile-tile 64px</code>, <code>mention-card 48px</code>, <code>panel-header 36px</code>
      , <code>surface-list 32px</code>, <code>compact-list 20px</code>, and{" "}
      <code>sidebar-list 18px</code>, and <code>preview-mini 14px</code>. Dropped exact sizes:{" "}
      <code>account-tile 56px</code> maps to <code>lg/xl</code>, <code>members-row 28px</code> maps
      to <code>sm/xs</code>, and <code>creator-link 22px</code> maps to <code>xs</code>. Parent
      row/card compositions own the remaining spacing.
    </>
  );
}

function SourceSizeTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line-subtle text-foreground-muted">
            <th className="py-2 pr-6 font-medium">Source context</th>
            <th className="py-2 pr-6 font-medium">Source frame</th>
            <th className="py-2 pr-6 font-medium">Source inner</th>
            <th className="py-2 pr-6 font-medium">Current size</th>
            <th className="py-2 pr-6 font-medium">Reason</th>
            <th className="py-2 font-medium">Implementation</th>
          </tr>
        </thead>
        <tbody>
          {SOURCE_SIZE_ROWS.map((row) => (
            <tr key={row.context} className="border-b border-line-subtle align-top">
              <td className="py-3 pr-6 font-mono text-xs text-info-dark">{row.context}</td>
              <td className="py-3 pr-6 text-foreground-muted">{row.sourceFrame}</td>
              <td className="py-3 pr-6 text-foreground-muted">{row.sourceInner}</td>
              <td className="py-3 pr-6 font-mono text-xs text-foreground-strong">{row.current}</td>
              <td className="py-3 pr-6 text-foreground-muted">{row.reason}</td>
              <td className="py-3 text-foreground-muted">{row.implementation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
