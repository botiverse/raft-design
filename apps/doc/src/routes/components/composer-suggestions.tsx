import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Kbd } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { ComposerSuggestionComposition } from "#/modules/composer-suggestions/composer-suggestions.composition.tsx";
import composerSuggestionCompositionSource from "#/modules/composer-suggestions/composer-suggestions.composition.tsx?raw";
import composerSuggestionResultsSource from "#/modules/composer-suggestions/composer-suggestion-results.tsx?raw";
import composerSuggestionsDataSource from "#/modules/composer-suggestions/composer-suggestions.data.ts?raw";
import { highlightSnippets } from "#/lib/highlight.tsx";
import type { HighlightedSnippet, HighlightedSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const ANATOMY_SNIPPET = `import {
  Composer,
  ComposerActions,
  ComposerInput,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
  ComposerSuggestionAside,
  ComposerSuggestionContent,
  ComposerSuggestionGroup,
  ComposerSuggestionGroupLabel,
  ComposerSuggestionIcon,
  ComposerSuggestionList,
  ComposerSuggestionMeta,
  ComposerSuggestionOption,
  ComposerSuggestionTitle,
  ComposerToolbar,
  ComposerToolbarLabel,
} from "raft-ui";

<ComposerRoot>
  <ComposerSuggestionList>
    <ComposerSuggestionGroup>
      <ComposerSuggestionGroupLabel />
      <ComposerSuggestionOption>
        <ComposerSuggestionIcon />
        <ComposerSuggestionContent>
          <ComposerSuggestionTitle />
          <ComposerSuggestionMeta />
          <ComposerSuggestionAside />
        </ComposerSuggestionContent>
      </ComposerSuggestionOption>
    </ComposerSuggestionGroup>
  </ComposerSuggestionList>
  <Composer>
    <ComposerInput />
    <ComposerToolbar>
      <ComposerActions />
      <ComposerMeta>
        <ComposerToolbarLabel />
        <ComposerSubmit />
      </ComposerMeta>
    </ComposerToolbar>
  </Composer>
</ComposerRoot>`;

const LONG_CONTENT_CANVASES = [
  { id: "wide", label: "Wide", width: undefined },
  { id: "thread", label: "336px · composer in a 360px thread panel", width: 336 },
  { id: "phone", label: "288px · narrow phone", width: 288 },
] as const;

const COMPOSITION_PATH =
  "apps/doc/src/modules/composer-suggestions/composer-suggestions.composition.tsx";
const RESULTS_PATH = "apps/doc/src/modules/composer-suggestions/composer-suggestion-results.tsx";
const DATA_PATH = "apps/doc/src/modules/composer-suggestions/composer-suggestions.data.ts";

const SNIPPETS = {
  anatomy: ANATOMY_SNIPPET,
  composition: composerSuggestionCompositionSource,
  suggestionResults: composerSuggestionResultsSource,
  suggestionsData: composerSuggestionsDataSource,
  peopleUsage: `<ComposerSuggestionComposition initialValue="@" />`,
  channelsUsage: `<ComposerSuggestionComposition initialValue="#" />`,
  longContentUsage: `<ComposerSuggestionComposition dataset="long-content" initialValue="@" />`,
  filteredPeopleUsage: `<ComposerSuggestionComposition initialValue="@av" />`,
} as const;

const HOOK_PROPS: readonly PropRow[] = [
  {
    name: "value",
    type: "string",
    description: "Controlled composer draft.",
  },
  {
    name: "onValueChange",
    type: "(value: string) => void",
    description: "Called when typing or insertion changes the draft.",
  },
  {
    name: "detectTrigger",
    type: "(textBeforeCaret: string) => ComposerSuggestionTriggerMatch | null",
    description:
      "Caller-owned trigger parser. The match identifies the marker, query, and marker start index before the caret.",
  },
  {
    name: "getItems",
    type: "(match: ComposerSuggestionTriggerMatch) => readonly TItem[]",
    description: "Returns items for the active trigger. An empty list closes the popup.",
  },
  {
    name: "getItemText",
    type: "(item: TItem) => string",
    description: "Returns the insertion text for a selected item.",
  },
  {
    name: "isItemDisabled",
    type: "(item: TItem) => boolean",
    description:
      "Optional disabled predicate. Disabled items remain visible but are skipped by keyboard navigation and cannot be selected.",
  },
  {
    name: "getInputProps",
    type: "(props?) => textarea props",
    description: "Merges textarea value, keyboard handling, refs, and combobox semantics.",
  },
  {
    name: "getListProps",
    type: "(props) => listbox props",
    description: "Merges listbox role, id, and ref.",
  },
  {
    name: "getOptionProps",
    type: "(item, index, props?) => option props",
    description: "Merges option identity, highlight state, selection, and pointer behavior.",
  },
  {
    name: "open",
    type: "boolean",
    description: "Whether an active trigger has suggestion items.",
  },
  {
    name: "items",
    type: "readonly TItem[]",
    description: "Items for the active trigger.",
  },
  {
    name: "highlightedIndex",
    type: "number",
    description: "Keyboard-highlighted item index, or -1.",
  },
  {
    name: "activeItem",
    type: "TItem | undefined",
    description: "Currently highlighted item, when one exists.",
  },
  {
    name: "select",
    type: "(item: TItem) => void",
    description: "Inserts a selectable item's text in place of the trigger.",
  },
  {
    name: "insert",
    type: "(text: string) => void",
    description: "Inserts text at the current caret.",
  },
  {
    name: "clear",
    type: "() => void",
    description: "Clears the draft and closes suggestions.",
  },
];

const SUGGESTION_LIST_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Popup container. Spread getListProps onto it.",
  },
];

