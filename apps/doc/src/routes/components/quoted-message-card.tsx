import { createFileRoute } from "@tanstack/react-router";
import { Hash } from "lucide-react";
import { Avatar, AvatarFallback } from "raft-ui";
import {
  QuotedMessageCard,
  QuotedMessageCardAttachments,
  QuotedMessageCardAuthor,
  QuotedMessageCardAuthorName,
  QuotedMessageCardAuthorSubtitle,
  QuotedMessageCardBody,
  QuotedMessageCardChannel,
  QuotedMessageCardContent,
  QuotedMessageCardContentWrap,
  QuotedMessageCardHeader,
  QuotedMessageCardMeta,
  QuotedMessageCardSeparator,
  QuotedMessageCardTag,
  QuotedMessageCardThread,
  QuotedMessageCardTimestamp,
  QuotedMessageCardUnavailable,
} from "raft-ui/wip";

import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import LegacyQuotedMessageCard from "../../../../../packages/ui/src/legacy/QuotedMessageCard.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "states", title: "States" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import {
  Avatar,
  AvatarFallback,
  QuotedMessageCard,
  QuotedMessageCardAuthor,
  QuotedMessageCardAuthorName,
  QuotedMessageCardAuthorSubtitle,
  QuotedMessageCardBody,
  QuotedMessageCardChannel,
  QuotedMessageCardContent,
  QuotedMessageCardContentWrap,
  QuotedMessageCardHeader,
  QuotedMessageCardMeta,
  QuotedMessageCardSeparator,
  QuotedMessageCardTimestamp,
} from "raft-ui";
import { Hash } from "lucide-react";

<QuotedMessageCard
  render={<button type="button" aria-label="Open quoted message" onClick={() => jumpToMessage()} />}
>
  <QuotedMessageCardBody>
    <QuotedMessageCardHeader>
      <QuotedMessageCardMeta>
        <QuotedMessageCardChannel>
          <Hash />
          general
        </QuotedMessageCardChannel>
        <QuotedMessageCardSeparator />
        <QuotedMessageCardAuthor>
          <Avatar size="xs" type="agent">
            <AvatarFallback />
          </Avatar>
          <QuotedMessageCardAuthorName>Atlas</QuotedMessageCardAuthorName>
          <QuotedMessageCardAuthorSubtitle>claude-opus</QuotedMessageCardAuthorSubtitle>
        </QuotedMessageCardAuthor>
      </QuotedMessageCardMeta>
      <QuotedMessageCardTimestamp>2:14 PM</QuotedMessageCardTimestamp>
    </QuotedMessageCardHeader>
    <QuotedMessageCardContentWrap>
      <QuotedMessageCardContent>
        Shipped the migration — take a look when you can.
      </QuotedMessageCardContent>
    </QuotedMessageCardContentWrap>
  </QuotedMessageCardBody>
</QuotedMessageCard>`,
  states: `<QuotedMessageCard
  render={<button type="button" aria-label="Open quoted message" onClick={() => jumpToMessage()} />}
>
  <QuotedMessageCardBody>
    <QuotedMessageCardHeader>
      <QuotedMessageCardMeta>
        <QuotedMessageCardChannel>
          <Hash />
          design
        </QuotedMessageCardChannel>
        <QuotedMessageCardSeparator />
        <QuotedMessageCardAuthor>...</QuotedMessageCardAuthor>
        <QuotedMessageCardSeparator />
        <QuotedMessageCardThread />
        <QuotedMessageCardSeparator />
        <QuotedMessageCardTag className="bg-brutal-orange/30 text-black">
          Archived
        </QuotedMessageCardTag>
      </QuotedMessageCardMeta>
      <QuotedMessageCardTimestamp>Yesterday</QuotedMessageCardTimestamp>
    </QuotedMessageCardHeader>
    <QuotedMessageCardContentWrap>
      <QuotedMessageCardContent>Archived thread with an attachment.</QuotedMessageCardContent>
      <QuotedMessageCardAttachments>
        <QuotedMessageCardTag className="bg-brutal-lavender font-mono text-[10px] font-bold text-black">
          diff.patch
        </QuotedMessageCardTag>
      </QuotedMessageCardAttachments>
    </QuotedMessageCardContentWrap>
  </QuotedMessageCardBody>
</QuotedMessageCard>

