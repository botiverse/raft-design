import { createFileRoute } from "@tanstack/react-router";
import {
  Badge,
  ConversationPreviewCard,
  ConversationPreviewCardAction,
  ConversationPreviewCardAuthor,
  ConversationPreviewCardAuthorName,
  ConversationPreviewCardAuthorSubtitle,
  ConversationPreviewCardChannel,
  ConversationPreviewCardContent,
  ConversationPreviewCardFooter,
  ConversationPreviewCardMeta,
  ConversationPreviewCardPreview,
  ConversationPreviewCardPreviewAuthor,
  ConversationPreviewCardPreviewLeading,
  ConversationPreviewCardSecondaryPreview,
  ConversationPreviewCardTimestamp,
} from "@slock/ui";
import { CheckCircle, MessageSquare } from "lucide-react";

import { Callout } from "#/components/callout.tsx";
import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import LegacyBadge from "../../../../../packages/ui/src/legacy/Badge.tsx";
import LegacyConversationPreviewCard from "../../../../../packages/ui/src/legacy/ConversationPreviewCard.tsx";

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
  ConversationPreviewCard,
  ConversationPreviewCardAuthor,
  ConversationPreviewCardAuthorName,
  ConversationPreviewCardAuthorSubtitle,
  ConversationPreviewCardChannel,
  ConversationPreviewCardContent,
  ConversationPreviewCardMeta,
  ConversationPreviewCardPreview,
  ConversationPreviewCardTimestamp,
} from "@slock/ui";

<ConversationPreviewCard onClick={() => open()}>
  <ConversationPreviewCardContent>
    <ConversationPreviewCardMeta>
      <ConversationPreviewCardChannel>#general</ConversationPreviewCardChannel>
      <ConversationPreviewCardAuthor>
        <Avatar size="4xs" type="agent" />
        <ConversationPreviewCardAuthorName>Atlas</ConversationPreviewCardAuthorName>
        <ConversationPreviewCardAuthorSubtitle>claude-opus</ConversationPreviewCardAuthorSubtitle>
      </ConversationPreviewCardAuthor>
      <ConversationPreviewCardTimestamp>2:14 PM</ConversationPreviewCardTimestamp>
    </ConversationPreviewCardMeta>
    <ConversationPreviewCardPreview>
      Shipped the migration — take a look when you can.
    </ConversationPreviewCardPreview>
  </ConversationPreviewCardContent>
</ConversationPreviewCard>`,
  states: `<ConversationPreviewCard
  data-state={active ? "active" : undefined}
  data-highlighted={focused ? "true" : undefined}
>
  ...
</ConversationPreviewCard>`,
  sourceSearch: `<ConversationPreviewCard
  channelLabel="#proj-theme"
  preview="Search result preview..."
  action={<Badge tone="stone">Saved</Badge>}
/>`,
  currentSearch: `<ConversationPreviewCard>
  <ConversationPreviewCardContent>
    <ConversationPreviewCardMeta>
      <ConversationPreviewCardChannel>#proj-theme</ConversationPreviewCardChannel>
    </ConversationPreviewCardMeta>
    <ConversationPreviewCardPreview>Search result preview...</ConversationPreviewCardPreview>
  </ConversationPreviewCardContent>
  <ConversationPreviewCardAction>
    <Badge variant="muted">Saved</Badge>
  </ConversationPreviewCardAction>
</ConversationPreviewCard>`,
  sourceThread: `<ConversationPreviewCard
  testId="inbox-row"
  onClick={onOpen}
  onContextMenu={onContextMenu}
  focused={focused}
  channelLabel={channelLabel}
  timestamp={timestamp}
  preview={preview}
  previewAuthor={isThread ? null : senderName}
  previewLeading={isThread ? <MessageSquare size={13} /> : null}
  previewLineClampClassName={isThread ? "line-clamp-2" : undefined}
  previewClassName={isThread && unreadCount === 0 ? "font-bold text-black/50" : undefined}
  secondaryPreview={secondaryPreview}
  secondaryPreviewClassName={isThread && unreadCount > 0 ? "text-black" : undefined}
  emphasized={unreadCount > 0}
  footer={footer}
