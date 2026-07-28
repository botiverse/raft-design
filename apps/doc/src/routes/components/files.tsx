import { createFileRoute } from "@tanstack/react-router";

import { Differences } from "#/components/differences.tsx";
import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { createCompositionSourceMap } from "#/lib/source-comparison-code.ts";
import { stripSourceCodeBlocks } from "#/lib/source-code.ts";
import { FilesPanelDefaultComposition } from "#/modules/files/compositions/default.composition.tsx";
import filesPanelDefaultCompositionSource from "#/modules/files/compositions/default.composition.tsx?raw";
import { FilesPanelFileRowComposition } from "#/modules/files/compositions/file-row.composition.tsx";
import filesPanelFileRowCompositionSource from "#/modules/files/compositions/file-row.composition.tsx?raw";
import { FilesPanelFileTypesComposition } from "#/modules/files/compositions/file-types.composition.tsx";
import filesPanelFileTypesCompositionSource from "#/modules/files/compositions/file-types.composition.tsx?raw";
import filesPanelCompositionSource from "#/modules/files/compositions/files-panel.composition.tsx?raw";
import { FilesPanelStatesComposition } from "#/modules/files/compositions/states.composition.tsx";
import filesPanelStatesCompositionSource from "#/modules/files/compositions/states.composition.tsx?raw";
import {
  FILES_PANEL_DEFAULT_COMPOSITION_PATH,
  FilesPanelSourcePreview,
} from "#/modules/files/files.source-comparison.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SOURCE_SCENES = [
  {
    label: "ChannelFilesPanel",
    scenes: [
      {
        label: "Data and interaction ownership: 143–253",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/ChannelFilesPanel.tsx:143",
      },
      {
        label: "Panel and row structure: 255–335",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/ChannelFilesPanel.tsx:255",
      },
    ],
  },
] as const;

const ANATOMY = `<FilesPanel>
  <FilesViewport>
    <FilesList>
      <FileRow>
        <FileRowOpen>
          <FileThumbnail>
            <FilePreview>
              <FilePreviewMedia>
                <FileImage />
              </FilePreviewMedia>
              <FilePreviewBadge />
            </FilePreview>
          </FileThumbnail>
          <FileContent>
            <FileName />
            <FileMeta>
              <FileMetaItem />
            </FileMeta>
          </FileContent>
        </FileRowOpen>
        <FileActions>
          <FileAction />
        </FileActions>
      </FileRow>
    </FilesList>
  </FilesViewport>
</FilesPanel>`;

const COMPOSITION_SOURCES = createCompositionSourceMap({
  defaultComposition: filesPanelDefaultCompositionSource,
  filesPanelComposition: filesPanelCompositionSource,
} as const);

const COMPOSITION_PATHS = {
  defaultComposition: FILES_PANEL_DEFAULT_COMPOSITION_PATH,
  filesPanelComposition: "apps/doc/src/modules/files/compositions/files-panel.composition.tsx",
} as const;

const SIMPLE_PART_PROPS = {
  filesPanel: [
    {
      name: "...props",
      type: 'useRender.ComponentProps<"section">',
      description:
        "Files tab panel root. It owns the themed surface; fetching, routing, and file policy remain in the consumer.",
    },
  ],
  filesViewport: [
    {
      name: "...props",
      type: 'useRender.ComponentProps<"div">',
      description:
        "Scrollable panel viewport. Attach near-end or other pagination behavior through native scroll props.",
    },
  ],
  filesList: [
    {
      name: "...props",
      type: 'useRender.ComponentProps<"div">',
      description: "Vertical collection layout for file rows.",
    },
  ],
  fileRow: [
    {
      name: "...props",
      type: 'useRender.ComponentProps<"div">',
      description:
        "Single file row. Keep FileRowOpen and FileActions as siblings so action buttons are not nested inside the row button.",
    },
  ],
  fileRowOpen: [
    {
      name: "...props",
      type: 'useRender.ComponentProps<"button">',
      description:
        'Primary file affordance. Defaults to type="button" and accepts native button props, including disabled.',
    },
  ],
  fileThumbnail: [
    {
      name: "...props",
      type: 'useRender.ComponentProps<"span">',
      description:
        "Thumbnail slot for an image or composed FilePreview fallback. FilePreview children automatically use the compact treatment.",
    },
  ],
  fileContent: [
    {
      name: "...props",
      type: 'useRender.ComponentProps<"span">',
      description: "Flexible content column containing the name and metadata.",
    },
  ],
  fileName: [
    {
      name: "...props",
      type: 'useRender.ComponentProps<"span">',
      description: "Truncated file name.",
    },
  ],
  fileMeta: [
    {
      name: "...props",
      type: 'useRender.ComponentProps<"span">',
      description: "Wrapping metadata row for size, timestamp, or other caller-owned facts.",
    },
  ],
  fileMetaItem: [
    {
      name: "...props",
      type: 'useRender.ComponentProps<"span">',
      description: "Inline metadata item with optional icon.",
    },
  ],
  fileActions: [
    {
      name: "...props",
      type: 'useRender.ComponentProps<"span">',
      description:
        "Trailing action cluster. Render it beside FileRowOpen, not inside it, to avoid nested buttons.",
    },
  ],
} satisfies Record<string, readonly PropRow[]>;

