import { createFileRoute } from "@tanstack/react-router";
import { Copy } from "lucide-react";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
import {
  createCompositionSnippetMap,
  createCompositionSourceMap,
} from "#/lib/source-comparison-code.ts";
import { highlightSnippets } from "#/lib/highlight.tsx";
import compactDetailCommandCompositionSource from "#/modules/copyable-code/compositions/compact-detail-command.composition.tsx?raw";
import { CompactDetailCommandComposition } from "#/modules/copyable-code/compositions/compact-detail-command.composition.tsx";
import dialogSetupCommandCompositionSource from "#/modules/copyable-code/compositions/dialog-setup-command.composition.tsx?raw";
import { DialogSetupCommandComposition } from "#/modules/copyable-code/compositions/dialog-setup-command.composition.tsx";

const CONNECT_COMMAND =
  "npx @botiverse/raft-daemon@latest --server-url https://api.raft.build --api-key sk_machine_0000000000000000000000000000000000000000000000000000000000000000 # Zolplay";

const COMPUTER_COMMAND =
  "npx @botiverse/computer@latest setup /zolplay --server-url https://api.raft.build --api-key sk_machine_0000000000000000000000000000000000000000000000000000000000000000";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SOURCE_SCENES = [
  {
    label: "Machine command copy rows",
    scenes: [
      {
        label: "AddMachineDialog.tsx:247-277",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/machine/AddMachineDialog.tsx:247-277",
      },
      {
        label: "MachineDetailPanel.tsx:844-873",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/machine/MachineDetailPanel.tsx:844-873",
      },
    ],
  },
] as const;

const SNIPPETS = {
  preview: `import { CopyableCode } from "raft-ui";

<CopyableCode.Root>
  <CopyableCode.Code truncate>{connectCommand}</CopyableCode.Code>
  <CopyableCode.Action ariaLabel="Copy daemon command" />
</CopyableCode.Root>`,
  anatomy: `<CopyableCode.Root>
  <CopyableCode.Code />
  <CopyableCode.Action />
</CopyableCode.Root>`,
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
    name: "CopyableCode.Root",
    type: "div",
    description: "Owns copied state, size, and copy behavior for composed parts.",
  },
  {
    name: "copied",
    type: "boolean",
    default: "–",
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
    default: "–",
    description: "Optional callback after Action sends the Code text to the clipboard.",
  },
];

const COPYABLE_CODE_CODE_PROPS: readonly PropRow[] = [
  {
    name: "CopyableCode.Code",
    type: "code",
    description: "Code text slot. Its rendered text is the default value copied by Action.",
  },
  {
    name: "truncate",
    type: "boolean",
    default: "false",
    description: "Single-line horizontally scrollable treatment for CopyableCode.Code.",
  },
];

const COPYABLE_CODE_ACTION_PROPS: readonly PropRow[] = [
  {
    name: "CopyableCode.Action",
    type: "Button",
    description: "Copy trigger slot with default Copy/Check feedback icon.",
  },
  {
    name: "ariaLabel / copiedAriaLabel",
    type: "string",
    default: '"Copy code" / "Copied code"',
    description: "Accessible name for the icon-only action. It is not rendered as visible text.",
  },
  {
    name: "children",
    type: "ReactNode | ({ copied }) => ReactNode",
    default: "Copy / Check icon",
    description: "Optional visible content for CopyableCode.Action.",
  },
];

export const Route = createFileRoute("/components/copyable-code")({
  component: CopyableCodeDoc,
  loader: () => highlightSnippets({ data: { ...SNIPPETS, ...COMPOSITION_SNIPPETS } }),
});

function SourceCommandPreview({ size = "md" }: { size?: "sm" | "md" }) {
  const padding = size === "md" ? "py-2" : "py-1.5";
  return (
    <SourceComparisonPreview className="min-h-28">
      <div className="flex w-full max-w-md min-w-0 items-center gap-2">
        <code
          className={`min-w-0 flex-1 break-all border-2 border-black bg-black px-3 ${padding} font-mono text-xs leading-5 text-[oklch(0.827_0.135_130.07)] shadow-[2px_2px_0_#000]`}
        >
          {size === "md" ? CONNECT_COMMAND : COMPUTER_COMMAND}
        </code>
        <button
          type="button"
          className="flex size-8 shrink-0 items-center justify-center border-2 border-black bg-white shadow-[2px_2px_0_#000]"
          aria-label="Copy command"
        >
          <Copy className="size-3.5" aria-hidden />
        </button>
      </div>
    </SourceComparisonPreview>
  );
}

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
            Use CopyableCode for machine setup commands and other copy-first code rows. Use
            InlineCode for prose tokens and markdown code blocks for rich multi-line code.
          </DocNote>
          <Preview previewClassName="min-h-40">
            <Preview.Canvas>
              <div className="grid w-full max-w-lg gap-4">
                <DialogSetupCommandComposition />
                <CompactDetailCommandComposition />
              </div>
            </Preview.Canvas>
            <Preview.Code html={code.preview} />
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
          <DocSubsection parentId="api" id="api-root" title="CopyableCode root">
            <PropsTable rows={COPYABLE_CODE_ROOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-code" title="CopyableCode.Code">
            <PropsTable rows={COPYABLE_CODE_CODE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-action" title="CopyableCode.Action">
            <PropsTable rows={COPYABLE_CODE_ACTION_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          sourceScenes={SOURCE_SCENES}
          items={[
            {
              label: "Dialog setup command",
              status: "difference",
              note: "Source repeated a brutal code row with a separate copy button. Current extracts the row and copy feedback into CopyableCode.",
              source: <SourceCommandPreview />,
              brutal: <DialogSetupCommandComposition />,
              elegant: <DialogSetupCommandComposition />,
              elegantDark: <DialogSetupCommandComposition />,
              compositionCode: code.copyableCodeDialogSetupCommandComposition,
              compositionPath: COMPOSITION_PATHS.DialogSetupCommand,
              compositionSource: COMPOSITION_SOURCES.DialogSetupCommand,
            },
            {
              label: "Compact detail command",
              status: "difference",
              note: "MachineDetailPanel uses the same row at a tighter density for offline reconnect commands.",
              source: <SourceCommandPreview size="sm" />,
              brutal: <CompactDetailCommandComposition />,
              elegant: <CompactDetailCommandComposition />,
              elegantDark: <CompactDetailCommandComposition />,
              compositionCode: code.copyableCodeCompactDetailCommandComposition,
              compositionPath: COMPOSITION_PATHS.CompactDetailCommand,
              compositionSource: COMPOSITION_SOURCES.CompactDetailCommand,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
