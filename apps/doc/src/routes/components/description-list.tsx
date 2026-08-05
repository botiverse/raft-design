import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import {
  createCompositionSnippetMap,
  createCompositionSourceMap,
} from "#/lib/source-comparison-code.ts";
import { highlightSnippets } from "#/lib/highlight.tsx";
import detailMetadataCompositionSource from "#/modules/description-list/compositions/detail-metadata.composition.tsx?raw";
import { DetailMetadataComposition } from "#/modules/description-list/compositions/detail-metadata.composition.tsx";
import horizontalCompositionSource from "#/modules/description-list/compositions/horizontal.composition.tsx?raw";
import { HorizontalDescriptionListComposition } from "#/modules/description-list/compositions/horizontal.composition.tsx";
import longMonospaceValueCompositionSource from "#/modules/description-list/compositions/long-monospace-value.composition.tsx?raw";
import { LongMonospaceValueComposition } from "#/modules/description-list/compositions/long-monospace-value.composition.tsx";
import memberInfoCompositionSource from "#/modules/description-list/compositions/member-info.composition.tsx?raw";
import richCreatorValueCompositionSource from "#/modules/description-list/compositions/rich-creator-value.composition.tsx?raw";
import { RichCreatorValueComposition } from "#/modules/description-list/compositions/rich-creator-value.composition.tsx";
import { DescriptionListPreview } from "#/modules/description-list/description-list.preview.tsx";
import LegacyKeyValueRow from "../../../../../packages/ui/src/legacy/KeyValueRow.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SNIPPETS = {
  anatomy: `import { ChevronDown, CircleHelp } from "lucide-react";
import {
  Badge,
  Button,
  DescriptionDetails,
  DescriptionItem,
  DescriptionList,
  DescriptionTerm,
} from "raft-ui";

<DescriptionList>
  <DescriptionItem>
    <DescriptionTerm>
      Role
      {/* Optional term-side control */}
      <Button variant="ghost" size="icon-xs" aria-label="Explain member roles">
        <CircleHelp />
      </Button>
    </DescriptionTerm>
    <DescriptionDetails>
      {/* Values can compose other UI components */}
      <Badge render={<button type="button" aria-label="Change role" />}>
        Owner
        <ChevronDown />
      </Badge>
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
  Horizontal: horizontalCompositionSource,
  LongMonospaceValue: longMonospaceValueCompositionSource,
  MemberInfo: memberInfoCompositionSource,
  RichCreatorValue: richCreatorValueCompositionSource,
});

const COMPOSITION_SNIPPETS = createCompositionSnippetMap(COMPOSITION_SOURCES, {
  DetailMetadata: "descriptionListDetailMetadataComposition",
  Horizontal: "descriptionListHorizontalComposition",
  LongMonospaceValue: "descriptionListLongMonospaceValueComposition",
  MemberInfo: "descriptionListMemberInfoComposition",
  RichCreatorValue: "descriptionListRichCreatorValueComposition",
});

const COMPOSITION_PATHS = {
  DetailMetadata:
    "apps/doc/src/modules/description-list/compositions/detail-metadata.composition.tsx",
  LongMonospaceValue:
    "apps/doc/src/modules/description-list/compositions/long-monospace-value.composition.tsx",
  MemberInfo: "apps/doc/src/modules/description-list/compositions/member-info.composition.tsx",
  RichCreatorValue:
    "apps/doc/src/modules/description-list/compositions/rich-creator-value.composition.tsx",
} as const;

const DESCRIPTION_LIST_PARTS: readonly PropRow[] = [
  {
    name: "DescriptionList",
    type: 'useRender.ComponentProps<"dl"> & { direction?: "vertical" | "horizontal" }',
    description:
      "Semantic definition-list root. Owns the vertical or horizontal layout shared by its direct items.",
  },
  {
    name: "DescriptionItem",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Groups one term/details pair. Horizontal lists expand direct items into the root grid.",
  },
  {
    name: "DescriptionTerm",
    type: 'useRender.ComponentProps<"dt">',
    description:
      "Theme-styled metadata label. Compose optional controls directly alongside the label.",
  },
  {
    name: "DescriptionDetails",
    type: 'useRender.ComponentProps<"dd">',
    description:
      "Metadata value with the native dd margin reset. Values may contain text, badges, links, or controls.",
  },
];

const DESCRIPTION_LIST_PROPS: readonly PropRow[] = [
  {
    name: "direction",
    type: '"vertical" | "horizontal"',
    default: '"vertical"',
    description:
      "Vertical preserves the normal item flow. Horizontal aligns direct term/details pairs in a shared grid and returns to one column below sm.",
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
      description="A semantic term/details list with vertical and responsive horizontal layouts."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <DescriptionListPreview
          code={code.descriptionListMemberInfoComposition}
          collapsedCode={code.descriptionListMemberInfoCompositionBody}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} collapsedHtml={code.anatomyBody} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <DocSubsection parentId="usage" id="horizontal" title="Horizontal">
          <p>
            Use the horizontal direction for compact label/value metadata, such as action-card
            properties. It returns to one column on small screens.
          </p>
          <div className="mt-4">
            <Preview>
              <Preview.Canvas>
                <HorizontalDescriptionListComposition />
              </Preview.Canvas>
              <Preview.Code
                html={code.descriptionListHorizontalComposition}
                collapsedHtml={code.descriptionListHorizontalCompositionBody}
              />
            </Preview>
          </div>
        </DocSubsection>
      </DocSection>
      <DocSection id="api" title="API">
        <div className="space-y-8">
          <DocSubsection parentId="api" id="api-parts" title="Parts">
            <PropsTable rows={DESCRIPTION_LIST_PARTS} nameColumnLabel="Part" />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-description-list-props"
            title="DescriptionList props"
          >
            <PropsTable rows={DESCRIPTION_LIST_PROPS} />
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
