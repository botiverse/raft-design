import { createFileRoute } from "@tanstack/react-router";
import {
  Banner,
  BannerAction,
  BannerDescription,
  BannerTitle,
  Button,
  type BannerProps,
} from "@slock/ui";
import { AlertTriangle, CheckCircle2, CircleAlert, Info, X } from "lucide-react";

import { Callout } from "#/components/callout.tsx";
import { CodeBlock } from "#/components/code-block.tsx";
import { ComponentPlayground } from "#/components/component-playground.tsx";
import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.ts";
import LegacyBanner from "../../../../../packages/ui/src/legacy/Banner.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "statuses", title: "Statuses" },
  { id: "sizes", title: "Sizes" },
  { id: "composition", title: "Composition" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const STATUSES = ["destructive", "warning", "info", "success"] as const;
const SIZES = ["sm", "md", "lg"] as const;

const STATUS_ICON = {
  destructive: AlertTriangle,
  warning: CircleAlert,
  info: Info,
  success: CheckCircle2,
} as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import { Banner, BannerDescription } from "@slock/ui";

<Banner status="warning">
  <BannerDescription>Heads up — this can't be undone.</BannerDescription>
</Banner>`,
  statuses: `<Banner status="destructive">
  <AlertTriangle />
  <BannerDescription>Irreversible — the channel will be deleted.</BannerDescription>
</Banner>
<Banner status="warning">
  <CircleAlert />
  <BannerDescription>Please fix the highlighted fields.</BannerDescription>
</Banner>`,
  sizes: `<Banner status="info" size="sm">
  <BannerDescription>Tight form-error banner.</BannerDescription>
</Banner>
<Banner status="info" size="md">
  <BannerDescription>Default banner.</BannerDescription>
</Banner>
<Banner status="info" size="lg">
  <BannerDescription>Prominent surface banner.</BannerDescription>
</Banner>`,
  composition: `<Banner status="warning">
  <CircleAlert />
  <BannerTitle>Plan limit reached</BannerTitle>
  <BannerDescription>Remove an inactive machine before adding another.</BannerDescription>
  <BannerAction>
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
  <AlertTriangle />
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
  withIcon: boolean;
  withTitle: boolean;
  withActions: boolean;
};

