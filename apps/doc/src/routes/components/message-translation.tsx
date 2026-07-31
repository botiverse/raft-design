import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { MessageTranslationBilingualComposition } from "#/modules/message-translation/compositions/bilingual.composition.tsx";
import bilingualSource from "#/modules/message-translation/compositions/bilingual.composition.tsx?raw";
import { MessageTranslationShowcaseComposition } from "#/modules/message-translation/compositions/translation-showcase.composition.tsx";
import { MessageTranslationStatesComposition } from "#/modules/message-translation/compositions/translation-states.composition.tsx";
import translationStatesSource from "#/modules/message-translation/compositions/translation-states.composition.tsx?raw";
import { MessageTranslationTranslatedComposition } from "#/modules/message-translation/compositions/translated.composition.tsx";
import translatedSource from "#/modules/message-translation/compositions/translated.composition.tsx?raw";
import {
  MESSAGE_TRANSLATION_PROPS,
  MESSAGE_TRANSLATION_TOC,
} from "#/modules/message-translation/message-translation.snippets.ts";
import { MessageTranslationSourcePreview } from "#/modules/message-translation/message-translation.source-preview.tsx";

const SOURCE_SCENES = [
  {
    label: "Slock message translation",
    scenes: [
      {
        label: "MessageItem.tsx",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/MessageItem.tsx",
      },
      {
        label: "translationStore.ts",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/store/translationStore.ts",
      },
    ],
  },
] as const;

const TRANSLATED_COMPOSITION_PATH =
  "apps/doc/src/modules/message-translation/compositions/translated.composition.tsx";
const BILINGUAL_COMPOSITION_PATH =
  "apps/doc/src/modules/message-translation/compositions/bilingual.composition.tsx";
const TRANSLATION_STATES_COMPOSITION_PATH =
  "apps/doc/src/modules/message-translation/compositions/translation-states.composition.tsx";

function UsagePreview({
  children,
  code,
  collapsedCode,
}: {
  children: ReactNode;
  code: ReactNode;
  collapsedCode?: ReactNode;
}) {
  return (
    <Preview>
      <Preview.Canvas>{children}</Preview.Canvas>
      <Preview.Code html={code} collapsedHtml={collapsedCode} />
    </Preview>
  );
}

function MessageTranslationShowcaseFiles({ code }: { code: Record<string, string> }) {
  return (
    <DocsCodeBlock.Files
      collapsible={false}
      files={[
        {
          path: TRANSLATED_COMPOSITION_PATH,
          source: translatedSource,
          html: code.translated,
          collapsedHtml: code.translatedBody,
        },
        {
          path: BILINGUAL_COMPOSITION_PATH,
          source: bilingualSource,
          html: code.bilingual,
          collapsedHtml: code.bilingualBody,
        },
        {
          path: TRANSLATION_STATES_COMPOSITION_PATH,
          source: translationStatesSource,
          html: code.translationStates,
          collapsedHtml: code.translationStatesBody,
        },
      ]}
    />
  );
}

export const Route = createFileRoute("/components/message-translation")({
  component: MessageTranslationDoc,
  loader: () =>
    highlightSnippets({
      data: {
        anatomy: bilingualSource,
        bilingual: bilingualSource,
        translated: translatedSource,
        translationStates: translationStatesSource,
      },
    }),
});

function MessageTranslationDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="MessageTranslation"
      description="Message-row translation output, bilingual originals, pending progress, and retry status composed from explicit parts."
      toc={MESSAGE_TRANSLATION_TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview>
          <Preview.Canvas>
            <MessageTranslationShowcaseComposition />
          </Preview.Canvas>
          <Preview.Code codeBlock={<MessageTranslationShowcaseFiles code={code} />} />
        </Preview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} collapsedHtml={code.anatomyBody} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-10">
          <DocSubsection parentId="usage" id="translated-output" title="Translated output">
            <p className="mb-3 text-sm text-foreground-muted">
              Render translated content in the message body and use the status action to switch
              between the translated and original text.
            </p>
            <UsagePreview code={code.translated} collapsedCode={code.translatedBody}>
              <MessageTranslationTranslatedComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="bilingual-output" title="Bilingual output">
            <p className="mb-3 text-sm text-foreground-muted">
              Keep the translation in the message body and compose the original-content region below
              it when both languages should remain visible.
            </p>
            <UsagePreview code={code.bilingual} collapsedCode={code.bilingualBody}>
              <MessageTranslationBilingualComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="request-states" title="Pending and failure">
            <p className="mb-3 text-sm text-foreground-muted">
              Use indeterminate Progress while translated content is unavailable. Failure copy and
              retry behavior remain explicit children of the status row.
            </p>
            <UsagePreview code={code.translationStates} collapsedCode={code.translationStatesBody}>
              <MessageTranslationStatesComposition />
            </UsagePreview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={MESSAGE_TRANSLATION_PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          items={[
            {
              label: "Translated message",
              status: "review",
              note: "The Source pane is a static fixture extracted from the real MessageItem translation DOM. Brutal and Elegant execute the canonical translated-message composition; eligibility and provider state remain product-owned.",
              sourceScenes: SOURCE_SCENES,
              source: (
                <SourceThemeScope className="w-full">
                  <MessageTranslationSourcePreview />
                </SourceThemeScope>
              ),
              brutal: <MessageTranslationTranslatedComposition />,
              elegant: <MessageTranslationTranslatedComposition />,
              elegantDark: <MessageTranslationTranslatedComposition />,
              compositionCode: code.translated,
              compositionCollapsedCode: code.translatedBody,
              compositionPath: TRANSLATED_COMPOSITION_PATH,
              compositionSource: translatedSource,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
