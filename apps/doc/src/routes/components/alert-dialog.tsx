import { createFileRoute } from "@tanstack/react-router";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";
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
} from "raft-ui";
import { Button, Text } from "raft-ui";
import { AlertTriangle, X } from "lucide-react";
import { useState, type ReactNode } from "react";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import {
  createCompositionPanelProps,
  createCompositionSnippetMap,
  createCompositionSourceMap,
} from "#/lib/source-comparison-code.ts";
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
  { id: "source-comparison", title: "Source comparison" },
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
  anatomy: `<AlertDialog>
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

const CANCEL_PROPS: readonly PropRow[] = [
  {
    name: "variant / size",
    type: "Button variant / size",
    default: "outline / sm",
    description: "Button styling for the cancelling close action.",
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

const ALERT_DIALOG_COMPOSITION_PATHS = {
  DeleteServer: "apps/doc/src/modules/alert-dialog/compositions/typed-delete.composition.tsx",
  ConfirmAction: "apps/doc/src/modules/alert-dialog/compositions/confirm-action.composition.tsx",
} as const;

type AlertDialogCompositionKey = keyof typeof ALERT_DIALOG_COMPOSITION_SOURCES;

function compositionPanelProps(
  code: Record<string, ReactNode | AnyRenderableServerComponent>,
  key: AlertDialogCompositionKey,
) {
  return createCompositionPanelProps({
    code,
    key,
    paths: ALERT_DIALOG_COMPOSITION_PATHS,
    snippetIds: ALERT_DIALOG_COMPOSITION_SNIPPET_IDS,
    sources: ALERT_DIALOG_COMPOSITION_SOURCES,
  });
}

function SourceButton({
  children,
  tone = "white",
  size = "sm",
  className,
}: {
  children: ReactNode;
  tone?: "white" | "red";
  size?: "xs" | "sm";
  className?: string;
}) {
  const toneClass = {
    white: "bg-white",
    red: "bg-[oklch(0.711_0.168_28.04)]",
  }[tone];
  const sizeClass = {
    xs: "px-3 py-1.5 text-xs",
    sm: "px-4 py-2 text-sm",
  }[size];

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 border-2 border-black ${toneClass} ${sizeClass} font-bold shadow-[2px_2px_0_#000] ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

function SourceModalCard({
  title,
  children,
  footer,
  closeButton = false,
}: {
  title: string;
  children: ReactNode;
  footer: ReactNode;
  closeButton?: boolean;
}) {
  return (
    <div className="min-w-0 w-full max-w-sm border-2 border-black bg-white p-6 font-sans text-black shadow-[6px_6px_0_#000]">
      {closeButton ? (
        <div className="mb-4 flex items-center justify-between">
          <h3 className="m-0 text-lg font-bold uppercase leading-none">{title}</h3>
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center border-2 border-black bg-white shadow-[2px_2px_0_#000]"
          >
            <X className="size-5" />
          </button>
        </div>
      ) : (
        <h3 className="m-0 text-lg font-bold uppercase leading-none">{title}</h3>
      )}
      <div className={closeButton ? undefined : "mt-4"}>{children}</div>
      <div className="mt-5 flex justify-end gap-3">{footer}</div>
    </div>
  );
}

function SourceBanner({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 border-2 border-black bg-[oklch(0.711_0.168_28.04_/_0.2)] p-3 text-sm font-bold text-black">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function SourceInput({ placeholder }: { placeholder?: string }) {
  return (
    <input
      readOnly
      placeholder={placeholder}
      className="h-10 w-full border-2 border-black bg-white px-3 font-mono text-sm shadow-[2px_2px_0_#000]"
    />
  );
}

function SourceDeleteServer() {
  return (
    <SourceModalCard
      title="Delete Server"
      closeButton
      footer={
        <>
          <SourceButton size="xs">Cancel</SourceButton>
          <SourceButton tone="red" size="xs" className="opacity-50">
            Delete Server
          </SourceButton>
        </>
      }
    >
      <div className="grid gap-5">
        <SourceBanner>
          This will permanently delete <span className="font-bold">Raft</span> and all its data
          (agents, channels, messages). This cannot be undone.
        </SourceBanner>
        <div>
          <p className="mb-2 mt-0 text-sm text-black/60">
            Type <span className="font-mono font-bold text-black">raft</span> to confirm:
          </p>
          <SourceInput placeholder="raft" />
        </div>
      </div>
    </SourceModalCard>
  );
}

function SourceConfirmAction() {
  return (
    <SourceModalCard
      title="Delete Task"
      closeButton
      footer={
        <>
          <SourceButton>Cancel</SourceButton>
          <SourceButton tone="red">Delete Task</SourceButton>
        </>
      }
    >
      <SourceBanner>Delete task #42 "Review dialog migration"? This cannot be undone.</SourceBanner>
    </SourceModalCard>
  );
}

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
          <Preview.Code html={code.preview} />
        </Preview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <div className="grid gap-4">
          <Text.Sans size="body" variant="placeholder" className="max-w-3xl">
            Use AlertDialog for destructive confirmation, irreversible changes, and typed-delete
            flows. Use Dialog for editable forms and non-destructive modal content.
          </Text.Sans>
          <DocsCodeBlock>
            <DocsCodeBlock.Body>
              <DocsCodeBlock.Content html={code.anatomy} />
            </DocsCodeBlock.Body>
          </DocsCodeBlock>
        </div>
      </DocSection>

      <DocSection id="usage" title="Usage" showThemeSwitcher>
        <div className="space-y-10">
          <DocSubsection parentId="usage" id="typed-delete" title="Typed delete">
            <Preview previewClassName="items-stretch">
              <Preview.Canvas>
                <TypedDeleteAlertDialogComposition />
              </Preview.Canvas>
              <Preview.Code html={code.alertDialogDeleteServerComposition} />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="confirm-action" title="Confirm action">
            <Preview previewClassName="items-stretch">
              <Preview.Canvas>
                <ConfirmActionAlertDialogComposition />
              </Preview.Canvas>
              <Preview.Code html={code.alertDialogConfirmActionComposition} />
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
          <DocSubsection parentId="api" id="api-content" title="AlertDialogContent">
            <PropsTable rows={CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-action" title="AlertDialogAction">
            <PropsTable rows={ACTION_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-cancel" title="AlertDialogCancel">
            <PropsTable rows={CANCEL_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          previewSize="tall"
          items={[
            {
              id: "source-comparison-delete-server",
              label: "Delete server",
              note: "Source used an inline Modal when the user must type the server slug to delete a server. Current maps it to AlertDialog.",
              source: <SourceDeleteServer />,
              brutal: <TypedDeleteAlertDialogComposition />,
              elegant: <TypedDeleteAlertDialogComposition />,
              elegantDark: <TypedDeleteAlertDialogComposition />,
              sourceScenes: [
                {
                  label: "Delete server typed confirmation",
                  scenes: [
                    {
                      label: "SettingsPanel.tsx:2319",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/settings/SettingsPanel.tsx:2319",
                    },
                  ],
                },
              ],
              ...compositionPanelProps(code, "DeleteServer"),
            },
            {
              id: "source-comparison-confirm-action",
              label: "Confirm action",
              note: "Source ConfirmDialog is a destructive modal confirm. Current maps it to AlertDialog.",
              source: <SourceConfirmAction />,
              brutal: <ConfirmActionAlertDialogComposition />,
              elegant: <ConfirmActionAlertDialogComposition />,
              elegantDark: <ConfirmActionAlertDialogComposition />,
              sourceScenes: [
                {
                  label: "ConfirmDialog call sites",
                  scenes: [
                    {
                      label: "ConfirmDialog.tsx:53",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/ConfirmDialog.tsx:53",
                    },
                    {
                      label: "TaskItem.tsx:172",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/task/TaskItem.tsx:172",
                    },
                    {
                      label: "ChatPanel.tsx:866",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/ChatPanel.tsx:866",
                    },
                    {
                      label: "AgentDetailPanel.tsx:1961,1973",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/AgentDetailPanel.tsx:1961,1973",
                    },
                    {
                      label: "MachineDetailPanel.tsx:559,963",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/machine/MachineDetailPanel.tsx:559,963",
                    },
                    {
                      label: "SettingsPanel.tsx:535,1434,1618,2303",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/settings/SettingsPanel.tsx:535,1434,1618,2303",
                    },
                    {
                      label: "SOSDialog.tsx:55",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/SOSDialog.tsx:55",
                    },
                    {
                      label: "ReportIssueDialog.tsx:246,276",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/ReportIssueDialog.tsx:246,276",
                    },
                    {
                      label: "HumanDetailPanel.tsx:551",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/member/HumanDetailPanel.tsx:551",
                    },
                    {
                      label: "Sidebar.tsx:1926,1955,1975,1995",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/layout/Sidebar.tsx:1926,1955,1975,1995",
                    },
                  ],
                },
              ],
              ...compositionPanelProps(code, "ConfirmAction"),
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
