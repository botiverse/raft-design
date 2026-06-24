import { createFileRoute } from "@tanstack/react-router";
import { PreviewShell } from "cuvii-rui/wip";
import { Eye } from "lucide-react";

import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import LegacyPreviewShell from "../../../../../packages/ui/src/legacy/PreviewShell.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "variants", title: "Variants" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import { PreviewShell } from "cuvii-rui";

<PreviewShell className="group block w-full p-3 text-left">
  Quoted message preview
</PreviewShell>`,
  variants: `<PreviewShell className="p-3">Default surface</PreviewShell>
<PreviewShell variant="muted" className="p-3">Unavailable</PreviewShell>
<PreviewShell
  render={<button type="button" aria-label="Open preview" onClick={openPreview} />}
  className="w-full p-3 text-left"
>
  Clickable button
</PreviewShell>`,
  sourceQuoted: `<PreviewShell
  onClick={onClick}
  data-testid="quoted-message-card"
  className="group block w-full text-left"
>
  ...
</PreviewShell>`,
  currentQuoted: `<PreviewShell
  render={<button type="button" aria-label="Open quoted message" onClick={onClick} />}
  data-testid="quoted-message-card"
  className="group block w-full text-left"
>
  ...
</PreviewShell>`,
  sourceAttachment: `<PreviewShell
  onClick={disabled ? undefined : onClick}
  aria-busy={loading ? "true" : undefined}
  title={attachment.filename}
  className={\`\${COMPACT_CHIP_LAYOUT}\${stateClassName ? \` \${stateClassName}\` : ""}\`}
>
  ...
</PreviewShell>`,
  currentAttachment: `<PreviewShell
  render={disabled ? undefined : <button type="button" aria-label="Open attachment preview" onClick={onClick} />}
  aria-busy={loading ? "true" : undefined}
  title={attachment.filename}
  className={\`\${COMPACT_CHIP_LAYOUT}\${stateClassName ? \` \${stateClassName}\` : ""}\`}
>
  ...
</PreviewShell>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "variant",
    type: '"default" | "muted"',
    default: '"default"',
    description: "default is the subtle preview skin; muted is the unavailable look.",
  },
  {
    name: "render",
    type: 'useRender.ComponentProps<"div">["render"]',
    description:
      'Swap the root. Use render={<button type="button" aria-label="..." />} for clickable previews.',
  },
  {
    name: "className",
    type: "string",
    description: "Caller-owned layout, appended after the skin.",
  },
  { name: "children", type: "ReactNode", description: "Surface content." },
];

const COMPACT_CHIP_LAYOUT =
  "group/img relative inline-flex h-20 w-44 min-w-44 max-w-44 shrink-0 flex-col justify-between overflow-hidden px-2.5 py-2 text-left transition-colors";

export const Route = createFileRoute("/components/preview-shell")({
  component: PreviewShellDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function PreviewShellDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="PreviewShell"
      description="The canonical subtle preview surface skin shared by quoted messages and attachment chips."
      overview={
        <Differences from="PreviewShell">
          <li>
            source skin is preserved: black/15 border, white bg, hover border deepen, faint hover bg
          </li>
          <li>
            source used <code>onClick</code> to switch between <code>div</code> and{" "}
            <code>button</code>; current uses Base UI <code>useRender</code> so the root is explicit
          </li>
          <li>
            layout is still caller-owned; PreviewShell only owns the shared preview surface skin
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="preview" title="Preview">
        <Example html={code.anatomy}>
          <div className="w-96">
            <QuotedPreviewShell />
          </div>
        </Example>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="PreviewShell.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
        />
      </DocSection>

      <DocSection id="variants" title="Variants">
        <Example html={code.variants}>
          <div className="flex w-72 flex-col gap-3">
            <PreviewShell className="p-3">Default surface</PreviewShell>
            <PreviewShell variant="muted" className="p-3">
              Unavailable
            </PreviewShell>
            <PreviewShell
              render={<button type="button" aria-label="Open preview" onClick={() => {}} />}
              className="w-full p-3 text-left"
            >
              Clickable button
            </PreviewShell>
          </div>
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          items={[
            {
              label: "Quoted message shell",
              status: "difference",
              note: "Source made onClick switch the root to button. Current preserves the same skin and layout but makes the button root explicit through render.",
              source: (
                <LegacyPreviewShell
                  onClick={() => {}}
                  data-testid="quoted-message-card"
                  className="group block w-full text-left"
                >
                  <QuotedPreviewShellContent />
                </LegacyPreviewShell>
              ),
              current: (
                <PreviewShell
                  render={
                    <button type="button" aria-label="Open quoted message" onClick={() => {}} />
                  }
                  data-testid="quoted-message-card"
                  className="group block w-full text-left"
                >
                  <QuotedPreviewShellContent />
                </PreviewShell>
              ),
              sourceCode: code.sourceQuoted,
              currentCode: code.currentQuoted,
            },
            {
              label: "Attachment chip shell",
              status: "difference",
              note: "Source reused PreviewShell for attachment chip border/bg/hover while AttachmentChip owned width and content layout. Current keeps the same split; clickable state is explicit via render.",
              source: (
                <LegacyPreviewShell
                  onClick={() => {}}
                  title="specification.pdf"
                  className={COMPACT_CHIP_LAYOUT}
                >
                  <AttachmentPreviewShellContent />
                </LegacyPreviewShell>
              ),
              current: (
                <PreviewShell
                  render={
                    <button type="button" aria-label="Open attachment preview" onClick={() => {}} />
                  }
                  title="specification.pdf"
                  className={COMPACT_CHIP_LAYOUT}
                >
                  <AttachmentPreviewShellContent />
                </PreviewShell>
              ),
              sourceCode: code.sourceAttachment,
              currentCode: code.currentAttachment,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}

function QuotedPreviewShell() {
  return (
    <PreviewShell className="group block w-full text-left">
      <QuotedPreviewShellContent />
    </PreviewShell>
  );
}

function QuotedPreviewShellContent() {
  return (
    <div className="px-2.5 py-2 sm:px-3 sm:py-2.5">
      <div className="mb-1 flex items-start gap-2 sm:mb-1.5">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-1 text-xs leading-none">
          <span className="inline-flex items-center gap-1 font-bold text-black/70">general</span>
          <span className="text-black/30">·</span>
          <span className="truncate font-bold text-black/70">Atlas</span>
        </div>
        <span className="shrink-0 font-mono text-[10px] text-black/40">2:14 PM</span>
      </div>
      <div className="line-clamp-2 text-xs leading-snug text-black sm:text-[13px]">
        Shipped the migration. Take a look when you can.
      </div>
    </div>
  );
}

function AttachmentPreviewShellContent() {
  return (
    <>
      <div className="w-full min-w-0 max-w-full overflow-hidden">
        <div className="block w-full max-w-full truncate text-xs font-bold text-black">
          specification.pdf
        </div>
        <div className="mt-0.5 truncate text-[10px] text-black/45">1.2 MB</div>
      </div>
      <div className="flex items-center gap-1.5 pr-5 font-mono text-[10px] font-bold tracking-[-0.04em] whitespace-nowrap">
        Document
      </div>
      <div className="absolute right-1.5 bottom-1.5 flex items-center justify-center text-black/60 group-hover/img:text-black">
        <Eye size={12} />
      </div>
    </>
  );
}
