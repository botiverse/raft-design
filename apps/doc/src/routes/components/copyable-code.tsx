import { createFileRoute } from "@tanstack/react-router";
import { InlineCode } from "raft-ui";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { createCompositionSnippetMap, createCompositionSourceMap } from "#/lib/composition-code.ts";
import { highlightSnippets } from "#/lib/highlight.tsx";
import compactDetailCommandCompositionSource from "#/modules/copyable-code/compositions/compact-detail-command.composition.tsx?raw";
import { CompactDetailCommandComposition } from "#/modules/copyable-code/compositions/compact-detail-command.composition.tsx";
import dialogSetupCommandCompositionSource from "#/modules/copyable-code/compositions/dialog-setup-command.composition.tsx?raw";
import { DialogSetupCommandComposition } from "#/modules/copyable-code/compositions/dialog-setup-command.composition.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  anatomy: `import { CopyableCode, CopyableCodeAction, CopyableCodeRoot } from "raft-ui";

<CopyableCodeRoot>
  <CopyableCode />
  <CopyableCodeAction />
</CopyableCodeRoot>`,
} as const;

const COMPOSITION_SOURCES = createCompositionSourceMap({
  CompactDetailCommand: compactDetailCommandCompositionSource,
  DialogSetupCommand: dialogSetupCommandCompositionSource,
});

const COMPOSITION_SNIPPETS = createCompositionSnippetMap(COMPOSITION_SOURCES, {
  CompactDetailCommand: "copyableCodeCompactDetailCommandComposition",
  DialogSetupCommand: "copyableCodeDialogSetupCommandComposition",
});

const COMPOSITION_PATHS = {
  CompactDetailCommand:
    "apps/doc/src/modules/copyable-code/compositions/compact-detail-command.composition.tsx",
  DialogSetupCommand:
    "apps/doc/src/modules/copyable-code/compositions/dialog-setup-command.composition.tsx",
} as const;

const COPYABLE_CODE_ROOT_PROPS: readonly PropRow[] = [
  {
    name: "copied",
    type: "boolean",
    description: "Optional controlled copied state. Omit it to let the component manage feedback.",
  },
  {
    name: "size",
    type: '"sm" | "md"',
    default: '"md"',
    description: "Density for dialog setup rows versus tighter detail-panel rows.",
  },
  {
    name: "onCopy",
    type: "(value: string) => void | Promise<void>",
    description: "Optional callback after Action sends the Code text to the clipboard.",
  },
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"div">',
    description: "Owns copied state, size, and copy behavior for composed parts.",
  },
];

const COPYABLE_CODE_CODE_PROPS: readonly PropRow[] = [
  {
    name: "truncate",
    type: "boolean",
    default: "false",
    description: "Single-line horizontally scrollable treatment for the code text.",
  },
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"code">',
    description: "Code text slot. Its rendered text is the default value copied by Action.",
  },
];

const COPYABLE_CODE_ACTION_PROPS: readonly PropRow[] = [
  {
    name: "ariaLabel",
    type: "string",
    default: '"Copy code"',
    description:
      "Idle accessible name for the icon-only action. It is not rendered as visible text.",
  },
  {
    name: "copiedAriaLabel",
    type: "string",
    default: '"Copied code"',
    description: "Accessible name announced after a successful copy.",
  },
  {
    name: "children",
    type: "ReactNode | ({ copied }) => ReactNode",
    default: "Copy / Check icon",
    description: "Optional visible content for the copy trigger.",
  },
  {
    name: "...props",
    type: "ButtonProps",
    description: "Copy trigger slot with default Copy/Check feedback icon.",
  },
];

export const Route = createFileRoute("/components/copyable-code")({
  component: CopyableCodeDoc,
  loader: () => highlightSnippets({ data: { ...SNIPPETS, ...COMPOSITION_SNIPPETS } }),
});

function CopyableCodeDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="CopyableCode"
      description="A command or code row with a built-in copy action."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <div className="space-y-4">
          <DocNote>
            Use <InlineCode>CopyableCode</InlineCode> for machine setup commands and other
            copy-first code rows. Use <InlineCode>InlineCode</InlineCode> for prose tokens and
            markdown code blocks for rich multi-line code.
          </DocNote>
          <Preview previewClassName="min-h-40">
            <Preview.Canvas>
              <div className="grid w-full max-w-lg gap-4">
                <DialogSetupCommandComposition />
                <CompactDetailCommandComposition />
              </div>
            </Preview.Canvas>
            <Preview.Code
              codeBlock={
                <DocsCodeBlock.Files
                  collapsible={false}
                  files={[
                    {
                      path: COMPOSITION_PATHS.DialogSetupCommand,
                      source: COMPOSITION_SOURCES.DialogSetupCommand,
                      html: code.copyableCodeDialogSetupCommandComposition,
                    },
                    {
                      path: COMPOSITION_PATHS.CompactDetailCommand,
                      source: COMPOSITION_SOURCES.CompactDetailCommand,
                      html: code.copyableCodeCompactDetailCommandComposition,
                    },
                  ]}
                />
              }
            />
          </Preview>
        </div>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-root" title="CopyableCodeRoot">
            <PropsTable rows={COPYABLE_CODE_ROOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-code" title="CopyableCode">
            <PropsTable rows={COPYABLE_CODE_CODE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-action" title="CopyableCodeAction">
            <PropsTable rows={COPYABLE_CODE_ACTION_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
