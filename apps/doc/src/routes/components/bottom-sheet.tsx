import { createFileRoute } from "@tanstack/react-router";
import { Button } from "raft-ui";
import {
  BottomSheet,
  BottomSheetClose,
  BottomSheetContent,
  BottomSheetDescription,
  BottomSheetFooter,
  BottomSheetHeader,
  BottomSheetPortal,
  BottomSheetPositioner,
  BottomSheetTitle,
  BottomSheetTrigger,
} from "raft-ui/wip";
import { X } from "lucide-react";
import { type ReactNode, useState } from "react";

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
  BottomSheetPortal,
  BottomSheetPositioner,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetDescription,
  BottomSheetFooter,
  BottomSheetClose,
} from "raft-ui";

<BottomSheet>
  <BottomSheetTrigger render={<Button variant="primary" />}>Open sheet</BottomSheetTrigger>
  <BottomSheetPortal>
    <BottomSheetPositioner>
      <BottomSheetContent>
        <BottomSheetClose />
        <BottomSheetHeader className="pr-14">
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
    </BottomSheetPositioner>
  </BottomSheetPortal>
</BottomSheet>`,
  sourceBottom: `<div className="fixed inset-x-0 bottom-0 p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
  <div className="mx-auto max-w-md border-2 border-black bg-white shadow-brutal-lg">
    ...
  </div>
</div>`,
  currentBottom: `<BottomSheetPortal>
  <BottomSheetPositioner>
    <BottomSheetContent>
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
  </BottomSheetPositioner>
</BottomSheetPortal>`,
  sourceAdaptive: `<BottomSheet
  className="md:hidden"
  sheetClassName="p-4"
>
  <div className="mb-3 flex items-start justify-between gap-3">
    <div>
      <div className="text-lg font-black leading-tight text-black">
        Add Slock to your Home Screen
      </div>
      <div className="mt-1 text-sm text-black/60">
        Open Slock as a fullscreen app — faster, more focused.
      </div>
    </div>
    <button type="button" className="btn-brutal-sm bg-white p-1" aria-label="Close install instructions">
      <X size={16} />
    </button>
  </div>
  <div className="border-2 border-black bg-brutal-cream p-2">
    <img
      src="/pwa/ios-add-to-home-screen-3step.svg"
      alt="Three steps: tap Safari Share, choose Add to Home Screen, then tap Add."
      className="block w-full"
    />
  </div>
  <div className="mt-4 flex gap-2">
    <button type="button" className="btn-brutal bg-white px-3 py-2 text-xs">
      Got it
    </button>
  </div>
</BottomSheet>`,
  sourceAdaptiveOther: `<BottomSheet
  className="md:hidden"
  sheetClassName="p-4"
>
  <div className="mb-3 flex items-start justify-between gap-3">
    <div>
      <div className="text-lg font-black leading-tight text-black">
        Add Slock to your Home Screen
      </div>
      <div className="mt-1 text-sm text-black/60">
        Open this page in Safari first, then add it to your Home Screen.
      </div>
    </div>
    <button type="button" className="btn-brutal-sm bg-white p-1" aria-label="Close install instructions">
      <X size={16} />
    </button>
  </div>
  <div className="border-2 border-black bg-brutal-cream p-3 text-sm text-black">
    iOS only allows Home Screen installation from Safari. Copy this page link, open Safari, then use Share → Add to Home Screen.
  </div>
  <div className="mt-4 flex gap-2">
    <button type="button" className="btn-brutal bg-brutal-yellow px-3 py-2 text-xs">
      Copy Link
    </button>
    <button type="button" className="btn-brutal bg-white px-3 py-2 text-xs">
      Close
    </button>
  </div>