<QuotedMessageCard
  variant="muted"
  render={<button type="button" aria-label="Open unavailable quoted message" onClick={() => jumpToMessage()} />}
>
  <QuotedMessageCardBody>
    <QuotedMessageCardUnavailable>Message unavailable</QuotedMessageCardUnavailable>
  </QuotedMessageCardBody>
</QuotedMessageCard>`,
  sourceDefault: `<QuotedMessageCard
  channelName="general"
  timestamp="2:14 PM"
  author={{ name: "Atlas", kind: "agent", subtitle: "claude-opus" }}
  content="Shipped the migration — take a look when you can."
  onClick={() => onOpen(permalink)}
/>`,
  currentDefault: `<QuotedMessageCard
  render={<button type="button" aria-label="Open quoted message" onClick={() => onOpen(permalink)} />}
>
  <QuotedMessageCardBody>
    <QuotedMessageCardHeader>
      <QuotedMessageCardMeta>
        <QuotedMessageCardChannel>
          <Hash />
          general
        </QuotedMessageCardChannel>
        <QuotedMessageCardSeparator />
        <QuotedMessageCardAuthor>
          <Avatar size="xs" type="agent">
            <AvatarFallback />
          </Avatar>
          <QuotedMessageCardAuthorName>Atlas</QuotedMessageCardAuthorName>
          <QuotedMessageCardAuthorSubtitle>claude-opus</QuotedMessageCardAuthorSubtitle>
        </QuotedMessageCardAuthor>
      </QuotedMessageCardMeta>
      <QuotedMessageCardTimestamp>2:14 PM</QuotedMessageCardTimestamp>
    </QuotedMessageCardHeader>
    <QuotedMessageCardContentWrap>
      <QuotedMessageCardContent>
        Shipped the migration — take a look when you can.
      </QuotedMessageCardContent>
    </QuotedMessageCardContentWrap>
  </QuotedMessageCardBody>
</QuotedMessageCard>`,
  sourceThread: `<QuotedMessageCard
  channelName="design"
  timestamp="Yesterday"
  isThread
  isArchived
  author={{ name: "Ada", kind: "user" }}
  content="Archived thread with an attachment."
  attachments={[{ label: "diff.patch" }]}
/>`,
  currentThread: `<QuotedMessageCard>
  <QuotedMessageCardBody>
    <QuotedMessageCardHeader>
      <QuotedMessageCardMeta>
        <QuotedMessageCardChannel>
          <Hash />
          design
        </QuotedMessageCardChannel>
        <QuotedMessageCardSeparator />
        <QuotedMessageCardAuthor>
          <Avatar size="xs" type="human">
            <AvatarFallback />
          </Avatar>
          <QuotedMessageCardAuthorName>Ada</QuotedMessageCardAuthorName>
        </QuotedMessageCardAuthor>
        <QuotedMessageCardSeparator />
        <QuotedMessageCardThread />
        <QuotedMessageCardSeparator />
        <QuotedMessageCardTag className="bg-brutal-orange/30 text-black">
          Archived
        </QuotedMessageCardTag>
      </QuotedMessageCardMeta>
      <QuotedMessageCardTimestamp>Yesterday</QuotedMessageCardTimestamp>
    </QuotedMessageCardHeader>
    <QuotedMessageCardContentWrap>
      <QuotedMessageCardContent>Archived thread with an attachment.</QuotedMessageCardContent>
      <QuotedMessageCardAttachments>
        <QuotedMessageCardTag className="bg-brutal-lavender font-mono text-[10px] font-bold text-black">
          diff.patch
        </QuotedMessageCardTag>
      </QuotedMessageCardAttachments>
    </QuotedMessageCardContentWrap>
  </QuotedMessageCardBody>
</QuotedMessageCard>`,
  sourceUnavailable: `<QuotedMessageCard
  unavailable
  onClick={() => onOpen(permalink)}
  channelName=""
  timestamp=""
  author={{ name: "", kind: "user" }}
  content=""
/>`,
  currentUnavailable: `<QuotedMessageCard
  variant="muted"
  render={<button type="button" aria-label="Open unavailable quoted message" onClick={() => onOpen(permalink)} />}
>
  <QuotedMessageCardBody>
    <QuotedMessageCardUnavailable>Message unavailable</QuotedMessageCardUnavailable>
  </QuotedMessageCardBody>
