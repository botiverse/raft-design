import { createFileRoute } from "@tanstack/react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  InlineCode,
  Text,
} from "raft-ui";
import { useState } from "react";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { createCompositionSnippetMap, createCompositionSourceMap } from "#/lib/composition-code.ts";
import { highlightSnippets } from "#/lib/highlight.tsx";
import confirmActionCompositionSource from "#/modules/alert-dialog/compositions/confirm-action.composition.tsx?raw";
import { ConfirmActionAlertDialogComposition } from "#/modules/alert-dialog/compositions/confirm-action.composition.tsx";
import typedDeleteCompositionSource from "#/modules/alert-dialog/compositions/typed-delete.composition.tsx?raw";
import { TypedDeleteAlertDialogComposition } from "#/modules/alert-dialog/compositions/typed-delete.composition.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  preview: `import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from "raft-ui";

<AlertDialog>
  <AlertDialogTrigger render={<Button variant="danger" />}>
    Delete task
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Task</AlertDialogTitle>
      <AlertDialogClose />
    </AlertDialogHeader>
    <AlertDialogBody className="grid gap-2">
      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
      <p className="m-0 text-sm leading-5 text-foreground/60">
        Delete task <strong className="font-bold text-foreground">#42</strong>{" "}
        <strong className="font-bold text-foreground">"Review dialog migration"</strong>?
      </p>
    </AlertDialogBody>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction variant="danger" size="sm">
        Delete Task
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`,
  anatomy: `import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "raft-ui";

