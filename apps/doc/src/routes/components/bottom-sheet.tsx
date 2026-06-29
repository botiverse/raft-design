import { createFileRoute } from "@tanstack/react-router";
import { Button, Text, useThemeFamily } from "raft-ui";
import {
  BottomSheet,
  BottomSheetClose,
  BottomSheetContent,
  BottomSheetDescription,
  BottomSheetFooter,
  BottomSheetHeader,
  BottomSheetOverlay,
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
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SNIPPETS = {
  anatomy: `import {
  BottomSheet,
  BottomSheetTrigger,
  BottomSheetContent,
  BottomSheetPortal,
  BottomSheetOverlay,
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
    <BottomSheetOverlay />
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
  currentBottom: `<BottomSheet>
  <BottomSheetTrigger render={<Button variant="primary" />}>
    Open sheet
  </BottomSheetTrigger>
  <BottomSheetPortal>
    <BottomSheetOverlay />
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
  </BottomSheetPortal>
</BottomSheet>`,
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
  currentAdaptive: `<BottomSheet>
  <BottomSheetTrigger render={<Button variant="primary" size="sm" />}>
    Install
  </BottomSheetTrigger>
  <BottomSheetPortal className="md:hidden">
    <BottomSheetOverlay />
    <BottomSheetPositioner>
      <BottomSheetContent className="p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <Text.Sans render={<div />} size="large" className="leading-tight font-black text-black">
              Add Slock to your Home Screen
            </Text.Sans>
            <Text.Sans size="small" className="mt-1 text-black/60">
              Open Slock as a fullscreen app — faster, more focused.
            </Text.Sans>
          </div>
          <BottomSheetClose className="static shrink-0" aria-label="Close install instructions" />
        </div>
        <div className="border-2 border-black bg-brutal-cream p-2">
          <img
            src="/pwa/ios-add-to-home-screen-3step.svg"
            alt="Three steps: tap Safari Share, choose Add to Home Screen, then tap Add."
            className="block w-full"
          />
        </div>
        <div className="mt-4 flex gap-2">
          <BottomSheetClose render={<Button variant="default" size="sm" />}>
            Got it
          </BottomSheetClose>
        </div>
      </BottomSheetContent>
    </BottomSheetPositioner>
  </BottomSheetPortal>
</BottomSheet>`,
  currentAdaptiveOther: `<BottomSheet>
  <BottomSheetTrigger render={<Button variant="primary" size="sm" />}>
    Install
  </BottomSheetTrigger>
  <BottomSheetPortal className="md:hidden">
    <BottomSheetOverlay />
    <BottomSheetPositioner>
      <BottomSheetContent className="p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <Text.Sans render={<div />} size="large" className="leading-tight font-black text-black">
              Add Slock to your Home Screen
            </Text.Sans>
            <Text.Sans size="small" className="mt-1 text-black/60">
              Open this page in Safari first, then add it to your Home Screen.
            </Text.Sans>
          </div>
          <BottomSheetClose className="static shrink-0" aria-label="Close install instructions" />
        </div>
        <Text.Sans render={<div />} size="small" className="border-2 border-black bg-brutal-cream p-3 text-black">
          iOS only allows Home Screen installation from Safari. Copy this page link, open Safari, then use Share → Add to Home Screen.
        </Text.Sans>
        <div className="mt-4 flex gap-2">
          <Button variant="primary" size="sm">
            Copy Link
          </Button>
          <BottomSheetClose render={<Button variant="default" size="sm" />}>
            Close
          </BottomSheetClose>
        </div>
      </BottomSheetContent>
    </BottomSheetPositioner>
  </BottomSheetPortal>
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
    type: "boolean",
    default: "true",
    description: "Vaul modal behavior. Locks body scroll and controls outside interaction.",
  },
  {
    name: "direction",
    type: '"bottom" | "top" | "left" | "right"',
    default: '"bottom"',
    description: "Vaul drawer direction. BottomSheet defaults it to bottom.",
  },
  {
    name: "BottomSheetPortal",
    type: "Drawer.Portal",
    description: "Portal slot. Use this for whole-sheet gates such as md:hidden.",
  },
  {
    name: "BottomSheetOverlay",
    type: "Drawer.Overlay",
    description: "Transparent outside-interaction layer. Style it when a dim backdrop is needed.",
  },
  {
    name: "BottomSheetPositioner",
    type: 'ComponentPropsWithRef<"div">',
    description: "Compatibility wrapper for composition structure; Vaul content owns placement.",
  },
  {
    name: "BottomSheetContent",
    type: "Drawer.Content",
    description:
      "Sheet card surface. Owns Vaul direction placement, max-width, frame, shadow, and content padding overrides.",
  },
];

