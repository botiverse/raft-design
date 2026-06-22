import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
  type AvatarProps,
} from "@raft/ui";
import { Check } from "lucide-react";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
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
import avatarIdentityResolutionCompositionSource from "#/compositions/avatar/identity-resolution-composition.tsx?raw";
import avatarPanelHeaderCompositionSource from "#/compositions/avatar/panel-header-composition.tsx?raw";
import avatarScaleCompositionSource from "#/compositions/avatar/scale-composition.tsx?raw";
import {
  AVATAR_SOURCE_COMPARISON_COMPOSITION,
  AVATAR_SOURCE_COMPARISON_COMPOSITION_PATHS,
} from "#/compositions/avatar-source-comparison.tsx";
import LegacyAvatarSlot from "../../../../../packages/ui/src/legacy/AvatarSlot.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "image", title: "Avatar image" },
  { id: "badge", title: "Badge" },
  { id: "group", title: "Group" },
  { id: "sizes", title: "Sizes" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SAMPLE_AGENT_PIXEL =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' shape-rendering='crispEdges'><rect width='64' height='64' fill='%2327CCF3'/><rect x='8' y='0' width='48' height='8' fill='%23141111'/><rect x='0' y='8' width='8' height='24' fill='%23141111'/><rect x='56' y='8' width='8' height='24' fill='%23141111'/><rect x='8' y='32' width='48' height='8' fill='%23141111'/><rect x='16' y='16' width='8' height='8' fill='%23FFFFFF'/><rect x='40' y='16' width='8' height='8' fill='%23FFFFFF'/><rect x='16' y='48' width='8' height='16' fill='%23141111'/><rect x='40' y='48' width='8' height='16' fill='%23141111'/></svg>";
const AVATAR_PHOTOS = [
  "https://unsplash.com/photos/n4KewLKFOZw/download?force=true&w=160&h=160&fit=crop&crop=faces",
  "https://unsplash.com/photos/H6FbE_vxaxQ/download?force=true&w=160&h=160&fit=crop&crop=faces",
  "https://unsplash.com/photos/mxwcEIqJ63Y/download?force=true&w=160&h=160&fit=crop&crop=faces",
  "https://unsplash.com/photos/8CEKQlmnf50/download?force=true&w=160&h=160&fit=crop&crop=faces",
] as const;

// Public t-shirt scale. Source-only one-off contexts collapse into these steps.
const SIZES = [
  { size: "xl", context: "profile/detail", px: 64 },
  { size: "lg", context: "large identity", px: 48 },
  { size: "md", context: "panel header", px: 36 },
  { size: "sm", context: "list rows", px: 32 },
  { size: "xs", context: "compact/sidebar", px: 20 },
  { size: "2xs", context: "inline preview", px: 14 },
] as const;

const SIZE_OPTIONS = SIZES.map((s) => s.size);

const TYPES = ["agent", "human"] as const;

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

const SNIPPETS = {
  anatomy: `import { Avatar, AvatarFallback, AvatarImage, AvatarBadge } from "@raft/ui";

<Avatar size="md" type="human">
  <AvatarImage src={url} alt="Atlas" />
  <AvatarFallback />
  <AvatarBadge />
</Avatar>`,
  image: `import { Avatar, AvatarImage, AvatarFallback } from "@raft/ui";

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
  badge: `import { Avatar, AvatarFallback, AvatarBadge } from "@raft/ui";
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
  group: `import { Avatar, AvatarGroup, AvatarGroupCount } from "@raft/ui";

<AvatarGroup>
  {avatarPhotoUrls.slice(0, 3).map((src, index) => (
    <Avatar key={src} size="sm" type={index === 1 ? "human" : "agent"}>
      <AvatarImage src={src} alt="" />
      <AvatarFallback />
    </Avatar>
  ))}
  <AvatarGroupCount size="sm">+3</AvatarGroupCount>
</AvatarGroup>`,
  sizes: `{(["xl", "lg", "md", "sm", "xs", "2xs"] as const).map((size, index) => (
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
<Avatar size="xs" type="agent" />  // compact-list / sidebar-list
<Avatar size="2xs" type="agent" /> // preview-mini`,
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

type PlaygroundValues = {
  size: NonNullable<AvatarProps["size"]>;
  type: NonNullable<AvatarProps["type"]>;
};

const AVATAR_PROPS: readonly PropRow[] = [
  {
    name: "size",
    type: SIZE_OPTIONS.map((s) => `"${s}"`).join(" | "),
    description: "Fixes the frame size and border width (xl 64px down to 2xs 14px).",
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
      <DocSection id="preview" title="Preview">
        <ComponentPlayground<PlaygroundValues>
          defaultValues={{ size: "lg", type: "agent" }}
          controls={[
            { name: "size", label: "Size", type: "select", options: SIZE_OPTIONS },
            { name: "type", label: "Type", type: "select", options: TYPES },
          ]}
          render={(values) => <Avatar size={values.size} type={values.type} />}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="Avatar.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
        />
      </DocSection>

      <DocSection id="image" title="Avatar image">
        <div className="space-y-4">
          <DocNote>
            Source <code>AvatarSlot</code> parsed <code>pixel:*</code>, uploaded human avatars, and
            Gravatar inside the component. Current <code>Avatar</code> keeps that app-domain
            resolution outside: callers pass a resolved image to <code>AvatarImage</code>, or leave{" "}
            <code>AvatarFallback</code> visible for placeholders and load failures.
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
        </div>
      </DocSection>

      <DocSection id="badge" title="Badge">
        <div className="space-y-4">
          <DocNote>
            The badge auto-scales with the avatar's <code>size</code> via its <code>data-size</code>{" "}
            + <code>group/avatar</code> hook. Frame, border weight, and inner icon all track the
            step.
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
        </div>
      </DocSection>

      <DocSection id="group" title="Group">
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
      </DocSection>

      <DocSection id="sizes" title="Sizes">
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
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">Avatar</h3>
            <PropsTable rows={AVATAR_PROPS} />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">Parts</h3>
            <PropsTable rows={PART_PROPS} />
          </div>
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
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
              note: "Source exposed ten context-specific frame sizes. Current keeps the reusable steps and collapses one-off contexts out of the public API.",
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
      {LEGACY_CONTEXTS.map((context) => (
        <LegacyAvatarSlot key={context} context={context} type="agent" />
      ))}
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