<AlertDialog>
  <AlertDialogTrigger />
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle />
      <AlertDialogClose />
    </AlertDialogHeader>
    <AlertDialogBody>
      <AlertDialogDescription />
    </AlertDialogBody>
    <AlertDialogFooter>
      <AlertDialogCancel />
      <AlertDialogAction />
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`,
} as const;

const ROOT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Dialog.Root.Props",
    description: "Owns modal state for destructive or irreversible confirmation flows.",
  },
];

const TRIGGER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Dialog.Trigger.Props",
    description: "Opens the alert dialog. Compose a Button through render.",
  },
];

const CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "overlay",
    type: "false | AlertDialogOverlayProps",
    description: "Pass false for framed previews; otherwise renders the themed backdrop.",
  },
  {
    name: "...props",
    type: "Base UI Dialog.Popup.Props",
    description: "Portaled centered alertdialog surface. Use className for one-off width changes.",
  },
];

const ACTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "ButtonProps",
    description: "The confirming action button.",
  },
];

const PORTAL_PROPS: readonly PropRow[] = [
  {
    name: "container",
    type: "HTMLElement | RefObject | null",
    description: "Custom portal container for framed previews or contained overlays.",
  },
  {
    name: "...props",
    type: "Base UI Dialog.Portal.Props",
    description: "Portals the alert dialog to the body or a custom container.",
  },
];

const OVERLAY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Dialog.Backdrop.Props",
    description: "Backdrop behind the alert dialog while it is open.",
  },
];

const HEADER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"div">',
    description: "Top region for the alert title and description.",
  },
];

const BODY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"div">',
    description: "Main content area between header and actions.",
  },
];

const FOOTER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"div">',
    description: "Bottom region for cancel and confirm actions.",
  },
];

const TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Dialog.Title.Props",
    description: "Accessible alert heading.",
  },
];

const DESCRIPTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Dialog.Description.Props",
    description: "Accessible supporting copy for the alert.",
  },
];

const CLOSE_PROPS: readonly PropRow[] = [
  {
    name: "variant",
    type: "Button variant",
    description: "Button styling for the close control.",
  },
  {
    name: "size",
    type: "Button size",
    description: "Button size for the close control.",
  },
  {
    name: "...props",
    type: "Base UI Dialog.Close.Props",
    description:
      "Closes the alert dialog. Compose your own visual affordance with render/className.",
  },
];

const CANCEL_PROPS: readonly PropRow[] = [
  {
    name: "variant",
    type: "Button variant",
    default: "outline",
    description: "Button styling for the cancelling close action.",
  },
  {
    name: "size",
    type: "Button size",
    default: "sm",
    description: "Button size for the cancelling close action.",
  },
  {
    name: "...props",
    type: "Base UI Dialog.Close.Props",
    description: "The cancelling close action.",
  },
];
const ALERT_DIALOG_COMPOSITION_RAW_SOURCES = {
  DeleteServer: typedDeleteCompositionSource,
  ConfirmAction: confirmActionCompositionSource,
} as const;

const ALERT_DIALOG_COMPOSITION_SOURCES = createCompositionSourceMap(
  ALERT_DIALOG_COMPOSITION_RAW_SOURCES,
);

const ALERT_DIALOG_COMPOSITION_SNIPPET_IDS = {
  DeleteServer: "alertDialogDeleteServerComposition",
  ConfirmAction: "alertDialogConfirmActionComposition",
} as const;

export const Route = createFileRoute("/components/alert-dialog")({
  component: AlertDialogDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        ...createCompositionSnippetMap(
          ALERT_DIALOG_COMPOSITION_SOURCES,
          ALERT_DIALOG_COMPOSITION_SNIPPET_IDS,
        ),
      },
    }),
});

function AlertDialogDoc() {
  const code = Route.useLoaderData();
  const [open, setOpen] = useState(false);

  return (
    <DocPage
      title="AlertDialog"
      description="A modal confirmation surface for irreversible or destructive actions."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview>
          <Preview.Canvas>
            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger render={<Button variant="danger" />}>
                Delete task
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Task</AlertDialogTitle>
                  <AlertDialogClose />
                </AlertDialogHeader>
                <AlertDialogBody className="grid gap-2">
                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                  <p className="m-0 text-sm leading-5 text-foreground/60">
                    Delete task <strong className="font-bold text-foreground">#42</strong>{" "}
                    <strong className="font-bold text-foreground">"Review dialog migration"</strong>
                    ?
                  </p>
                </AlertDialogBody>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction variant="danger" size="sm">
                    Delete Task
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Preview.Canvas>
          <Preview.Code html={code.preview} collapsedHtml={code.previewBody} />
        </Preview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <div className="grid gap-4">
          <Text.Sans size="body" variant="placeholder" className="max-w-3xl">
            Use <InlineCode>AlertDialog</InlineCode> for destructive confirmation, irreversible
            changes, and typed-delete flows. Use <InlineCode>Dialog</InlineCode> for editable forms
            and non-destructive modal content.
          </Text.Sans>
          <DocsCodeBlock>
            <DocsCodeBlock.Body>
              <DocsCodeBlock.Content html={code.anatomy} />
            </DocsCodeBlock.Body>
          </DocsCodeBlock>
        </div>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-10">
          <DocSubsection parentId="usage" id="typed-delete" title="Typed delete">
            <Preview previewClassName="items-stretch">
              <Preview.Canvas>
                <TypedDeleteAlertDialogComposition />
              </Preview.Canvas>
              <Preview.Code
                html={code.alertDialogDeleteServerComposition}
                collapsedHtml={code.alertDialogDeleteServerCompositionBody}
              />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="confirm-action" title="Confirm action">
            <Preview previewClassName="items-stretch">
              <Preview.Canvas>
                <ConfirmActionAlertDialogComposition />
              </Preview.Canvas>
              <Preview.Code
                html={code.alertDialogConfirmActionComposition}
                collapsedHtml={code.alertDialogConfirmActionCompositionBody}
              />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-root" title="AlertDialog">
            <PropsTable rows={ROOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-trigger" title="AlertDialogTrigger">
            <PropsTable rows={TRIGGER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-portal" title="AlertDialogPortal">
            <PropsTable rows={PORTAL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-content" title="AlertDialogContent">
            <PropsTable rows={CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-overlay" title="AlertDialogOverlay">
            <PropsTable rows={OVERLAY_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-header" title="AlertDialogHeader">
            <PropsTable rows={HEADER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-body" title="AlertDialogBody">
            <PropsTable rows={BODY_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-footer" title="AlertDialogFooter">
            <PropsTable rows={FOOTER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-title" title="AlertDialogTitle">
            <PropsTable rows={TITLE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-description" title="AlertDialogDescription">
            <PropsTable rows={DESCRIPTION_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-close" title="AlertDialogClose">
            <PropsTable rows={CLOSE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-action" title="AlertDialogAction">
            <PropsTable rows={ACTION_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-cancel" title="AlertDialogCancel">
            <PropsTable rows={CANCEL_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