/>`,
  currentThread: `<ConversationPreviewCard
  testId="inbox-row"
  onClick={onOpen}
  onContextMenu={onContextMenu}
  data-highlighted={focused ? "true" : undefined}
>
  <ConversationPreviewCardContent>
    <ConversationPreviewCardMeta>
      <ConversationPreviewCardChannel>{channelLabel}</ConversationPreviewCardChannel>
      <ConversationPreviewCardTimestamp>{timestamp}</ConversationPreviewCardTimestamp>
    </ConversationPreviewCardMeta>
    <ConversationPreviewCardPreview className="line-clamp-2 font-bold">
      <ConversationPreviewCardPreviewLeading>
        <MessageSquare />
      </ConversationPreviewCardPreviewLeading>
      <ConversationPreviewCardPreviewAuthor>{senderName}: </ConversationPreviewCardPreviewAuthor>
      {preview}
    </ConversationPreviewCardPreview>
    <ConversationPreviewCardSecondaryPreview className="text-black">
      {secondaryPreview}
    </ConversationPreviewCardSecondaryPreview>
    <ConversationPreviewCardFooter>{footer}</ConversationPreviewCardFooter>
  </ConversationPreviewCardContent>
</ConversationPreviewCard>`,
  sourceDm: `<ConversationPreviewCard
  channelLabel="Agent DM"
  timestamp={formatSearchRelativeTime(item.lastMessageAt || item.createdAt)}
  author={{
    name: item.peerDisplayName || item.peerName,
    kind: "agent",
    avatarUrl: item.peerAvatarUrl || null,
    subtitle: \`@\${item.peerName}\`,
  }}
  preview={item.lastMessagePreview || "No messages yet"}
  ariaLabel={\`\${item.peerDisplayName || item.peerName} agent DM activity\`}
  title="Agent DM activity"
  footer={<span className="text-[11px] font-mono uppercase tracking-wide text-black/45">Activity only</span>}
/>`,
  currentDm: `<ConversationPreviewCard
  aria-label={\`\${displayName} agent DM activity\`}
  title="Agent DM activity"
>
  <ConversationPreviewCardContent>
    <ConversationPreviewCardMeta>
      <ConversationPreviewCardChannel>Agent DM</ConversationPreviewCardChannel>
      <ConversationPreviewCardAuthor>
        <Avatar size="4xs" type="agent" />
        <ConversationPreviewCardAuthorName>{displayName}</ConversationPreviewCardAuthorName>
        <ConversationPreviewCardAuthorSubtitle>@atlas</ConversationPreviewCardAuthorSubtitle>
      </ConversationPreviewCardAuthor>
      <ConversationPreviewCardTimestamp>2m ago</ConversationPreviewCardTimestamp>
    </ConversationPreviewCardMeta>
    <ConversationPreviewCardPreview>No messages yet</ConversationPreviewCardPreview>
    <ConversationPreviewCardFooter>
      <span className="text-[11px] font-mono uppercase tracking-wide text-black/45">Activity only</span>
    </ConversationPreviewCardFooter>
  </ConversationPreviewCardContent>
</ConversationPreviewCard>`,
} as const;

const ROOT_PROPS: readonly PropRow[] = [
  {
    name: "className",
    type: "string",
    description: "Root escape hatch for one-off layout or styling adjustments.",
  },
  {
    name: 'data-state="active"',
    type: "data attribute",
    description: "Applies the source active row styling.",
  },
  {
    name: 'data-highlighted="true"',
    type: "data attribute",
    description: "Applies the source focused / jump-highlight styling.",
  },
  {
    name: "onClick",
    type: "handlers",
    description: "Renders the root as a Base UI Button. Other events pass through normally.",
  },
  { name: "render", type: "ReactElement", description: "Base UI render hook escape hatch." },
];

const PART_PROPS: readonly PropRow[] = [
  { name: "ConversationPreviewCardContent", type: "div props", description: "Main text column." },
  { name: "ConversationPreviewCardMeta", type: "div props", description: "Top metadata row." },
  {
    name: "ConversationPreviewCardChannel",
    type: "span props",
    description: "Bold muted channel label.",
  },
  {
    name: "ConversationPreviewCardAuthor",
    type: "span props",
    description: "Inline author cluster; callers provide avatar and text slots.",
  },
  {
    name: "ConversationPreviewCardAuthorName",
    type: "span props",
    description: "Truncating author name.",
  },
  {
    name: "ConversationPreviewCardAuthorSubtitle",
    type: "span props",
    description: "Tiny mono author subtitle.",
  },
  { name: "ConversationPreviewCardTimestamp", type: "span props", description: "Mono timestamp." },
  {
    name: "ConversationPreviewCardPreview",
    type: "p props",
    description:
      "Message preview. Caller renders markdown and passes content strategy classes such as line-clamp-2 or font-bold.",
  },
  {
    name: "ConversationPreviewCardPreviewLeading",
    type: "span props",
    description: "Inline icon/node before the preview text.",
  },
  {
    name: "ConversationPreviewCardPreviewAuthor",
    type: "span props",
    description: "Inline author prefix inside preview.",
  },
  {
    name: "ConversationPreviewCardSecondaryPreview",
    type: "p props",
    description: "Optional one-line secondary preview.",
  },
  { name: "ConversationPreviewCardFooter", type: "div props", description: "Footer metadata row." },
  {
    name: "ConversationPreviewCardAction",
    type: "div props",
    description: "Trailing action slot.",
  },
];

const MiniAvatar = ({ tone = "agent" }: { tone?: "agent" | "human" }) => (
  <span
    className={`inline-flex size-[14px] shrink-0 items-center justify-center border border-black ${
      tone === "agent" ? "bg-brutal-cyan" : "bg-brutal-lavender"
    }`}
  />
);

export const Route = createFileRoute("/components/conversation-preview-card")({
  component: ConversationPreviewCardDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function ConversationPreviewCardDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="ConversationPreviewCard"
      description="A conversation-specific preview row with channel, author, timestamp, preview text, and conversation state."
      overview={
        <Differences from="ConversationPreviewCard">
          <li>
            source styling is preserved while the frame now maps through surface and information
            tokens
          </li>
          <li>
            app-domain markdown and avatar resolution move to callers; the component exposes slots
            instead of <code>author</code> and <code>preview</code> props
          </li>
          <li>
            root interaction is still built on Base UI&rsquo;s <code>Button</code> through{" "}
            <code>useRender</code>
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="preview" title="Preview">
        <Example html={code.anatomy}>
          <div className="w-96">
            <GeneralPreview />
          </div>
        </Example>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="ConversationPreviewCard.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
          showLineNumbers={false}
        />
      </DocSection>

      <DocSection id="states" title="States">
        <div className="space-y-4">
          <Example html={code.states}>
            <div className="flex w-96 flex-col gap-3">
              <GeneralPreview />
              <OpenPreview />
              <FocusedPreview />
            </div>
          </Example>
          <Callout>
            Source exposed <code>focused</code> / <code>active</code> props. Current uses data
            attributes so CSS selectors own the visuals while business state stays at the callsite.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <PropsTable rows={ROOT_PROPS} />
          <PropsTable rows={PART_PROPS} />
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          items={[
            {
              label: "Search result",
              status: "difference",
              note: "Source exposed channelLabel and preview props. Current keeps the same static result but composes channel and preview explicitly.",
              source: <LegacySearchPreview />,
              current: <CurrentSearchPreview />,
              sourceCode: code.sourceSearch,
              currentCode: code.currentSearch,
            },
            {
              label: "Threads inbox",
              status: "difference",
              note: "Source packed thread leading icon, preview author, secondary preview, and footer into props. Current keeps root interactions and maps business state through data attributes while moving body content to slots.",
              source: <LegacyThreadPreview />,
              current: <CurrentThreadPreview />,
              sourceCode: code.sourceThread,
              currentCode: code.currentThread,
            },
            {
              label: "Agent DM",
              status: "difference",
              note: "Source resolved AvatarSlot from the author object. Current asks callers to pass the visual slot so avatar fetching stays app-domain.",
              source: <LegacyDmPreview />,
              current: <CurrentDmPreview />,
              sourceCode: code.sourceDm,
              currentCode: code.currentDm,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}

function GeneralPreview() {
  return (
    <ConversationPreviewCard onClick={() => {}}>
      <ConversationPreviewCardContent>
        <ConversationPreviewCardMeta>
          <ConversationPreviewCardChannel>#general</ConversationPreviewCardChannel>
          <ConversationPreviewCardAuthor>
            <MiniAvatar />
            <ConversationPreviewCardAuthorName>Atlas</ConversationPreviewCardAuthorName>
            <ConversationPreviewCardAuthorSubtitle>
              claude-opus
            </ConversationPreviewCardAuthorSubtitle>
          </ConversationPreviewCardAuthor>
          <ConversationPreviewCardTimestamp>2:14 PM</ConversationPreviewCardTimestamp>
        </ConversationPreviewCardMeta>
        <ConversationPreviewCardPreview>
          Shipped the migration - take a look when you can.
        </ConversationPreviewCardPreview>
      </ConversationPreviewCardContent>
    </ConversationPreviewCard>
  );
}

function OpenPreview() {
  return (
    <ConversationPreviewCard data-state="active" onClick={() => {}}>
      <ConversationPreviewCardContent>
        <ConversationPreviewCardMeta>
          <ConversationPreviewCardChannel>#design</ConversationPreviewCardChannel>
          <ConversationPreviewCardAuthor>
            <MiniAvatar tone="human" />
            <ConversationPreviewCardAuthorName>Ada</ConversationPreviewCardAuthorName>
          </ConversationPreviewCardAuthor>
          <Badge variant="information">Open</Badge>
          <ConversationPreviewCardTimestamp>1:02 PM</ConversationPreviewCardTimestamp>
        </ConversationPreviewCardMeta>
        <ConversationPreviewCardPreview>
          Currently-open conversation.
        </ConversationPreviewCardPreview>
      </ConversationPreviewCardContent>
    </ConversationPreviewCard>
  );
}

function FocusedPreview() {
  return (
    <ConversationPreviewCard data-highlighted="true" onClick={() => {}}>
      <ConversationPreviewCardContent>
        <ConversationPreviewCardMeta>
          <ConversationPreviewCardChannel>#random</ConversationPreviewCardChannel>
          <ConversationPreviewCardAuthor>
            <MiniAvatar tone="human" />
            <ConversationPreviewCardAuthorName>Grace</ConversationPreviewCardAuthorName>
          </ConversationPreviewCardAuthor>
          <ConversationPreviewCardTimestamp>11:30 AM</ConversationPreviewCardTimestamp>
        </ConversationPreviewCardMeta>
        <ConversationPreviewCardPreview className="font-bold">
          Jumped here from a permalink.
        </ConversationPreviewCardPreview>
      </ConversationPreviewCardContent>
    </ConversationPreviewCard>
  );
}

function LegacySearchPreview() {
  return (
    <div className="w-96">
      <LegacyConversationPreviewCard
        channelLabel="#proj-theme"
        preview="Search result preview..."
        action={<LegacyBadge tone="stone">Saved</LegacyBadge>}
      />
    </div>
  );
}

function CurrentSearchPreview() {
  return (
    <div className="w-96">
      <ConversationPreviewCard>
        <ConversationPreviewCardContent>
          <ConversationPreviewCardMeta>
            <ConversationPreviewCardChannel>#proj-theme</ConversationPreviewCardChannel>
          </ConversationPreviewCardMeta>
          <ConversationPreviewCardPreview>Search result preview...</ConversationPreviewCardPreview>
        </ConversationPreviewCardContent>
        <ConversationPreviewCardAction>
          <Badge variant="muted">Saved</Badge>
        </ConversationPreviewCardAction>
      </ConversationPreviewCard>
    </div>
  );
}

function LegacyThreadPreview() {
  return (
    <div className="w-96">
      <LegacyConversationPreviewCard
        testId="inbox-row"
        onClick={() => {}}
        onContextMenu={() => {}}
        channelLabel="#engineering"
        timestamp="2m"
        preview="Parent message preview"
        previewAuthor="Wug"
        previewLeading={<MessageSquare size={13} className="shrink-0 text-brutal-pink" />}
        previewLineClampClassName="line-clamp-2"
        secondaryPreview={
          <>
            <span className="font-bold text-black">Wug: </span>
            <span>Latest reply in a followed thread</span>
          </>
        }
        secondaryPreviewClassName="text-black"
        emphasized
        footer={<TaskFooter />}
      />
    </div>
  );
}

function CurrentThreadPreview() {
  return (
    <div className="w-96">
      <ConversationPreviewCard testId="inbox-row" onClick={() => {}} onContextMenu={() => {}}>
        <ConversationPreviewCardContent>
          <ConversationPreviewCardMeta>
            <ConversationPreviewCardChannel>#engineering</ConversationPreviewCardChannel>
            <ConversationPreviewCardTimestamp>2m</ConversationPreviewCardTimestamp>
          </ConversationPreviewCardMeta>
          <ConversationPreviewCardPreview className="line-clamp-2 font-bold">
            <ConversationPreviewCardPreviewLeading>
              <MessageSquare className="shrink-0 text-brutal-pink" />
            </ConversationPreviewCardPreviewLeading>
            <ConversationPreviewCardPreviewAuthor>Wug: </ConversationPreviewCardPreviewAuthor>
            Parent message preview
          </ConversationPreviewCardPreview>
          <ConversationPreviewCardSecondaryPreview className="text-black">
            <span className="font-bold text-black">Wug: </span>
            <span>Latest reply in a followed thread</span>
          </ConversationPreviewCardSecondaryPreview>
          <ConversationPreviewCardFooter>
            <TaskFooter />
          </ConversationPreviewCardFooter>
        </ConversationPreviewCardContent>
      </ConversationPreviewCard>
    </div>
  );
}

function LegacyDmPreview() {
  return (
    <div className="w-96">
      <LegacyConversationPreviewCard
        channelLabel="Agent DM"
        timestamp="2m ago"
        author={{
          name: "Atlas",
          kind: "agent",
          avatarUrl: null,
          subtitle: "@atlas",
        }}
        preview="No messages yet"
        ariaLabel="Atlas agent DM activity"
        title="Agent DM activity"
        footer={
          <span className="font-mono text-[11px] uppercase tracking-wide text-black/45">
            Activity only
          </span>
        }
      />
    </div>
  );
}

function CurrentDmPreview() {
  return (
    <div className="w-96">
      <ConversationPreviewCard aria-label="Atlas agent DM activity" title="Agent DM activity">
        <ConversationPreviewCardContent>
          <ConversationPreviewCardMeta>
            <ConversationPreviewCardChannel>Agent DM</ConversationPreviewCardChannel>
            <ConversationPreviewCardAuthor>
              <MiniAvatar />
              <ConversationPreviewCardAuthorName>Atlas</ConversationPreviewCardAuthorName>
              <ConversationPreviewCardAuthorSubtitle>@atlas</ConversationPreviewCardAuthorSubtitle>
            </ConversationPreviewCardAuthor>
            <ConversationPreviewCardTimestamp>2m ago</ConversationPreviewCardTimestamp>
          </ConversationPreviewCardMeta>
          <ConversationPreviewCardPreview>No messages yet</ConversationPreviewCardPreview>
          <ConversationPreviewCardFooter>
            <span className="font-mono text-[11px] uppercase tracking-wide text-black/45">
              Activity only
            </span>
          </ConversationPreviewCardFooter>
        </ConversationPreviewCardContent>
      </ConversationPreviewCard>
    </div>
  );
}

function TaskFooter() {
  return (
    <>
      <span className="inline-flex items-center gap-1 border border-black bg-brutal-lime px-1.5 py-0.5 text-[10px] font-bold">
        <CheckCircle size={10} />
        #13 @Ada
      </span>
      <span className="font-mono text-[10px] text-black/40">4 replies</span>
    </>
  );
}
