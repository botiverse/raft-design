import { createFileRoute } from "@tanstack/react-router";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Banner,
  BannerDescription,
  Button,
  Text,
} from "raft-ui";
import { AlertTriangle } from "lucide-react";
import { useState, type ReactNode } from "react";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import {
  createCompositionPanelProps,
  createCompositionSnippetMap,
  createCompositionSourceMap,
} from "#/lib/source-comparison-code.ts";
import { highlightSnippets } from "#/lib/highlight.tsx";
import confirmActionCompositionSource from "#/compositions/alert-dialog/confirm-action-composition.tsx?raw";
import { ConfirmActionAlertDialogComposition } from "#/compositions/alert-dialog/confirm-action-composition.tsx";
import typedDeleteCompositionSource from "#/compositions/alert-dialog/typed-delete-composition.tsx?raw";
import { TypedDeleteAlertDialogComposition } from "#/compositions/alert-dialog/typed-delete-composition.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "structure", title: "Structure" },
  { id: "api", title: "API" },
  {
    id: "source-comparison",
    title: "Source comparison",
    children: [
      { id: "source-comparison-typed-delete", title: "Typed delete" },
      { id: "source-comparison-confirm-action", title: "Confirm action" },
    ],
  },
] as const;

const SNIPPETS = {
  anatomy: `import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Banner,
  BannerDescription,
  Button,
} from "raft-ui";

<AlertDialog>
  <AlertDialogTrigger render={<Button variant="danger" />}>
    Delete task
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Task</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogBody>
      <Banner status="destructive" size="md">
        <BannerDescription>
          Delete task #42 "Review dialog migration"?
        </BannerDescription>
      </Banner>
    </AlertDialogBody>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction variant="danger" size="sm">
        Delete Task
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`,
  structure: `<AlertDialog>
  <AlertDialogTrigger />
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle />
      <AlertDialogDescription />
    </AlertDialogHeader>
    <AlertDialogBody />
    <AlertDialogFooter>
      <AlertDialogCancel />
      <AlertDialogAction />
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "AlertDialog",
    type: "Base UI Dialog.Root.Props",
    description: "Owns modal state for destructive or irreversible confirmation flows.",
  },
  {
    name: "AlertDialogTrigger",
    type: "Base UI Dialog.Trigger.Props",
    description: "Opens the alert dialog. Compose a Button through render.",
  },
  {
    name: "AlertDialogContent",
    type: "Base UI Dialog.Popup.Props",
    description: "Portaled centered alertdialog surface. Pass size for sm/md width.",
  },
  {
    name: "AlertDialogContent.overlay",
    type: "false | AlertDialogOverlayProps",
    description: "Pass false for framed previews; otherwise renders the themed backdrop.",
  },
  {
    name: "AlertDialogAction",
    type: "ButtonProps",
    description: "The confirming action button.",
  },
  {
    name: "AlertDialogCancel",
    type: "Base UI Dialog.Close.Props + Button variant/size",
    description: "The cancelling close action. Defaults to outline / sm.",
  },
];

const ALERT_DIALOG_COMPOSITION_RAW_SOURCES = {
  TypedDelete: typedDeleteCompositionSource,
  ConfirmAction: confirmActionCompositionSource,
} as const;

const ALERT_DIALOG_COMPOSITION_SOURCES = createCompositionSourceMap(
  ALERT_DIALOG_COMPOSITION_RAW_SOURCES,
);

const ALERT_DIALOG_COMPOSITION_SNIPPET_IDS = {
  TypedDelete: "alertDialogTypedDeleteComposition",
  ConfirmAction: "alertDialogConfirmActionComposition",
} as const;

const ALERT_DIALOG_COMPOSITION_PATHS = {
  TypedDelete: "apps/doc/src/compositions/alert-dialog/typed-delete-composition.tsx",
  ConfirmAction: "apps/doc/src/compositions/alert-dialog/confirm-action-composition.tsx",
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
}: {
  title: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="min-w-0 w-full max-w-sm border-2 border-black bg-white p-6 font-sans text-black shadow-[6px_6px_0_#000]">
      <h3 className="m-0 text-lg font-bold uppercase leading-none">{title}</h3>
      <div className="mt-4">{children}</div>
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
      className="h-10 w-full border-2 border-black bg-white px-3 text-sm shadow-[2px_2px_0_#000]"
    />
  );
}

function SourceTypedDelete() {
  return (
    <SourceModalCard
      title="Delete Server"
      footer={
        <>
          <SourceButton size="xs">Cancel</SourceButton>
          <SourceButton tone="red" size="xs" className="opacity-50">
            Delete Server
          </SourceButton>
        </>
      }
    >
      <div className="grid gap-4">
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
      <DocSection id="preview" title="Preview">
        <Example html={code.anatomy}>
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger render={<Button variant="danger" />}>
              Delete task
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Task</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogBody>
                <Banner status="destructive" size="md">
                  <BannerDescription>Delete task #42 "Review dialog migration"?</BannerDescription>
                </Banner>
              </AlertDialogBody>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="danger" size="sm">
                  Delete Task
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Example>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="AlertDialog.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
        />
      </DocSection>

      <DocSection id="structure" title="Structure">
        <div className="grid gap-4">
          <Text.Sans size="body" variant="placeholder" className="max-w-3xl">
            Use AlertDialog for destructive confirmation, irreversible changes, and typed-delete
            flows. Use Dialog for editable forms and non-destructive modal content.
          </Text.Sans>
          <DocsCodeBlock.Panel
            path="AlertDialogStructure.tsx"
            source={SNIPPETS.structure}
            html={code.structure}
            collapsedHtml={code.structureBody}
          />
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          previewSize="tall"
          items={[
            {
              id: "source-comparison-typed-delete",
              label: "Typed delete",
              note: "Source used an inline Modal when the user must type the server slug. Current maps it to AlertDialog.",
              source: <SourceTypedDelete />,
              brutal: <TypedDeleteAlertDialogComposition />,
              elegant: <TypedDeleteAlertDialogComposition />,
              elegantDark: <TypedDeleteAlertDialogComposition />,
              sourceScenes: [
                {
                  label: "Typed destructive confirmation",
                  scenes: [
                    {
                      label: "SettingsPanel.tsx:2319",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/settings/SettingsPanel.tsx:2319",
                    },
                  ],
                },
              ],
              ...compositionPanelProps(code, "TypedDelete"),
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