const PROPS: readonly PropRow[] = [
  {
    name: "status",
    type: STATUSES.map((status) => `"${status}"`).join(" | "),
    description: 'Drives the surface color. Source intent="..." maps to this prop.',
  },
  {
    name: "size",
    type: SIZES.map((size) => `"${size}"`).join(" | "),
    default: '"md"',
    description:
      "sm (p-2, text-xs), md (p-3, text-sm), lg (p-4 + shadow). Source density maps to this prop.",
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
    description: "Place a lucide icon as a direct Banner child. The root normalizes 18px SVGs.",
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
];

function DismissIconButton() {
  return (
    <button
      type="button"
      aria-label="Dismiss"
      className="inline-flex size-6 shrink-0 items-center justify-center border-2 border-black bg-white text-black transition-transform hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)] [&>svg]:size-3.5"
    >
      <X />
    </button>
  );
}

export const Route = createFileRoute("/components/banner")({
  component: BannerDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function BannerDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Banner"
      description="An inline banner / callout / alert composed from a status-driven root and slot parts."
      overview={
        <Differences from="Banner">
          <li>brutal styling reproduced 1:1 (status surface token, density padding, lg shadow)</li>
          <li>
            source <code>intent</code> is renamed to <code>status</code>; source{" "}
            <code>density</code> is renamed to <code>size</code>
          </li>
          <li>
            source <code>icon</code>, <code>withIcon</code>, <code>title</code>, and{" "}
            <code>actions</code> props move to direct icon, title, description, and action
            composition
          </li>
          <li>
            aligned to shadcn Alert composition: icon is a direct child, followed by title,
            description, and action slots
          </li>
          <li>
            all slots use Base UI <code>useRender</code>, so the root and each part can swap the
            rendered element without changing styling
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
          defaultValues={{
            status: "warning",
            size: "md",
            withIcon: true,
            withTitle: false,
            withActions: false,
          }}
          controls={[
            { name: "status", label: "Status", type: "select", options: STATUSES },
            { name: "size", label: "Size", type: "select", options: SIZES },
            { name: "withIcon", label: "With icon", type: "boolean" },
            { name: "withTitle", label: "With title", type: "boolean" },
            { name: "withActions", label: "With actions", type: "boolean" },
          ]}
          render={(values) => {
            const Icon = STATUS_ICON[values.status];
            return (
              <Banner status={values.status} size={values.size} className="w-80">
                {values.withIcon ? <Icon /> : null}
                {values.withTitle ? <BannerTitle>Review required</BannerTitle> : null}
                <BannerDescription>This action can&rsquo;t be undone.</BannerDescription>
                {values.withActions ? (
                  <BannerAction>
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
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="statuses" title="Statuses">
        <Example html={code.statuses}>
          <div className="flex w-80 flex-col gap-3">
            <Banner status="destructive">
              <AlertTriangle />
              <BannerDescription>Irreversible — the channel will be deleted.</BannerDescription>
            </Banner>
            <Banner status="warning">
              <CircleAlert />
              <BannerDescription>Please fix the highlighted fields.</BannerDescription>
            </Banner>
            <Banner status="info">
              <Info />
              <BannerDescription>You&rsquo;re on the free plan.</BannerDescription>
            </Banner>
            <Banner status="success">
              <CheckCircle2 />
              <BannerDescription>Saved.</BannerDescription>
            </Banner>
          </div>
        </Example>
      </DocSection>

      <DocSection id="sizes" title="Sizes">
        <div className="space-y-4">
          <Example html={code.sizes}>
            <div className="flex w-80 flex-col gap-3">
              <Banner status="info" size="sm">
                <BannerDescription>Tight form-error banner.</BannerDescription>
              </Banner>
              <Banner status="info" size="md">
                <BannerDescription>Default banner.</BannerDescription>
              </Banner>
              <Banner status="info" size="lg">
                <BannerDescription>Prominent surface banner.</BannerDescription>
              </Banner>
            </div>
          </Example>
          <Callout>
            Banners stay iconless by default, matching the dominant inline pattern. Compose a direct
            icon child for the heavier warning surfaces.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="composition" title="Composition">
        <Example html={code.composition}>
          <div className="w-96">
            <Banner status="warning">
              <CircleAlert />
              <BannerTitle>Plan limit reached</BannerTitle>
              <BannerDescription>
                Remove an inactive machine before adding another.
              </BannerDescription>
              <BannerAction>
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
          items={[
            {
              label: "Iconless warning",
              status: "difference",
              note: "Visual output matches. Source intent maps to current status, and body content moves into BannerDescription.",
              source: (
                <LegacyBanner intent="warning">Please fix the highlighted fields.</LegacyBanner>
              ),
              current: (
                <Banner status="warning">
                  <BannerDescription>Please fix the highlighted fields.</BannerDescription>
                </Banner>
              ),
              sourceCode: code.sourceDefault,
              currentCode: code.currentDefault,
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
              current: (
                <Banner status="destructive">
                  <AlertTriangle />
                  <BannerTitle>Delete server</BannerTitle>
                  <BannerDescription>This can&rsquo;t be undone.</BannerDescription>
                </Banner>
              ),
              sourceCode: code.sourceIcon,
              currentCode: code.currentIcon,
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
              current: (
                <Banner status="info" size="lg">
                  <Info />
                  <BannerDescription>You&rsquo;re on the free plan.</BannerDescription>
                  <BannerAction>
                    <DismissIconButton />
                  </BannerAction>
                </Banner>
              ),
              sourceCode: code.sourceActions,
              currentCode: code.currentActions,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