const FILE_IMAGE_PROPS: readonly PropRow[] = [
  {
    name: "fit",
    type: '"contain" | "cover"',
    default: '"cover"',
    description: "Controls object-fit for wide/tall artwork versus ordinary cropped thumbnails.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"img">',
    description:
      "Native image props. Provide alt text according to whether the thumbnail is content.",
  },
];

const FILE_ACTION_PROPS: readonly PropRow[] = [
  {
    name: "variant",
    type: "ButtonProps['variant']",
    default: '"outline" (Brutal) / "ghost" (Elegant)',
    description: "Optional Button variant override. The theme-aware default matches panel chrome.",
  },
  {
    name: "size",
    type: "ButtonProps['size']",
    default: '"icon-sm"',
    description: "Button size. The default is optimized for trailing row actions.",
  },
  {
    name: "...props",
    type: "ButtonProps",
    description:
      "All other Button props, including disabled, aria-label, title, render substitution, and click handlers.",
  },
];

export const Route = createFileRoute("/components/files")({
  component: FilesPanelDoc,
  loader: () =>
    highlightSnippets({
      data: {
        anatomy: ANATOMY,
        default: stripSourceCodeBlocks(filesPanelDefaultCompositionSource),
        fileRow: stripSourceCodeBlocks(filesPanelFileRowCompositionSource),
        fileTypes: stripSourceCodeBlocks(filesPanelFileTypesCompositionSource),
        filesPanelComposition: COMPOSITION_SOURCES.filesPanelComposition,
        states: stripSourceCodeBlocks(filesPanelStatesCompositionSource),
      },
    }),
});

function FilesPanelDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="FilesPanel"
      description="Composable panel structure for channel files, thumbnails, metadata, and file actions."
      overview={
        <Differences from="Slock ChannelFilesPanel">
          <li>replaces AvatarListRow coupling with explicit file-row parts</li>
          <li>
            keeps fetching, cursor state, signed URLs, lightbox policy, downloads, and navigation in
            the consumer
          </li>
          <li>
            composes <code>FilePreview</code> for archive, document, code, media, and badge
            fallbacks
          </li>
          <li>preserves the source list, row, metadata, actions, and load-more structure</li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview previewClassName="items-stretch p-6">
          <Preview.Canvas>
            <div className="flex w-full justify-center">
              <FilesPanelFileRowComposition />
            </div>
          </Preview.Canvas>
          <Preview.Code html={code.fileRow} collapsedHtml={code.fileRowBody} />
        </Preview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-10">
          <DocSubsection parentId="usage" id="file-types" title="File previews">
            <Preview previewClassName="items-stretch">
              <Preview.Canvas>
                <div className="flex w-full justify-center">
                  <FilesPanelFileTypesComposition />
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.fileTypes} collapsedHtml={code.fileTypesBody} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="states" title="Loading, error, and empty">
            <Preview previewClassName="items-stretch">
              <Preview.Canvas>
                <FilesPanelStatesComposition />
              </Preview.Canvas>
              <Preview.Code html={code.states} collapsedHtml={code.statesBody} />
            </Preview>
          </DocSubsection>

          <DocSubsection
            parentId="usage"
            id="consumer-ownership"
            title="Advanced: actions and pagination"
          >
            <DocNote>
              The package exposes structure and native event surfaces. The consumer decides how to
              preview, download, jump to the original message, fetch the next cursor, and render
              loading or error states. This advanced example keeps those actions observable without
              introducing product stores or routing into raft-ui.
            </DocNote>
            <Preview previewClassName="items-stretch p-6">
              <Preview.Canvas>
                <div className="flex w-full justify-center">
                  <FilesPanelDefaultComposition />
                </div>
              </Preview.Canvas>
              <Preview.Code
                codeBlock={
                  <DocsCodeBlock.Files
                    collapsible={false}
                    files={[
                      {
                        path: COMPOSITION_PATHS.defaultComposition,
                        source: COMPOSITION_SOURCES.defaultComposition,
                        html: code.default,
                        collapsedHtml: code.defaultBody,
                      },
                      {
                        path: COMPOSITION_PATHS.filesPanelComposition,
                        source: COMPOSITION_SOURCES.filesPanelComposition,
                        html: code.filesPanelComposition,
                        collapsedHtml: code.filesPanelCompositionBody,
                      },
                    ]}
                  />
                }
              />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-8">
          <DocSubsection parentId="api" id="api-panel-structure" title="Panel structure">
            <div className="space-y-6">
              <ApiPart title="FilesPanel" rows={SIMPLE_PART_PROPS.filesPanel} />
              <ApiPart title="FilesViewport" rows={SIMPLE_PART_PROPS.filesViewport} />
              <ApiPart title="FilesList" rows={SIMPLE_PART_PROPS.filesList} />
            </div>
          </DocSubsection>

          <DocSubsection parentId="api" id="api-row-structure" title="Row structure">
            <div className="space-y-6">
              <ApiPart title="FileRow" rows={SIMPLE_PART_PROPS.fileRow} />
              <ApiPart title="FileRowOpen" rows={SIMPLE_PART_PROPS.fileRowOpen} />
            </div>
          </DocSubsection>

          <DocSubsection parentId="api" id="api-file-content" title="File content">
            <div className="space-y-6">
              <ApiPart title="FileThumbnail" rows={SIMPLE_PART_PROPS.fileThumbnail} />
              <ApiPart title="FileImage" rows={FILE_IMAGE_PROPS} />
              <ApiPart title="FileContent" rows={SIMPLE_PART_PROPS.fileContent} />
              <ApiPart title="FileName" rows={SIMPLE_PART_PROPS.fileName} />
              <ApiPart title="FileMeta" rows={SIMPLE_PART_PROPS.fileMeta} />
              <ApiPart title="FileMetaItem" rows={SIMPLE_PART_PROPS.fileMetaItem} />
            </div>
          </DocSubsection>

          <DocSubsection parentId="api" id="api-file-actions" title="File actions">
            <div className="space-y-6">
              <ApiPart title="FileActions" rows={SIMPLE_PART_PROPS.fileActions} />
              <ApiPart title="FileAction" rows={FILE_ACTION_PROPS} />
            </div>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          previewSize="tall"
          sourceScenes={SOURCE_SCENES}
          items={[
            {
              id: "source-comparison-files-panel",
              label: "Channel files panel",
              status: "difference",
              note: "Source owns API data, cursor pagination, signed URLs, lightbox state, and routing in one product component. Current keeps those workflows in the docs/Playground consumer and exposes stable, business-agnostic row parts through raft-ui.",
              source: (
                <SourceThemeScope className="w-full">
                  <FilesPanelSourcePreview />
                </SourceThemeScope>
              ),
              brutal: <FilesPanelDefaultComposition />,
              elegant: <FilesPanelDefaultComposition />,
              elegantDark: <FilesPanelDefaultComposition />,
              compositionCode: code.default,
              compositionCollapsedCode: code.defaultBody,
              compositionPath: FILES_PANEL_DEFAULT_COMPOSITION_PATH,
              compositionSource: COMPOSITION_SOURCES.defaultComposition,
              compositionShowLineNumbers: false,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}

function ApiPart({ rows, title }: { rows: readonly PropRow[]; title: string }) {
  return (
    <div className="space-y-3">
      <h4 className="font-mono text-xs font-medium text-foreground-strong">{title}</h4>
      <PropsTable rows={rows} />
    </div>
  );
}
