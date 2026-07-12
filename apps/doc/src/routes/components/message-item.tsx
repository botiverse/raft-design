import { createFileRoute } from "@tanstack/react-router";

import { ComponentPlayground } from "#/components/component-playground.tsx";
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
import messageMediaCompositionsSource from "#/compositions/message-item/message-media-compositions.tsx?raw";
import messageRowToolbarCompositionSource from "#/compositions/message-item/message-row-toolbar-composition.tsx?raw";
import messageStateMatrixSource from "#/compositions/message-item/message-state-matrix-composition.tsx?raw";

import { getMessageItemComparisonItems } from "./message-item.comparison";
import {
  ActiveMessageRow,
  AuthoredMessageRow,
  ConsecutiveMessageRow,
  RemovedSenderMessageRow,
  RichAttachmentMessageRow,
  SearchMatchMessageRow,
  SelectedMessageRow,
  ThreadArchiveEventRow,
} from "#/compositions/message-item/message-row-compositions.tsx";
import {
  MessageItemPreview,
  type MessageItemPreviewChrome,
} from "#/compositions/message-item/message-item-preview-composition.tsx";
import { MessageReactionOverlaysComposition } from "#/compositions/message-item/message-reaction-compositions.tsx";
import { MessageItemStateMatrix } from "#/compositions/message-item/message-state-matrix-composition.tsx";
import { ANATOMY_SOURCE, PROPS, TOC } from "./message-item.snippets";

const CHROME_OPTIONS = [
  "default",
  "active",
  "search-match",
  "selected",
] as const satisfies readonly MessageItemPreviewChrome[];

type PlaygroundValues = {
  chrome: MessageItemPreviewChrome;
  saved: boolean;
  reactions: boolean;
  toolbar: boolean;
};

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
        <ComponentPlayground<PlaygroundValues>
          defaultValues={{ chrome: "default", saved: false, reactions: true, toolbar: true }}
          controls={[
            { name: "chrome", label: "Chrome", type: "select", options: CHROME_OPTIONS },
            { name: "saved", label: "Saved", type: "boolean" },
            { name: "reactions", label: "Reactions", type: "boolean" },
            { name: "toolbar", label: "Toolbar", type: "boolean" },
          ]}
          previewTheme="brutal"
          previewMode="light"
          previewClassName="items-stretch"
          render={(values) => (
            <div className="w-full max-w-3xl">
              <MessageItemPreview
                chrome={values.chrome}
                saved={values.saved}
                reactions={values.reactions}
                toolbar={values.toolbar}
              />
            </div>
          )}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="MessageItem.tsx"
          source={ANATOMY_SOURCE}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
        />
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
