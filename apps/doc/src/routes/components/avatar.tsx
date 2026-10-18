import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
  InlineCode,
  Status,
} from "raft-ui";
import { Check } from "lucide-react";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { createCompositionSnippetMap, createCompositionSourceMap } from "#/lib/composition-code.ts";
import { SIZES, SIZE_OPTIONS } from "#/modules/avatar/avatar.constants.ts";
import { AvatarPlaygroundPreview } from "#/modules/avatar/avatar.preview.tsx";
import avatarPreviewCompositionSource from "#/modules/avatar/compositions/preview.composition.tsx?raw";
import { AvatarBadgeOffsetContent } from "#/modules/avatar/compositions/badge-offset.composition.tsx";
import { AvatarBadgePresenceContent } from "#/modules/avatar/compositions/badge-presence.composition.tsx";
import avatarBadgePresenceCompositionSource from "#/modules/avatar/compositions/badge-presence.composition.tsx?raw";
import avatarBadgeOffsetCompositionSource from "#/modules/avatar/compositions/badge-offset.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-differences", title: "Source differences" },
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

const SOURCE_SIZE_ROWS = [
  {
    context: "profile-tile",
    sourceFrame: "64px frame, 2px border",
    sourceInner: "agent 60 / human 60 / icon 32",
    current: "xl / 99px",
    reason: "This is a stable profile/detail scale, not a one-off layout adjustment.",
    implementation: 'Use <Avatar size="xl">; image/fallback fills the 99px frame.',
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
    current: "lg / 51px",
    reason: "Mention cards and identity popovers share this visual weight.",
    implementation: 'Use <Avatar size="lg"> inside hover-card or identity header compositions.',
  },
  {
    context: "panel-header",
    sourceFrame: "36px frame, 2px border",
    sourceInner: "agent 32 / human 32 / icon 18",
    current: "md / 35px",
    reason: "Panel headers need a distinct step between list rows and mention cards.",
    implementation: 'Use <Avatar size="md"> in PanelHeader visual/icon slots.',
  },
  {
    context: "surface-list",
    sourceFrame: "32px frame, 2px border",
    sourceInner: "agent 28 / human 28 / icon 16",
    current: "sm / 27px",
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
    current: "2xs / 19px",
    reason:
      "Sidebar and DM rows keep their own public step on the t-shirt scale; it renders at the same 19px as xs.",
    implementation: 'Use <Avatar size="2xs"> inside SidebarItemIcon.',
  },
  {
    context: "compact-list",
    sourceFrame: "20px frame, 1px border",
    sourceInner: "agent 18 / human 18 / icon 12",
    current: "xs / 19px",
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
    current: "Fallback, icon, and badge scale from the parent size; the ink edge stays 1.5px.",
  },
  {
    area: "Frame surface",
    source: "Square frame with role background and black border.",
    current: "Sticker frame with an ink edge; agents sit on stone, people on lavender.",
  },
  {
    area: "Extra parts",
    source: "No badge or group primitive in AvatarSlot.",
    current: "Badge and group are first-class composition parts.",
  },
] as const;

const SNIPPETS = {
  anatomy: `import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "raft-ui";

<Avatar size="md" type="human">
  <AvatarImage src="/avatar.png" alt="" />
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
  badge: `import { Avatar, AvatarBadge, AvatarFallback, AvatarImage, Status } from "raft-ui";
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
    <AvatarBadge className="bg-info">
      <Check />
    </AvatarBadge>
  </Avatar>
  <Avatar size="xl" type="agent">
    <AvatarImage src={avatarPhotoUrls[0]} alt="Nova" />
    <AvatarFallback />
    <AvatarBadge render={<Status aria-hidden variant="success" />} />
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
  sizes: `{sizes.map(({ size, context, px }, index) => (
  <div key={size} className="flex flex-col items-center gap-1.5">
    <Avatar size={size} type="agent">
      <AvatarImage src={avatarPhotoUrls[index % avatarPhotoUrls.length]} alt="" />
      <AvatarFallback />
    </Avatar>
    <span className="font-mono text-xs text-foreground-muted">{size}</span>
    <span className="text-[10px] text-foreground-placeholder">
      {context} · {px}px
    </span>
  </div>
))}`,
} as const;

const AVATAR_PROPS: readonly PropRow[] = [
  {
    name: "size",
    type: SIZE_OPTIONS.map((s) => `"${s}"`).join(" | "),
    description:
      "Fixes the frame size on the DS 8n + 3 steps: xl 99, lg 51, md 35, sm 27, xs and 2xs 19, 3xs 14px. The ink edge stays 1.5px at every size.",
  },
  {
    name: "type",
    type: '"agent" | "human"',
    description:
      "Role-keyed background: agent → stone until its sprite covers it, human → lavender.",
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

const AVATAR_IMAGE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Avatar.Image.Props",
    description:
      "Managed image part. Fills the frame and reveals fallback while loading or on error.",
  },
];

