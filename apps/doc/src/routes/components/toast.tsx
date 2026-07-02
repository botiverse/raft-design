import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, Copy, Info, Send, SendHorizontal } from "lucide-react";
import { Button, useThemeFamily } from "raft-ui";
import {
  ToastAction,
  ToastActions,
  ToastBody,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastIcon,
  ToastPortal,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastViewport,
  useToastManager,
} from "raft-ui/wip";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { StatusBadge } from "#/components/status-badge.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import toastCompositionSource from "#/compositions/toast-source-comparison.tsx?raw";
import {
  SourceImageActionErrorPreview,
  SourceSelectionToastPreview,
  TOAST_COMPOSITION_PATH,
  ToastComposition,
  ToastPreviewScene,
} from "#/compositions/toast-source-comparison.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "variants", title: "Variants" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const ANATOMY_VARIANTS = [
  {
    id: "variant-full",
    title: "Full example",
    description: "Icon, description, action, and dismiss all together.",
    icon: true,
    hasAction: true,
    hasClose: true,
  },
  {
    id: "variant-no-icon",
    title: "No icon",
    description: "Text-only content without a leading icon.",
    icon: false,
    hasAction: true,
    hasClose: true,
  },
  {
    id: "variant-no-description",
    title: "No description",
    description: undefined,
    icon: true,
    hasAction: true,
    hasClose: true,
  },
  {
    id: "variant-no-action",
    title: "No action",
    description: "Informational only, no retry or follow-up action.",
    icon: true,
    hasAction: false,
    hasClose: true,
  },
  {
    id: "variant-no-dismiss",
    title: "No dismiss",
    description: "Persists until it resolves on its own.",
    icon: true,
    hasAction: true,
    hasClose: false,
  },
  {
    id: "variant-loading-action",
    title: "Loading action",
    description: "Keeps the action width stable while the retry is pending.",
    icon: true,
    hasAction: true,
    hasClose: true,
    actionLoading: true,
  },
  {
    id: "variant-minimal",
    title: "Minimal",
    description: undefined,
    icon: false,
    hasAction: false,
    hasClose: false,
  },
] as const;

type AnatomyVariantData = {
  icon: boolean;
  hasAction: boolean;
  hasClose: boolean;
  actionLoading?: boolean;
};

const SELECTION_TOAST_SCENES = [
  {
    label: "Selection toast",
    scenes: [
      {
        label: "ChatPanel.tsx:832-835",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/ChatPanel.tsx:832-835",
      },
      {
        label: "ChatPanel.tsx:1213-1220",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/ChatPanel.tsx:1213-1220",
      },
      {
        label: "forwardSelectionUtils.ts:40-52",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/forwardSelectionUtils.ts:40-52",
      },
    ],
  },
] as const;

const IMAGE_ACTION_ERROR_SCENES = [
  {
    label: "Image action error",
    scenes: [
      {
        label: "ChatPanel.tsx:1271-1279",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/ChatPanel.tsx:1271-1279",
      },
      {
        label: "ThreadPanel.tsx:1517-1525",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/ThreadPanel.tsx:1517-1525",
      },
    ],
  },
] as const;

