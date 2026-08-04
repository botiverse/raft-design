import { createFileRoute } from "@tanstack/react-router";
import { InlineCode } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { createCompositionSnippetMap, createCompositionSourceMap } from "#/lib/composition-code.ts";
import { highlightSnippets } from "#/lib/highlight.tsx";
import horizontalCompositionSource from "#/modules/description-list/compositions/horizontal.composition.tsx?raw";
import { HorizontalDescriptionListComposition } from "#/modules/description-list/compositions/horizontal.composition.tsx";
import memberInfoCompositionSource from "#/modules/description-list/compositions/member-info.composition.tsx?raw";
import { DescriptionListPreview } from "#/modules/description-list/description-list.preview.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
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
} as const;

const COMPOSITION_SOURCES = createCompositionSourceMap({
  Horizontal: horizontalCompositionSource,
  MemberInfo: memberInfoCompositionSource,
});

const COMPOSITION_SNIPPETS = createCompositionSnippetMap(COMPOSITION_SOURCES, {
  Horizontal: "descriptionListHorizontalComposition",
  MemberInfo: "descriptionListMemberInfoComposition",
});

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
            Use <InlineCode>direction="horizontal"</InlineCode> for compact label/value metadata,
            such as action-card properties. It returns to one column on small screens.
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
    </DocPage>
  );
}