const AVATAR_FALLBACK_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Avatar.Fallback.Props",
    description: "Fallback part. Defaults to the scaled User icon when no children are passed.",
  },
];

const AVATAR_BADGE_PROPS: readonly PropRow[] = [
  {
    name: "presence",
    type: '"online" | "busy" | "error" | "offline" | "external"',
    default: '"online"',
    description:
      "The default dot's status light, from the same map as Status. Ignored when render draws its own indicator.",
  },
  {
    name: "offset",
    type: "[string | number, string | number]",
    description:
      "Where the badge's centre sits, measured from the avatar's top-left: [x, y]. Numbers are px; strings are any CSS length, and percentages are of the avatar, so [\"100%\", 0] is the top-right corner at every size. Omit it to keep the default bottom-right spot.",
  },
  {
    name: "render",
    type: "useRender render prop",
    description:
      "Optional element override. Default is the solid dot; pass render={<Status … />} for activity/presence chrome.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Corner shell on the avatar. The default dot and custom renders auto-scale from the parent size.",
  },
];

const AVATAR_GROUP_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentProps<"div">',
    description: "Overlapping avatar stack.",
  },
];

const AVATAR_GROUP_COUNT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentProps<"span"> & { size: AvatarSize }',
    description: "Trailing +N chip. Its size should match the sibling avatars.",
  },
];

const AVATAR_COMPOSITION_RAW_SOURCES = {
  Preview: avatarPreviewCompositionSource,
  BadgeOffset: avatarBadgeOffsetCompositionSource,
  BadgePresence: avatarBadgePresenceCompositionSource,
} as const;

const AVATAR_COMPOSITION_SOURCES = createCompositionSourceMap(AVATAR_COMPOSITION_RAW_SOURCES);

