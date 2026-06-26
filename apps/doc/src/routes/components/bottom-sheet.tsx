import { createFileRoute } from "@tanstack/react-router";
import { Button } from "raft-ui";
import {
  BottomSheet,
  BottomSheetClose,
  BottomSheetContent,
  BottomSheetDescription,
  BottomSheetFooter,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetTrigger,
} from "raft-ui/wip";
import { X } from "lucide-react";
import { type ReactNode, useState } from "react";

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
} from "raft-ui";

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
  sourceBottom: `<div className="fixed inset-x-0 bottom-0 p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
  <div className="mx-auto max-w-md border-2 border-black bg-white shadow-brutal-lg">
    ...
  </div>
</div>`,
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
  sourceAdaptive: `<BottomSheet
  className="md:hidden"
  sheetClassName="p-4"
>
  <IosInstructionSheetContent />
</BottomSheet>`,
  currentAdaptive: `<BottomSheetContent className="md:hidden p-4">
  <BottomSheetHeader>
    <BottomSheetTitle>Add Slock to your Home Screen</BottomSheetTitle>
    <BottomSheetDescription>
      Open Slock as a fullscreen app — faster, more focused.
    </BottomSheetDescription>
  </BottomSheetHeader>
  <div className="border-2 border-black bg-brutal-cream p-2">
    <img
      src="/pwa/ios-add-to-home-screen-3step.svg"
      alt="Three steps: tap Safari Share, choose Add to Home Screen, then tap Add."
      className="block w-full"
    />
  </div>
  <div className="mt-4 flex gap-2">
    <BottomSheetClose render={<button className="btn-brutal bg-white px-3 py-2 text-xs" />}>
      Got it
    </BottomSheetClose>
  </div>
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

function BottomSheetSurfacePreview({ viewport = "mobile" }: { viewport?: "mobile" | "desktop" }) {
  return (
    <ViewportFrame viewport={viewport}>
      <LeaveChannelSheetContent />
    </ViewportFrame>
  );
}

function PwaInstallSheetPreview() {
  return (
    <div className="flex min-h-[28rem] w-full items-center justify-center overflow-hidden bg-gray-50 px-4 py-4">
      <ViewportFrame viewport="mobile" sheetClassName="p-4">
        <InstallSheetContent />
      </ViewportFrame>
    </div>
  );
}

function ViewportFrame({
  viewport,
  sheetClassName,
  children,
}: {
  viewport: "mobile" | "desktop";
  sheetClassName?: string;
  children: ReactNode;
}) {
  const isDesktop = viewport === "desktop";
  const frameClass = isDesktop ? "h-[24rem] w-full max-w-[34rem]" : "h-[24rem] w-[21rem]";
  const frameLabel = isDesktop ? "desktop viewport" : "mobile viewport";
  const frameWidth = isDesktop ? "1024px" : "375px";

  return (
    <div
      className={`grid overflow-hidden border-2 border-black bg-white shadow-[var(--shadow)] ${frameClass}`}
    >
      <div className="flex h-7 items-center justify-between border-b-2 border-black bg-white px-3 font-mono text-[9px] leading-none font-bold text-black/45 uppercase">
        <span>{frameLabel}</span>
        <span>{frameWidth}</span>
      </div>
      <div className="relative min-h-0 bg-gray-50">
        <div className="absolute inset-x-0 bottom-0 p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <div
            className={`mx-auto max-w-md border-2 border-black bg-white shadow-[var(--shadow-lg)] ${sheetClassName ?? ""}`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function LeaveChannelSheetContent() {
  return (
    <>
      <div className="flex flex-col gap-1 p-4">
        <div className="text-base font-bold text-black">Leave channel?</div>
        <div className="text-sm text-black/60">You can rejoin anytime from the directory.</div>
      </div>
      <div className="mt-auto flex flex-col gap-2 p-4">
        <Button variant="danger">Leave</Button>
        <Button variant="default">Cancel</Button>
      </div>
    </>
  );
}

function InstallSheetContent({ compact = false }: { compact?: boolean }) {
  return (
    <div className="grid gap-3 text-black">
      <div className="mb-0 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={`${compact ? "text-sm" : "text-lg"} leading-tight font-black text-black`}>
            Add Slock to your Home Screen
          </div>
          <div
            className={`${compact ? "mt-0.5 text-xs" : "mt-1 text-sm"} leading-snug text-black/60`}
          >
            Open Slock as a fullscreen app — faster, more focused.
          </div>
        </div>
        <div className="flex size-7 shrink-0 items-center justify-center border-2 border-black bg-white p-1 shadow-[var(--shadow)]">
          <X size={16} />
        </div>
      </div>
      <div className="border-2 border-black bg-brutal-cream p-2">
        <img
          src="/pwa/ios-add-to-home-screen-3step.svg"
          alt="Three steps: tap Safari Share, choose Add to Home Screen, then tap Add."
          className="block w-full"
        />
      </div>
      <div className="mt-1 flex gap-2">
        <div className="border-2 border-black bg-white px-3 py-2 text-xs font-bold shadow-[var(--shadow)]">
          Got it
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
              label: "Leave channel mobile",
              status: "match",
              note: "Mobile viewport behavior: source anchors the sheet to the bottom safe area with 12px side gutter. The default max-w-md sheet nearly fills a 375px viewport while keeping the black frame, white surface, and large brutal shadow.",
              sourceScenes: [
                {
                  label: "Primitive source",
                  scenes: [
                    {
                      label: "BottomSheet.tsx:58",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/ui/BottomSheet.tsx:58",
                    },
                    {
                      label: "BottomSheet.tsx:69",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/ui/BottomSheet.tsx:69",
                    },
                  ],
                },
              ],
              source: <BottomSheetSurfacePreview viewport="mobile" />,
              current: <BottomSheetSurfacePreview viewport="mobile" />,
              sourceCode: code.sourceBottom,
              currentCode: code.currentBottom,
              compositionCode: code.currentBottom,
              compositionPath:
                "apps/doc/src/compositions/bottom-sheet/bottom-surface-composition.tsx",
              compositionSource: SNIPPETS.currentBottom,
            },
            {
              label: "Leave channel desktop",
              status: "match",
              note: "Desktop viewport behavior: source still anchors to the bottom, but max-w-md keeps the card narrow and centered inside the wider viewport instead of stretching edge to edge.",
              sourceScenes: [
                {
                  label: "Primitive source",
                  scenes: [
                    {
                      label: "BottomSheet.tsx:58",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/ui/BottomSheet.tsx:58",
                    },
                    {
                      label: "BottomSheet.tsx:69",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/ui/BottomSheet.tsx:69",
                    },
                  ],
                },
              ],
              source: <BottomSheetSurfacePreview viewport="desktop" />,
              current: <BottomSheetSurfacePreview viewport="desktop" />,
              sourceCode: code.sourceBottom,
              currentCode: code.currentBottom,
              compositionCode: code.currentBottom,
              compositionPath:
                "apps/doc/src/compositions/bottom-sheet/bottom-surface-composition.tsx",
              compositionSource: SNIPPETS.currentBottom,
            },
            {
              label: "PWA install mobile",
              status: "difference",
              note: "Mobile viewport behavior for the real PWA install callsite. Source adds md:hidden to the portal root and p-4 to the sheet card; the sheet itself uses the same bottom-safe-area placement as the primitive.",
              sourceScenes: [
                {
                  label: "Primitive style hooks",
                  scenes: [
                    {
                      label: "BottomSheet.tsx:14",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/ui/BottomSheet.tsx:14",
                    },
                    {
                      label: "BottomSheet.tsx:33",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/ui/BottomSheet.tsx:33",
                    },
                    {
                      label: "BottomSheet.tsx:69",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/ui/BottomSheet.tsx:69",
                    },
                  ],
                },
                {
                  label: "PWA install callsite",
                  scenes: [
                    {
                      label: "PwaInstallPrompt.tsx:21",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/pwa/PwaInstallPrompt.tsx:21",
                    },
                    {
                      label: "PwaInstallPrompt.tsx:37",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/pwa/PwaInstallPrompt.tsx:37",
                    },
                    {
                      label: "PwaInstallPrompt.tsx:42",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/pwa/PwaInstallPrompt.tsx:42",
                    },
                  ],
                },
              ],
              source: <PwaInstallSheetPreview />,
              current: <PwaInstallSheetPreview />,
              sourceCode: code.sourceAdaptive,
              currentCode: code.currentAdaptive,
              compositionCode: code.currentAdaptive,
              compositionPath:
                "apps/doc/src/compositions/bottom-sheet/pwa-install-sheet-composition.tsx",
              compositionSource: SNIPPETS.currentAdaptive,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
