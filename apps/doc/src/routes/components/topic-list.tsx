import { createFileRoute } from "@tanstack/react-router";
import { InlineCode } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { TopicListComposition } from "#/modules/topic-list/topic-list.composition.tsx";
import topicListCompositionSource from "#/modules/topic-list/topic-list.composition.tsx?raw";

const ANATOMY_SNIPPET = `import {
  TopicList,
  TopicListGroup,
  TopicListGroupLabel,
  TopicListItem,
  TopicListItemAside,
  TopicListItemAuthor,
  TopicListItemAvatar,
  TopicListItemContent,
  TopicListItemExcerpt,
  TopicListItemHeading,
  TopicListItemReplies,
  TopicListItemStats,
  TopicListItemTime,
  TopicListItemTitle,
  TopicListItemTrigger,
} from "raft-ui/wip";

<TopicListGroup>
  <TopicListGroupLabel />
  <TopicList>
    <TopicListItem>
      <TopicListItemTrigger />
      <TopicListItemAvatar />
      <TopicListItemContent>
        <TopicListItemHeading>
          <TopicListItemTitle />
          {/* trailing badges */}
        </TopicListItemHeading>
        <TopicListItemExcerpt>
          <TopicListItemAuthor />
        </TopicListItemExcerpt>
      </TopicListItemContent>
      <TopicListItemAside>
        <TopicListItemTime />
        <TopicListItemStats>
          {/* AvatarGroup, badges */}
          <TopicListItemReplies />
        </TopicListItemStats>
      </TopicListItemAside>
    </TopicListItem>
  </TopicList>
</TopicListGroup>`;

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
] as const;

const GROUP_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"section">',
    description:
      "Labelled run of topics such as a date bucket. Point the inner TopicList at the label with aria-labelledby.",
  },
];

const LIST_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"ul">',
    description: "List of topics in one channel. Pass an aria-label naming the channel.",
  },
];

const ITEM_PROPS: readonly PropRow[] = [
  {
    name: "unread",
    type: "boolean",
    default: "false",
    description: "Emphasizes the title and excerpt of topics with unseen activity.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"li">',
    description: "One topic row.",
  },
];

const TRIGGER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"button">',
    description:
      "Full-row hit area layered under the row content. Render a router link when opening a topic navigates; set aria-current on the open topic to highlight its row.",
  },
];

const SLOT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "useRender.ComponentProps",
    description:
      "GroupLabel (an h3), Avatar, Content, Heading, Title, Excerpt, Author, Aside, Time (a time element), Stats and Replies are layout and typography parts. Heading keeps trailing badges visible while the title truncates; Stats lines up participants, badges and the reply count.",
  },
];

const SNIPPETS = {
  anatomy: ANATOMY_SNIPPET,
  list: topicListCompositionSource,
} as const;

export const Route = createFileRoute("/components/topic-list")({
  component: TopicListDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function TopicListDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="TopicList"
      description="Dense rows for channels organized as topics, where each topic opens its own reply thread."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview previewClassName="items-stretch p-6">
          <Preview.Canvas>
            <div className="w-full max-w-2xl">
              <TopicListComposition />
            </div>
          </Preview.Canvas>
          <Preview.Code html={code.list} collapsedHtml={code.listBody} />
        </Preview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <p className="mb-4 text-sm text-foreground-strong/70">
          <InlineCode>TopicListItemTrigger</InlineCode> covers the whole row so the topic opens from
          anywhere on it. Selection, unread state and navigation stay with the consumer.
        </p>
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-group" title="TopicListGroup">
            <PropsTable rows={GROUP_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-list" title="TopicList">
            <PropsTable rows={LIST_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-item" title="TopicListItem">
            <PropsTable rows={ITEM_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-trigger" title="TopicListItemTrigger">
            <PropsTable rows={TRIGGER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-slots" title="Layout parts">
            <PropsTable rows={SLOT_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
