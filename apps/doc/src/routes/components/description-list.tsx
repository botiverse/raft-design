import { createFileRoute } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import {
  DescriptionAction,
  DescriptionDetails,
  DescriptionItem,
  DescriptionList,
  DescriptionTerm,
} from "raft-ui/wip";

import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import {
  createCompositionSnippetMap,
  createCompositionSourceMap,
} from "#/lib/source-comparison-code.ts";
import { highlightSnippets } from "#/lib/highlight.tsx";
import detailMetadataCompositionSource from "#/modules/description-list/compositions/detail-metadata.composition.tsx?raw";
import { DetailMetadataComposition } from "#/modules/description-list/compositions/detail-metadata.composition.tsx";
import longMonospaceValueCompositionSource from "#/modules/description-list/compositions/long-monospace-value.composition.tsx?raw";
import { LongMonospaceValueComposition } from "#/modules/description-list/compositions/long-monospace-value.composition.tsx";
import richCreatorValueCompositionSource from "#/modules/description-list/compositions/rich-creator-value.composition.tsx?raw";
import { RichCreatorValueComposition } from "#/modules/description-list/compositions/rich-creator-value.composition.tsx";
import LegacyKeyValueRow from "../../../../../packages/ui/src/legacy/KeyValueRow.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `<DescriptionList>
  <DescriptionItem>
    <DescriptionTerm>
      <DescriptionAction />
    </DescriptionTerm>
    <DescriptionDetails />
  </DescriptionItem>
</DescriptionList>`,
  examples: `<DescriptionList className="flex flex-wrap gap-x-8 gap-y-3">
  <DescriptionItem>
    <DescriptionTerm>Created</DescriptionTerm>
    <DescriptionDetails className="font-mono">Jun 5, 2026</DescriptionDetails>
  </DescriptionItem>
  <DescriptionItem>
    <DescriptionTerm>Email</DescriptionTerm>
    <DescriptionDetails className="break-all font-mono">ada@example.com</DescriptionDetails>
  </DescriptionItem>
  <DescriptionItem>
    <DescriptionTerm>
      Creator
      <DescriptionAction
        render={<button type="button" aria-label="Edit creator" />}
      >
        <Pencil />
      </DescriptionAction>
    </DescriptionTerm>
    <DescriptionDetails className="flex items-center gap-2">
      <span className="size-5 border-2 border-black bg-brutal-yellow" />
      <span className="font-bold">Ada</span>
      <span className="font-mono text-xs text-black/50">@ada</span>
    </DescriptionDetails>
  </DescriptionItem>
</DescriptionList>`,
  sourceCreated: `<KeyValueRow label="Created" value={createdDate} mono />`,
  sourceEmail: `<KeyValueRow label="Email" value={human.email} mono breakAll />`,
  sourceCreator: `<KeyValueRow
  label="Creator"
  valueClassName="flex items-center gap-2"
  value={
    <button type="button" className="flex items-center gap-2 text-sm text-black hover:underline">
      <AvatarSlot context="creator-link" type="human" />
      <span className="font-bold">Ada Lovelace</span>
      <span className="font-mono text-xs text-black/50">@ada</span>
    </button>
  }