const SUGGESTION_GROUP_PROPS: readonly PropRow[] = [
  {
    name: "separated",
    type: "boolean",
    default: "false",
    description: "Adds top spacing when stacking multiple groups.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Optional visual group of suggestion options.",
  },
];

const SUGGESTION_GROUP_LABEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Optional label for a suggestion group.",
  },
];

const SUGGESTION_OPTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Visual option root. Spread getOptionProps onto it so highlighted and disabled states remain keyboard-complete.",
  },
];

const SUGGESTION_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Flexible content row for title, metadata, and trailing content.",
  },
];

const SUGGESTION_ICON_PROPS: readonly PropRow[] = [
  {
    name: "variant",
    type: '"avatar" | "framed" | "auxiliary" | "inline"',
    default: '"avatar"',
    description:
      "Leading icon treatment for avatar, framed glyph, or auxiliary affordance; inline is a text-sized glyph inside the row (e.g. human vs agent) that never shrinks.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Leading icon or avatar slot.",
  },
];

const SUGGESTION_TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Primary option label.",
  },
];

const SUGGESTION_META_PROPS: readonly PropRow[] = [
  {
    name: "variant",
    type: '"text" | "code"',
    default: '"text"',
    description: "Secondary option text style.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Secondary option text.",
  },
];

const SUGGESTION_ASIDE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Trailing option content slot.",
  },
];