</BottomSheet>`,
  currentAdaptive: `<BottomSheetPortal className="md:hidden">
  <BottomSheetPositioner>
    <BottomSheetContent className="p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-lg leading-tight font-black text-black">
            Add Slock to your Home Screen
          </div>
          <div className="mt-1 text-sm text-black/60">
            Open Slock as a fullscreen app — faster, more focused.
          </div>
        </div>
        <BottomSheetClose
          render={<button className="btn-brutal-sm bg-white p-1" aria-label="Close install instructions" />}
        >
          <X size={16} />
        </BottomSheetClose>
      </div>
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
    </BottomSheetContent>
  </BottomSheetPositioner>
</BottomSheetPortal>`,
  currentAdaptiveOther: `<BottomSheetPortal className="md:hidden">
  <BottomSheetPositioner>
    <BottomSheetContent className="p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-lg leading-tight font-black text-black">
            Add Slock to your Home Screen
          </div>
          <div className="mt-1 text-sm text-black/60">
            Open this page in Safari first, then add it to your Home Screen.
          </div>
        </div>
        <BottomSheetClose
          render={<button className="btn-brutal-sm bg-white p-1" aria-label="Close install instructions" />}
        >
          <X size={16} />
        </BottomSheetClose>
      </div>
      <div className="border-2 border-black bg-brutal-cream p-3 text-sm text-black">
        iOS only allows Home Screen installation from Safari. Copy this page link, open Safari, then use Share → Add to Home Screen.
      </div>
      <div className="mt-4 flex gap-2">
        <button type="button" className="btn-brutal bg-brutal-yellow px-3 py-2 text-xs">
          Copy Link
        </button>
        <BottomSheetClose render={<button className="btn-brutal bg-white px-3 py-2 text-xs" />}>
          Close
        </BottomSheetClose>
      </div>
    </BottomSheetContent>
  </BottomSheetPositioner>
