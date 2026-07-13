import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Check, Copy, Info, Send } from "lucide-react";
import {
  Button,
  createToastManager,
  toast,
  ToastAction,
  ToastActions,
  ToastArrow,
  ToastBody,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastIcon,
  ToastPortal,
  ToastPositioner,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastViewport,
  useToastManager,
  useThemeFamily,
} from "raft-ui";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { ComponentPlayground } from "#/components/component-playground.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import {
  ToastComposition,
  ToastPreviewScene,
  type ToastDemoOptions,
} from "#/compositions/toast-composition.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "variants", title: "Variants" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const anchoredUsageToastManager = createToastManager();

type PreviewPlaygroundValues = ToastDemoOptions;

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
    id: "variant-icon-title",
    title: "Icon + title",
    description: undefined,
    icon: true,
    hasAction: false,
    hasClose: false,
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

const SNIPPETS = {
  anatomy: `<ToastProvider>
  <ToastPortal>
    <ToastViewport>
      <ToastRoot>
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
    </ToastViewport>
  </ToastPortal>
</ToastProvider>`,
  variantFull: `<ToastRoot toast={toast} layout="inline">
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
  variantNoIcon: `<ToastRoot toast={toast} layout="inline">
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
  variantNoDescription: `<ToastRoot toast={toast} layout="inline">
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
  variantNoAction: `<ToastRoot toast={toast} layout="inline">
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
  variantNoDismiss: `<ToastRoot toast={toast} layout="inline">
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
  variantLoadingAction: `<ToastRoot toast={toast} layout="inline">
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
  variantIconTitle: `<ToastRoot toast={toast} layout="inline">
  <ToastContent>
    <ToastIcon />
    <ToastBody>
      <ToastTitle />
    </ToastBody>
  </ToastContent>
</ToastRoot>`,
  variantMinimal: `<ToastRoot toast={toast} layout="inline">
  <ToastContent>
    <ToastBody>
      <ToastTitle />
    </ToastBody>
  </ToastContent>
</ToastRoot>`,
  preview: `import { toast } from "raft-ui";

function ToastDemo() {
  return (
    <Button
      type="button"
      size="sm"
      variant="primary"
      onClick={() =>
        toast.success("Link copied.", {
          description: "The message link is ready to paste.",
          action: { label: "Copy again" },
        })}
    >
      Copy link
    </Button>
  );
}`,
  usage: `import { Button } from "raft-ui";
import { ToastProvider, toast } from "raft-ui";

function AppToastLayer() {
  return (
    <ToastProvider timeout={3600} limit={3}>
      <MessageActions />
    </ToastProvider>
  );
}

function MessageActions() {
  return (
    <Button
      type="button"
      onClick={() =>
        toast.info("Forwarded to #design-system", {
          description: "The selected messages were sent.",
          action: { label: "View" },
        })}
    >
      Forward
    </Button>
  );
}`,
  anchoredUsage: `import { useEffect, useRef, type RefObject } from "react";
import { Button } from "raft-ui";
import {
  createToastManager,
  ToastArrow,
  ToastContent,
  ToastPortal,
  ToastPositioner,
  ToastProvider,
  ToastRoot,
  ToastViewport,
  useToastManager,
} from "raft-ui";

const anchoredToastManager = createToastManager();

function AppToastLayer() {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  return (
    <ToastProvider
      toastManager={anchoredToastManager}
      timeout={0}
      limit={1}
      renderViewport={false}
    >
      <SeedAnchoredToast buttonRef={buttonRef} />
      <CopyButton buttonRef={buttonRef} />
      <AnchoredToasts />
    </ToastProvider>
  );
}

function SeedAnchoredToast({ buttonRef }: { buttonRef: RefObject<HTMLButtonElement | null> }) {
  useEffect(() => {
    if (!buttonRef.current) return;

    anchoredToastManager.add({
      id: "copy-link",
      title: "Copied",
      positionerProps: {
        anchor: buttonRef.current,
        side: "top",
        align: "center",
        sideOffset: 8,
      },
    });
  }, [buttonRef]);

  return null;
}

function CopyButton({ buttonRef }: { buttonRef: RefObject<HTMLButtonElement | null> }) {
  return (
    <Button
      ref={buttonRef}
      type="button"
      onClick={() =>
        anchoredToastManager.add({
          id: "copy-link",
          title: "Copied",
          timeout: 1500,
          positionerProps: {
            anchor: buttonRef.current,
            side: "top",
            align: "center",
            sideOffset: 8,
          },
        })}
    >
      Copy link
    </Button>
  );
}

function AnchoredToasts() {
  const { toasts } = useToastManager();

  return (
    <ToastPortal>
      <ToastViewport placement="none">
        {toasts.map((toast) => (
          <ToastPositioner key={toast.id} toast={toast}>
            <ToastRoot
              toast={toast}
              layout="inline"
              className="[--toast-title-only-min-h:1.875rem] [--toast-title-only-min-w:0px] [--toast-title-only-px:0.625rem] [--toast-title-only-py:0.375rem]"
            >
              <ToastArrow />
              <ToastContent className="min-h-0 min-w-0 px-2.5 py-1.5">
                <ToastTitle className="text-[13px] leading-[18px]" />
              </ToastContent>
            </ToastRoot>
          </ToastPositioner>
        ))}
      </ToastViewport>
    </ToastPortal>
  );
}`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "ToastProvider",
    type: "Base UI Toast.Provider.Props & { portalContainer?, renderViewport?, viewportPlacement?, viewportStrategy? }",
    description:
      "Provides toast state and renders the default viewport/list. Pass renderViewport=false when composing a custom viewport.",
  },
  {
    name: "toast",
    type: "{ info, success, warning, error, add, dismiss }",
    description:
      "Default imperative toast channel for app code. Use toast.success(title, options) without reading the manager.",
  },
  {
    name: "useToastManager",
    type: "() => { toasts, add, close, update, promise }",
    description:
      "Advanced hook for custom toast lists, seeded docs previews, and anchored composition.",
  },
  {
    name: "createToastManager",
    type: "Base UI createToastManager",
    description:
      "Advanced escape hatch for isolated channels, local previews, and multiple independent toast roots.",
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
      "Viewport landmark for toasts. Use placement=none for ToastPositioner anchored toasts, and strategy=absolute inside contained previews.",
  },
  {
    name: "ToastPositioner",
    type: "Base UI Toast.Positioner.Props",
    description:
      "Positions contextual toasts against the anchor supplied through toastManager.add({ positionerProps }).",
  },
  {
    name: "ToastArrow",
    type: "Base UI Toast.Arrow.Props",
    description: "Optional arrow rendered inside an anchored toast positioned by ToastPositioner.",
  },
  {
    name: "ToastRoot",
    type: 'Base UI Toast.Root.Props & { layout?: "stacked" | "inline" }',
    default: 'layout="stacked"',
    description:
      "Individual toast frame. Keep stacked by default; use layout=inline only inside ToastPositioner anchored toasts or isolated one-off previews.",
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
      "Renders the toast action. The default toast channel maps action.label to ToastAction; custom managers can still pass Base UI actionProps.",
  },
  {
    name: "ToastClose",
    type: "Base UI Toast.Close.Props",
    description: "Dismiss button. Renders a default text label unless children are provided.",
  },
];