const AVATAR_COMPOSITION_SNIPPET_IDS = {
  Preview: "avatarPreviewComposition",
  BadgeOffset: "avatarBadgeOffsetComposition",
  BadgePresence: "avatarBadgePresenceComposition",
} as const;

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
  return (
    <DocPage
      title="Avatar"
      description="A square sticker frame with an ink edge, a role-keyed background, managed image, and placeholder."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <AvatarPlaygroundPreview code={code.avatarPreviewComposition} />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-10">
          <DocSubsection parentId="usage" id="image" title="Avatar image">
            <DocNote>
              Source <InlineCode>AvatarSlot</InlineCode> parsed <InlineCode>pixel:*</InlineCode>,
              uploaded human avatars, and Gravatar inside the component. Current{" "}
              <InlineCode>Avatar</InlineCode> keeps that app-domain resolution outside: callers pass
              a resolved image to <InlineCode>AvatarImage</InlineCode>, or leave{" "}
              <InlineCode>AvatarFallback</InlineCode> visible for placeholders and load failures.
            </DocNote>
            <Preview>
              <Preview.Canvas>
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
              </Preview.Canvas>
              <Preview.Code html={code.image} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="badge" title="Badge">
            <DocNote>
              The default dot and custom indicator both auto-scale with the avatar&apos;s{" "}
              <InlineCode>size</InlineCode>. Pass <InlineCode>{`render={<Status />}`}</InlineCode>{" "}
              when the indicator needs <InlineCode>Status</InlineCode> variants —{" "}
              <InlineCode>Status</InlineCode> only owns its color.
            </DocNote>
            <Preview previewClassName="!min-h-56 flex-col gap-8">
              <Preview.Canvas>
                <div className="flex items-end gap-4">
                  <Avatar size="xl" type="agent">
                    <AvatarImage src={AVATAR_PHOTOS[0]} alt="Atlas" />
                    <AvatarFallback />
                    <AvatarBadge />
                  </Avatar>
                  <Avatar size="xl" type="human">
                    <AvatarImage src={AVATAR_PHOTOS[1]} alt="Ada" />
                    <AvatarFallback />
                    <AvatarBadge className="bg-info">
                      <Check />
                    </AvatarBadge>
                  </Avatar>
                  <Avatar size="xl" type="agent">
                    <AvatarImage src={AVATAR_PHOTOS[0]} alt="Nova" />
                    <AvatarFallback />
                    <AvatarBadge
                      title="Working"
                      render={<Status aria-hidden variant="success" />}
                    />
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
              </Preview.Canvas>
              <Preview.Code html={code.badge} collapsedHtml={code.badgeBody} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="badge-presence" title="Badge presence">
            <DocNote>
              <InlineCode>presence</InlineCode> sets the default dot&apos;s status light: online
              (the default), busy for an agent at work, error, offline, or external. The light never
              animates; label it when no word sits beside it.
            </DocNote>
            <Preview previewClassName="!min-h-40">
              <Preview.Canvas>
                <AvatarBadgePresenceContent />
              </Preview.Canvas>
              <Preview.Code html={code.avatarBadgePresenceComposition} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="badge-offset" title="Badge offset">
            <DocNote>
              <InlineCode>offset</InlineCode> places the badge anywhere on the avatar. It is the
              position of the badge&apos;s <strong>centre</strong>, measured from the avatar&apos;s
              top-left corner, as <InlineCode>[x, y]</InlineCode>. Numbers are px; strings are any
              CSS length, and percentages are of the avatar&apos;s size — so the four corners are{" "}
              <InlineCode>[0, 0]</InlineCode>, <InlineCode>{`["100%", 0]`}</InlineCode>,{" "}
              <InlineCode>{`[0, "100%"]`}</InlineCode> and{" "}
              <InlineCode>{`["100%", "100%"]`}</InlineCode> at every size. Without{" "}
              <InlineCode>offset</InlineCode> the badge keeps the default bottom-right spot; size
              and stacking stay owned by the avatar either way.
            </DocNote>
            <Preview previewClassName="!min-h-40">
              <Preview.Canvas>
                <AvatarBadgeOffsetContent />
              </Preview.Canvas>
              <Preview.Code html={code.avatarBadgeOffsetComposition} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="group" title="Group">
            <Preview>
              <Preview.Canvas>
                <AvatarGroup>
                  {AVATAR_PHOTOS.slice(0, 3).map((src, index) => (
                    <Avatar key={src} size="sm" type={index === 1 ? "human" : "agent"}>
                      <AvatarImage src={src} alt="" />
                      <AvatarFallback />
                    </Avatar>
                  ))}
                  <AvatarGroupCount size="sm">+3</AvatarGroupCount>
                </AvatarGroup>
              </Preview.Canvas>
              <Preview.Code html={code.group} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="sizes" title="Sizes">
            <Preview>
              <Preview.Canvas>
                <div className="flex flex-wrap items-end gap-4">
                  {SIZES.map(({ size, context, px }, index) => (
                    <div key={size} className="flex flex-col items-center gap-1.5">
                      <Avatar size={size} type="agent">
                        <AvatarImage src={AVATAR_PHOTOS[index % AVATAR_PHOTOS.length]} alt="" />
                        <AvatarFallback />
                      </Avatar>
                      <span className="font-mono text-xs text-foreground-muted">{size}</span>
                      <span className="text-[10px] text-foreground-placeholder">
                        {context} · {px}px
                      </span>
                    </div>
                  ))}
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.sizes} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-avatar" title="Avatar">
            <PropsTable rows={AVATAR_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-avatar-image" title="AvatarImage">
            <PropsTable rows={AVATAR_IMAGE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-avatar-fallback" title="AvatarFallback">
            <PropsTable rows={AVATAR_FALLBACK_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-avatar-badge" title="AvatarBadge">
            <PropsTable rows={AVATAR_BADGE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-avatar-group" title="AvatarGroup">
            <PropsTable rows={AVATAR_GROUP_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-avatar-group-count" title="AvatarGroupCount">
            <PropsTable rows={AVATAR_GROUP_COUNT_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="source-differences" title="Source differences" showThemeSwitcher={false}>
        <div className="space-y-8">
          <DocNote>
            Source <InlineCode>AvatarSlot</InlineCode> was a product-specific identity slot. Current{" "}
            <InlineCode>Avatar</InlineCode> is the reusable UI primitive: it keeps the frame, image,
            fallback, badge, and group behavior, while app-domain lookup stays outside. Dropped
            exact sizes are handled by parent compositions, not by leaking every source callsite
            density into the public avatar API.
          </DocNote>
          <SourceDifferenceTable />
          <SourceSizeTable />
        </div>
      </DocSection>
    </DocPage>
  );
}

function IdentityAvatarExample({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      {children}
      <span className="font-mono text-[10px] text-foreground-muted">{label}</span>
    </div>
  );
}

function SourceDifferenceTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line-muted text-foreground-muted">
            <th className="py-2 pr-6 font-medium">Area</th>
            <th className="py-2 pr-6 font-medium">Source</th>
            <th className="py-2 font-medium">Current</th>
          </tr>
        </thead>
        <tbody>
          {SOURCE_DIFFERENCE_ROWS.map((row) => (
            <tr key={row.area} className="border-b border-line-muted align-top">
              <td className="py-3 pr-6 font-medium text-foreground">{row.area}</td>
              <td className="py-3 pr-6 text-foreground-muted">{row.source}</td>
              <td className="py-3 text-foreground-muted">{row.current}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SourceSizeTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line-muted text-foreground-muted">
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
            <tr key={row.context} className="border-b border-line-muted align-top">
              <td className="py-3 pr-6 font-mono text-xs text-info-strong">{row.context}</td>
              <td className="py-3 pr-6 text-foreground-muted">{row.sourceFrame}</td>
              <td className="py-3 pr-6 text-foreground-muted">{row.sourceInner}</td>
              <td className="py-3 pr-6 font-mono text-xs text-foreground">{row.current}</td>
              <td className="py-3 pr-6 text-foreground-muted">{row.reason}</td>
              <td className="py-3 text-foreground-muted">{row.implementation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
