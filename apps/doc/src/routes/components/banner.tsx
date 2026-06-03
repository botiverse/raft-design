import { createFileRoute } from "@tanstack/react-router";
import { Banner, BannerBody, BannerIcon, type BannerProps } from "@slock-ui/ui";
import { AlertTriangle, CheckCircle2, CircleAlert, Info } from "lucide-react";

import { Callout } from "#/components/callout.tsx";
import { CodeBlock } from "#/components/code-block.tsx";
import { ComponentPlayground } from "#/components/component-playground.tsx";
import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.ts";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "statuses", title: "Statuses" },
  { id: "sizes", title: "Sizes" },
  { id: "api", title: "API" },
] as const;

const STATUSES = ["destructive", "warning", "info", "success"] as const;
const SIZES = ["sm", "md", "lg"] as const;

// Conventional glyph per status, mirrored in the playground / examples. Banners
// stay iconless by default — composition decides whether to mount a BannerIcon.
const STATUS_ICON = {
  destructive: AlertTriangle,
  warning: CircleAlert,
  info: Info,
  success: CheckCircle2,
} as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import { Banner, BannerBody } from "@slock-ui/ui";

<Banner status="warning">
  <BannerBody>Heads up — this can't be undone.</BannerBody>
</Banner>`,
  statuses: `<Banner status="destructive">
  <BannerIcon><AlertTriangle /></BannerIcon>
  <BannerBody>Irreversible — the channel will be deleted.</BannerBody>
</Banner>
<Banner status="warning">
  <BannerIcon><CircleAlert /></BannerIcon>
  <BannerBody>Please fix the highlighted fields.</BannerBody>
</Banner>`,
  sizes: `<Banner status="info" size="sm">
  <BannerBody>Tight form-error banner.</BannerBody>
</Banner>
<Banner status="info" size="md">
  <BannerBody>Default banner.</BannerBody>
</Banner>
<Banner status="info" size="lg">
  <BannerBody>Prominent surface banner.</BannerBody>
</Banner>`,
} as const;

type PlaygroundValues = {
  status: BannerProps["status"];
  size: NonNullable<BannerProps["size"]>;
  withIcon: boolean;
};

const PROPS: readonly PropRow[] = [
  {
    name: "status",
    type: STATUSES.map((s) => `"${s}"`).join(" | "),
    description: "Drives the surface color of the root.",
  },
  {
    name: "size",
    type: SIZES.map((s) => `"${s}"`).join(" | "),
    default: '"md"',
    description: "sm (p-2, text-xs), md (p-3, text-sm), lg (p-4 + shadow).",
  },
  {
    name: "...props",
    type: "HTMLAttributes<HTMLDivElement>",
    description: "Native div attributes.",
  },
];

const PART_PROPS: readonly PropRow[] = [
  { name: "BannerIcon", type: "ReactNode", description: "Leading icon slot, normalized to 18px." },
  { name: "BannerBody", type: "ReactNode", description: "Flexible text column for the message." },
  { name: "BannerTitle", type: "ReactNode", description: "Optional bold heading inside the body." },
  { name: "BannerActions", type: "ReactNode", description: "Trailing slot, pinned right." },
];

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
          <li>brutal styling reproduced 1:1 (status → surface token, size padding)</li>
          <li>
            <code>shadow-brutal-sm</code> (lg size) maps to the brutal <code>--shadow</code> token
          </li>
          <li>
            composition-first: <code>BannerIcon</code> / <code>BannerBody</code> /{" "}
            <code>BannerTitle</code> / <code>BannerActions</code> parts replace the original{" "}
            <code>icon</code> / <code>withIcon</code> / <code>title</code> / <code>actions</code>{" "}
            props
          </li>
          <li>
            renamed the variants <code>intent</code> → <code>status</code> and <code>density</code>{" "}
            → <code>size</code>
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
          initial={{ status: "warning", size: "md", withIcon: true }}
          controls={[
            { name: "status", label: "Status", type: "select", options: STATUSES },
            { name: "size", label: "Size", type: "select", options: SIZES },
            { name: "withIcon", label: "With icon", type: "boolean" },
          ]}
          render={(values) => {
            const Icon = STATUS_ICON[values.status];
            return (
              <Banner status={values.status} size={values.size} className="w-80">
                {values.withIcon ? (
                  <BannerIcon>
                    <Icon />
                  </BannerIcon>
                ) : null}
                <BannerBody>This action can&rsquo;t be undone.</BannerBody>
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
              <BannerIcon>
                <AlertTriangle />
              </BannerIcon>
              <BannerBody>Irreversible — the channel will be deleted.</BannerBody>
            </Banner>
            <Banner status="warning">
              <BannerIcon>
                <CircleAlert />
              </BannerIcon>
              <BannerBody>Please fix the highlighted fields.</BannerBody>
            </Banner>
            <Banner status="info">
              <BannerIcon>
                <Info />
              </BannerIcon>
              <BannerBody>You&rsquo;re on the free plan.</BannerBody>
            </Banner>
            <Banner status="success">
              <BannerIcon>
                <CheckCircle2 />
              </BannerIcon>
              <BannerBody>Saved.</BannerBody>
            </Banner>
          </div>
        </Example>
      </DocSection>

      <DocSection id="sizes" title="Sizes">
        <div className="space-y-4">
          <Example html={code.sizes}>
            <div className="flex w-80 flex-col gap-3">
              <Banner status="info" size="sm">
                <BannerBody>Tight form-error banner.</BannerBody>
              </Banner>
              <Banner status="info" size="md">
                <BannerBody>Default banner.</BannerBody>
              </Banner>
              <Banner status="info" size="lg">
                <BannerBody>Prominent surface banner.</BannerBody>
              </Banner>
            </div>
          </Example>
          <Callout>
            Banners stay iconless by default, matching the dominant inline pattern. Compose a{" "}
            <code>BannerIcon</code> for the heavier warning surfaces.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
        <PropsTable rows={PART_PROPS} />
      </DocSection>
    </DocPage>
  );
}