function BottomSheetSurfacePreview({ viewport = "mobile" }: { viewport?: "mobile" | "desktop" }) {
  const [open, setOpen] = useState(true);

  return (
    <ViewportFrame
      viewport={viewport}
      open={open}
      trigger={
        <Button variant="primary" size="sm" onClick={() => setOpen(true)}>
          Open sheet
        </Button>
      }
      onOpenChange={setOpen}
    >
      <LeaveChannelSheetContent onClose={() => setOpen(false)} />
    </ViewportFrame>
  );
}

function BottomSheetSurfaceSourcePreview({
  viewport = "mobile",
}: {
  viewport?: "mobile" | "desktop";
}) {
  const [open, setOpen] = useState(true);

  return (
    <ViewportFrame
      viewport={viewport}
      source
      open={open}
      trigger={
        <button
          type="button"
          className="btn-brutal bg-brutal-yellow px-3 py-2 text-xs"
          onClick={() => setOpen(true)}
        >
          Open sheet
        </button>
      }
      onOpenChange={setOpen}
    >
      <LeaveChannelSheetSourceContent onClose={() => setOpen(false)} />
    </ViewportFrame>
  );
}

function PwaInstallSheetPreview({ variant = "safari" }: { variant?: "safari" | "other" }) {
  const [open, setOpen] = useState(true);

  return (
    <BottomSheet modal={false} open={open} onOpenChange={setOpen}>
      <div className="flex min-h-[30rem] w-full items-center justify-center overflow-hidden bg-gray-50 px-4 py-4">
        <PwaInstallViewportFrame
          open={open}
          onOpenChange={setOpen}
          trigger={
            <BottomSheetTrigger render={<Button variant="primary" size="sm" />}>
              Install
            </BottomSheetTrigger>
          }
        >
          <PwaInstallSheetContent variant={variant} />
        </PwaInstallViewportFrame>
      </div>
    </BottomSheet>
  );
}

function PwaInstallSheetSourcePreview({ variant = "safari" }: { variant?: "safari" | "other" }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex min-h-[30rem] w-full items-center justify-center overflow-hidden bg-gray-50 px-4 py-4">
      <PwaInstallViewportFrame
        source
        open={open}
        onOpenChange={setOpen}
        trigger={
          <button
            type="button"
            className="btn-brutal bg-brutal-yellow px-3 py-2 text-xs"
            onClick={() => setOpen(true)}
          >
            Install
          </button>
        }
      >
        <PwaInstallSheetSourceContent variant={variant} onClose={() => setOpen(false)} />
      </PwaInstallViewportFrame>
    </div>
  );
}