</QuotedMessageCard>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "QuotedMessageCard",
    type: "PreviewShellProps",
    description: "PreviewShell-backed root. Use variant='muted' for unavailable state.",
  },
  {
    name: "QuotedMessageCardBody",
    type: 'useRender.ComponentProps<"div">',
    description: "Inner padding slot.",
  },
  {
    name: "QuotedMessageCardHeader",
    type: 'useRender.ComponentProps<"div">',
    description: "Top row containing meta and timestamp.",
  },
  {
    name: "QuotedMessageCardMeta",
    type: 'useRender.ComponentProps<"div">',
    description: "Wrapping metadata cluster.",
  },
  {
    name: "QuotedMessageCardChannel",
    type: 'useRender.ComponentProps<"span">',
    description: "Channel / DM label slot. Compose the hash icon or @ prefix at the callsite.",
  },
  {
    name: "QuotedMessageCardAuthor",
    type: 'useRender.ComponentProps<"span">',
    description: "Author cluster; compose Avatar, name, and subtitle as children.",
  },
  {
    name: "QuotedMessageCardContent",
    type: 'useRender.ComponentProps<"div">',
    description: "Line-clamped message content. Pass rendered markdown as children.",
  },
  {
    name: "QuotedMessageCardTag",
    type: 'useRender.ComponentProps<"span">',
    description: "Bordered inline tag used for Archived and attachment chips.",
  },
  {
    name: "QuotedMessageCardThread",
    type: 'useRender.ComponentProps<"span">',
    description: "Thread marker slot with the source MessageSquare icon.",
  },
];

