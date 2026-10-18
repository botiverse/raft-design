import { createFileRoute } from "@tanstack/react-router";
import { InlineCode } from "raft-ui";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { createCompositionSnippetMap, createCompositionSourceMap } from "#/lib/composition-code.ts";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { ListRowConversationsComposition } from "#/modules/list-row/compositions/conversations.composition.tsx";
import listRowConversationsCompositionSource from "#/modules/list-row/compositions/conversations.composition.tsx?raw";
import { ListRowEntriesComposition } from "#/modules/list-row/compositions/entries.composition.tsx";
import listRowEntriesCompositionSource from "#/modules/list-row/compositions/entries.composition.tsx?raw";
import { ListRowSettingsComposition } from "#/modules/list-row/compositions/settings.composition.tsx";
import listRowSettingsCompositionSource from "#/modules/list-row/compositions/settings.composition.tsx?raw";
import { ListRowTonesComposition } from "#/modules/list-row/compositions/tones.composition.tsx";
import listRowTonesCompositionSource from "#/modules/list-row/compositions/tones.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  anatomy: `import {
  ListRow,
  ListRowBody,
  ListRowBottom,
  ListRowDescription,
  ListRowGroup,
  ListRowMeta,
  ListRowTitle,
  ListRowTop,
} from "raft-ui";

<ListRowGroup>
  <ListRow>
    {/* leading: an avatar, a tile or ListRowIcon */}
    <ListRowBody>
      <ListRowTop>
        <ListRowTitle />
        <ListRowMeta />
      </ListRowTop>
      <ListRowBottom>
        <ListRowDescription />
        {/* at most one badge */}
      </ListRowBottom>
    </ListRowBody>
    {/* trailing: ListRowValue, ListRowChevron, a switch */}
  </ListRow>
</ListRowGroup>`,
} as const;

const COMPOSITION_SOURCES = createCompositionSourceMap({
  Conversations: listRowConversationsCompositionSource,
  Entries: listRowEntriesCompositionSource,
  Settings: listRowSettingsCompositionSource,
  Tones: listRowTonesCompositionSource,
});

const COMPOSITION_SNIPPET_IDS = {
  Conversations: "listRowConversationsComposition",
  Entries: "listRowEntriesComposition",
  Settings: "listRowSettingsComposition",
  Tones: "listRowTonesComposition",
} as const;

const COMPOSITION_SNIPPETS = createCompositionSnippetMap(
  COMPOSITION_SOURCES,
  COMPOSITION_SNIPPET_IDS,
);

const LIST_ROW_PROPS: readonly PropRow[] = [
  {
    name: "variant",
    type: '"default" | "plain" | "entry"',
    default: '"default"',
    description:
      "default: at least 64 tall, a hairline from the text start (63px). plain: a setting, 48 tall with one line, the hairline from the edge. entry: a shortcut (Search, Activity), 48 tall, no hairlines.",
  },
  {
    name: "tone",
    type: '"default" | "unread" | "muted" | "away"',
    default: '"default"',
    description:
      "unread: bold title, ink preview. muted: ink-2 title. away (not joined yet): ink-3 title and preview.",
  },
  {
    name: "selected",
    type: "boolean",
    default: "false",
    description:
      "The item open beside the list: a cyan wash, no hover. Set aria-current or aria-selected yourself.",
  },
  {
    name: "interactive",
    type: "boolean",
    default: "true",
    description:
      "false renders a display-only div with no hover or press, for a row whose switch or buttons are its only targets.",
  },
  {
    name: "render",
    type: "ReactElement | (props, state) => ReactElement",
    description: "Render a link or a router link instead of the button.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"button">',
    description:
      "Native button attributes: onClick, value, aria-*. disabled (or aria-disabled) greys every part, drops the tone and stops hover and press.",
  },
];

const PARTS: readonly PropRow[] = [
  {
    name: "ListRowGroup",
    type: "div",
    description: "An inset group: rows in a card (surface, hairline border, radius-lg).",
  },
  {
    name: "ListRowIcon",
    type: "span",
    description: "A 20px leading icon in ink-3, for entry rows and settings.",
  },
  {
    name: "ListRowBody",
    type: "span",
    description: "The text column: a title and a description, or a top and a bottom line.",
  },
  {
    name: "ListRowTop / ListRowBottom",
    type: "span",
    description: "The title line (title, time) and the preview line (preview, one badge).",
  },
  {
    name: "ListRowTitle",
    type: "span",
    description: "16/24 600, one line; the row's tone sets its weight and ink.",
  },
  {
    name: "ListRowDescription",
    type: "span",
    description: "14/20 ink-2, one line; wrap lets a setting's consequence run on.",
  },
  {
    name: "ListRowMeta",
    type: "span",
    description: "Space Mono 12 ink-3: the time, a gray count.",
  },
  {
    name: "ListRowValue",
    type: "span",
    description: "A setting's current value, 15/20 ink-3, at most 45% of the row.",
  },
  {
    name: "ListRowChevron",
    type: "span",
    description: "The ink-3 arrow of a row that opens another page; decorative.",
  },
];

export const Route = createFileRoute("/components/list-row")({
  component: ListRowDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        ...COMPOSITION_SNIPPETS,
      },
    }),
});

function ListRowDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="ListRow"
      description="The row of phone lists, settings, and the people and agents on a detail page: a leading block, a title and a preview, the time and a badge. The whole row is the target."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview>
          <Preview.Canvas>
            <ListRowConversationsComposition />
          </Preview.Canvas>
          <Preview.Code
            html={code.listRowConversationsComposition}
            collapsedHtml={code.listRowConversationsCompositionBody}
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
        <div className="space-y-8">
          <DocSubsection parentId="usage" id="entries" title="Entry rows">
            <DocNote>
              <InlineCode>variant="entry"</InlineCode> is a shortcut into another page at the top of
              a list (Search, Activity, Saved): a 20px <InlineCode>ListRowIcon</InlineCode> and a
              name, with a badge or a gray count on the right, 48 tall. They are a set of buttons,
              so no lines run between them.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <ListRowEntriesComposition />
              </Preview.Canvas>
              <Preview.Code
                html={code.listRowEntriesComposition}
                collapsedHtml={code.listRowEntriesCompositionBody}
              />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="settings" title="Settings">
            <DocNote>
              <InlineCode>variant="plain"</InlineCode> is a setting row inside a{" "}
              <InlineCode>ListRowGroup</InlineCode>: the current value and a chevron when it opens a
              choice, or a <InlineCode>Switch</InlineCode> labelled by the title. A row with a
              switch takes <InlineCode>interactive=&#123;false&#125;</InlineCode>: the switch is the
              target, and the description says the consequence.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <ListRowSettingsComposition />
              </Preview.Canvas>
              <Preview.Code
                html={code.listRowSettingsComposition}
                collapsedHtml={code.listRowSettingsCompositionBody}
              />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="tones" title="Tones">
            <DocNote>
              <InlineCode>tone</InlineCode> carries what the place is to you:{" "}
              <InlineCode>unread</InlineCode>, <InlineCode>muted</InlineCode>, or{" "}
              <InlineCode>away</InlineCode> for one you have not joined. Rows that go somewhere
              render a link.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <ListRowTonesComposition />
              </Preview.Canvas>
              <Preview.Code
                html={code.listRowTonesComposition}
                collapsedHtml={code.listRowTonesCompositionBody}
              />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-list-row" title="ListRow">
            <PropsTable rows={LIST_ROW_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-parts" title="Parts">
            <PropsTable rows={PARTS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