const SNIPPETS = {
  anatomy: `import {
  ToastAction,
  ToastActions,
  ToastBody,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastIcon,
  ToastPortal,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastViewport,
  useToastManager,
} from "raft-ui/wip";

<ToastProvider timeout={3600} limit={3}>
  <ToastPortal>
    <ToastViewport>
      {toasts.map((toast) => (
        <ToastRoot key={toast.id} toast={toast}>
          <ToastContent>
            <ToastIcon />
            <ToastBody>
              <ToastTitle />
              <ToastDescription />
            </ToastBody>
            <ToastActions>
              <ToastClose />
              <ToastAction />
            </ToastActions>
          </ToastContent>
        </ToastRoot>
      ))}
    </ToastViewport>
  </ToastPortal>
</ToastProvider>`,
  variantFull: `<ToastRoot toast={toast} layout="anchored">
  <ToastContent>
    <ToastIcon />
    <ToastBody>
      <ToastTitle />
      <ToastDescription />
    </ToastBody>
    <ToastActions>
      <ToastClose />
      <ToastAction />
    </ToastActions>
  </ToastContent>
</ToastRoot>`,
  variantNoIcon: `<ToastRoot toast={toast} layout="anchored">
  <ToastContent>
    <ToastBody>
      <ToastTitle />
      <ToastDescription />
    </ToastBody>
    <ToastActions>
      <ToastClose />
      <ToastAction />
    </ToastActions>
  </ToastContent>
</ToastRoot>`,
  variantNoDescription: `<ToastRoot toast={toast} layout="anchored">
  <ToastContent>
    <ToastIcon />
    <ToastBody>
      <ToastTitle />
    </ToastBody>
    <ToastActions>
      <ToastClose />
      <ToastAction />
    </ToastActions>
  </ToastContent>
</ToastRoot>`,
  variantNoAction: `<ToastRoot toast={toast} layout="anchored">
  <ToastContent>
    <ToastIcon />
    <ToastBody>
      <ToastTitle />
      <ToastDescription />
    </ToastBody>
    <ToastActions>
      <ToastClose />
    </ToastActions>
  </ToastContent>
</ToastRoot>`,
  variantNoDismiss: `<ToastRoot toast={toast} layout="anchored">
  <ToastContent>
    <ToastIcon />
    <ToastBody>
      <ToastTitle />
      <ToastDescription />
    </ToastBody>
    <ToastActions>
      <ToastAction />
    </ToastActions>
  </ToastContent>
</ToastRoot>`,
  variantLoadingAction: `<ToastRoot toast={toast} layout="anchored">
  <ToastContent>
    <ToastIcon />
    <ToastBody>
      <ToastTitle />
      <ToastDescription />
    </ToastBody>
    <ToastActions>
      <ToastClose />
      <ToastAction loading loadingLabel="Retrying" />
    </ToastActions>
  </ToastContent>
</ToastRoot>`,
  variantMinimal: `<ToastRoot toast={toast} layout="anchored">
  <ToastContent>
    <ToastBody>
      <ToastTitle />
    </ToastBody>
  </ToastContent>
</ToastRoot>`,
  preview: `function ToastDemo() {
  const toastManager = useToastManager();

  return (
    <Button
      type="button"
      size="sm"
      variant="primary"
      onClick={() =>
        toastManager.add({
          type: "info",
          title: "Link copied.",
          description: "The message link is ready to paste.",
          data: { icon: "info" },
          actionProps: { children: "Copy again" },
        })}
    >
      Copy link
    </Button>
  );
}`,
  usage: `import { Button } from "raft-ui";
import {
  ToastProvider,
  ToastPortal,
  ToastViewport,
  useToastManager,
} from "raft-ui/wip";

function AppToastLayer() {
  return (
    <ToastProvider timeout={3600} limit={3}>
      <MessageActions />
      <ToastPortal>
        <ToastViewport placement="bottom-center" />
      </ToastPortal>
    </ToastProvider>
  );
}

function MessageActions() {
  const toastManager = useToastManager();

  return (
    <Button
      type="button"
      onClick={() =>
        toastManager.add({
          type: "info",
          title: "Forwarded to #design-system",
          description: "The selected messages were sent.",
          actionProps: { children: "View" },
        })}
    >
      Forward
    </Button>
  );
}`,
  sourceToast: `<div
  className="fixed bottom-4 left-1/2 z-[70] -translate-x-1/2 border-2 border-black bg-soft-signal px-3 py-2 text-sm font-bold text-black shadow-[var(--shadow-brutal)]"
  role="status"
  data-testid="forward-toast"
>
  {selectionToast}
</div>`,
  sourceErrorToast: `<div
  role="alert"
  className="fixed bottom-20 left-1/2 z-[110] -translate-x-1/2 border-2 border-black bg-brutal-orange px-3 py-2 text-xs font-bold shadow-[var(--shadow-brutal-sm)]"
  onClick={() => setPicError(null)}
  data-testid="select-share-error"
>
  Image action failed: {picError} — click to dismiss.
</div>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "ToastProvider",
    type: "Base UI Toast.Provider.Props",
    description:
      "Provides toast state, timeout, limit, keyboard navigation, and optional global toastManager.",
  },
  {
    name: "useToastManager",
    type: "() => { toasts, add, close, update, promise }",
    description:
      "Creates or reads the active manager inside ToastProvider. Use add/update/promise for transient feedback.",
  },
  {
    name: "createToastManager",
    type: "Base UI createToastManager",
    description: "Creates an external manager for app-level toast calls outside React render.",
  },
  {
    name: "ToastPortal",
    type: "Base UI Toast.Portal.Props",
    description:
      "Portals the viewport. Pass container when a docs preview needs local containment.",
  },
  {
    name: "ToastViewport",
    type: "Base UI Toast.Viewport.Props & { placement, strategy }",
    default: 'placement="bottom-center", strategy="fixed"',
    description:
      "Viewport landmark and stack anchor. Use strategy=absolute inside contained previews.",
  },
  {
    name: "ToastRoot",
    type: 'Base UI Toast.Root.Props & { layout?: "stacked" | "anchored" }',
    default: 'layout="stacked"',
    description:
      "Individual toast frame. Reads toast.type for status styling and Base UI stack/swipe state.",
  },
  {
    name: "ToastContent",
    type: "Base UI Toast.Content.Props",
    description: "Grid shell for icon, title/description, and a right-aligned action row.",
  },
  {
    name: "ToastActions",
    type: "React.HTMLAttributes<HTMLDivElement>",
    description:
      "Action row container. Place ToastClose before ToastAction so dismiss appears before the primary action.",
  },
  {
    name: "ToastTitle / ToastDescription",
    type: "Base UI title and description props",
    description: "Render toast.title and toast.description by default, or explicit children.",
  },
  {
    name: "ToastAction",
    type: "Base UI Toast.Action.Props & { loading?, loadingLabel? }",
    description:
      "Renders only when actionProps.children exists on the toast object. Set loading to keep the action disabled with a spinner while work is pending.",
  },
  {
    name: "ToastClose",
    type: "Base UI Toast.Close.Props",
    description: "Dismiss button. Renders a default text label unless children are provided.",
  },
];

export const Route = createFileRoute("/components/toast")({
  component: ToastDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        toastComposition: toastCompositionSource,
      },
    }),
});

function ToastDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Toast"
      description="A transient feedback layer for copy, forward, sync, and action-result messages."
      headerAction={<StatusBadge status="in-progress" />}
      toc={TOC}
    >
      <DocSection id="preview" title="Preview">
        <Example html={code.preview} previewClassName="min-h-84" previewInset="flush">
          <ToastComposition controls className="h-full min-h-84 w-full" />
        </Example>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="Toast.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
        />
      </DocSection>

      <DocSection id="variants" title="Variants">
        <div className="space-y-3">
          <DocNote>
            Icon, description, action, and dismiss are all optional. Omit the part you don't need
            instead of rendering it empty.
          </DocNote>
          <div className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground-strong">Full</h3>
              <Example html={code.variantFull} previewClassName="min-h-32" previewInset="flush">
                <ToastAnatomyVariantPreview variant={ANATOMY_VARIANTS[0]} />
              </Example>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground-strong">No icon</h3>
              <Example html={code.variantNoIcon} previewClassName="min-h-32" previewInset="flush">
                <ToastAnatomyVariantPreview variant={ANATOMY_VARIANTS[1]} />
              </Example>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground-strong">No description</h3>
              <Example
                html={code.variantNoDescription}
                previewClassName="min-h-32"
                previewInset="flush"
              >
                <ToastAnatomyVariantPreview variant={ANATOMY_VARIANTS[2]} />
              </Example>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground-strong">No action</h3>
              <Example html={code.variantNoAction} previewClassName="min-h-32" previewInset="flush">
                <ToastAnatomyVariantPreview variant={ANATOMY_VARIANTS[3]} />
              </Example>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground-strong">No dismiss</h3>
              <Example
                html={code.variantNoDismiss}
                previewClassName="min-h-32"
                previewInset="flush"
              >
                <ToastAnatomyVariantPreview variant={ANATOMY_VARIANTS[4]} />
              </Example>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground-strong">Loading action</h3>
              <Example
                html={code.variantLoadingAction}
                previewClassName="min-h-32"
                previewInset="flush"
              >
                <ToastAnatomyVariantPreview variant={ANATOMY_VARIANTS[5]} />
              </Example>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground-strong">Minimal</h3>
              <Example html={code.variantMinimal} previewClassName="min-h-32" previewInset="flush">
                <ToastAnatomyVariantPreview variant={ANATOMY_VARIANTS[6]} />
              </Example>
            </div>
          </div>
        </div>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-3">
          <DocNote>
            Toast lives in <code>raft-ui/wip</code> while the public API settles. Keep long-running
            or historical notifications in NotificationCenter; use Toast for immediate feedback that
            can disappear.
          </DocNote>
          <Example html={code.usage} previewClassName="min-h-72" previewInset="flush">
            <InlineUsageToast />
          </Example>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison" showThemeSwitcher={false}>
        <SourceComparison
          layout="grid"
          previewSize="tall"
          items={[
            {
              id: "source-comparison-selection-toast",
              label: "Selection feedback toast",
              status: "match",
              note: "Source keeps one hand-rolled bottom-center status region in ChatPanel. The WIP Toast keeps that transient feedback shape but moves lifecycle, stacking, swipe dismiss, and live-region semantics into Base UI.",
              sourceScenes: SELECTION_TOAST_SCENES,
              source: <SourceSelectionToastPreview message="3 links copied." />,
              sourceCode: code.sourceToast,
              brutal: <ToastComposition seed="copy" />,
              elegant: <ToastComposition seed="forward" />,
              elegantDark: <ToastComposition seed="clipboard-error" />,
              compositionCode: code.toastComposition,
              compositionCollapsedCode: code.toastCompositionBody,
              compositionPath: TOAST_COMPOSITION_PATH,
              compositionSource: toastCompositionSource,
              compositionShowLineNumbers: false,
              previewClassName: "min-h-72",
            },
            {
              id: "source-comparison-image-action-error",
              label: "Image action error",
              status: "match",
              note: "Source uses a separate fixed alert for image/share failures: orange surface, higher bottom offset, smaller text, smaller brutal shadow, and click-to-dismiss behavior.",
              sourceScenes: IMAGE_ACTION_ERROR_SCENES,
              source: <SourceImageActionErrorPreview />,
              sourceCode: code.sourceErrorToast,
              brutal: <ToastComposition seed="image-error" />,
              compositionCode: code.toastComposition,
              compositionCollapsedCode: code.toastCompositionBody,
              compositionPath: TOAST_COMPOSITION_PATH,
              compositionSource: toastCompositionSource,
              compositionShowLineNumbers: false,
              previewClassName: "min-h-72",
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}

function InlineUsageToast() {
  const theme = useThemeFamily();
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div ref={setPortalContainer} className="relative min-h-72 w-full overflow-hidden">
      <ToastPreviewScene />
      <ToastProvider key={theme} timeout={3600} limit={3}>
        <div className="relative z-10">
          <InlineUsageControls />
        </div>
        {portalContainer ? (
          <ToastPortal container={portalContainer}>
            <ToastViewport strategy="absolute" placement="bottom-center">
              <InlineUsageToastList />
            </ToastViewport>
          </ToastPortal>
        ) : null}
      </ToastProvider>
    </div>
  );
}

function InlineUsageControls() {
  const toastManager = useToastManager<{ icon?: "info" | "send" | "copy" }>();

  return (
    <div className="flex w-full items-start justify-center gap-2 pt-2">
      <Button
        type="button"
        size="sm"
        variant="primary"
        onClick={() =>
          toastManager.add({
            type: "info",
            title: "Link copied.",
            description: "The message link is ready to paste.",
            data: { icon: "copy" },
            actionProps: {
              children: "Copy again",
              onClick: () => toastManager.close(),
            },
          })
        }
      >
        <Check aria-hidden />
        Copy link
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() =>
          toastManager.add({
            type: "info",
            title: "Forwarded to #design-system.",
            description: "The selected messages were sent.",
            data: { icon: "send" },
            actionProps: {
              children: "View",
              onClick: () => toastManager.close(),
            },
          })
        }
      >
        <Send aria-hidden />
        Forward
      </Button>
    </div>
  );
}

function InlineUsageToastList() {
  const theme = useThemeFamily();
  const { toasts } = useToastManager<{ icon?: "info" | "send" | "copy" }>();

  return toasts.map((toast) => {
    if (theme === "brutal") {
      return (
        <ToastRoot key={toast.id} toast={toast}>
          <ToastContent>
            <ToastBody>
              <ToastTitle />
              <ToastDescription />
            </ToastBody>
            <ToastActions>
              <ToastClose />
              <ToastAction />
            </ToastActions>
          </ToastContent>
        </ToastRoot>
      );
    }

    const Icon =
      toast.data?.icon === "send" ? SendHorizontal : toast.data?.icon === "copy" ? Copy : Info;

    return (
      <ToastRoot key={toast.id} toast={toast}>
        <ToastContent>
          <ToastIcon>
            <Icon aria-hidden />
          </ToastIcon>
          <ToastBody>
            <ToastTitle />
            <ToastDescription />
          </ToastBody>
          <ToastActions>
            <ToastClose />
            <ToastAction />
          </ToastActions>
        </ToastContent>
      </ToastRoot>
    );
  });
}

function ToastAnatomyVariantPreview({ variant }: { variant: (typeof ANATOMY_VARIANTS)[number] }) {
  const theme = useThemeFamily();

  return (
    <div className="relative flex min-h-32 w-full items-center justify-center overflow-hidden">
      <ToastPreviewScene />
      <ToastProvider key={theme} timeout={0} limit={1}>
        <ToastAnatomyVariantSeed variant={variant} />
        <div className="relative z-10">
          <ToastAnatomyVariantItem />
        </div>
      </ToastProvider>
    </div>
  );
}

function ToastAnatomyVariantSeed({ variant }: { variant: (typeof ANATOMY_VARIANTS)[number] }) {
  const seededVariantRef = useRef<string | null>(null);
  const toastManager = useToastManager<AnatomyVariantData>();

  useEffect(() => {
    if (seededVariantRef.current === variant.id) return;
    seededVariantRef.current = variant.id;

    toastManager.add({
      id: variant.id,
      type: "info",
      title: variant.title,
      description: variant.description,
      timeout: 0,
      data: {
        icon: variant.icon,
        hasAction: variant.hasAction,
        hasClose: variant.hasClose,
        actionLoading: "actionLoading" in variant ? variant.actionLoading : undefined,
      },
      actionProps: variant.hasAction ? { children: "Retry" } : undefined,
    });
  }, [toastManager, variant]);

  return null;
}

function ToastAnatomyVariantItem() {
  const theme = useThemeFamily();
  const { toasts } = useToastManager<AnatomyVariantData>();
  const toast = toasts[0];

  if (!toast) return null;

  const showIcon = theme !== "brutal" && Boolean(toast.data?.icon);
  const showDescription = Boolean(toast.description);
  const showAction = Boolean(toast.data?.hasAction);
  const showClose = Boolean(toast.data?.hasClose);

  return (
    <ToastRoot toast={toast} layout="anchored">
      <ToastContent>
        {showIcon ? (
          <ToastIcon>
            <Info aria-hidden />
          </ToastIcon>
        ) : null}
        <ToastBody>
          <ToastTitle />
          {showDescription ? <ToastDescription /> : null}
        </ToastBody>
        {showAction || showClose ? (
          <ToastActions>
            {showClose ? <ToastClose /> : null}
            {showAction ? (
              <ToastAction loading={toast.data?.actionLoading} loadingLabel="Retrying" />
            ) : null}
          </ToastActions>
        ) : null}
      </ToastContent>
    </ToastRoot>
  );
}