export const Route = createFileRoute("/components/quoted-message-card")({
  component: QuotedMessageCardDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function QuotedMessageCardDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="QuotedMessageCard"
      description="A quoted-message preview routed through PreviewShell."
      overview={
        <Differences from="QuotedMessageCard">
          <li>
            source props for channel, author, content, tags, and unavailable state are now slots
          </li>
          <li>
            the component intentionally keeps <code>PreviewShell</code> instead of merging into{" "}
            <code>ListItem</code>, <code>MediaListItem</code>, or{" "}
            <code>ConversationPreviewCard</code>; their surface skins are different
          </li>
          <li>
            markdown rendering, permalink fetching, and avatar URL resolution remain app domain
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Example html={code.anatomy}>
          <div className="w-96">
            <CurrentQuotedMessage />
          </div>
        </Example>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="QuotedMessageCard.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
        />
      </DocSection>

      <DocSection id="states" title="States">
        <Example html={code.states}>
          <div className="flex w-96 flex-col gap-3">
            <CurrentQuotedMessage />
            <CurrentQuotedMessage
              archived
              attachment
              thread
              channelName="design"
              timestamp="Yesterday"
            />
            <QuotedMessageCard
              variant="muted"
              render={
                <button
                  type="button"
                  aria-label="Open unavailable quoted message"
                  onClick={() => {}}
                />
              }
            >
              <QuotedMessageCardBody>
                <QuotedMessageCardUnavailable>Message unavailable</QuotedMessageCardUnavailable>
              </QuotedMessageCardBody>
            </QuotedMessageCard>
          </div>
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          items={[
            {
              label: "Permalink preview",
              status: "difference",
              note: "Source accepted resolved channel/author/content props. Current keeps the same PreviewShell visual contract but composes those pieces as slots.",
              source: (
                <LegacyQuotedMessageCard
                  channelName="general"
                  timestamp="2:14 PM"
                  author={{ name: "Atlas", kind: "agent", subtitle: "claude-opus" }}
                  content="Shipped the migration — take a look when you can."
                  onClick={() => {}}
                />
              ),
              current: <CurrentQuotedMessage />,
              sourceCode: code.sourceDefault,
              currentCode: code.currentDefault,
              compositionCode: code.currentDefault,
              compositionPath:
                "apps/doc/src/compositions/quoted-message-card/permalink-preview-composition.tsx",
              compositionSource: SNIPPETS.currentDefault,
            },
            {
              label: "Thread, archived, attachments",
              status: "difference",
              note: "Source derived markers from booleans and an attachment array. Current exposes marker/tag/attachments slots so business derivation stays outside the component.",
              source: (
                <LegacyQuotedMessageCard
                  channelName="design"
                  timestamp="Yesterday"
                  isThread
                  isArchived
                  author={{ name: "Ada", kind: "user" }}
                  content="Archived thread with an attachment."
                  attachments={[{ label: "diff.patch" }]}
                />
              ),
              current: (
                <CurrentQuotedMessage
                  archived
                  attachment
                  thread
                  channelName="design"
                  timestamp="Yesterday"
                />
              ),
              sourceCode: code.sourceThread,
              currentCode: code.currentThread,
              compositionCode: code.currentThread,
              compositionPath:
                "apps/doc/src/compositions/quoted-message-card/thread-archived-attachments-composition.tsx",
              compositionSource: SNIPPETS.currentThread,
            },
            {
              label: "Unavailable",
              status: "difference",
              note: "Source used an unavailable boolean plus placeholder props. Current uses PreviewShell's muted variant and the unavailable text slot directly.",
              source: (
                <LegacyQuotedMessageCard
                  unavailable
                  onClick={() => {}}
                  channelName=""
                  timestamp=""
                  author={{ name: "", kind: "user" }}
                  content=""
                />
              ),
              current: (
                <QuotedMessageCard
                  variant="muted"
                  render={
                    <button
                      type="button"
                      aria-label="Open unavailable quoted message"
                      onClick={() => {}}
                    />
                  }
                >
                  <QuotedMessageCardBody>
                    <QuotedMessageCardUnavailable>Message unavailable</QuotedMessageCardUnavailable>
                  </QuotedMessageCardBody>
                </QuotedMessageCard>
              ),
              sourceCode: code.sourceUnavailable,
              currentCode: code.currentUnavailable,
              compositionCode: code.currentUnavailable,
              compositionPath:
                "apps/doc/src/compositions/quoted-message-card/unavailable-composition.tsx",
              compositionSource: SNIPPETS.currentUnavailable,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}

function CurrentQuotedMessage({
  archived = false,
  attachment = false,
  thread = false,
  channelName = "general",
  timestamp = "2:14 PM",
}: {
  archived?: boolean;
  attachment?: boolean;
  thread?: boolean;
  channelName?: string;
  timestamp?: string;
}) {
  return (
    <QuotedMessageCard
      render={<button type="button" aria-label="Open quoted message" onClick={() => {}} />}
    >
      <QuotedMessageCardBody>
        <QuotedMessageCardHeader>
          <QuotedMessageCardMeta>
            <QuotedMessageCardChannel>
              <Hash />
              {channelName}
            </QuotedMessageCardChannel>
            <QuotedMessageCardSeparator />
            <QuotedMessageCardAuthor>
              <Avatar size="xs" type={archived ? "human" : "agent"}>
                <AvatarFallback />
              </Avatar>
              <QuotedMessageCardAuthorName>
                {archived ? "Ada" : "Atlas"}
              </QuotedMessageCardAuthorName>
              {archived ? null : (
                <QuotedMessageCardAuthorSubtitle>claude-opus</QuotedMessageCardAuthorSubtitle>
              )}
            </QuotedMessageCardAuthor>
            {thread ? (
              <>
                <QuotedMessageCardSeparator />
                <QuotedMessageCardThread />
              </>
            ) : null}
            {archived ? (
              <>
                <QuotedMessageCardSeparator />
                <QuotedMessageCardTag className="bg-brutal-orange/30 text-black">
                  Archived
                </QuotedMessageCardTag>
              </>
            ) : null}
          </QuotedMessageCardMeta>
          <QuotedMessageCardTimestamp>{timestamp}</QuotedMessageCardTimestamp>
        </QuotedMessageCardHeader>
        <QuotedMessageCardContentWrap>
          <QuotedMessageCardContent>
            {attachment
              ? "Archived thread with an attachment."
              : "Shipped the migration — take a look when you can."}
          </QuotedMessageCardContent>
          {attachment ? (
            <QuotedMessageCardAttachments>
              <QuotedMessageCardTag className="bg-brutal-lavender font-mono text-[10px] font-bold text-black">
                diff.patch
              </QuotedMessageCardTag>
            </QuotedMessageCardAttachments>
          ) : null}
        </QuotedMessageCardContentWrap>
      </QuotedMessageCardBody>
    </QuotedMessageCard>
  );
}
