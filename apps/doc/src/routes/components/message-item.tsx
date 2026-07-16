import { createFileRoute } from "@tanstack/react-router";

import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import messageAttachmentsShowcaseSource from "#/modules/message-item/compositions/message-attachments-showcase.composition.tsx?raw";
import messageInteractionsShowcaseSource from "#/modules/message-item/compositions/message-interactions-showcase.composition.tsx?raw";
import messageRowsShowcaseSource from "#/modules/message-item/compositions/message-rows-showcase.composition.tsx?raw";
import messageSourceVisibleStatesSource from "#/modules/message-item/compositions/message-source-visible-states.composition.tsx?raw";
import messageContentCompositionsSource from "#/modules/message-item/compositions/content.compositions.tsx?raw";
import messageProductStatesSource from "#/modules/message-item/compositions/message-product-states.composition.tsx?raw";
import messageReferenceShowcaseSource from "#/modules/message-item/compositions/reference-showcase.composition.tsx?raw";
import messageTranslationShowcaseSource from "#/modules/message-item/compositions/translation-showcase.composition.tsx?raw";

import {
  MessageCodeBlockComposition,
  MessageMarkdownComposition,
} from "#/modules/message-item/compositions/content.compositions.tsx";
import { MessageAttachmentsShowcaseComposition } from "#/modules/message-item/compositions/message-attachments-showcase.composition.tsx";
import { MessageInteractionsShowcaseComposition } from "#/modules/message-item/compositions/message-interactions-showcase.composition.tsx";
import { MessageProductStatesComposition } from "#/modules/message-item/compositions/message-product-states.composition.tsx";
import { MessageRowsShowcaseComposition } from "#/modules/message-item/compositions/message-rows-showcase.composition.tsx";
import { MessageSourceVisibleStatesComposition } from "#/modules/message-item/compositions/message-source-visible-states.composition.tsx";
import { MessageReferenceShowcaseComposition } from "#/modules/message-item/compositions/reference-showcase.composition.tsx";
import { MessageTranslationShowcaseComposition } from "#/modules/message-item/compositions/translation-showcase.composition.tsx";
import { MESSAGE_FIXTURE_IMAGE_SRC } from "#/modules/message-item/message-item.fixtures.ts";
import { MessageItemPlaygroundPreview } from "#/modules/message-item/message-item.preview.tsx";
import { SourceMessageItemPreview } from "#/modules/message-item/message-item.source-preview.tsx";
import { ANATOMY_SOURCE, API_GROUPS, TOC } from "#/modules/message-item/message-item.snippets.ts";
import { MessageItemPreview } from "#/modules/message-item/compositions/item-preview.composition.tsx";
import messageItemPreviewSource from "#/modules/message-item/compositions/item-preview.composition.tsx?raw";

const SOURCE_SCENES = [
  {
    label: "Slock message row",
    scenes: [
      {
        label: "MessageItem.tsx",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/MessageItem.tsx",
      },
    ],
  },
] as const;

export const Route = createFileRoute("/components/message-item")({
  component: MessageItemDoc,
  loader: () =>
    highlightSnippets({
      data: {
        anatomy: ANATOMY_SOURCE,
        attachmentsShowcase: messageAttachmentsShowcaseSource,
        contentCompositions: messageContentCompositionsSource,
        interactionsShowcase: messageInteractionsShowcaseSource,
        productStates: messageProductStatesSource,
        referenceShowcase: messageReferenceShowcaseSource,
        rowsShowcase: messageRowsShowcaseSource,
        sourceVisibleStates: messageSourceVisibleStatesSource,
        translationShowcase: messageTranslationShowcaseSource,
      },
    }),
});

function MessageItemDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="MessageItem"
      description="Business-agnostic message primitives composed into source-faithful rows for every theme."
      overview={
        <Differences from="MessageItem">
          <li>
            store data, permission checks, reaction picker state, and thread behavior stay outside
          </li>
          <li>context menu is composed with the existing ContextMenu primitive</li>
          <li>
            active, search-match, and selection chrome use explicit composition roots without owning
            business state
          </li>
          <li>
            product copy, icons, callbacks, and async state live in docs compositions rather than
            the UI package
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <MessageItemPlaygroundPreview />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="rows" title="Message rows" showThemeSwitcher>
        <Example html={code.rowsShowcase} previewMode="light" previewClassName="items-stretch">
          <MessageRowsShowcaseComposition />
        </Example>
      </DocSection>

      <DocSection id="content" title="Content & references" showThemeSwitcher>
        <Example
          html={code.contentCompositions}
          previewMode="light"
          previewClassName="items-stretch"
        >
          <div className="flex w-full max-w-3xl flex-col gap-5">
            <MessageMarkdownComposition imageSrc={MESSAGE_FIXTURE_IMAGE_SRC} />
            <MessageCodeBlockComposition />
          </div>
        </Example>
        <div className="mt-6">
          <Example
            html={code.translationShowcase}
            previewMode="light"
            previewClassName="items-stretch"
          >
            <div className="w-full max-w-3xl">
              <MessageTranslationShowcaseComposition />
            </div>
          </Example>
        </div>
        <div className="mt-6">
          <Example html={code.productStates} previewMode="light" previewClassName="items-stretch">
            <MessageProductStatesComposition />
          </Example>
        </div>
        <div className="mt-6">
          <Example
            html={code.referenceShowcase}
            previewMode="light"
            previewClassName="items-stretch"
          >
            <div className="w-full max-w-3xl">
              <MessageReferenceShowcaseComposition />
            </div>
          </Example>
        </div>
      </DocSection>

      <DocSection id="attachments" title="Attachments" showThemeSwitcher>
        <Example
          html={code.attachmentsShowcase}
          previewMode="light"
          previewClassName="items-stretch"
        >
          <MessageAttachmentsShowcaseComposition />
        </Example>
      </DocSection>

      <DocSection id="interactions" title="Interactions" showThemeSwitcher>
        <Example
          html={code.interactionsShowcase}
          previewMode="light"
          previewClassName="items-stretch"
        >
          <MessageInteractionsShowcaseComposition />
        </Example>
      </DocSection>

      <DocSection id="source-visible-states" title="Source-visible states" showThemeSwitcher>
        <Example
          html={code.sourceVisibleStates}
          previewMode="light"
          previewClassName="items-stretch"
        >
          <MessageSourceVisibleStatesComposition />
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="grid gap-8">
          {API_GROUPS.map((group) => (
            <section key={group.title} className="grid gap-3">
              <h3 className="text-sm font-medium text-foreground-strong">{group.title}</h3>
              <PropsTable rows={group.rows} />
            </section>
          ))}
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          items={[
            {
              label: "Standard message row",
              status: "review",
              note: "The source fixture preserves the visible sender, content, and reply structure; product data, reactions, and thread navigation remain consumer-owned composition.",
              sourceScenes: SOURCE_SCENES,
              source: (
                <SourceThemeScope>
                  <SourceMessageItemPreview />
                </SourceThemeScope>
              ),
              brutal: <MessageItemPreview reactions replies toolbar />,
              elegant: <MessageItemPreview reactions replies toolbar />,
              elegantDark: <MessageItemPreview reactions replies toolbar />,
              compositionCode: messageItemPreviewSource,
              compositionPath:
                "apps/doc/src/modules/message-item/compositions/item-preview.composition.tsx",
              compositionSource: messageItemPreviewSource,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
