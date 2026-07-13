import { createFileRoute } from "@tanstack/react-router";

import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import messageReactionCompositionsSource from "#/modules/message-item/compositions/reaction.compositions.tsx?raw";
import messageRowCompositionsSource from "#/modules/message-item/compositions/row.compositions.tsx?raw";
import messageMediaCompositionsSource from "#/modules/message-item/compositions/media.compositions.tsx?raw";
import messageRowToolbarCompositionSource from "#/modules/message-item/compositions/row-toolbar.composition.tsx?raw";
import messageStateMatrixSource from "#/modules/message-item/compositions/state-matrix.composition.tsx?raw";

import { getMessageItemComparisonItems } from "#/modules/message-item/message-item.comparison.tsx";
import {
  ActiveMessageRow,
  AuthoredMessageRow,
  ConsecutiveMessageRow,
  RemovedSenderMessageRow,
  RichAttachmentMessageRow,
  SearchMatchMessageRow,
  SelectedMessageRow,
  ThreadArchiveEventRow,
} from "#/modules/message-item/compositions/row.compositions.tsx";
import { MessageReactionOverlaysComposition } from "#/modules/message-item/compositions/reaction.compositions.tsx";
import { MessageItemStateMatrix } from "#/modules/message-item/compositions/state-matrix.composition.tsx";
import { MessageItemPlaygroundPreview } from "#/modules/message-item/message-item.preview.tsx";
import { ANATOMY_SOURCE, PROPS, TOC } from "#/modules/message-item/message-item.snippets.ts";

export const Route = createFileRoute("/components/message-item")({
  component: MessageItemDoc,
  loader: () =>
    highlightSnippets({
      data: {
        anatomy: ANATOMY_SOURCE,
        rowCompositions: messageRowCompositionsSource,
        reactionCompositions: messageReactionCompositionsSource,
        mediaCompositions: messageMediaCompositionsSource,
        rowToolbarComposition: messageRowToolbarCompositionSource,
        stateMatrix: messageStateMatrixSource,
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

      <DocSection id="state-matrix" title="State matrix" showThemeSwitcher>
        <Example
          html={code.stateMatrix}
          previewTheme="brutal"
          previewMode="light"
          previewClassName="items-stretch"
        >
          <MessageItemStateMatrix />
        </Example>
      </DocSection>

      <DocSection id="fixtures" title="Fixtures" showThemeSwitcher>
        <Example
          html={code.rowCompositions}
          previewTheme="brutal"
          previewMode="light"
          previewClassName="items-stretch"
        >
          <div className="flex w-full max-w-3xl flex-col gap-3">
            <AuthoredMessageRow />
            <ConsecutiveMessageRow />
            <ThreadArchiveEventRow />
            <RemovedSenderMessageRow />
          </div>
        </Example>

        <div className="mt-6">
          <Example
            html={code.rowCompositions}
            previewTheme="brutal"
            previewMode="light"
            previewClassName="items-stretch"
          >
            <div className="w-full max-w-3xl">
              <RichAttachmentMessageRow />
            </div>
          </Example>
        </div>

        <div className="mt-6">
          <Example
            html={code.rowCompositions}
            previewTheme="brutal"
            previewMode="light"
            previewClassName="items-stretch"
          >
            <div className="flex w-full max-w-3xl flex-col gap-3">
              <SelectedMessageRow />
              <ActiveMessageRow />
              <SearchMatchMessageRow />
            </div>
          </Example>
        </div>

        <div className="mt-6">
          <Example
            html={code.reactionCompositions}
            previewTheme="brutal"
            previewMode="light"
            previewClassName="items-stretch"
          >
            <MessageReactionOverlaysComposition />
          </Example>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          items={getMessageItemComparisonItems(code)}
          previewSize="tall"
        />
      </DocSection>
    </DocPage>
  );
}
