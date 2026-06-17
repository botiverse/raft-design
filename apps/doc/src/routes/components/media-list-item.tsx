import { createFileRoute } from "@tanstack/react-router";
import {
  Badge,
  Button,
  MediaListItem,
  MediaListItemActionGroup,
  MediaListItemAside,
  MediaListItemBody,
  MediaListItemSubtitle,
  MediaListItemText,
  MediaListItemTitle,
  MediaListItemVisual,
  Status,
} from "@slock/ui";
import { Clock3, Download, ExternalLink } from "lucide-react";

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
import LegacyAvatarListRow from "../../../../../packages/ui/src/legacy/AvatarListRow.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "align", title: "Align" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import {
  MediaListItem,
  MediaListItemActionGroup,
  MediaListItemAside,
  MediaListItemBody,
  MediaListItemSubtitle,
  MediaListItemText,
  MediaListItemTitle,
  MediaListItemVisual,
} from "@slock/ui";

<MediaListItem>
  <MediaListItemBody>
    <MediaListItemVisual>
      <Avatar size="md" type="agent" />
    </MediaListItemVisual>
    <MediaListItemText>
      <MediaListItemTitle>Atlas</MediaListItemTitle>
      <MediaListItemSubtitle>claude-opus</MediaListItemSubtitle>
    </MediaListItemText>
    <MediaListItemAside>
      <Status variant="success" />
    </MediaListItemAside>
  </MediaListItemBody>
</MediaListItem>`,
  interactive: `<MediaListItem>
  <MediaListItemBody onClick={() => open(agent)}>
    <MediaListItemVisual>
      <Avatar size="md" type="agent" />
    </MediaListItemVisual>
    <MediaListItemText>
      <MediaListItemTitle>Atlas</MediaListItemTitle>
      <MediaListItemSubtitle>claude-opus</MediaListItemSubtitle>
    </MediaListItemText>
    <MediaListItemAside>
      <Status variant="success" />
    </MediaListItemAside>
  </MediaListItemBody>
</MediaListItem>`,
  align: `<MediaListItem align="start">
  <MediaListItemBody>
    <MediaListItemVisual>
      <Avatar />
    </MediaListItemVisual>
    <MediaListItemText>
      <MediaListItemTitle>report.pdf</MediaListItemTitle>
      <MediaListItemSubtitle>2.4 MB · uploaded 3d ago</MediaListItemSubtitle>
    </MediaListItemText>
  </MediaListItemBody>
  <MediaListItemActionGroup>
    <Button size="icon-xs">⇩</Button>
  </MediaListItemActionGroup>
</MediaListItem>`,
  sourceAgentRow: `<AvatarListRow
  avatar={<AvatarSlot context="surface-list" type="agent" agentAvatarUrl={agent.avatarUrl} />}
  name={agent.displayName || agent.name}
  subtitle={getRuntimeDisplayName(agent.runtime)}
  rightContent={rightStatus}
  onClick={() => nav.toAgent(agent.id)}
  selected={false}
  className="bg-gray-100 hover:bg-white"
/>`,
  currentAgentRow: `<MediaListItem selected={false} className="bg-gray-100 hover:bg-white">
  <MediaListItemBody onClick={() => nav.toAgent(agent.id)}>
    <MediaListItemVisual>
      <Avatar />
    </MediaListItemVisual>
    <MediaListItemText>
      <MediaListItemTitle>Atlas</MediaListItemTitle>
      <MediaListItemSubtitle>claude-opus</MediaListItemSubtitle>
    </MediaListItemText>
    <MediaListItemAside>
      <Status variant="success" />
    </MediaListItemAside>
  </MediaListItemBody>