/>`,
} as const;

const COMPOSITION_SOURCES = createCompositionSourceMap({
  DetailMetadata: detailMetadataCompositionSource,
  LongMonospaceValue: longMonospaceValueCompositionSource,
  RichCreatorValue: richCreatorValueCompositionSource,
});

const COMPOSITION_SNIPPETS = createCompositionSnippetMap(COMPOSITION_SOURCES, {
  DetailMetadata: "descriptionListDetailMetadataComposition",
  LongMonospaceValue: "descriptionListLongMonospaceValueComposition",
  RichCreatorValue: "descriptionListRichCreatorValueComposition",
});

const COMPOSITION_PATHS = {
  DetailMetadata:
    "apps/doc/src/modules/description-list/compositions/detail-metadata.composition.tsx",
  LongMonospaceValue:
    "apps/doc/src/modules/description-list/compositions/long-monospace-value.composition.tsx",
  RichCreatorValue:
    "apps/doc/src/modules/description-list/compositions/rich-creator-value.composition.tsx",
} as const;

const DESCRIPTION_LIST_ROOT_PROPS: readonly PropRow[] = [
  {
    name: "DescriptionList",
    type: 'useRender.ComponentProps<"dl">',
    description: "Semantic list root for description metadata groups.",
  },
];

const DESCRIPTION_LIST_PART_PROPS: readonly PropRow[] = [
  {
    name: "DescriptionItem",
    type: 'useRender.ComponentProps<"div">',
    description: "Wrapper for one term/details pair. Keeps dl grouping valid and layout-neutral.",
  },
  {
    name: "DescriptionTerm",
    type: 'useRender.ComponentProps<"dt">',
    description: "Muted detail label. Actions can be composed as children.",
  },
  {
    name: "DescriptionDetails",
    type: 'useRender.ComponentProps<"dd">',
    description:
      "Value cell with dd margin reset. Use className for mono, wrapping, badges, or links.",
  },
  {
    name: "DescriptionAction",
    type: 'useRender.ComponentProps<"span">',
    description: "Inline trailing action container for controls next to the term.",
  },
];

export const Route = createFileRoute("/components/description-list")({
  component: DescriptionListDoc,
  loader: () => highlightSnippets({ data: { ...SNIPPETS, ...COMPOSITION_SNIPPETS } }),
});

function DescriptionListDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="DescriptionList"
      description="A compact term/details composition for detail-panel metadata."
      overview={
        <Differences from="KeyValueRow">
          <li>
            <code>KeyValueRow</code> moved to <code>src/legacy</code>; the package surface now
            exposes a description-list composition family
          </li>
          <li>
            source props such as <code>label</code>, <code>value</code>, <code>mono</code>,{" "}
            <code>breakAll</code>, and <code>action</code> are now explicit slots and classes
          </li>
          <li>brutal typography and spacing are preserved for the original detail-panel pattern</li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Example html={code.examples}>
          <DescriptionList className="flex w-full max-w-xl flex-wrap gap-x-8 gap-y-3">
            <DescriptionItem>
              <DescriptionTerm>Created</DescriptionTerm>
              <DescriptionDetails className="font-mono">Jun 5, 2026</DescriptionDetails>
            </DescriptionItem>
            <DescriptionItem>
              <DescriptionTerm>Email</DescriptionTerm>
              <DescriptionDetails className="break-all font-mono">
                ada@example.com
              </DescriptionDetails>
            </DescriptionItem>
            <DescriptionItem>
              <DescriptionTerm>
                Creator
                <DescriptionAction render={<button type="button" aria-label="Edit creator" />}>
                  <Pencil />
                </DescriptionAction>
              </DescriptionTerm>
              <DescriptionDetails className="flex items-center gap-2">
                <span className="size-5 border-2 border-black bg-brutal-yellow" />
                <span className="font-bold">Ada</span>
                <span className="font-mono text-xs text-black/50">@ada</span>
              </DescriptionDetails>
            </DescriptionItem>
          </DescriptionList>
        </Example>
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
          <DocSubsection parentId="api" id="api-root" title="DescriptionList root">
            <PropsTable rows={DESCRIPTION_LIST_ROOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-parts" title="Parts">
            <PropsTable rows={DESCRIPTION_LIST_PART_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          items={[
            {
              label: "Detail metadata",
              status: "difference",
              note: "Source packed label, value, and mono into one props object. Current preserves the same visual contract through term/details slots.",
              source: <LegacyKeyValueRow label="Created" value="Jun 5, 2026" mono />,
              current: <DetailMetadataComposition />,
              sourceCode: code.sourceCreated,
              currentCode: code.descriptionListDetailMetadataComposition,
              compositionCode: code.descriptionListDetailMetadataComposition,
              compositionPath: COMPOSITION_PATHS.DetailMetadata,
              compositionSource: COMPOSITION_SOURCES.DetailMetadata,
            },
            {
              label: "Long monospace value",
              status: "difference",
              note: "Source used boolean styling props. Current keeps the same classes at the value slot callsite.",
              source: <LegacyKeyValueRow label="Email" value="ada@example.com" mono breakAll />,
              current: <LongMonospaceValueComposition />,
              sourceCode: code.sourceEmail,
              currentCode: code.descriptionListLongMonospaceValueComposition,
              compositionCode: code.descriptionListLongMonospaceValueComposition,
              compositionPath: COMPOSITION_PATHS.LongMonospaceValue,
              compositionSource: COMPOSITION_SOURCES.LongMonospaceValue,
            },
            {
              label: "Rich creator value",
              status: "difference",
              note: "Source used valueClassName to style a rich value. Current makes the value slot explicit.",
              source: (
                <LegacyKeyValueRow
                  label="Creator"
                  valueClassName="flex items-center gap-2"
                  value={
                    <button
                      type="button"
                      className="flex items-center gap-2 text-sm text-black hover:underline"
                    >
                      <span className="size-5 border-2 border-black bg-brutal-yellow" />
                      <span className="font-bold">Ada Lovelace</span>
                      <span className="font-mono text-xs text-black/50">@ada</span>
                    </button>
                  }
                />
              ),
              current: <RichCreatorValueComposition />,
              sourceCode: code.sourceCreator,
              currentCode: code.descriptionListRichCreatorValueComposition,
              compositionCode: code.descriptionListRichCreatorValueComposition,
              compositionPath: COMPOSITION_PATHS.RichCreatorValue,
              compositionSource: COMPOSITION_SOURCES.RichCreatorValue,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
