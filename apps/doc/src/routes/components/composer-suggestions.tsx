import { createFileRoute } from "@tanstack/react-router";
import { Kbd } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { ComposerSuggestionComposition } from "#/modules/composer-suggestions/composer-suggestions.composition.tsx";
import composerSuggestionCompositionSource from "#/modules/composer-suggestions/composer-suggestions.composition.tsx?raw";
import { ComposerSuggestionsSourceComparison } from "#/modules/composer-suggestions/composer-suggestions.source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "states", title: "States" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SOURCE_SCENES = [
  {
    label: "Slock MessageInput autocomplete",
    scenes: [
      {
        label: "Mention candidates",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/MessageInput.tsx:1562",
      },
      {
        label: "Channel candidates",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/MessageInput.tsx:1625",
      },
    ],
  },
] as const;

const ANATOMY_SNIPPET = `<ComposerRoot>
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

const SNIPPETS = {
  anatomy: ANATOMY_SNIPPET,
  composition: composerSuggestionCompositionSource,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "useComposerSuggestions",
    type: "<TItem extends object>(params) => ComposerSuggestionsApi<TItem>",
    description:
      "Headless inline-trigger behavior. Owns open state, highlighted option, keyboard navigation, IME guarding, focus return, and caret-preserving insertion.",
  },
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
    type: "(textBeforeCaret) => ComposerSuggestionTriggerMatch | null",
    description:
      "Caller-owned trigger parser. The match identifies the marker, query, and marker start index before the caret.",
  },
  {
    name: "getItems",
    type: "(match) => readonly TItem[]",
    description: "Returns items for the active trigger. An empty list closes the popup.",
  },
  {
    name: "getItemText",
    type: "(item) => string",
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
    type: "textarea prop getter",
    description: "Merges textarea value, keyboard handling, refs, and combobox semantics.",
  },
  {
    name: "getListProps",
    type: "listbox prop getter",
    description: "Merges listbox role, id, and ref.",
  },
  {
    name: "getOptionProps",
    type: "option prop getter",
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
  {
    name: "ComposerSuggestionList",
    type: "div props",
    description: "Popup container. Spread getListProps onto it.",
  },
  {
    name: "ComposerSuggestionGroup",
    type: "div props",
    description: "Optional visual group of suggestion options.",
  },
  {
    name: "ComposerSuggestionGroupLabel",
    type: "div props",
    description: "Optional label for a suggestion group.",
  },
  {
    name: "ComposerSuggestionOption",
    type: "div props",
    description:
      "Visual option root. Spread getOptionProps onto it so highlighted and disabled states remain keyboard-complete.",
  },
  {
    name: "ComposerSuggestionContent",
    type: "div props",
    description: "Flexible content row for title, metadata, and trailing content.",
  },
  {
    name: "ComposerSuggestionIcon",
    type: "div props",
    description: "Leading icon or avatar slot.",
  },
  {
    name: "ComposerSuggestionTitle",
    type: "span props",
    description: "Primary option label.",
  },
  {
    name: "ComposerSuggestionMeta",
    type: 'span props & { variant?: "text" | "code" }',
    description: "Secondary option text.",
  },
  {
    name: "ComposerSuggestionAside",
    type: "div props",
    description: "Trailing option content slot.",
  },
  {
    name: "Badge",
    type: "shared primitive props",
    description: "Caller-owned label for a suggestion state.",
  },
  {
    name: "Status",
    type: "shared primitive props",
    description: "Caller-owned availability indicator.",
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
        <Example html={code.composition} previewClassName="items-stretch">
          <div className="relative h-[460px] w-full overflow-hidden">
            <p className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-xs text-foreground-muted">
              Use <Kbd>@</Kbd> to mention people or <Kbd>#</Kbd> to find channels.
            </p>
            <ComposerSuggestionComposition initialValue="" />
          </div>
        </Example>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="states" title="States">
        <div className="grid gap-8">
          <section className="grid gap-3">
            <h3 className="text-sm font-medium text-foreground-strong">People</h3>
            <Example
              html={code.composition}
              previewClassName="min-h-[26rem] items-stretch"
              previewTheme="brutal"
            >
              <div className="h-[26rem] w-full max-w-[560px]">
                <ComposerSuggestionComposition />
              </div>
            </Example>
          </section>
          <section className="grid gap-3">
            <h3 className="text-sm font-medium text-foreground-strong">Channels</h3>
            <Example
              html={code.composition}
              previewClassName="min-h-[26rem] items-stretch"
              previewTheme="elegant"
            >
              <div className="h-[26rem] w-full max-w-[560px]">
                <ComposerSuggestionComposition initialValue="#" />
              </div>
            </Example>
          </section>
          <section className="grid gap-3">
            <h3 className="text-sm font-medium text-foreground-strong">Filtered people</h3>
            <Example
              html={code.composition}
              previewClassName="min-h-[26rem] items-stretch"
              previewMode="dark"
              previewTheme="elegant"
            >
              <div className="h-[26rem] w-full max-w-[560px]">
                <ComposerSuggestionComposition initialValue="@av" />
              </div>
            </Example>
          </section>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          previewSize="popover"
          sourceScenes={SOURCE_SCENES}
          items={[
            {
              label: "Message composer autocomplete",
              status: "difference",
              note: "Source keeps popup positioning and rendering inside MessageInput. The current implementation retains that inline anchor while exposing behavior and visuals as composable parts.",
              source: (
                <SourceThemeScope className="w-full">
                  <ComposerSuggestionsSourceComparison />
                </SourceThemeScope>
              ),
              brutal: (
                <div className="h-[21rem] w-full max-w-[560px]">
                  <ComposerSuggestionComposition initialValue="@" />
                </div>
              ),
              elegant: (
                <div className="h-[21rem] w-full max-w-[560px]">
                  <ComposerSuggestionComposition initialValue="@" />
                </div>
              ),
              elegantDark: (
                <div className="h-[21rem] w-full max-w-[560px]">
                  <ComposerSuggestionComposition initialValue="@" />
                </div>
              ),
              compositionCode: code.composition,
              compositionPath:
                "apps/doc/src/modules/composer-suggestions/composer-suggestions.composition.tsx",
              compositionSource: composerSuggestionCompositionSource,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
