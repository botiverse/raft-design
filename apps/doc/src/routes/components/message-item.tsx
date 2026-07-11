import { createFileRoute } from "@tanstack/react-router";

import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import messageReactionCompositionsSource from "#/compositions/message-item/message-reaction-compositions.tsx?raw";
import messageRowCompositionsSource from "#/compositions/message-item/message-row-compositions.tsx?raw";
import messageStateMatrixSource from "#/compositions/message-item/message-state-matrix-composition.tsx?raw";

import { getMessageItemComparisonItems } from "./message-item.comparison";
import {
  ActiveMessageRow,
  ContextMenuMessageRow,
  AuthoredMessageRow,
  ConsecutiveMessageRow,
  ReactionOverlays,
  RemovedSenderMessageRow,
  RichAttachmentMessageRow,
  SearchMatchMessageRow,
  SelectedMessageRow,
  ThreadArchiveEventRow,
} from "#/compositions/message-item/message-row-compositions.tsx";
import { MessageItemStateMatrix } from "#/compositions/message-item/message-state-matrix-composition.tsx";
import { PROPS, SNIPPETS, TOC } from "./message-item.snippets";

export const Route = createFileRoute("/components/message-item")({
  component: MessageItemDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        anatomy: messageRowCompositionsSource,
        currentAuthoredRow: messageRowCompositionsSource,
        fixtureReactions: messageReactionCompositionsSource,
        fixtureRich: messageRowCompositionsSource,
        fixtureRows: messageRowCompositionsSource,
        fixtureStates: messageStateMatrixSource,
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
        <Example
          html={code.anatomy}
          previewTheme="brutal"
          previewMode="light"
          previewClassName="items-stretch"
        >
          <div className="w-full max-w-3xl">
            <ContextMenuMessageRow />
          </div>
        </Example>
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
          html={code.fixtureRows}
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
            html={code.fixtureRich}
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
            html={code.fixtureStates}
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
            html={code.fixtureReactions}
            previewTheme="brutal"
            previewMode="light"
            previewClassName="items-stretch"
          >
            <ReactionOverlays />
          </Example>
        </div>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="apps/doc/src/compositions/message-item/message-row-compositions.tsx"
          source={messageRowCompositionsSource}
          html={code.anatomy}
        />
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