export const Route = createFileRoute("/components/composer-suggestions")({
  component: ComposerSuggestionsDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function ComposerSuggestionsDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="ComposerSuggestions"
      description="Headless inline @/# autocomplete behavior paired with composable, theme-aware suggestion parts."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview previewClassName="items-stretch bg-layer-inset">
          <Preview.Canvas>
            <div className="relative h-[460px] w-full overflow-hidden">
              <p className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-xs text-foreground-muted">
                Use <Kbd>@</Kbd> to mention people or <Kbd>#</Kbd> to find channels.
              </p>
              <ComposerSuggestionComposition initialValue="@" />
            </div>
          </Preview.Canvas>
          <Preview.Code
            codeBlock={<ComposerSuggestionsSourceFiles code={code} collapsible={false} />}
          />
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
        <div className="grid gap-8">
          <DocSubsection parentId="usage" id="people" title="People">
            <Preview previewClassName="min-h-[26rem] items-stretch bg-layer-inset">
              <Preview.Canvas>
                <div className="h-[26rem] w-full max-w-[560px]">
                  <ComposerSuggestionComposition initialValue="@" />
                </div>
              </Preview.Canvas>
              <Preview.Code
                codeBlock={
                  <ComposerSuggestionsSourceFiles
                    code={code}
                    collapsible={false}
                    defaultPath={COMPOSITION_PATH}
                    usageHtml={code.peopleUsage}
                  />
                }
              />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="channels" title="Channels">
            <Preview previewClassName="min-h-[26rem] items-stretch bg-layer-inset">
              <Preview.Canvas>
                <div className="h-[26rem] w-full max-w-[560px]">
                  <ComposerSuggestionComposition initialValue="#" />
                </div>
              </Preview.Canvas>
              <Preview.Code
                codeBlock={
                  <ComposerSuggestionsSourceFiles
                    code={code}
                    collapsible={false}
                    defaultPath={RESULTS_PATH}
                    usageHtml={code.channelsUsage}
                  />
                }
              />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="long-content" title="Long names and descriptions">
            <p className="text-sm text-foreground-muted">
              Every row stays one line with the same height. Space goes to the name first; the
              description only uses what is left and truncates (or disappears) first. The name
              truncates only when it alone cannot fit, with the full name on hover. Handles show in
              full up to a third of the row, then truncate.
            </p>
            <Preview previewClassName="min-h-[26rem] items-stretch bg-layer-inset">
              <Preview.Canvas>
                <div className="flex w-full flex-wrap items-end gap-4">
                  {LONG_CONTENT_CANVASES.map((canvas) => (
                    <div
                      key={canvas.id}
                      className="flex h-[26rem] min-w-0 flex-col gap-1"
                      style={canvas.width ? { width: canvas.width } : { flex: "1 1 360px" }}
                      data-demo-width={canvas.id}
                    >
                      <span className="text-xs text-foreground-muted">{canvas.label}</span>
                      <div className="min-h-0 flex-1">
                        <ComposerSuggestionComposition dataset="long-content" initialValue="@" />
                      </div>
                    </div>
                  ))}
                </div>
              </Preview.Canvas>
              <Preview.Code
                codeBlock={
                  <ComposerSuggestionsSourceFiles
                    code={code}
                    collapsible={false}
                    defaultPath={DATA_PATH}
                    usageHtml={code.longContentUsage}
                  />
                }
              />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="filtered-people" title="Filtered people">
            <Preview previewClassName="min-h-[26rem] items-stretch bg-layer-inset">
              <Preview.Canvas>
                <div className="h-[26rem] w-full max-w-[560px]">
                  <ComposerSuggestionComposition initialValue="@av" />
                </div>
              </Preview.Canvas>
              <Preview.Code
                codeBlock={
                  <ComposerSuggestionsSourceFiles
                    code={code}
                    collapsible={false}
                    defaultPath={DATA_PATH}
                    usageHtml={code.filteredPeopleUsage}
                  />
                }
              />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-hook" title="useComposerSuggestions">
            <PropsTable rows={HOOK_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-suggestion-list" title="ComposerSuggestionList">
            <PropsTable rows={SUGGESTION_LIST_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-suggestion-group" title="ComposerSuggestionGroup">
            <PropsTable rows={SUGGESTION_GROUP_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-suggestion-group-label"
            title="ComposerSuggestionGroupLabel"
          >
            <PropsTable rows={SUGGESTION_GROUP_LABEL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-suggestion-option" title="ComposerSuggestionOption">
            <PropsTable rows={SUGGESTION_OPTION_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-suggestion-content"
            title="ComposerSuggestionContent"
          >
            <PropsTable rows={SUGGESTION_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-suggestion-icon" title="ComposerSuggestionIcon">
            <PropsTable rows={SUGGESTION_ICON_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-suggestion-title" title="ComposerSuggestionTitle">
            <PropsTable rows={SUGGESTION_TITLE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-suggestion-meta" title="ComposerSuggestionMeta">
            <PropsTable rows={SUGGESTION_META_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-suggestion-aside" title="ComposerSuggestionAside">
            <PropsTable rows={SUGGESTION_ASIDE_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}

/**
 * Composition, the suggestion parts it renders, and the trigger/query contract
 * that feeds useComposerSuggestions. `usageHtml` shows the callsite that puts the
 * canvas into its documented state.
 */
function ComposerSuggestionsSourceFiles({
  code,
  collapsible = true,
  defaultPath,
  usageHtml,
}: {
  code: HighlightedSnippets;
  collapsible?: boolean;
  defaultPath?: string;
  usageHtml?: HighlightedSnippet;
}) {
  const files = useMemo(
    () => [
      {
        path: COMPOSITION_PATH,
        source: composerSuggestionCompositionSource,
        html: code.composition,
        collapsedHtml: code.compositionBody,
      },
      {
        path: RESULTS_PATH,
        source: composerSuggestionResultsSource,
        html: code.suggestionResults,
        collapsedHtml: code.suggestionResultsBody,
      },
      {
        path: DATA_PATH,
        source: composerSuggestionsDataSource,
        html: code.suggestionsData,
      },
    ],
    [code],
  );
  return (
    <>
      {usageHtml ? (
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={usageHtml} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      ) : null}
      <DocsCodeBlock.Files
        collapsible={collapsible}
        showLineNumbers={false}
        defaultPath={defaultPath}
        files={files}
      />
    </>
  );
}