function PwaInstallViewportFrame({
  open,
  onOpenChange,
  trigger,
  children,
  source = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  children: ReactNode;
  source?: boolean;
}) {
  const theme = useThemeFamily();
  const sheetClassName = source
    ? "mx-auto max-w-md border-2 border-black bg-white p-4 shadow-[var(--shadow-lg)]"
    : theme === "elegant"
      ? "mx-auto max-w-md overflow-clip rounded-t-lg rounded-b-none bg-layer-popover p-4 text-foreground shadow-xl"
      : "mx-auto max-w-md border-t-2 border-x-0 border-b-0 border-black bg-white p-4 shadow-[var(--shadow-lg)]";
  const overlayClassName = source ? null : "bg-layer-backdrop";

  return (
    <div className="grid h-[26rem] w-[375px] overflow-hidden border-2 border-black bg-white shadow-[var(--shadow)]">
      <div className="flex h-7 items-center justify-between border-b-2 border-black bg-white px-3 font-mono text-[9px] leading-none font-bold text-black/45 uppercase">
        <span>mobile viewport</span>
        <span>375px</span>
      </div>
      <div className="relative min-h-0 bg-gray-50">
        <div className="absolute inset-0 z-0 flex items-center justify-center">{trigger}</div>
        {open && overlayClassName ? (
          <div
            className={`absolute inset-0 z-[5] ${overlayClassName}`}
            onClick={() => onOpenChange(false)}
          />
        ) : null}
        {open ? (
          <div
            className={
              source
                ? "absolute inset-x-0 bottom-0 z-10 p-3 pb-[max(12px,env(safe-area-inset-bottom))]"
                : "absolute inset-x-0 bottom-0 z-10"
            }
            onClick={(event) => {
              if (event.target === event.currentTarget) onOpenChange(false);
            }}
          >
            <div className={sheetClassName} onClick={(event) => event.stopPropagation()}>
              {children}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ViewportFrame({
  viewport,
  sheetClassName,
  trigger,
  open = true,
  onOpenChange,
  children,
  source = false,
}: {
  viewport: "mobile" | "desktop";
  sheetClassName?: string;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  source?: boolean;
}) {
  const isDesktop = viewport === "desktop";
  const frameClass = isDesktop ? "h-[24rem] w-full max-w-[34rem]" : "h-[26rem] w-[375px]";
  const frameLabel = isDesktop ? "desktop viewport" : "mobile viewport";
  const frameWidth = isDesktop ? "1024px" : "375px";
  const theme = useThemeFamily();
  const resolvedSheetClassName = source
    ? `mx-auto max-w-md border-2 border-black bg-white shadow-[var(--shadow-lg)] ${
        sheetClassName ?? ""
      }`
    : theme === "elegant"
      ? `mx-auto overflow-clip rounded-t-lg rounded-b-none bg-layer-popover text-foreground shadow-xl ${
          isDesktop ? "max-w-xl" : "max-w-md"
        } ${sheetClassName ?? ""}`
      : `mx-auto max-w-md border-black bg-white shadow-[var(--shadow-lg)] ${
          isDesktop ? "border-2" : "border-t-2 border-x-0 border-b-0"
        } ${sheetClassName ?? ""}`;
  const overlayClassName = source ? null : "bg-layer-backdrop";

  return (
    <div
      className={`grid overflow-hidden border-2 border-black bg-white shadow-[var(--shadow)] ${frameClass}`}
    >
      <div className="flex h-7 items-center justify-between border-b-2 border-black bg-white px-3 font-mono text-[9px] leading-none font-bold text-black/45 uppercase">
        <span>{frameLabel}</span>
        <span>{frameWidth}</span>
      </div>
      <div className="relative min-h-0 bg-gray-50">
        {trigger ? (
          <div className="absolute inset-0 z-0 flex items-center justify-center">{trigger}</div>
        ) : null}
        {open && overlayClassName ? (
          <div
            className={`absolute inset-0 z-[5] ${overlayClassName}`}
            onClick={() => onOpenChange?.(false)}
          />
        ) : null}
        {open ? (
          <div
            className={
              source
                ? "absolute inset-x-0 bottom-0 z-10 p-3 pb-[max(12px,env(safe-area-inset-bottom))]"
                : isDesktop
                  ? "absolute inset-x-0 bottom-0 z-10 px-3"
                  : "absolute inset-x-0 bottom-0 z-10"
            }
            onClick={(event) => {
              if (event.target === event.currentTarget) onOpenChange?.(false);
            }}
          >
            <div className={resolvedSheetClassName} onClick={(event) => event.stopPropagation()}>
              {children}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function LeaveChannelSheetContent({ onClose }: { onClose?: () => void }) {
  return (
    <>
      <div className="flex flex-col gap-1 p-4">
        <Text.Sans render={<div />} size="body" className="font-bold text-black">
          Leave channel?
        </Text.Sans>
        <Text.Sans size="small" className="text-black/60">
          You can rejoin anytime from the directory.
        </Text.Sans>
      </div>
      <div className="mt-auto flex flex-col gap-2 p-4">
        <Button variant="danger" onClick={onClose}>
          Leave
        </Button>
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </>
  );
}

function LeaveChannelSheetSourceContent({ onClose }: { onClose?: () => void }) {
  return (
    <>
      <div className="flex flex-col gap-1 p-4">
        <div className="text-base font-bold text-black">Leave channel?</div>
        <div className="text-sm text-black/60">You can rejoin anytime from the directory.</div>
      </div>
      <div className="mt-auto flex flex-col gap-2 p-4">
        <Button variant="danger" onClick={onClose}>
          Leave
        </Button>
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
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
          <Text.Sans render={<div />} size="large" className="leading-tight font-black text-black">
            Add Slock to your Home Screen
          </Text.Sans>
          <Text.Sans size="small" className="mt-1 text-black/60">
            {isSafari
              ? "Open Slock as a fullscreen app — faster, more focused."
              : "Open this page in Safari first, then add it to your Home Screen."}
          </Text.Sans>
        </div>
        <BottomSheetClose className="static shrink-0" aria-label="Close install instructions" />
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
        <Text.Sans
          render={<div />}
          size="small"
          className="border-2 border-black bg-brutal-cream p-3 text-black"
        >
          iOS only allows Home Screen installation from Safari. Copy this page link, open Safari,
          then use Share → Add to Home Screen.
        </Text.Sans>
      )}

      <div className="mt-4 flex gap-2">
        {isSafari ? null : (
          <Button variant="primary" size="sm">
            Copy Link
          </Button>
        )}
        <BottomSheetClose render={<Button variant="default" size="sm" />}>
          {isSafari ? "Got it" : "Close"}
        </BottomSheetClose>
      </div>
    </>
  );
}

function PwaInstallSheetSourceContent({
  variant = "safari",
  onClose,
}: {
  variant?: "safari" | "other";
  onClose?: () => void;
}) {
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
          onClick={onClose}
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
        <button type="button" className="btn-brutal bg-white px-3 py-2 text-xs" onClick={onClose}>
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
      description="A mobile bottom sheet with no dim backdrop; the sheet carries the active theme frame."
      toc={TOC}
    >
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
                <BottomSheetOverlay />
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
              status: "difference",
              note: "Intentional differences: source anchors the sheet to the bottom safe area with a 12px side gutter and no visible overlay. Current mobile removes the outer side and bottom inset, keeps the safe area inside the sheet content, and shows the themed overlay.",
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
              source: <BottomSheetSurfaceSourcePreview viewport="mobile" />,
              brutal: <BottomSheetSurfacePreview viewport="mobile" />,
              elegant: <BottomSheetSurfacePreview viewport="mobile" />,
              elegantDark: <BottomSheetSurfacePreview viewport="mobile" />,
              sourceCode: code.sourceBottom,
              currentCode: code.currentBottom,
              compositionCode: code.currentBottom,
              compositionPath:
                "apps/doc/src/compositions/bottom-sheet/leave-channel-composition.tsx",
              compositionSource: SNIPPETS.currentBottom,
            },
            {
              label: "Leave channel desktop",
              status: "difference",
              note: "Intentional differences: source keeps the same outer safe-area wrapper on desktop. Current desktop preserves the side inset only, removes the bottom inset, and uses the themed overlay while keeping the sheet narrow and centered.",
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
              source: <BottomSheetSurfaceSourcePreview viewport="desktop" />,
              brutal: <BottomSheetSurfacePreview viewport="desktop" />,
              elegant: <BottomSheetSurfacePreview viewport="desktop" />,
              elegantDark: <BottomSheetSurfacePreview viewport="desktop" />,
              sourceCode: code.sourceBottom,
              currentCode: code.currentBottom,
              compositionCode: code.currentBottom,
              compositionPath:
                "apps/doc/src/compositions/bottom-sheet/leave-channel-composition.tsx",
              compositionSource: SNIPPETS.currentBottom,
            },
            {
              label: "PWA install mobile",
              status: "difference",
              note: "Mobile-only behavior for the real PWA install callsite. Current keeps the same mobile gate and p-4 sheet padding, but expresses the scene through composition primitives: BottomSheetTrigger/Close for behavior, Button for actions, and Text for copy.",
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
              source: <PwaInstallSheetSourcePreview />,
              brutal: <PwaInstallSheetPreview />,
              elegant: <PwaInstallSheetPreview />,
              elegantDark: <PwaInstallSheetPreview />,
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
              note: "The same PWA install composition also renders a non-Safari branch. It keeps the mobile-only portal and p-4 sheet padding, then uses Text for the instruction panel plus Button actions for Copy Link and Close.",
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
              source: <PwaInstallSheetSourcePreview variant="other" />,
              brutal: <PwaInstallSheetPreview variant="other" />,
              elegant: <PwaInstallSheetPreview variant="other" />,
              elegantDark: <PwaInstallSheetPreview variant="other" />,
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