export const Route = createFileRoute("/components/toast")({
  component: ToastDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function ToastDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Toast"
      description="A transient feedback layer for copy, forward, sync, and action-result messages."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <ComponentPlayground<PreviewPlaygroundValues>
          defaultValues={{
            mode: "stacked",
            icon: true,
            description: true,
            action: true,
            dismissible: true,
          }}
          controls={[
            { name: "mode", label: "Mode", type: "radio", options: ["stacked", "anchored"] },
            { name: "icon", label: "Icon", type: "boolean" },
            { name: "description", label: "Description", type: "boolean" },
            { name: "action", label: "Action", type: "boolean" },
            { name: "dismissible", label: "Dismiss", type: "boolean" },
          ]}
          previewClassName="min-h-84"
          render={(values) => (
            <ToastComposition
              key={values.mode}
              controls
              demoOptions={values}
              className="h-full min-h-84 w-full"
            />
          )}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="variants" title="Variants" showThemeSwitcher>
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
              <h3 className="text-sm font-medium text-foreground-strong">Icon + title</h3>
              <Example
                html={code.variantIconTitle}
                previewClassName="min-h-32"
                previewInset="flush"
              >
                <ToastAnatomyVariantPreview variant={ANATOMY_VARIANTS[6]} />
              </Example>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground-strong">Minimal</h3>
              <Example html={code.variantMinimal} previewClassName="min-h-32" previewInset="flush">
                <ToastAnatomyVariantPreview variant={ANATOMY_VARIANTS[7]} />
              </Example>
            </div>
          </div>
        </div>
      </DocSection>

      <DocSection id="usage" title="Usage" showThemeSwitcher>
        <div className="space-y-3">
          <DocNote>
            Keep long-running or historical notifications in NotificationCenter; use Toast for
            immediate feedback that can disappear.
          </DocNote>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground-strong">Stacked</h3>
            <Example html={code.usage} previewClassName="min-h-72" previewInset="flush">
              <InlineUsageToast />
            </Example>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground-strong">Anchored with arrow</h3>
            <DocNote>
              Anchored toasts use <code>ToastPositioner</code> with the <code>positionerProps</code>{" "}
              supplied to <code>toastManager.add</code>. Keep anchored and stacked toasts in
              separate <code>ToastProvider</code> instances when both patterns appear in the same
              app.
            </DocNote>
            <Example html={code.anchoredUsage} previewClassName="min-h-56" previewInset="flush">
              <AnchoredUsageToast />
            </Example>
          </div>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
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
      <ToastProvider
        key={theme}
        timeout={3600}
        limit={3}
        portalContainer={portalContainer}
        viewportPlacement="bottom-center"
        viewportStrategy="absolute"
      >
        <div className="relative z-10">
          <InlineUsageControls />
        </div>
      </ToastProvider>
    </div>
  );
}

