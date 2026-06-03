import { createFileRoute } from "@tanstack/react-router";
import {
  BottomSheet,
  BottomSheetClose,
  BottomSheetContent,
  BottomSheetDescription,
  BottomSheetFooter,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetTrigger,
  Button,
} from "@slock-ui/ui";
import { X } from "lucide-react";
import { useState } from "react";

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
  { id: "demo", title: "Demo" },
  { id: "api", title: "API" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import {
  BottomSheet,
  BottomSheetTrigger,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetDescription,
  BottomSheetFooter,
  BottomSheetClose,
} from "@slock-ui/ui";

<BottomSheet>
  <BottomSheetTrigger render={<Button tone="yellow">Open sheet</Button>} />
  <BottomSheetContent>
    <BottomSheetClose
      render={
        <Button tone="white" size="icon-sm" aria-label="Close" className="absolute top-3 right-3">
          <X />
        </Button>
      }
    />
    <BottomSheetHeader>
      <BottomSheetTitle>Leave channel?</BottomSheetTitle>
      <BottomSheetDescription>
        You can rejoin anytime from the directory.
      </BottomSheetDescription>
    </BottomSheetHeader>
    <BottomSheetFooter>
      <BottomSheetClose render={<Button tone="red">Leave</Button>} />
      <BottomSheetClose render={<Button tone="white">Cancel</Button>} />
    </BottomSheetFooter>
  </BottomSheetContent>
</BottomSheet>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "open",
    type: "boolean",
    description: "Controlled open state (on BottomSheet). Pair with onOpenChange.",
  },
  {
    name: "defaultOpen",
    type: "boolean",
    default: "false",
    description: "Uncontrolled initial open state (on BottomSheet).",
  },
  {
    name: "onOpenChange",
    type: "(open: boolean) => void",
    description: "Fires on trigger / close / ESC / outside-press (on BottomSheet).",
  },
  {
    name: "modal",
    type: 'boolean | "trap-focus"',
    default: "true",
    description: "Traps focus + locks body scroll while open (on BottomSheet).",
  },
];

export const Route = createFileRoute("/components/bottom-sheet")({
  component: BottomSheetDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function BottomSheetDoc() {
  const code = Route.useLoaderData();
  const [open, setOpen] = useState(false);

  return (
    <DocPage
      title="BottomSheet"
      description="A mobile bottom sheet — no dim backdrop, the sheet carries the brutal frame."
      overview={
        <Differences from="BottomSheet">
          <li>
            split into a composition family over base-ui <code>Dialog</code> parts (Trigger,
            Content, Header, Footer, Title, Description, Close)
          </li>
          <li>
            native outside-press dismiss replaces the manual backdrop <code>onClick</code>;{" "}
            <code>open</code> / <code>onOpenChange</code> replace <code>onClose</code>
          </li>
          <li>
            close affordances are composed in via <code>BottomSheetClose</code> — no{" "}
            <code>showCloseButton</code> prop
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

      <DocSection id="demo" title="Demo">
        <div className="space-y-4">
          <Example html={code.anatomy}>
            <BottomSheet open={open} onOpenChange={setOpen}>
              <BottomSheetTrigger render={<Button tone="yellow">Open sheet</Button>} />
              <BottomSheetContent>
                <BottomSheetClose
                  render={
                    <Button
                      tone="white"
                      size="icon-sm"
                      aria-label="Close"
                      className="absolute top-3 right-3"
                    >
                      <X />
                    </Button>
                  }
                />
                <BottomSheetHeader>
                  <BottomSheetTitle>Leave channel?</BottomSheetTitle>
                  <BottomSheetDescription>
                    You can rejoin anytime from the directory.
                  </BottomSheetDescription>
                </BottomSheetHeader>
                <BottomSheetFooter>
                  <BottomSheetClose render={<Button tone="red">Leave</Button>} />
                  <BottomSheetClose render={<Button tone="white">Cancel</Button>} />
                </BottomSheetFooter>
              </BottomSheetContent>
            </BottomSheet>
          </Example>
          <Callout>
            Unlike Lightbox, the sheet has no dim layer — it anchors to the bottom safe area and
            carries its own border + shadow. Dialog still locks body scroll and dismisses on
            outside-press.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