</MediaListItem>`,
  sourceAdminRow: `<AvatarListRow
  avatar={<AvatarSlot context="surface-list" type="human" className="self-start" />}
  name={label}
  subtitle={admin.email ? \`\${admin.email} · \${admin.role}\` : admin.role}
  rightContent={
    <button className="btn-brutal-sm shrink-0 bg-white px-2 py-1 text-xs">
      Remove Admin
    </button>
  }
  align="start"
/>`,
  currentAdminRow: `<MediaListItem align="start" interactive={false}>
  <MediaListItemBody>
    <MediaListItemVisual>
      <Avatar className="self-start" />
    </MediaListItemVisual>
    <MediaListItemText>
      <MediaListItemTitle>Ada Lovelace</MediaListItemTitle>
      <MediaListItemSubtitle>ada@example.com · admin</MediaListItemSubtitle>
    </MediaListItemText>
    <MediaListItemAside>
      <button className="btn-brutal-sm shrink-0 bg-white px-2 py-1 text-xs">
        Remove Admin
      </button>
    </MediaListItemAside>
  </MediaListItemBody>
</MediaListItem>`,
  sourceFileRow: `<AvatarListRow
  align="start"
  avatar={<ChannelFileVisual file={file} canPreview={canPreview} icon={Icon} />}
  name={file.filename}
  subtitle={
    <>
      <span>{formatChannelFileSize(file.sizeBytes)}</span>
      <span className="inline-flex items-center gap-1">
        <Clock3 size={12} />
        {formatShortDateTime(file.createdAt)}
      </span>
    </>
  }
  onClick={() => void openPreview(file)}
  buttonProps={{ title: "Preview file" }}
  actionContent={actions}
/>`,
  currentFileRow: `<MediaListItem align="start">
  <MediaListItemBody onClick={() => void openPreview(file)} title="Preview file">
    <MediaListItemVisual>
      <FileVisual />
    </MediaListItemVisual>
    <MediaListItemText>
      <MediaListItemTitle>report.pdf</MediaListItemTitle>
      <MediaListItemSubtitle>
        <span>2.4 MB</span>
        <span className="inline-flex items-center gap-1">
          <Clock3 />
          Jun 5, 09:14
        </span>
      </MediaListItemSubtitle>
    </MediaListItemText>
  </MediaListItemBody>
  <MediaListItemActionGroup>{actions}</MediaListItemActionGroup>
</MediaListItem>`,
} as const;

const ROOT_PROPS: readonly PropRow[] = [
  {
    name: "align",
    type: '"start" | "center"',
    default: '"center"',
    description: "start stacks title/subtitle and top-aligns the body. Published to parts.",
  },
  {
    name: "selected",
    type: "boolean",
    default: "false",
    description: "Selected (cyan-tint) state on the ListItem frame.",
  },
  {
    name: "interactive",
    type: "boolean",
    default: "false",
    description:
      "Force hover affordance on the frame. Clickable MediaListItemBody enables the same hover affordance automatically.",
  },
  { name: "className", type: "string", description: "Extra classes on the ListItem." },
  { name: "children", type: "ReactNode", description: "Body + trailing aside/action parts." },
];

const PART_PROPS: readonly PropRow[] = [
  {
    name: "MediaListItemVisual",
    type: "div props",
    description: "Leading media slot for an avatar, file thumbnail, or icon visual.",
  },
  {
    name: "MediaListItemBody",
    type: "button props",
    description: "Primary column. Renders a button when onClick is set, else a div.",
  },
  {
    name: "MediaListItemText",
    type: "div props",
    description: "Text column for title and subtitle.",
  },
  { name: "MediaListItemTitle", type: "span props", description: "Primary text (truncates)." },
  {
    name: "MediaListItemSubtitle",
    type: "span props",
    description: "Secondary text (font-mono, text-black/50).",
  },
  {
    name: "MediaListItemAside",
    type: "div props",
    description: "Trailing status slot inside Body; rides along with the row click target.",
  },
  {
    name: "MediaListItemActionGroup",
    type: "div props",
    description: "Independent trailing actions rendered as a sibling of Body.",
  },
];

const Avatar = ({ className = "" }: { className?: string }) => (
  <div className={`size-8 shrink-0 border-2 border-black bg-brutal-cyan ${className}`.trim()} />
);