function InlineUsageControls() {
  return (
    <div className="flex w-full items-start justify-center gap-2 pt-2">
      <Button
        type="button"
        size="sm"
        variant="primary"
        onClick={() =>
          toast.success("Link copied.", {
            description: "The message link is ready to paste.",
            action: {
              label: "Copy again",
              onClick: () => toast.dismiss(),
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
          toast.info("Forwarded to #design-system.", {
            description: "The selected messages were sent.",
            action: {
              label: "View",
              onClick: () => toast.dismiss(),
            },
          })
        }
      >
        <Send aria-hidden />
        Forward
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() =>
          toast.error("Clipboard write blocked.", {
            description: "Grant clipboard access or copy the links manually.",
            action: {
              label: "Retry",
              onClick: () => toast.dismiss(),
            },
          })
        }
      >
        Error
      </Button>
    </div>
  );
}

function AnchoredUsageToast() {
  const theme = useThemeFamily();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div ref={setPortalContainer} className="relative min-h-56 w-full overflow-hidden">
      <ToastPreviewScene />
      <ToastProvider
        key={theme}
        toastManager={anchoredUsageToastManager}
        timeout={0}
        limit={1}
        renderViewport={false}
      >
        <SeedAnchoredUsageToast buttonRef={buttonRef} />
        <div className="relative z-10 flex min-h-56 w-full items-center justify-center gap-2">
          <AnchoredUsageButton buttonRef={buttonRef} />
        </div>
        {portalContainer ? (
          <ToastPortal container={portalContainer}>
            <ToastViewport strategy="absolute" placement="none">
              <AnchoredUsageToastList />
            </ToastViewport>
          </ToastPortal>
        ) : null}
      </ToastProvider>
    </div>
  );
}

function SeedAnchoredUsageToast({ buttonRef }: { buttonRef: RefObject<HTMLButtonElement | null> }) {
  useEffect(() => {
    if (!buttonRef.current) return;

    anchoredUsageToastManager.add({
      id: "copy-link",
      title: "Copied",
      positionerProps: {
        anchor: buttonRef.current,
        side: "top",
        align: "center",
        sideOffset: 8,
      },
    });
  }, [buttonRef]);

  return null;
}

function AnchoredUsageButton({ buttonRef }: { buttonRef: RefObject<HTMLButtonElement | null> }) {
  return (
    <Button
      ref={buttonRef}
      type="button"
      size="sm"
      variant="primary"
      onClick={() =>
        anchoredUsageToastManager.add({
          id: "copy-link",
          title: "Copied",
          timeout: 1500,
          positionerProps: {
            anchor: buttonRef.current,
            side: "top",
            align: "center",
            sideOffset: 8,
          },
        })
      }
    >
      <Copy aria-hidden />
      Copy link
    </Button>
  );
}

function AnchoredUsageToastList() {
  const { toasts } = useToastManager();

  return toasts.map((toast) => (
    <ToastPositioner key={toast.id} toast={toast}>
      <ToastRoot
        toast={toast}
        layout="inline"
        className="[--toast-title-only-min-h:1.875rem] [--toast-title-only-min-w:0px] [--toast-title-only-px:0.625rem] [--toast-title-only-py:0.375rem]"
      >
        <ToastArrow />
        <ToastContent className="min-h-0 min-w-0 px-2.5 py-1.5">
          <ToastTitle className="text-[13px] leading-[18px]" />
        </ToastContent>
      </ToastRoot>
    </ToastPositioner>
  ));
}

function ToastAnatomyVariantPreview({ variant }: { variant: (typeof ANATOMY_VARIANTS)[number] }) {
  const theme = useThemeFamily();
  const [toastManager] = useState(() => createToastManager<AnatomyVariantData>());

  return (
    <div className="relative flex min-h-32 w-full items-center justify-center overflow-hidden">
      <ToastPreviewScene />
      <ToastProvider
        key={theme}
        toastManager={toastManager}
        timeout={0}
        limit={1}
        renderViewport={false}
      >
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
  const { toasts } = useToastManager<AnatomyVariantData>();
  const toast = toasts[0];

  if (!toast) return null;

  const showIcon = Boolean(toast.data?.icon);
  const showDescription = Boolean(toast.description);
  const showAction = Boolean(toast.data?.hasAction);
  const showClose = Boolean(toast.data?.hasClose);

  return (
    <ToastRoot toast={toast} layout="inline">
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
