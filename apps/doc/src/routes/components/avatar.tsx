import { createFileRoute } from "@tanstack/react-router";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
  type AvatarProps,
} from "@slock/ui";
import { Check } from "lucide-react";

import { Callout } from "#/components/callout.tsx";
import { CodeBlock } from "#/components/code-block.tsx";
import { ComponentPlayground } from "#/components/component-playground.tsx";
import { ComponentPreview } from "#/components/component-preview.tsx";
import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.ts";
import LegacyAvatarSlot from "../../../../../packages/ui/src/legacy/AvatarSlot.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "sizes", title: "Sizes" },
  { id: "image", title: "Avatar image" },
  { id: "badge", title: "Badge" },
  { id: "group", title: "Group" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

// Self-contained sample image (offline) for the managed-image demo.
const SAMPLE_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='64' height='64' fill='%2367e8f9'/><circle cx='32' cy='24' r='12' fill='%23000'/><rect x='12' y='40' width='40' height='24' rx='8' fill='%23000'/></svg>";

// t-shirt scale → the original call-site "context" it replaces (px is the frame size).
const SIZES = [
  { size: "3xl", context: "profile-tile", px: 64 },
  { size: "2xl", context: "account-tile", px: 56 },
  { size: "xl", context: "mention-card", px: 48 },
  { size: "lg", context: "panel-header", px: 36 },
  { size: "md", context: "surface-list", px: 32 },
  { size: "sm", context: "members-row", px: 28 },
  { size: "xs", context: "creator-link", px: 22 },
  { size: "2xs", context: "compact-list", px: 20 },
  { size: "3xs", context: "sidebar-list", px: 18 },
  { size: "4xs", context: "preview-mini", px: 14 },
] as const;

const SIZE_OPTIONS = SIZES.map((s) => s.size);

const TYPES = ["agent", "human"] as const;

// Representative steps for the badge auto-scale demo (a badge below sm is too small to read).
const BADGE_SCALE_SIZES = ["3xl", "2xl", "xl", "lg", "md", "sm"] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import { Avatar } from "@slock/ui";

<Avatar size="lg" type="agent" />`,
  image: `import { Avatar, AvatarImage, AvatarFallback } from "@slock/ui";

// AvatarImage is managed by Base UI: while it loads or if it errors,
// the AvatarFallback shows instead (placeholder icon, or custom content).
<Avatar size="lg" type="human">
  <AvatarImage src={url} alt="Atlas" />
  <AvatarFallback />
</Avatar>`,
  badge: `import { Avatar, AvatarFallback, AvatarBadge } from "@slock/ui";

<Avatar size="lg" type="agent">
  <AvatarFallback />
  <AvatarBadge className="bg-brutal-lime" />
</Avatar>`,
  group: `import { Avatar, AvatarGroup, AvatarGroupCount } from "@slock/ui";

<AvatarGroup>
  <Avatar size="md" type="agent" />
  <Avatar size="md" type="human" />
  <Avatar size="md" type="agent" />
  <AvatarGroupCount size="md">+3</AvatarGroupCount>
</AvatarGroup>`,
  sourceApi: `<AvatarSlot
  context="panel-header"
  type="human"
  humanAvatarUrl={member.avatarUrl}
  gravatarHash={member.gravatarHash}
/>`,
  currentApi: `<Avatar size="lg" type="human">
  <AvatarImage src={member.avatarUrl} alt={member.name} />
  <AvatarFallback />
</Avatar>`,
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
  currentSizes: `<Avatar size="3xl" type="agent" />
<Avatar size="2xl" type="agent" />
<Avatar size="xl" type="agent" />
<Avatar size="lg" type="agent" />
<Avatar size="md" type="agent" />
<Avatar size="sm" type="agent" />
<Avatar size="xs" type="agent" />
<Avatar size="2xs" type="agent" />
<Avatar size="3xs" type="agent" />
<Avatar size="4xs" type="agent" />`,
  sourceIdentity: `// Source owned identity resolution inside AvatarSlot:
// agentAvatarUrl -> AgentAvatar
// humanPlaceholder -> static User icon
// humanAvatarUrl -> uploaded human image
// gravatarHash/email -> GravatarAvatar
<AvatarSlot context="surface-list" type="agent" agentAvatarUrl={agent.avatarUrl} />
<AvatarSlot context="surface-list" type="human" humanAvatarUrl={human.avatarUrl} gravatarHash={human.gravatarHash} />`,
  currentIdentity: `// Current keeps identity resolution outside the UI primitive:
const src = resolveAvatarUrl(person);

<Avatar size="md" type={person.kind === "agent" ? "agent" : "human"}>
  {src ? <AvatarImage src={src} alt={person.name} /> : null}
  <AvatarFallback />
</Avatar>`,
} as const;

type PlaygroundValues = {
  size: NonNullable<AvatarProps["size"]>;
  type: NonNullable<AvatarProps["type"]>;
};

const PROPS: readonly PropRow[] = [
  {
    name: "size",
    type: SIZE_OPTIONS.map((s) => `"${s}"`).join(" | "),
    description: "Fixes the frame size and border width (3xl 64px down to 4xs 14px).",
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
    type: "HTMLAttributes<HTMLSpanElement>",
    description: "Native span attributes (className for positioning, etc.).",
  },
];

export const Route = createFileRoute("/components/avatar")({
  component: AvatarDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function AvatarDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Avatar"
      description="A black-bordered avatar frame with a role-keyed background, managed image, and placeholder."
      overview={
        <Differences from="AvatarSlot">
          <li>
            brutal frame reproduced 1:1 (per-size frame/border, role bg, placeholder icon sizes);
            the original per-context sizing now lives on a <code>size</code> t-shirt scale
          </li>
          <li>
            rebuilt on Base UI's <code>Avatar</code> primitive — <code>AvatarImage</code> is
            managed, so it reveals the fallback while loading or on error
          </li>
          <li>
            added beyond the original: <code>AvatarImage</code>, <code>AvatarBadge</code>,{" "}
            <code>AvatarGroup</code> + <code>AvatarGroupCount</code>
          </li>
          <li>
            dropped the avatar fetching (<code>AgentAvatar</code> / <code>GravatarAvatar</code>, app
            domain) — pass a URL to <code>AvatarImage</code> or a node via <code>fallback</code>
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

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
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="sizes" title="Sizes">
        <Example html={code.anatomy}>
          <div className="flex flex-wrap items-end gap-4">
            {SIZES.map(({ size, context, px }) => (
              <div key={size} className="flex flex-col items-center gap-1.5">
                <Avatar size={size} type="agent" />
                <span className="font-mono text-black/70 text-xs">{size}</span>
                <span className="text-[10px] text-black/40">
                  {context} · {px}px
                </span>
              </div>
            ))}
          </div>
        </Example>
      </DocSection>

      <DocSection id="image" title="Avatar image">
        <div className="space-y-4">
          <Example html={code.image}>
            <div className="flex items-end gap-4">
              <Avatar size="3xl" type="human">
                <AvatarImage src={SAMPLE_IMAGE} alt="Atlas" />
                <AvatarFallback />
              </Avatar>
              <Avatar size="3xl" type="agent">
                <AvatarImage src="/__broken.png" alt="" />
                <AvatarFallback />
              </Avatar>
            </div>
          </Example>
          <Callout>
            <code>AvatarImage</code> fills the frame (<code>size-full object-cover</code>) and is
            managed by Base UI: the second avatar above points at a broken URL, so its placeholder
            shows instead.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="badge" title="Badge">
        <div className="space-y-4">
          <Example html={code.badge}>
            <div className="flex items-end gap-4">
              <Avatar size="3xl" type="agent">
                <AvatarFallback />
                <AvatarBadge className="bg-brutal-lime" />
              </Avatar>
              <Avatar size="3xl" type="human">
                <AvatarFallback />
                <AvatarBadge className="bg-brutal-cyan">
                  <Check />
                </AvatarBadge>
              </Avatar>
            </div>
          </Example>
          <Callout>
            The badge auto-scales with the avatar's <code>size</code> (via its{" "}
            <code>data-size</code> + <code>group/avatar</code> hook) — frame, border weight, and
            inner icon all track the step:
          </Callout>
          <ComponentPreview>
            <div className="flex items-end gap-4">
              {BADGE_SCALE_SIZES.map((size) => (
                <Avatar key={size} size={size} type="agent">
                  <AvatarFallback />
                  <AvatarBadge className="bg-brutal-lime" />
                </Avatar>
              ))}
            </div>
          </ComponentPreview>
        </div>
      </DocSection>

      <DocSection id="group" title="Group">
        <Example html={code.group}>
          <AvatarGroup>
            <Avatar size="md" type="agent" />
            <Avatar size="md" type="human" />
            <Avatar size="md" type="agent" />
            <AvatarGroupCount size="md">+3</AvatarGroupCount>
          </AvatarGroup>
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          items={[
            {
              label: "API shape",
              status: "difference",
              note: "Source AvatarSlot combined frame, context sizing, and app-domain identity lookup props. Current keeps only the frame primitive and exposes image/fallback as compound parts.",
              source: <LegacyAvatarPanelHeaderPreview />,
              current: <AvatarPanelHeaderPreview />,
              sourceCode: code.sourceApi,
              currentCode: code.currentApi,
            },
            {
              label: "Context scale",
              status: "match",
              note: "The source context sizes and border weights are preserved as the current t-shirt size scale. Context names are intentionally removed from the public API.",
              source: <LegacyAvatarScalePreview />,
              current: <AvatarScalePreview />,
              sourceCode: code.sourceContexts,
              currentCode: code.currentSizes,
            },
            {
              label: "Identity resolution",
              status: "difference",
              note: "Source routed AgentAvatar and GravatarAvatar inside AvatarSlot. Current delegates URL resolution to callers, then uses Base UI AvatarImage/Fallback for loading and error states.",
              source: <LegacyAvatarIdentityPreview />,
              current: <AvatarIdentityPreview />,
              sourceCode: code.sourceIdentity,
              currentCode: code.currentIdentity,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}

function LegacyAvatarPanelHeaderPreview() {
  return <LegacyAvatarSlot context="panel-header" type="human" humanAvatarUrl={SAMPLE_IMAGE} />;
}

function AvatarPanelHeaderPreview() {
  return (
    <Avatar size="lg" type="human">
      <AvatarImage src={SAMPLE_IMAGE} alt="Atlas" />
      <AvatarFallback />
    </Avatar>
  );
}

function LegacyAvatarScalePreview() {
  return (
    <div className="flex flex-wrap items-end gap-4">
      {SIZES.map(({ context }) => (
        <LegacyAvatarSlot key={context} context={context} type="agent" />
      ))}
    </div>
  );
}

function AvatarScalePreview() {
  return (
    <div className="flex flex-wrap items-end gap-4">
      {SIZES.map(({ size }) => (
        <Avatar key={size} size={size} type="agent" />
      ))}
    </div>
  );
}

function LegacyAvatarIdentityPreview() {
  return (
    <div className="flex items-center gap-4">
      <LegacyAvatarSlot context="surface-list" type="agent" />
      <LegacyAvatarSlot context="surface-list" type="human" humanPlaceholder />
      <LegacyAvatarSlot context="surface-list" type="human" humanAvatarUrl={SAMPLE_IMAGE} />
    </div>
  );
}

function AvatarIdentityPreview() {
  return (
    <div className="flex items-center gap-4">
      <Avatar size="md" type="agent" />
      <Avatar size="md" type="human" />
      <Avatar size="md" type="human">
        <AvatarImage src={SAMPLE_IMAGE} alt="Atlas" />
        <AvatarFallback />
      </Avatar>
    </div>
  );
}
