import { createFileRoute } from "@tanstack/react-router";
import {
  AvatarListRow,
  AvatarListRowAside,
  AvatarListRowBody,
  AvatarListRowContent,
  AvatarListRowName,
  AvatarListRowSubtitle,
  Badge,
  Button,
  StatusDot,
} from "@slock-ui/ui";

import { Callout } from "#/components/callout.tsx";
import { CodeBlock } from "#/components/code-block.tsx";
import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.ts";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "anatomy", title: "Anatomy" },
  { id: "interactive", title: "Interactive" },
  { id: "align", title: "Align" },
  { id: "api", title: "API" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import {
  AvatarListRow,
  AvatarListRowBody,
  AvatarListRowContent,
  AvatarListRowName,
  AvatarListRowSubtitle,
  AvatarListRowAside,
} from "@slock-ui/ui";

<AvatarListRow>
  <AvatarListRowBody>
    <Avatar size="md" type="agent" />
    <AvatarListRowContent>
      <AvatarListRowName>Atlas</AvatarListRowName>
      <AvatarListRowSubtitle>claude-opus</AvatarListRowSubtitle>
    </AvatarListRowContent>
    <AvatarListRowAside>
      <StatusDot className="bg-brutal-lime" />
    </AvatarListRowAside>
  </AvatarListRowBody>
</AvatarListRow>`,
  interactive: `<AvatarListRow>
  <AvatarListRowBody onClick={() => open(agent)}>
    <Avatar size="md" type="agent" />
    <AvatarListRowContent>
      <AvatarListRowName>Atlas</AvatarListRowName>
      <AvatarListRowSubtitle>claude-opus</AvatarListRowSubtitle>
    </AvatarListRowContent>
    <AvatarListRowAside>
      <StatusDot className="bg-brutal-lime" />
    </AvatarListRowAside>
  </AvatarListRowBody>
</AvatarListRow>`,
  align: `<AvatarListRow align="start">
  <AvatarListRowBody>
    <Avatar />
    <AvatarListRowContent>
      <AvatarListRowName>report.pdf</AvatarListRowName>
      <AvatarListRowSubtitle>2.4 MB · uploaded 3d ago</AvatarListRowSubtitle>
    </AvatarListRowContent>
  </AvatarListRowBody>
  <AvatarListRowAside>
    <Button size="icon-xs">⇩</Button>
  </AvatarListRowAside>
</AvatarListRow>`,
} as const;

const ROOT_PROPS: readonly PropRow[] = [
  {
    name: "align",
    type: '"start" | "center"',
    default: '"center"',
    description: "start stacks name/subtitle and top-aligns the body. Published to parts.",
  },
  {
    name: "selected",
    type: "boolean",
    default: "false",
    description: "Selected (cyan-tint) state on the SurfaceListItem frame.",
  },
  {
    name: "interactive",
    type: "boolean",
    default: "true",
    description: "Hover affordance on the frame. Set false for display-only rows.",
  },
  { name: "className", type: "string", description: "Extra classes on the SurfaceListItem." },
  { name: "children", type: "ReactNode", description: "Body + trailing aside(s)." },
];

const PART_PROPS: readonly PropRow[] = [
  {
    name: "AvatarListRowBody",
    type: "button props",
    description: "Primary column. Renders a <button> when onClick is set, else a <div>.",
  },
  { name: "AvatarListRowContent", type: "div props", description: "Name/subtitle text column." },
  { name: "AvatarListRowName", type: "span props", description: "Primary text (truncates)." },
  {
    name: "AvatarListRowSubtitle",
    type: "span props",
    description: "Secondary text (font-mono, text-black/50).",
  },
  {
    name: "AvatarListRowAside",
    type: "div props",
    description:
      "Trailing slot. Inside Body it rides the click target; as a sibling it acts alone.",
  },
];

const Avatar = () => <div className="size-8 shrink-0 border-2 border-black bg-brutal-cyan" />;

export const Route = createFileRoute("/components/avatar-list-row")({
  component: AvatarListRowDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function AvatarListRowDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="AvatarListRow"
      description="A card-style row with an avatar, a name/subtitle column, and an optional action."
      overview={
        <Differences from="AvatarListRow">
          <li>brutal styling reproduced 1:1 (routes its frame through SurfaceListItem)</li>
          <li>
            composition-first: parts compose as children, the avatar stays a caller-supplied node
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

      <DocSection id="anatomy" title="Anatomy">
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="interactive" title="Interactive">
        <Example html={code.interactive}>
          <div className="flex w-80 flex-col gap-3">
            <AvatarListRow>
              <AvatarListRowBody onClick={() => {}}>
                <Avatar />
                <AvatarListRowContent>
                  <AvatarListRowName>Atlas</AvatarListRowName>
                  <AvatarListRowSubtitle>claude-opus</AvatarListRowSubtitle>
                </AvatarListRowContent>
                <AvatarListRowAside>
                  <StatusDot className="bg-brutal-lime" />
                </AvatarListRowAside>
              </AvatarListRowBody>
            </AvatarListRow>
            <AvatarListRow interactive={false}>
              <AvatarListRowBody>
                <Avatar />
                <AvatarListRowContent>
                  <AvatarListRowName>Ada Lovelace</AvatarListRowName>
                  <AvatarListRowSubtitle>ada@example.com</AvatarListRowSubtitle>
                </AvatarListRowContent>
                <AvatarListRowAside>
                  <Badge tone="stone" uppercase={false}>
                    admin
                  </Badge>
                </AvatarListRowAside>
              </AvatarListRowBody>
            </AvatarListRow>
          </div>
        </Example>
      </DocSection>

      <DocSection id="align" title="Align">
        <div className="space-y-4">
          <Example html={code.align}>
            <div className="w-80">
              <AvatarListRow align="start">
                <AvatarListRowBody>
                  <Avatar />
                  <AvatarListRowContent>
                    <AvatarListRowName>report.pdf</AvatarListRowName>
                    <AvatarListRowSubtitle>2.4 MB · uploaded 3d ago</AvatarListRowSubtitle>
                  </AvatarListRowContent>
                </AvatarListRowBody>
                <AvatarListRowAside>
                  <Button size="icon-xs" aria-label="Download">
                    ⇩
                  </Button>
                </AvatarListRowAside>
              </AvatarListRow>
            </div>
          </Example>
          <Callout>
            With <code>align="start"</code> the body top-aligns and the content column stacks
            vertically; an <code>AvatarListRowAside</code> kept as a sibling of the body stays
            vertically centered and acts as its own click target.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <PropsTable rows={ROOT_PROPS} />
          <PropsTable rows={PART_PROPS} />
        </div>
      </DocSection>
    </DocPage>
  );
}