export const Route = createFileRoute("/components/media-list-item")({
  component: MediaListItemDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function MediaListItemDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="MediaListItem"
      description="A card-style list item with a leading visual, title/subtitle text, and optional status or actions."
      overview={
        <Differences from="AvatarListRow">
          <li>brutal styling reproduced 1:1 (routes its frame through ListItem)</li>
          <li>
            composition-first: parts compose as children; avatar/file/icon visuals stay
            caller-supplied
          </li>
          <li>
            clickable bodies are built on Base UI&rsquo;s <code>Button</code> via the render hook
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="preview" title="Preview">
        <Example html={code.interactive}>
          <div className="flex w-80 flex-col gap-3">
            <MediaListItem>
              <MediaListItemBody onClick={() => {}}>
                <MediaListItemVisual>
                  <Avatar />
                </MediaListItemVisual>
                <MediaListItemText>
                  <MediaListItemTitle>Atlas</MediaListItemTitle>
                  <MediaListItemSubtitle>claude-opus</MediaListItemSubtitle>
                </MediaListItemText>
                <MediaListItemAside>
                  <Status variant="success" />
                </MediaListItemAside>
              </MediaListItemBody>
            </MediaListItem>
            <MediaListItem interactive={false}>
              <MediaListItemBody>
                <MediaListItemVisual>
                  <Avatar />
                </MediaListItemVisual>
                <MediaListItemText>
                  <MediaListItemTitle>Ada Lovelace</MediaListItemTitle>
                  <MediaListItemSubtitle>ada@example.com</MediaListItemSubtitle>
                </MediaListItemText>
                <MediaListItemAside>
                  <Badge variant="muted">admin</Badge>
                </MediaListItemAside>
              </MediaListItemBody>
            </MediaListItem>
          </div>
        </Example>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="MediaListItem.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
          showLineNumbers={false}
        />
      </DocSection>
      <DocSection id="align" title="Align">
        <div className="space-y-4">
          <Example html={code.align}>
            <div className="w-80">
              <MediaListItem align="start">
                <MediaListItemBody>
                  <MediaListItemVisual>
                    <Avatar />
                  </MediaListItemVisual>
                  <MediaListItemText>
                    <MediaListItemTitle>report.pdf</MediaListItemTitle>
                    <MediaListItemSubtitle>2.4 MB · uploaded 3d ago</MediaListItemSubtitle>
                  </MediaListItemText>
                </MediaListItemBody>
                <MediaListItemActionGroup>
                  <Button size="icon-xs" aria-label="Download">
                    ⇩
                  </Button>
                </MediaListItemActionGroup>
              </MediaListItem>
            </div>
          </Example>
          <Callout>
            With <code>align="start"</code> the body top-aligns and the text column stacks
            vertically; <code>MediaListItemActionGroup</code> stays vertically centered as its own
            target.
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
              label: "Agent row",
              status: "difference",
              note: "Source passed avatar/name/subtitle/rightContent/onClick as props. Current keeps the same visual result but exposes those pieces as composition children.",
              source: <LegacyAgentRowPreview />,
              current: <CurrentAgentRowPreview />,
              sourceCode: code.sourceAgentRow,
              currentCode: code.currentAgentRow,
            },
            {
              label: "Admin row",
              status: "difference",
              note: "Source used rightContent for a row-local admin action. Current keeps that visual in MediaListItemAside because it rides along with the row body.",
              source: <LegacyAdminRowPreview />,
              current: <CurrentAdminRowPreview />,
              sourceCode: code.sourceAdminRow,
              currentCode: code.currentAdminRow,
            },
            {
              label: "File row",
              status: "difference",
              note: "Source used align, buttonProps, and actionContent props for file preview rows. Current keeps align on the root but expresses the preview target and independent actions as slots.",
              source: <LegacyFileRowPreview />,
              current: <CurrentFileRowPreview />,
              sourceCode: code.sourceFileRow,
              currentCode: code.currentFileRow,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}

function LegacyAgentRowPreview() {
  return (
    <div className="w-96">
      <LegacyAvatarListRow
        avatar={<Avatar />}
        name="Atlas"
        subtitle="claude-opus"
        rightContent={<Status variant="success" />}
        onClick={() => {}}
        selected={false}
        className="bg-gray-100 hover:bg-white"
      />
    </div>
  );
}

function CurrentAgentRowPreview() {
  return (
    <div className="w-96">
      <MediaListItem selected={false} className="bg-gray-100 hover:bg-white">
        <MediaListItemBody onClick={() => {}}>
          <MediaListItemVisual>
            <Avatar />
          </MediaListItemVisual>
          <MediaListItemText>
            <MediaListItemTitle>Atlas</MediaListItemTitle>
            <MediaListItemSubtitle>claude-opus</MediaListItemSubtitle>
          </MediaListItemText>
          <MediaListItemAside>
            <Status variant="success" />
          </MediaListItemAside>
        </MediaListItemBody>
      </MediaListItem>
    </div>
  );
}

function LegacyAdminRowPreview() {
  return (
    <div className="w-96">
      <LegacyAvatarListRow
        align="start"
        avatar={<Avatar className="self-start" />}
        name="Ada Lovelace"
        subtitle="ada@example.com · admin"
        rightContent={<AdminButton />}
      />
    </div>
  );
}

function CurrentAdminRowPreview() {
  return (
    <div className="w-96">
      <MediaListItem align="start" interactive={false}>
        <MediaListItemBody>
          <MediaListItemVisual>
            <Avatar className="self-start" />
          </MediaListItemVisual>
          <MediaListItemText>
            <MediaListItemTitle>Ada Lovelace</MediaListItemTitle>
            <MediaListItemSubtitle>ada@example.com · admin</MediaListItemSubtitle>
          </MediaListItemText>
          <MediaListItemAside>
            <AdminButton />
          </MediaListItemAside>
        </MediaListItemBody>
      </MediaListItem>
    </div>
  );
}

function LegacyFileRowPreview() {
  return (
    <div className="w-96">
      <LegacyAvatarListRow
        align="start"
        avatar={<FileVisual />}
        name="report.pdf"
        subtitle={
          <>
            <span>2.4 MB</span>
            <span className="inline-flex items-center gap-1">
              <Clock3 size={12} />
              Jun 5, 09:14
            </span>
          </>
        }
        onClick={() => {}}
        buttonProps={{ title: "Preview file" }}
        actionContent={<FileActions />}
      />
    </div>
  );
}

function CurrentFileRowPreview() {
  return (
    <div className="w-96">
      <MediaListItem align="start">
        <MediaListItemBody onClick={() => {}} title="Preview file">
          <MediaListItemVisual>
            <FileVisual />
          </MediaListItemVisual>
          <MediaListItemText>
            <MediaListItemTitle>report.pdf</MediaListItemTitle>
            <MediaListItemSubtitle>
              <span>2.4 MB</span>
              <span className="inline-flex items-center gap-1">
                <Clock3 />
                Jun 5, 09:14
              </span>
            </MediaListItemSubtitle>
          </MediaListItemText>
        </MediaListItemBody>
        <MediaListItemActionGroup>
          <FileActions />
        </MediaListItemActionGroup>
      </MediaListItem>
    </div>
  );
}

function AdminButton() {
  return (
    <button type="button" className="btn-brutal-sm shrink-0 bg-white px-2 py-1 text-xs">
      Remove Admin
    </button>
  );
}

function FileVisual() {
  return <div className="size-10 shrink-0 border-2 border-black bg-brutal-yellow" />;
}

function FileActions() {
  return (
    <>
      <button
        type="button"
        className="btn-brutal-sm flex size-7 items-center justify-center p-0"
        aria-label="Jump to original message"
      >
        <ExternalLink />
      </button>
      <button
        type="button"
        className="btn-brutal-sm flex size-7 items-center justify-center p-0"
        aria-label="Download file"
      >
        <Download />
      </button>
    </>
  );
}