</BottomSheetPortal>`,
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
  {
    name: "BottomSheetPortal",
    type: "Dialog.Portal",
    description: "Portal slot. Use this for whole-sheet gates such as md:hidden.",
  },
  {
    name: "BottomSheetPositioner",
    type: 'ComponentPropsWithRef<"div">',
    description: "Outer fixed bottom placement with side gutter and safe-area bottom padding.",
  },
  {
    name: "BottomSheetContent",
    type: "Dialog.Popup",
    description:
      "Sheet card surface. Owns max-width, frame, shadow, relative positioning, and content padding overrides.",
  },
];

function BottomSheetSurfacePreview({ viewport = "mobile" }: { viewport?: "mobile" | "desktop" }) {
  return (
    <ViewportFrame viewport={viewport}>
      <LeaveChannelSheetContent />
    </ViewportFrame>
  );
}

function PwaInstallSheetPreview({ variant = "safari" }: { variant?: "safari" | "other" }) {
  return (
    <div className="flex min-h-[30rem] w-full items-center justify-center overflow-hidden bg-gray-50 px-4 py-4">
      <ViewportFrame viewport="mobile" sheetClassName="p-4">
        <PwaInstallSheetContent variant={variant} />
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
  const frameClass = isDesktop ? "h-[24rem] w-full max-w-[34rem]" : "h-[26rem] w-[375px]";
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

function PwaInstallSheetContent({ variant = "safari" }: { variant?: "safari" | "other" }) {
  const isSafari = variant === "safari";

  return (
    <>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-lg leading-tight font-black text-black">
            Add Slock to your Home Screen
          </div>
          <div className="mt-1 text-sm text-black/60">
            {isSafari
              ? "Open Slock as a fullscreen app — faster, more focused."
              : "Open this page in Safari first, then add it to your Home Screen."}
          </div>
        </div>
        <button
          type="button"
          className="btn-brutal-sm bg-white p-1"
          aria-label="Close install instructions"
        >
          <X size={16} />
        </button>
      </div>

      {isSafari ? (
        <div className="border-2 border-black bg-brutal-cream p-2">
          <img
            src="/pwa/ios-add-to-home-screen-3step.svg"
            alt="Three steps: tap Safari Share, choose Add to Home Screen, then tap Add."
            className="block w-full"
          />
        </div>
      ) : (
        <div className="border-2 border-black bg-brutal-cream p-3 text-sm text-black">
          iOS only allows Home Screen installation from Safari. Copy this page link, open Safari,
          then use Share → Add to Home Screen.
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {isSafari ? null : (
          <button type="button" className="btn-brutal bg-brutal-yellow px-3 py-2 text-xs">
            Copy Link
          </button>
        )}
        <button type="button" className="btn-brutal bg-white px-3 py-2 text-xs">
          {isSafari ? "Got it" : "Close"}
        </button>
      </div>
    </>
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
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="preview" title="Preview">
        <div className="space-y-4">
          <p className="max-w-2xl text-sm leading-6 text-foreground-muted">
            Trigger and footer actions compose their button shell through <code>render</code>. The
            corner close button has a default icon affordance, and business scenes can replace it
            with their own source-specific button.
          </p>
          <Example html={code.anatomy}>
            <BottomSheet open={open} onOpenChange={setOpen}>
              <BottomSheetTrigger render={<Button variant="primary" />}>
                Open sheet
              </BottomSheetTrigger>
              <BottomSheetPortal>
                <BottomSheetPositioner>
                  <BottomSheetContent>
                    <BottomSheetClose />
                    <BottomSheetHeader className="pr-14">
                      <BottomSheetTitle>Leave channel?</BottomSheetTitle>
                      <BottomSheetDescription>
                        You can rejoin anytime from the directory.
                      </BottomSheetDescription>
                    </BottomSheetHeader>
                    <BottomSheetFooter>
                      <BottomSheetClose render={<Button variant="danger" />}>
                        Leave
                      </BottomSheetClose>
                      <BottomSheetClose render={<Button variant="default" />}>
                        Cancel
                      </BottomSheetClose>
                    </BottomSheetFooter>
                  </BottomSheetContent>
                </BottomSheetPositioner>
              </BottomSheetPortal>
            </BottomSheet>
          </Example>
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
              note: "Mobile-only behavior for the real PWA install callsite. Source only renders this sheet below md, then adds p-4 to the sheet card and a source-styled header close button. Current keeps the same visual structure while mapping the old outer className to BottomSheetPortal and sheetClassName to BottomSheetContent.",
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
                    {
                      label: "PwaInstallPrompt.tsx:45",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/pwa/PwaInstallPrompt.tsx:45",
                    },
                    {
                      label: "PwaInstallPrompt.tsx:59",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/pwa/PwaInstallPrompt.tsx:59",
                    },
                    {
                      label: "PwaInstallPrompt.tsx:73",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/pwa/PwaInstallPrompt.tsx:73",
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
            {
              label: "PWA install non-Safari mobile",
              status: "difference",
              note: "The same source BottomSheet callsite also renders a non-Safari branch. It keeps the mobile-only portal and p-4 sheet padding, but swaps the image for an instructional cream panel and adds a Copy Link action before Close.",
              sourceScenes: [
                {
                  label: "PWA install alternate branch",
                  scenes: [
                    {
                      label: "PwaInstallPrompt.tsx:49",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/pwa/PwaInstallPrompt.tsx:49",
                    },
                    {
                      label: "PwaInstallPrompt.tsx:67",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/pwa/PwaInstallPrompt.tsx:67",
                    },
                    {
                      label: "PwaInstallPrompt.tsx:73",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/pwa/PwaInstallPrompt.tsx:73",
                    },
                  ],
                },
              ],
              source: <PwaInstallSheetPreview variant="other" />,
              current: <PwaInstallSheetPreview variant="other" />,
              sourceCode: code.sourceAdaptiveOther,
              currentCode: code.currentAdaptiveOther,
              compositionCode: code.currentAdaptiveOther,
              compositionPath:
                "apps/doc/src/compositions/bottom-sheet/pwa-install-other-sheet-composition.tsx",
              compositionSource: SNIPPETS.currentAdaptiveOther,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
