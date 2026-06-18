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
} from "@slock/ui";
import { X } from "lucide-react";
import { useState } from "react";

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

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
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
} from "@slock/ui";

<BottomSheet>
  <BottomSheetTrigger render={<Button variant="primary" />}>Open sheet</BottomSheetTrigger>
  <BottomSheetContent>
    <BottomSheetClose
      render={
        <Button variant="default" size="icon-sm" aria-label="Close" className="absolute top-3 right-3" />
      }
    >
      <X />
    </BottomSheetClose>
    <BottomSheetHeader>
      <BottomSheetTitle>Leave channel?</BottomSheetTitle>
      <BottomSheetDescription>
        You can rejoin anytime from the directory.
      </BottomSheetDescription>
    </BottomSheetHeader>
    <BottomSheetFooter>
      <BottomSheetClose render={<Button variant="danger" />}>Leave</BottomSheetClose>
      <BottomSheetClose render={<Button variant="default" />}>Cancel</BottomSheetClose>
    </BottomSheetFooter>
  </BottomSheetContent>
</BottomSheet>`,
  sourceBottom: `<BottomSheetContent>
  <BottomSheetHeader>
    <BottomSheetTitle>Leave channel?</BottomSheetTitle>
    <BottomSheetDescription>
      You can rejoin anytime from the directory.
    </BottomSheetDescription>
  </BottomSheetHeader>
  <BottomSheetFooter>
    <Button variant="danger">Leave</Button>
    <Button variant="default">Cancel</Button>
  </BottomSheetFooter>
</BottomSheetContent>`,
  currentBottom: `<BottomSheetContent>
  <BottomSheetHeader>
    <BottomSheetTitle>Leave channel?</BottomSheetTitle>
    <BottomSheetDescription>
      You can rejoin anytime from the directory.
    </BottomSheetDescription>
  </BottomSheetHeader>
  <BottomSheetFooter>
    <BottomSheetClose render={<Button variant="danger" />}>Leave</BottomSheetClose>
    <BottomSheetClose render={<Button variant="default" />}>Cancel</BottomSheetClose>
  </BottomSheetFooter>
</BottomSheetContent>`,
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

function BottomSheetSurfacePreview() {
  return (
    <div className="relative h-56 w-full overflow-hidden rounded-md border border-gray-200 bg-gray-50">
      <div className="absolute inset-x-0 bottom-0 p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-md border-2 border-black bg-white shadow-[var(--shadow-lg)]">
          <div className="flex flex-col gap-1 p-4">
            <div className="text-base font-bold text-black">Leave channel?</div>
            <div className="text-sm text-black/60">You can rejoin anytime from the directory.</div>
          </div>
          <div className="mt-auto flex flex-col gap-2 p-4">
            <Button variant="danger">Leave</Button>
            <Button variant="default">Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
      description="A mobile bottom sheet with no dim backdrop; the sheet carries the brutal frame."
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
            close affordances are composed in via <code>BottomSheetClose</code>; no{" "}
            <code>showCloseButton</code> prop
          </li>
          <li>
            source has no built-in transition; current keeps the same resting geometry and lets Base
            UI own mount/unmount state
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="preview" title="Preview">
        <div className="space-y-4">
          <Example html={code.anatomy}>
            <BottomSheet open={open} onOpenChange={setOpen}>
              <BottomSheetTrigger render={<Button variant="primary" />}>
                Open sheet
              </BottomSheetTrigger>
              <BottomSheetContent>
                <BottomSheetClose
                  render={
                    <Button
                      variant="default"
                      size="icon-sm"
                      aria-label="Close"
                      className="absolute top-3 right-3"
                    />
                  }
                >
                  <X />
                </BottomSheetClose>
                <BottomSheetHeader>
                  <BottomSheetTitle>Leave channel?</BottomSheetTitle>
                  <BottomSheetDescription>
                    You can rejoin anytime from the directory.
                  </BottomSheetDescription>
                </BottomSheetHeader>
                <BottomSheetFooter>
                  <BottomSheetClose render={<Button variant="danger" />}>Leave</BottomSheetClose>
                  <BottomSheetClose render={<Button variant="default" />}>Cancel</BottomSheetClose>
                </BottomSheetFooter>
              </BottomSheetContent>
            </BottomSheet>
          </Example>
          <Callout>
            The trigger and close controls follow the Base UI/source pattern: pass the component
            shell to <code>render</code>, then place text or icons as children of the primitive.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="BottomSheet.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
        />
      </DocSection>
      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          items={[
            {
              label: "Bottom surface",
              status: "match",
              note: "Resting visual style stays aligned to the slock source: no dim backdrop, 12px safe-area gutter, centered max-w-md sheet, black 2px frame, white surface, and brutal large shadow.",
              source: <BottomSheetSurfacePreview />,
              current: <BottomSheetSurfacePreview />,
              sourceCode: code.sourceBottom,
              currentCode: code.currentBottom,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
