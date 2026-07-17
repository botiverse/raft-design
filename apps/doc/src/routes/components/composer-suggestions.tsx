import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Kbd } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PreviewThemeScope } from "#/components/preview-theme.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { ComposerSuggestionComposition } from "#/modules/composer-suggestions/composer-suggestions.composition.tsx";
import composerSuggestionCompositionSource from "#/modules/composer-suggestions/composer-suggestions.composition.tsx?raw";
import { highlightSnippets } from "#/lib/highlight.tsx";

const COMPOSER_SUGGESTION_COMPOSITION_PATH =
  "apps/doc/src/modules/composer-suggestions/composer-suggestions.composition.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "states", title: "States" },
  { id: "api", title: "API" },
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
    name: "value / onValueChange",
    type: "string / (value: string) => void",
    description: "Controlled composer value and its change callback.",
  },
  {
    name: "detectTrigger",
    type: "(textBeforeCaret) => ComposerSuggestionTriggerMatch | null",
    description:
      "Caller-owned trigger parser. The match identifies the marker, query, and marker start index before the caret.",
  },
  {
    name: "getItems / getItemText",
    type: "(match) => readonly TItem[] / (item) => string",
    description:
      "Caller-owned filtering and insertion text. Returning no items closes the suggestion list.",
  },
  {
    name: "isItemDisabled",
    type: "(item: TItem) => boolean",
    description:
      "Optional disabled predicate. Disabled items remain visible but are skipped by keyboard navigation and cannot be selected.",
  },
  {
    name: "getInputProps / getListProps / getOptionProps",
    type: "native prop getters",
    description:
      "Merge the hook's combobox semantics, refs, keyboard handlers, highlight state, and option identity into native textarea, list, and option props.",
  },
  {
    name: "open / items / highlightedIndex / activeItem",
    type: "derived suggestion state",
    description: "Render data exposed by the hook for composing the popup and its visual states.",
  },
  {
    name: "select / insert / clear",
    type: "imperative actions",
    description:
      "Selection and editing helpers that preserve focus and restore the caret after updating the controlled value.",
  },
  {
    name: "ComposerSuggestionList / Group / GroupLabel",
    type: "div props",
    description:
      "Styling-only popup and grouping parts. Behavior and ARIA semantics come from the hook prop getters.",
  },
  {
    name: "ComposerSuggestionOption",
    type: "div props",
    description:
      "Visual option root. Spread getOptionProps onto it so highlighted and disabled states remain keyboard-complete.",
  },
  {
    name: "ComposerSuggestionContent / Icon / Title / Aside",
    type: "div / span props",
    description: "Explicit option structure for caller-owned icons, labels, and trailing content.",
  },
  {
    name: "ComposerSuggestionMeta / Aside",
    type: "span props & visual variant",
    description: "Secondary text and trailing-content parts. Meta supports text/code.",
  },
  {
    name: "Badge / Status",
    type: "shared primitive props",
    description: "Caller-owned status labels and availability indicators for suggestion content.",
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
        <PreviewGrid>
          <PreviewPane label="Brutal · people in and out of channel">
            <PreviewThemeScope family="brutal" className="h-full">
              <PanelFrame>
                <ComposerSuggestionComposition />
              </PanelFrame>
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant · channels and archived option">
            <PreviewThemeScope family="elegant" mode="light" className="h-full">
              <PanelFrame>
                <ComposerSuggestionComposition initialValue="#" />
              </PanelFrame>
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant dark · filtered results">
            <PreviewThemeScope family="elegant" mode="dark" className="h-full dark">
              <PanelFrame>
                <ComposerSuggestionComposition initialValue="@av" />
              </PanelFrame>
            </PreviewThemeScope>
          </PreviewPane>
        </PreviewGrid>
        <DocsCodeBlock.Panel
          path={COMPOSER_SUGGESTION_COMPOSITION_PATH}
          source={SNIPPETS.composition}
          html={code.composition}
          showLineNumbers={false}
        />
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}

function PreviewGrid({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4">{children}</div>;
}

function PreviewPane({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-none border border-line bg-layer-panel">
      <div className="border-b border-line bg-layer-muted px-3 py-2 text-xs font-medium text-foreground-muted">
        {label}
      </div>
      <div className="flex h-[420px] items-stretch justify-start overflow-x-auto bg-white p-2">
        {children}
      </div>
    </div>
  );
}

function PanelFrame({ children }: { children: ReactNode }) {
  return <div className="h-full w-[560px] shrink-0 overflow-hidden bg-layer-panel">{children}</div>;
}
