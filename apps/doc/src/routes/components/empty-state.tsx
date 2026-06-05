import { createFileRoute } from "@tanstack/react-router";
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@slock/ui";
import { Inbox, Plus } from "lucide-react";

import { CodeBlock } from "#/components/code-block.tsx";
import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.ts";
import LegacyEmptyState from "../../../../../packages/ui/src/legacy/EmptyState.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "with-action", title: "With action" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import { EmptyState, EmptyStateIcon, EmptyStateTitle } from "@slock/ui";
import { Inbox } from "lucide-react";

<EmptyState>
  <EmptyStateIcon>
    <Inbox size={36} />
  </EmptyStateIcon>
  <EmptyStateTitle>No messages yet</EmptyStateTitle>
</EmptyState>`,
  basic: `<EmptyState>
  <EmptyStateIcon>
    <Inbox size={36} />
  </EmptyStateIcon>
  <EmptyStateTitle>No messages yet</EmptyStateTitle>
  <EmptyStateDescription>Conversations you start will show up here.</EmptyStateDescription>
</EmptyState>`,
  withAction: `<EmptyState>
  <EmptyStateIcon>
    <Inbox size={36} />
  </EmptyStateIcon>
  <EmptyStateTitle>No channels yet</EmptyStateTitle>
  <EmptyStateDescription>Create your first channel to get started.</EmptyStateDescription>
  <EmptyStateActions>
    <Button tone="yellow" size="sm">
      <Plus />
      New channel
    </Button>
  </EmptyStateActions>
</EmptyState>`,
  sourceApi: `<EmptyState
  icon={<Inbox size={36} />}
  title="No messages yet"
  description="Conversations you start will show up here."
  action={<Button tone="yellow" size="sm">New channel</Button>}
/>`,
  currentApi: `<EmptyState>
  <EmptyStateIcon>
    <Inbox size={36} />
  </EmptyStateIcon>
  <EmptyStateTitle>No messages yet</EmptyStateTitle>
  <EmptyStateDescription>Conversations you start will show up here.</EmptyStateDescription>
  <EmptyStateActions>
    <Button tone="yellow" size="sm">New channel</Button>
  </EmptyStateActions>
</EmptyState>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "HTMLAttributes<HTMLDivElement>",
    description: "Native div attributes. Pass render to override the element.",
  },
];

const PART_PROPS: readonly PropRow[] = [
  {
    name: "EmptyStateIcon",
    type: "ReactNode",
    description: "Muted icon slot, conventionally 36px.",
  },
  { name: "EmptyStateTitle", type: "ReactNode", description: "Muted, sentence-case title line." },
  {
    name: "EmptyStateDescription",
    type: "ReactNode",
    description: "Optional supporting copy (max ~32ch).",
  },
  {
    name: "EmptyStateActions",
    type: "ReactNode",
    description: "Optional action slot below the copy.",
  },
];

export const Route = createFileRoute("/components/empty-state")({
  component: EmptyStateDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function EmptyStateDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="EmptyState"
      description="A quiet 'nothing here yet' surface — muted icon, title, and optional action."
      overview={
        <Differences from="EmptyState">
          <li>brutal styling reproduced 1:1 (no icon frame, muted title, 36px icon at callsite)</li>
          <li>
            composition-first: <code>EmptyStateIcon</code> / <code>EmptyStateTitle</code> /{" "}
            <code>EmptyStateDescription</code> / <code>EmptyStateActions</code> parts replace the
            original <code>icon</code> / <code>title</code> / <code>description</code> /{" "}
            <code>action</code> props
          </li>
          <li>
            the <code>default</code> export is now a named <code>EmptyState</code> export
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="preview" title="Preview">
        <Example html={code.basic}>
          <EmptyState>
            <EmptyStateIcon>
              <Inbox size={36} />
            </EmptyStateIcon>
            <EmptyStateTitle>No messages yet</EmptyStateTitle>
            <EmptyStateDescription>
              Conversations you start will show up here.
            </EmptyStateDescription>
          </EmptyState>
        </Example>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <CodeBlock html={code.anatomy} />
      </DocSection>
      <DocSection id="with-action" title="With action">
        <Example html={code.withAction}>
          <EmptyState>
            <EmptyStateIcon>
              <Inbox size={36} />
            </EmptyStateIcon>
            <EmptyStateTitle>No channels yet</EmptyStateTitle>
            <EmptyStateDescription>Create your first channel to get started.</EmptyStateDescription>
            <EmptyStateActions>
              <Button tone="yellow" size="sm">
                <Plus />
                New channel
              </Button>
            </EmptyStateActions>
          </EmptyState>
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
        <PropsTable rows={PART_PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          items={[
            {
              label: "API shape",
              status: "difference",
              note: "Source accepted icon, title, description, and action props. Current keeps the visual contract but exposes those areas as compound parts so callers own composition and semantics.",
              source: <LegacyEmptyStatePreview />,
              current: <EmptyStatePreview />,
              sourceCode: code.sourceApi,
              currentCode: code.currentApi,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}

function EmptyStatePreview() {
  return (
    <EmptyState>
      <EmptyStateIcon>
        <Inbox size={36} />
      </EmptyStateIcon>
      <EmptyStateTitle>No messages yet</EmptyStateTitle>
      <EmptyStateDescription>Conversations you start will show up here.</EmptyStateDescription>
      <EmptyStateActions>
        <Button tone="yellow" size="sm">
          <Plus />
          New channel
        </Button>
      </EmptyStateActions>
    </EmptyState>
  );
}

function LegacyEmptyStatePreview() {
  return (
    <LegacyEmptyState
      icon={<Inbox size={36} />}
      title="No messages yet"
      description="Conversations you start will show up here."
      action={
        <Button tone="yellow" size="sm">
          <Plus />
          New channel
        </Button>
      }
    />
  );
}
