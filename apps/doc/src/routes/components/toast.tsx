import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Check, Copy, Info, Send } from "lucide-react";
import {
  Button,
  createToastManager,
  InlineCode,
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
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { ToastPreviewScene } from "#/modules/toast/toast.composition.tsx";
import { ToastPlaygroundPreview } from "#/modules/toast/toast.preview.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const anchoredUsageToastManager = createToastManager();

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
} from "raft-ui";

<ToastProvider renderViewport={false}>
  <ToastPortal>
    <ToastViewport>
      <ToastRoot toast={toast}>
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
  preview: `import { Button, createToastManager, ToastProvider, useToastManager } from "raft-ui";

const previewToastManager = createToastManager();

function ToastDemo() {
  return (
    <ToastProvider toastManager={previewToastManager} timeout={3600} limit={3}>
      <CopyLinkButton />
    </ToastProvider>
  );
}

function CopyLinkButton() {
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
          actionProps: {
            children: "Copy again",
            onClick: () => toastManager.close(),
          },
        })
      }
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

const PROVIDER_PROPS: readonly PropRow[] = [
  {
    name: "portalContainer",
    type: "Base UI Toast.Portal.Props['container']",
    description: "Portal container for the default viewport when ToastProvider renders it.",
  },
  {
    name: "renderViewport",
    type: "boolean",
    default: "true",
    description: "Pass false when composing a custom viewport.",
  },
  {
    name: "viewportPlacement",
    type: "ToastViewport placement",
    default: '"bottom-center"',
    description: "Placement passed to the default ToastViewport.",
  },
  {
    name: "viewportStrategy",
    type: "ToastViewport strategy",
    default: '"fixed"',
    description: "Positioning strategy passed to the default ToastViewport.",
  },
  {
    name: "...props",
    type: "Base UI Toast.Provider.Props",
    description: "Provides toast state and renders the default viewport/list.",
  },
];

const TOAST_CHANNEL_PROPS: readonly PropRow[] = [
  {
    name: "info / success / warning / error",
    type: "(title: string, options?) => string",
    description: "Default imperative toast channel for app code.",
  },
  {
    name: "add",
    type: "(options & { title, type? }) => string",
    description: "Add a toast with an explicit type. Defaults to info.",
  },
  {
    name: "dismiss",
    type: "(id?: string) => void",
    description: "Close one toast by id, or the active toast when omitted.",
  },
];

const USE_TOAST_MANAGER_PROPS: readonly PropRow[] = [
  {
    name: "...",
    type: "() => { toasts, add, close, update, promise }",
    description:
      "Advanced hook for custom toast lists, seeded docs previews, and anchored composition.",
  },
];

const CREATE_TOAST_MANAGER_PROPS: readonly PropRow[] = [
  {
    name: "...",
    type: "Base UI createToastManager",
    description:
      "Advanced escape hatch for isolated channels, local previews, and multiple independent toast roots.",
  },
];
const PORTAL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Toast.Portal.Props",
    description:
      "Portals the viewport. Pass container when a docs preview needs local containment.",
  },
];

const VIEWPORT_PROPS: readonly PropRow[] = [
  {
    name: "placement",
    type: "ToastViewport placement",
    default: '"bottom-center"',
    description: "Use none for ToastPositioner anchored toasts.",
  },
  {
    name: "strategy",
    type: '"fixed" | "absolute"',
    default: '"fixed"',
    description: "Use absolute inside contained previews.",
  },
  {
    name: "...props",
    type: "Base UI Toast.Viewport.Props",
    description: "Viewport landmark for toasts.",
  },
];

const POSITIONER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Toast.Positioner.Props",
    description:
      "Positions contextual toasts against the anchor supplied through toastManager.add({ positionerProps }).",
  },
];

const ARROW_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Toast.Arrow.Props",
    description: "Optional arrow rendered inside an anchored toast positioned by ToastPositioner.",
  },
];

const ROOT_PROPS: readonly PropRow[] = [
  {
    name: "layout",
    type: '"stacked" | "inline"',
    default: '"stacked"',
    description:
      "Individual toast frame layout. Keep stacked by default; use inline only inside ToastPositioner anchored toasts or isolated one-off previews.",
  },
  {
    name: "...props",
    type: "Base UI Toast.Root.Props",
    description: "Individual toast frame.",
  },
];

const CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Toast.Content.Props",
    description: "Grid shell for icon, title/description, and a right-aligned action row.",
  },
];

const ACTIONS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "React.HTMLAttributes<HTMLDivElement>",
    description:
      "Action row container. Place ToastClose before ToastAction so dismiss appears before the primary action.",
  },
];

const TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Toast.Title.Props",
    description: "Renders toast.title by default, or explicit children.",
  },
];

const DESCRIPTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Toast.Description.Props",
    description: "Renders toast.description by default, or explicit children.",
  },
];

const ACTION_PROPS: readonly PropRow[] = [
  {
    name: "loading / loadingLabel",
    type: "boolean / string",
    description: "Shows a loading affordance on the action when the toast is busy.",
  },
  {
    name: "...props",
    type: "Base UI Toast.Action.Props",
    description:
      "Renders the toast action. The default toast channel maps action.label to ToastAction; custom managers can still pass Base UI actionProps.",
  },
];

const CLOSE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
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
        <ToastPlaygroundPreview code={code.preview} />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-10">
          <DocNote>
            Icon, description, action, and dismiss are all optional. Omit the part you don't need
            instead of rendering it empty.
          </DocNote>
          <DocSubsection parentId="usage" id="full" title="Full">
            <Preview previewClassName="min-h-32" previewInset="flush">
              <Preview.Canvas>
                <ToastAnatomyVariantPreview variant={ANATOMY_VARIANTS[0]} />
              </Preview.Canvas>
              <Preview.Code html={code.variantFull} />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="no-icon" title="No icon">
            <Preview previewClassName="min-h-32" previewInset="flush">
              <Preview.Canvas>
                <ToastAnatomyVariantPreview variant={ANATOMY_VARIANTS[1]} />
              </Preview.Canvas>
              <Preview.Code html={code.variantNoIcon} />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="no-description" title="No description">
            <Preview previewClassName="min-h-32" previewInset="flush">
              <Preview.Canvas>
                <ToastAnatomyVariantPreview variant={ANATOMY_VARIANTS[2]} />
              </Preview.Canvas>
              <Preview.Code html={code.variantNoDescription} />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="no-action" title="No action">
            <Preview previewClassName="min-h-32" previewInset="flush">
              <Preview.Canvas>
                <ToastAnatomyVariantPreview variant={ANATOMY_VARIANTS[3]} />
              </Preview.Canvas>
              <Preview.Code html={code.variantNoAction} />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="no-dismiss" title="No dismiss">
            <Preview previewClassName="min-h-32" previewInset="flush">
              <Preview.Canvas>
                <ToastAnatomyVariantPreview variant={ANATOMY_VARIANTS[4]} />
              </Preview.Canvas>
              <Preview.Code html={code.variantNoDismiss} />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="loading-action" title="Loading action">
            <Preview previewClassName="min-h-32" previewInset="flush">
              <Preview.Canvas>
                <ToastAnatomyVariantPreview variant={ANATOMY_VARIANTS[5]} />
              </Preview.Canvas>
              <Preview.Code html={code.variantLoadingAction} />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="icon-title" title="Icon + title">
            <Preview previewClassName="min-h-32" previewInset="flush">
              <Preview.Canvas>
                <ToastAnatomyVariantPreview variant={ANATOMY_VARIANTS[6]} />
              </Preview.Canvas>
              <Preview.Code html={code.variantIconTitle} />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="minimal" title="Minimal">
            <Preview previewClassName="min-h-32" previewInset="flush">
              <Preview.Canvas>
                <ToastAnatomyVariantPreview variant={ANATOMY_VARIANTS[7]} />
              </Preview.Canvas>
              <Preview.Code html={code.variantMinimal} />
            </Preview>
          </DocSubsection>
          <DocNote>
            Keep long-running or historical notifications in{" "}
            <InlineCode>NotificationCenter</InlineCode>; use <InlineCode>Toast</InlineCode> for
            immediate feedback that can disappear.
          </DocNote>
          <DocSubsection parentId="usage" id="stacked" title="Stacked">
            <Preview previewClassName="min-h-72" previewInset="flush">
              <Preview.Canvas>
                <InlineUsageToast />
              </Preview.Canvas>
              <Preview.Code html={code.usage} collapsedHtml={code.usageBody} />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="anchored-with-arrow" title="Anchored with arrow">
            <DocNote>
              Anchored toasts use <InlineCode>ToastPositioner</InlineCode> with the{" "}
              <InlineCode>positionerProps</InlineCode> supplied to{" "}
              <InlineCode>toastManager.add</InlineCode>. Keep anchored and stacked toasts in
              separate <InlineCode>ToastProvider</InlineCode> instances when both patterns appear in
              the same app.
            </DocNote>
            <Preview previewClassName="min-h-56" previewInset="flush">
              <Preview.Canvas>
                <AnchoredUsageToast />
              </Preview.Canvas>
              <Preview.Code html={code.anchoredUsage} collapsedHtml={code.anchoredUsageBody} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-provider" title="ToastProvider">
            <PropsTable rows={PROVIDER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-toast-channel" title="toast">
            <PropsTable rows={TOAST_CHANNEL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-use-toast-manager" title="useToastManager">
            <PropsTable rows={USE_TOAST_MANAGER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-create-toast-manager" title="createToastManager">
            <PropsTable rows={CREATE_TOAST_MANAGER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-portal" title="ToastPortal">
            <PropsTable rows={PORTAL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-viewport" title="ToastViewport">
            <PropsTable rows={VIEWPORT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-positioner" title="ToastPositioner">
            <PropsTable rows={POSITIONER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-arrow" title="ToastArrow">
            <PropsTable rows={ARROW_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-root" title="ToastRoot">
            <PropsTable rows={ROOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-content" title="ToastContent">
            <PropsTable rows={CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-actions" title="ToastActions">
            <PropsTable rows={ACTIONS_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-title" title="ToastTitle">
            <PropsTable rows={TITLE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-description" title="ToastDescription">
            <PropsTable rows={DESCRIPTION_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-action" title="ToastAction">
            <PropsTable rows={ACTION_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-close" title="ToastClose">
            <PropsTable rows={CLOSE_PROPS} />
          </DocSubsection>
        </div>
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
