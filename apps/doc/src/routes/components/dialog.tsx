import { createFileRoute } from "@tanstack/react-router";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "raft-ui";
import { Button, Field, FieldDescription, FieldLabel, Input, Text, Textarea } from "raft-ui";
import { cn } from "raft-ui/cn";
import {
  AlertTriangle,
  Archive,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  EyeOff,
  Hash,
  Link2,
  Lock,
  Mail,
  Monitor,
  RotateCcw,
  Search,
  Terminal,
  Trash2,
  X,
  Download,
} from "lucide-react";
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
import addMachineCompositionSource from "#/modules/dialog/compositions/add-machine.composition.tsx?raw";
import { AddMachineDialogComposition } from "#/modules/dialog/compositions/add-machine.composition.tsx";
import agreementCompositionSource from "#/modules/dialog/compositions/agreement.composition.tsx?raw";
import { AgreementDialogComposition } from "#/modules/dialog/compositions/agreement.composition.tsx";
import announcementCompositionSource from "#/modules/dialog/compositions/announcement.composition.tsx?raw";
import { AnnouncementDialogComposition } from "#/modules/dialog/compositions/announcement.composition.tsx";
import attachmentPreviewCompositionSource from "#/modules/dialog/compositions/attachment-preview.composition.tsx?raw";
import { AttachmentPreviewDialogComposition } from "#/modules/dialog/compositions/attachment-preview.composition.tsx";
import createAgentCompositionSource from "#/modules/dialog/compositions/create-agent.composition.tsx?raw";
import { CreateAgentDialogComposition } from "#/modules/dialog/compositions/create-agent.composition.tsx";
import createChannelCompositionSource from "#/modules/dialog/compositions/create-channel.composition.tsx?raw";
import { CreateChannelDialogComposition } from "#/modules/dialog/compositions/create-channel.composition.tsx";
import editChannelCompositionSource from "#/modules/dialog/compositions/edit-channel.composition.tsx?raw";
import { EditChannelDialogComposition } from "#/modules/dialog/compositions/edit-channel.composition.tsx";
import editChannelManagementCompositionSource from "#/modules/dialog/compositions/edit-channel-management.composition.tsx?raw";
import { EditChannelManagementDialogComposition } from "#/modules/dialog/compositions/edit-channel-management.composition.tsx";
import inviteHumanCompositionSource from "#/modules/dialog/compositions/invite-human.composition.tsx?raw";
import { InviteHumanDialogComposition } from "#/modules/dialog/compositions/invite-human.composition.tsx";
import onboardingCompositionSource from "#/modules/dialog/compositions/onboarding.composition.tsx?raw";
import { OnboardingDialogComposition } from "#/modules/dialog/compositions/onboarding.composition.tsx";
import resetAgentCompositionSource from "#/modules/dialog/compositions/reset-agent.composition.tsx?raw";
import { ResetAgentDialogComposition } from "#/modules/dialog/compositions/reset-agent.composition.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SNIPPETS = {
  preview: `import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldDescription,
  FieldLabel,
  Input,
  Textarea,
} from "raft-ui";

<Dialog>
  <DialogTrigger render={<Button variant="primary" />}>
    Edit channel
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Channel</DialogTitle>
      <DialogClose />
    </DialogHeader>
    <DialogBody className="grid gap-4">
      <DialogDescription className="pb-1">
        Update the channel name and short description.
      </DialogDescription>
      <Field>
        <FieldLabel htmlFor="channel-name">Name</FieldLabel>
        <Input id="channel-name" defaultValue="design-system" />
        <FieldDescription>Shown in the sidebar and message header.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="channel-description">Description</FieldLabel>
        <Textarea id="channel-description" className="min-h-20" />
      </Field>
    </DialogBody>
    <DialogFooter>
      <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
      <Button variant="primary">Save Changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`,
  anatomy: `<Dialog>
  <DialogTrigger />
  <DialogContent>
    <DialogHeader>
      <div>
        <DialogTitle />
        <DialogDescription />
      </div>
      <DialogClose />
    </DialogHeader>
    <DialogBody />
    <DialogFooter>
      <DialogClose />
    </DialogFooter>
  </DialogContent>
</Dialog>`,
} as const;

const ROOT_PROPS: readonly PropRow[] = [
  {
    name: "Dialog",
    type: "Base UI Dialog.Root.Props",
    description: "Owns open state, focus trap, Escape close, outside press, and modal behavior.",
  },
];

const TRIGGER_PROPS: readonly PropRow[] = [
  {
    name: "DialogTrigger",
    type: "Base UI Dialog.Trigger.Props",
    description: "Opens the dialog. Compose a Button through render when the trigger is visible.",
  },
];

const CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "DialogContent",
    type: "Base UI Dialog.Popup.Props",
    description: "Portaled centered dialog surface. Use className for width and one-off layouts.",
  },
  {
    name: "DialogContent.overlay",
    type: "false | DialogOverlayProps",
    description: "Pass false for framed previews; otherwise renders the themed backdrop.",
  },
];

const LAYOUT_PROPS: readonly PropRow[] = [
  {
    name: "DialogHeader / DialogBody / DialogFooter",
    type: "div props",
    description:
      "Header defaults to title/action columns. Footer defaults to an aligned action row.",
  },
  {
    name: "DialogTitle / DialogDescription",
    type: "Base UI title / description props",
    description: "Accessible title and supporting description.",
  },
  {
    name: "DialogClose",
    type: "Base UI Dialog.Close.Props + Button variant/size",
    description:
      "Closes the dialog. Defaults to a themed icon button; pass render for footer actions.",
  },
];

const DIALOG_COMPOSITION_RAW_SOURCES = {
  EditChannel: editChannelCompositionSource,
  EditChannelManagement: editChannelManagementCompositionSource,
  InviteHuman: inviteHumanCompositionSource,
  CreateChannel: createChannelCompositionSource,
  CreateAgent: createAgentCompositionSource,
  AddMachine: addMachineCompositionSource,
  AttachmentPreview: attachmentPreviewCompositionSource,
  ResetAgent: resetAgentCompositionSource,
  Agreement: agreementCompositionSource,
  Onboarding: onboardingCompositionSource,
  Announcement: announcementCompositionSource,
} as const;

const DIALOG_COMPOSITION_SOURCES = createCompositionSourceMap(DIALOG_COMPOSITION_RAW_SOURCES);

const DIALOG_COMPOSITION_SNIPPET_IDS = {
  EditChannel: "dialogEditChannelComposition",
  EditChannelManagement: "dialogEditChannelManagementComposition",
  InviteHuman: "dialogInviteHumanComposition",
  CreateChannel: "dialogCreateChannelComposition",
  CreateAgent: "dialogCreateAgentComposition",
  AddMachine: "dialogAddMachineComposition",
  AttachmentPreview: "dialogAttachmentPreviewComposition",
  ResetAgent: "dialogResetAgentComposition",
  Agreement: "dialogAgreementComposition",
  Onboarding: "dialogOnboardingComposition",
  Announcement: "dialogAnnouncementComposition",
} as const;

const DIALOG_COMPOSITION_PATHS = {
  EditChannel: "apps/doc/src/modules/dialog/compositions/edit-channel.composition.tsx",
  EditChannelManagement:
    "apps/doc/src/modules/dialog/compositions/edit-channel-management.composition.tsx",
  InviteHuman: "apps/doc/src/modules/dialog/compositions/invite-human.composition.tsx",
  CreateChannel: "apps/doc/src/modules/dialog/compositions/create-channel.composition.tsx",
  CreateAgent: "apps/doc/src/modules/dialog/compositions/create-agent.composition.tsx",
  AddMachine: "apps/doc/src/modules/dialog/compositions/add-machine.composition.tsx",
  AttachmentPreview: "apps/doc/src/modules/dialog/compositions/attachment-preview.composition.tsx",
  ResetAgent: "apps/doc/src/modules/dialog/compositions/reset-agent.composition.tsx",
  Agreement: "apps/doc/src/modules/dialog/compositions/agreement.composition.tsx",
  Onboarding: "apps/doc/src/modules/dialog/compositions/onboarding.composition.tsx",
  Announcement: "apps/doc/src/modules/dialog/compositions/announcement.composition.tsx",
} as const;

const DIALOG_USAGE_ITEMS = [
  {
    id: "edit-channel",
    title: "Edit channel",
    codeKey: DIALOG_COMPOSITION_SNIPPET_IDS.EditChannel,
    preview: <EditChannelDialogComposition />,
  },
  {
    id: "edit-channel-actions",
    title: "Edit channel actions",
    codeKey: DIALOG_COMPOSITION_SNIPPET_IDS.EditChannelManagement,
    preview: <EditChannelManagementDialogComposition />,
  },
  {
    id: "invite-human",
    title: "Invite human",
    codeKey: DIALOG_COMPOSITION_SNIPPET_IDS.InviteHuman,
    preview: <InviteHumanDialogComposition />,
  },
  {
    id: "add-computer",
    title: "Add computer",
    codeKey: DIALOG_COMPOSITION_SNIPPET_IDS.AddMachine,
    preview: <AddMachineDialogComposition />,
  },
  {
    id: "attachment-preview",
    title: "Attachment preview",
    codeKey: DIALOG_COMPOSITION_SNIPPET_IDS.AttachmentPreview,
    preview: <AttachmentPreviewDialogComposition />,
  },
  {
    id: "announcement",
    title: "Announcement",
    codeKey: DIALOG_COMPOSITION_SNIPPET_IDS.Announcement,
    preview: <AnnouncementDialogComposition />,
  },
  {
    id: "create-channel",
    title: "Create channel",
    codeKey: DIALOG_COMPOSITION_SNIPPET_IDS.CreateChannel,
    preview: <CreateChannelDialogComposition />,
  },
  {
    id: "create-agent",
    title: "Create agent",
    codeKey: DIALOG_COMPOSITION_SNIPPET_IDS.CreateAgent,
    preview: <CreateAgentDialogComposition />,
  },
  {
    id: "reset-agent",
    title: "Reset agent",
    codeKey: DIALOG_COMPOSITION_SNIPPET_IDS.ResetAgent,
    preview: <ResetAgentDialogComposition />,
  },
  {
    id: "agreement",
    title: "Agreement",
    codeKey: DIALOG_COMPOSITION_SNIPPET_IDS.Agreement,
    preview: <AgreementDialogComposition />,
  },
  {
    id: "onboarding",
    title: "Onboarding",
    codeKey: DIALOG_COMPOSITION_SNIPPET_IDS.Onboarding,
    preview: <OnboardingDialogComposition />,
  },
] as const;

type DialogCompositionKey = keyof typeof DIALOG_COMPOSITION_SOURCES;

const modalComparisonPreviewClassName = "px-0 py-0";

function compositionPanelProps(
  code: Record<string, ReactNode | AnyRenderableServerComponent>,
  key: DialogCompositionKey,
) {
  return createCompositionPanelProps({
    code,
    key,
    paths: DIALOG_COMPOSITION_PATHS,
    snippetIds: DIALOG_COMPOSITION_SNIPPET_IDS,
    sources: DIALOG_COMPOSITION_SOURCES,
  });
}

function SourceModalCard({
  title,
  children,
  footer,
  className,
}: {
  title: string;
  children: ReactNode;
  footer: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-0 w-full max-w-full max-w-md border-2 border-black bg-white p-6 font-sans text-black shadow-[6px_6px_0_#000]",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="m-0 text-lg font-bold uppercase leading-none">{title}</h3>
        <button
          type="button"
          className="border-2 border-black bg-white p-1 shadow-[2px_2px_0_#000]"
        >
          <X className="size-5" />
        </button>
      </div>
      {children}
      <div className="mt-5 flex justify-end gap-3">{footer}</div>
    </div>
  );
}

function SourceButton({
  children,
  tone = "white",
  size = "sm",
  className,
}: {
  children: ReactNode;
  tone?: "white" | "yellow" | "red" | "pink" | "orange" | "lime" | "cyan";
  size?: "xs" | "sm";
  className?: string;
}) {
  const toneClass = {
    white: "bg-white",
    yellow: "bg-[oklch(0.883_0.162_91.89)]",
    red: "bg-[oklch(0.711_0.168_28.04)]",
    pink: "bg-[oklch(0.749_0.162_0.71)]",
    orange: "bg-[oklch(0.785_0.123_50.11)]",
    lime: "bg-[oklch(0.827_0.135_130.07)]",
    cyan: "bg-[oklch(0.783_0.135_219.2)]",
  }[tone];
  const sizeClass = {
    xs: "px-3 py-1.5 text-xs",
    sm: "px-4 py-2 text-sm",
  }[size];
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-1.5 border-2 border-black font-bold shadow-[2px_2px_0_#000]",
        toneClass,
        sizeClass,
        className,
      )}
    >
      {children}
    </button>
  );
}

function SourceIconButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex shrink-0 items-center justify-center border-2 border-black bg-white p-2 shadow-[2px_2px_0_#000]"
    >
      {children}
    </button>
  );
}

function SourceBanner({
  children,
  tone = "warning",
  withIcon,
  className,
}: {
  children: ReactNode;
  tone?: "warning" | "danger" | "info" | "success";
  withIcon?: boolean;
  className?: string;
}) {
  const toneClass = {
    warning: "bg-[oklch(0.785_0.123_50.11)]",
    danger: "bg-[oklch(0.711_0.168_28.04_/_0.2)]",
    info: "bg-[oklch(0.783_0.135_219.2_/_0.2)]",
    success: "bg-[oklch(0.827_0.135_130.07_/_0.3)]",
  }[tone];
  return (
    <div
      className={cn(
        "flex items-start gap-2 border-2 border-black p-3 text-sm font-bold text-black",
        toneClass,
        className,
      )}
    >
      {withIcon ? <AlertTriangle className="mt-0.5 size-4 shrink-0" /> : null}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function SourceField({
  label,
  children,
  helper,
  optional,
  required,
}: {
  label: string;
  children: ReactNode;
  helper?: string;
  optional?: boolean;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-bold uppercase">
        {label}
        {required ? <span className="ml-1 text-[oklch(0.749_0.162_0.71)]">*</span> : null}
        {optional ? <span className="ml-1 text-black/50">(optional)</span> : null}
      </span>
      {children}
      {helper ? <span className="text-xs text-black/60">{helper}</span> : null}
    </label>
  );
}

function SourceInput({
  value,
  placeholder,
  disabled,
}: {
  value?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <input
      readOnly
      disabled={disabled}
      value={value}
      placeholder={placeholder}
      className="h-10 w-full border-2 border-black bg-white px-3 text-sm shadow-[2px_2px_0_#000] disabled:opacity-100"
    />
  );
}

function SourceTextarea({ value, placeholder }: { value?: string; placeholder?: string }) {
  return (
    <textarea
      readOnly
      value={value}
      placeholder={placeholder}
      className="min-h-20 w-full resize-none border-2 border-black bg-white px-3 py-2 text-sm shadow-[2px_2px_0_#000]"
    />
  );
}

function SourceEditChannel() {
  return (
    <div className="min-w-0 w-full max-w-full max-w-md border-2 border-black bg-white p-6 font-sans text-black shadow-[6px_6px_0_#000]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="m-0 text-lg font-bold uppercase leading-none">Edit Channel</h3>
        <button
          type="button"
          className="border-2 border-black bg-white p-1 shadow-[2px_2px_0_#000]"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="grid gap-4">
        <SourceField label="Name" required helper="The #all channel cannot be renamed">
          <SourceInput value="all" disabled />
        </SourceField>
        <SourceField label="Description" optional>
          <SourceTextarea value="General channel for all members" />
        </SourceField>
        <div className="flex justify-end gap-3">
          <SourceButton>Cancel</SourceButton>
          <SourceButton tone="pink">Save Changes</SourceButton>
        </div>
        <div className="border-t-2 border-black pt-5">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-1.5 border-2 border-black bg-[oklch(0.785_0.123_50.11)] px-4 py-2 text-sm font-bold shadow-[2px_2px_0_#000]"
          >
            <EyeOff className="size-4" />
            Hide #all
          </button>
        </div>
      </div>
    </div>
  );
}

function SourceEditChannelManagement() {
  return (
    <div className="min-w-0 w-full max-w-full max-w-md border-2 border-black bg-white p-6 font-sans text-black shadow-[6px_6px_0_#000]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="m-0 text-lg font-bold uppercase leading-none">Edit Channel</h3>
        <button
          type="button"
          className="border-2 border-black bg-white p-1 shadow-[2px_2px_0_#000]"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="grid gap-4">
        <SourceField label="Name" required>
          <SourceInput value="onboarding-willxiang" />
        </SourceField>
        <SourceField label="Description" optional>
          <SourceTextarea value="Owner onboarding workspace (system-managed)." />
        </SourceField>
        <div className="flex justify-end gap-3">
          <SourceButton>Cancel</SourceButton>
          <SourceButton tone="pink">Save Changes</SourceButton>
        </div>
        <div className="border-t-2 border-black pt-5">
          <div className="grid gap-3">
            <SourceButton tone="orange" className="w-full">
              <Lock className="size-4" />
              Make Private
            </SourceButton>
            <SourceButton tone="orange" className="w-full">
              <Archive className="size-4" />
              Archive Channel
            </SourceButton>
            <SourceButton tone="red" className="w-full">
              <Trash2 className="size-4" />
              Delete Channel
            </SourceButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function SourceInviteHuman() {
  return (
    <SourceModalCard
      title="Invite Human"
      className="max-w-[calc(24rem+48px)]"
      footer={
        <>
          <SourceButton>Cancel</SourceButton>
          <SourceButton tone="pink">
            <Mail className="size-3.5" />
            Send invites
          </SourceButton>
        </>
      }
    >
      <div className="grid gap-4">
        <div>
          <label className="mb-1 block text-sm font-bold uppercase tracking-wide text-black">
            Join link
          </label>
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
            <div className="min-w-0 truncate border-2 border-black bg-white px-2 py-2 font-mono text-xs shadow-[2px_2px_0_#000]">
              http://localhost:5173/join/slk_invite_8k2
            </div>
            <SourceIconButton>
              <Copy className="size-3.5" />
            </SourceIconButton>
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-black/50">
            <Link2 className="size-3" />
            Anyone with this link can join this server.
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-bold uppercase tracking-wide text-black">
            Emails
          </label>
          <div className="grid gap-2">
            <SourceInput placeholder="teammate@example.com" />
            <SourceInput placeholder="optional" />
            <SourceInput placeholder="optional" />
          </div>
        </div>
      </div>
    </SourceModalCard>
  );
}

function SourceCreateChannel() {
  return (
    <SourceModalCard
      title="Create Channel"
      footer={
        <>
          <SourceButton>Cancel</SourceButton>
          <SourceButton tone="pink">Create Channel</SourceButton>
        </>
      }
    >
      <div className="grid gap-4">
        <SourceBanner>
          <p className="m-0">
            The name <span className="font-mono">#archive</span> is held by an archived channel.
          </p>
          <p className="m-0 mt-1 text-xs font-normal text-black/70">
            Unarchive it to keep its history, or choose a different name.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <SourceButton tone="lime" size="xs">
              Unarchive
            </SourceButton>
            <SourceButton size="xs">Change name</SourceButton>
          </div>
        </SourceBanner>
        <SourceField label="Name" required>
          <SourceInput placeholder="e.g. ai-research" />
        </SourceField>
        <SourceField label="Description" optional>
          <SourceTextarea placeholder="What is this channel about?" />
        </SourceField>
        <SourceField label="Visibility">
          <div className="flex gap-2">
            <SourceButton tone="yellow" size="xs">
              <Hash className="size-3" />
              Public
            </SourceButton>
            <SourceButton size="xs">
              <Lock className="size-3" />
              Private
            </SourceButton>
          </div>
        </SourceField>
        <SourceField label="Members" optional>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-black/40" />
            <input
              readOnly
              placeholder="Search members by name"
              className="h-10 w-full border-2 border-black bg-white pl-9 pr-3 text-sm shadow-[2px_2px_0_#000]"
            />
          </div>
          <div className="border-2 border-black bg-white shadow-[2px_2px_0_#000]">
            <div className="bg-white/50 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wide text-black/50">
              Agents
            </div>
            {["Atlas", "Mira"].map((member) => (
              <div
                key={member}
                className="flex items-center gap-2 border-t border-black/15 bg-[oklch(0.749_0.162_0.71_/_0.2)] px-3 py-1.5 text-sm font-medium text-black"
              >
                <span className="size-5 border border-black bg-[oklch(0.883_0.162_91.89)]" />
                <span className="min-w-0 flex-1 truncate">{member}</span>
                <Check className="size-3.5 text-[oklch(0.749_0.162_0.71)]" />
              </div>
            ))}
            <div className="border-t border-black/15 bg-white/50 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wide text-black/50">
              Humans
            </div>
            {["Avery", "Sam"].map((member, index) => (
              <div
                key={member}
                className={cn(
                  "flex items-center gap-2 border-t border-black/15 px-3 py-1.5 text-sm font-medium text-black",
                  index === 0 && "bg-[oklch(0.749_0.162_0.71_/_0.2)]",
                )}
              >
                <span className="size-5 border border-black bg-white" />
                <span className="min-w-0 flex-1 truncate">{member}</span>
                {index === 0 ? <Check className="size-3.5 text-[oklch(0.749_0.162_0.71)]" /> : null}
              </div>
            ))}
          </div>
        </SourceField>
      </div>
    </SourceModalCard>
  );
}

function SourceCreateAgent() {
  return (
    <SourceModalCard
      title="Create Agent"
      footer={
        <>
          <SourceButton>Cancel</SourceButton>
          <SourceButton tone="pink">Create Agent</SourceButton>
        </>
      }
    >
      <div className="grid gap-4">
        <SourceField label="Computer" required>
          <div className="flex h-10 items-center justify-between border-2 border-black bg-white px-3 text-sm shadow-[2px_2px_0_#000]">
            <span>Studio Mac (atlas.local)</span>
            <ChevronRight className="size-3 rotate-90" />
          </div>
          <div className="mt-1 text-xs text-black/50">Suggested by the action card.</div>
        </SourceField>
        <SourceField label="Name" required>
          <SourceInput placeholder="e.g. Alice" />
        </SourceField>
        <SourceField label="Description" optional>
          <SourceTextarea placeholder="Leave blank for a general-purpose agent, or describe a role..." />
          <div className="mt-1 text-right font-mono text-xs text-black/50">0/240</div>
        </SourceField>
        <div className="grid gap-2 border-2 border-black bg-white p-3 shadow-[2px_2px_0_#000]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-bold">Runtime</span>
            <span className="font-mono text-xs text-black/50">codex</span>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-black/15 pt-2">
            <span className="text-sm font-bold">Model</span>
            <span className="font-mono text-xs text-black/50">auto</span>
          </div>
          <button type="button" className="mt-1 text-left text-xs font-bold underline">
            Advanced environment
          </button>
        </div>
      </div>
    </SourceModalCard>
  );
}

function SourceAddMachine() {
  const connectCommand =
    "npx @botiverse/raft-daemon@latest --server-url https://api.raft.build --api-key sk_machine_0000000000000000000000000000000000000000000000000000000000000000 # Zolplay";

  return (
    <SourceModalCard
      title="Connect Computer"
      className="max-w-lg"
      footer={
        <>
          <SourceButton>Cancel</SourceButton>
          <SourceButton tone="lime" className="opacity-50">
            Done
          </SourceButton>
        </>
      }
    >
      <div>
        <div className="mb-6 flex items-center gap-2">
          <Terminal className="size-4" />
          <span className="text-sm font-bold">Run this command on your computer to connect:</span>
        </div>
        <div className="mb-7 flex min-w-0 items-center gap-2">
          <code className="min-w-0 flex-1 break-all border-2 border-black bg-black px-3 py-2 font-mono text-xs leading-5 text-[oklch(0.827_0.135_130.07)] shadow-[2px_2px_0_#000]">
            {connectCommand}
          </code>
          <SourceIconButton>
            <Copy className="size-3.5" />
          </SourceIconButton>
        </div>
        <SourceBanner
          tone="warning"
          className="mb-5 items-center bg-[oklch(0.965_0.067_93.6)] px-4 py-3"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="inline-flex size-3 shrink-0 rounded-full border-2 border-[oklch(0.55_0.11_52)] bg-[oklch(0.84_0.08_54)]" />
            <span className="min-w-0">Waiting for computer to connect...</span>
          </span>
        </SourceBanner>
      </div>
    </SourceModalCard>
  );
}

function SourceAttachmentPreview() {
  return (
    <div className="flex h-80 w-full max-w-3xl flex-col overflow-hidden border-2 border-black bg-white font-sans text-black shadow-[6px_6px_0_#000]">
      <div className="safe-top safe-left pointer-events-auto shrink-0 border-b-2 border-black bg-white">
        <div className="flex h-14 items-center gap-3 px-4">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-black">
              diagram-export.html
            </span>
            <span className="shrink-0 rounded-full border border-black/20 bg-black/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-black/60">
              HTML preview
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <SourceIconButton>
              <Download className="size-3.5" />
            </SourceIconButton>
            <SourceIconButton>
              <X className="size-3.5" />
            </SourceIconButton>
          </div>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden bg-white p-4">
        <div className="grid h-full min-h-0 w-full place-items-center border-2 border-black bg-white font-mono text-xs text-black/50 shadow-[2px_2px_0_#000]">
          Sandboxed HTML preview
        </div>
      </div>
    </div>
  );
}

function SourceResetAgent() {
  return (
    <SourceModalCard
      title="Restart Atlas"
      footer={
        <>
          <SourceButton>Cancel</SourceButton>
          <SourceButton tone="red">
            <RotateCcw className="size-3.5" />
            Full Reset & Restart
          </SourceButton>
        </>
      }
    >
      <div className="grid gap-3">
        {[
          {
            title: "Restart",
            description:
              "Stop and restart the agent process. Keeps the runtime session and workspace files.",
            tone: "bg-[oklch(0.783_0.135_219.2_/_0.2)]",
            selected: false,
          },
          {
            title: "Reset Session & Restart",
            description:
              "Clear the runtime session and restart. Workspace files (MEMORY.md, notes/) are preserved.",
            tone: "bg-[oklch(0.785_0.123_50.11_/_0.2)]",
            selected: false,
          },
          {
            title: "Full Reset & Restart",
            description:
              "Clear the runtime session, delete all workspace files, and restart from scratch.",
            tone: "bg-[oklch(0.711_0.168_28.04_/_0.2)]",
            selected: true,
          },
        ].map((option) => (
          <button
            key={option.title}
            type="button"
            className={cn(
              "border-2 p-4 text-left transition-colors",
              option.selected
                ? ["border-black", option.tone, "shadow-[2px_2px_0_#000]"]
                : "border-black/30",
            )}
          >
            <div className="text-sm font-bold uppercase">{option.title}</div>
            <p className="m-0 mt-1 text-xs text-black/60">{option.description}</p>
          </button>
        ))}
        <SourceBanner tone="warning" withIcon>
          This will permanently delete all workspace files including MEMORY.md and notes/. This
          cannot be undone.
        </SourceBanner>
      </div>
    </SourceModalCard>
  );
}

function SourceAgreement() {
  return (
    <div className="min-w-0 w-full max-w-full max-w-lg border-2 border-black bg-white p-5 font-sans text-black shadow-[6px_6px_0_#000]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="m-0 text-lg font-bold leading-tight">Community Guidelines</h3>
          <div className="mt-0.5 text-xs text-black/50">Version 3</div>
        </div>
        <button
          type="button"
          className="shrink-0 border-2 border-black bg-white p-1 shadow-[2px_2px_0_#000]"
        >
          <X className="size-[18px]" />
        </button>
      </div>
      <div className="grid gap-4">
        <div className="max-h-[50vh] overflow-y-auto border-2 border-black bg-white p-4 text-sm">
          <div className="space-y-2 whitespace-pre-wrap break-words">
            <p className="m-0">Before joining, review the workspace rules.</p>
            <ul className="m-0 list-disc space-y-1 pl-5">
              <li>Keep sensitive customer data out of public channels.</li>
              <li>Use design-system components for shared product surfaces.</li>
              <li>Report unsafe automation or missing audit context immediately.</li>
            </ul>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <SourceButton size="xs">Cancel</SourceButton>
          <SourceButton tone="pink" size="xs">
            Agree & Continue
          </SourceButton>
        </div>
      </div>
    </div>
  );
}

function SourceOnboarding() {
  return (
    <div className="min-w-0 w-full max-w-full max-w-lg border-2 border-black bg-white p-6 font-sans text-black shadow-[6px_6px_0_#000]">
      <div className="mb-4">
        <div className="mb-1 font-mono text-[11px] font-bold uppercase tracking-widest text-black/50">
          Meet RAFT
        </div>
        <h3 className="m-0 text-lg font-bold uppercase leading-tight">Add a computer</h3>
      </div>
      <div className="mb-5 flex items-start gap-3">
        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center border-2 border-black bg-[oklch(0.883_0.162_91.89)]">
          <Monitor className="size-[17px]" />
        </div>
        <div className="min-w-0 space-y-2">
          <p className="m-0 text-sm leading-relaxed text-black/70">
            Your agents need somewhere to run. Connect a computer and they&apos;ll come online
            there.
          </p>
          <p className="m-0 text-xs text-black/60">
            Need an agent runtime installed — Codex, Claude Code, or Cursor.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t-2 border-black/20 pt-4">
        <label className="inline-flex min-w-0 select-none items-center gap-1.5">
          <span className="inline-flex size-4 border-2 border-black bg-white shadow-[2px_2px_0_#000]" />
          <span className="truncate text-xs font-bold text-black/60">
            Don&apos;t remind me again
          </span>
        </label>
        <div className="flex shrink-0 items-center gap-2">
          <SourceButton>Skip</SourceButton>
          <SourceButton tone="pink">
            <Monitor className="size-3.5" />
            Add Computer
          </SourceButton>
        </div>
      </div>
    </div>
  );
}

function SourceAnnouncement() {
  return (
    <div className="min-w-0 w-full max-w-full max-w-xl border-2 border-black bg-white font-sans text-black shadow-[6px_6px_0_#000]">
      <div className="flex items-center justify-between gap-3 border-b-2 border-black bg-[oklch(0.883_0.162_91.89)] px-5 py-3">
        <h3 className="m-0 truncate text-lg font-bold uppercase">Workspace Update</h3>
        <button
          type="button"
          className="border-2 border-black bg-white p-1 shadow-[2px_2px_0_#000]"
        >
          <X className="size-5" />
        </button>
      </div>
      <div className="grid gap-3 px-6 py-5 text-sm leading-6">
        <h4 className="m-0 text-base font-bold uppercase">New migration queue</h4>
        <p className="m-0 text-black/70">
          Review newly ready components and compare them against their source scenes before
          migration.
        </p>
        <ul className="m-0 list-disc pl-5 text-black/70">
          <li>Dialog scenes now have a dedicated comparison page.</li>
          <li>Composition code is shown under each case.</li>
        </ul>
      </div>
      <div className="flex items-center justify-between gap-3 border-t-2 border-black px-5 py-3">
        <div className="flex items-center gap-1">
          <span className="size-2 rounded-full border border-black bg-white" />
          <span className="size-2 rounded-full border border-black bg-black" />
          <span className="size-2 rounded-full border border-black bg-white" />
          <span className="ml-2 font-mono text-xs text-black/60">2 / 3</span>
        </div>
        <div className="flex items-center gap-2">
          <SourceButton>
            <ChevronLeft className="inline size-3" /> Back
          </SourceButton>
          <SourceButton tone="pink">
            Next <ChevronRight className="inline size-3" />
          </SourceButton>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/components/dialog")({
  component: DialogDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        ...createCompositionSnippetMap(DIALOG_COMPOSITION_SOURCES, DIALOG_COMPOSITION_SNIPPET_IDS),
      },
    }),
});

function DialogDoc() {
  const code = Route.useLoaderData();
  const [open, setOpen] = useState(false);

  return (
    <DocPage
      title="Dialog"
      description="A centered modal surface for forms, setup steps, announcements, and blocking detail panels."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview>
          <Preview.Canvas>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger render={<Button variant="primary" />}>Edit channel</DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Channel</DialogTitle>
                  <DialogClose />
                </DialogHeader>
                <DialogBody className="grid gap-4">
                  <DialogDescription className="pb-1">
                    Update the channel name and short description.
                  </DialogDescription>
                  <Field>
                    <FieldLabel htmlFor="channel-name">Name</FieldLabel>
                    <Input id="channel-name" defaultValue="design-system" />
                    <FieldDescription>Shown in the sidebar and message header.</FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="channel-description">Description</FieldLabel>
                    <Textarea id="channel-description" className="min-h-20" />
                  </Field>
                </DialogBody>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
                  <Button variant="primary">Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Preview.Canvas>
          <Preview.Code html={code.preview} />
        </Preview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <div className="grid gap-4">
          <Text.Sans size="body" variant="placeholder" className="max-w-3xl">
            Use Dialog for content surfaces that need focus trapping and a centered modal frame. Use
            AlertDialog for irreversible confirms and destructive confirmation flows.
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
          {DIALOG_USAGE_ITEMS.map((item) => (
            <DocSubsection key={item.id} parentId="usage" id={item.id} title={item.title}>
              <Preview previewClassName="items-stretch p-0">
                <Preview.Canvas>{item.preview}</Preview.Canvas>
                <Preview.Code html={code[item.codeKey]} />
              </Preview>
            </DocSubsection>
          ))}
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-root" title="Dialog root">
            <PropsTable rows={ROOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-trigger" title="Trigger">
            <PropsTable rows={TRIGGER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-content" title="Content">
            <PropsTable rows={CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-layout" title="Layout parts">
            <PropsTable rows={LAYOUT_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          previewSize="tall"
          items={[
            {
              id: "source-comparison-edit-channel",
              label: "Edit channel",
              status: "difference",
              note: "Remaining differences: actions are grouped inside DialogBody; current uses Dialog default chrome and themed Button variants instead of exact source post-footer action styling.",
              source: <SourceEditChannel />,
              brutal: <EditChannelDialogComposition />,
              elegant: <EditChannelDialogComposition />,
              elegantDark: <EditChannelDialogComposition />,
              previewClassName: modalComparisonPreviewClassName,
              sourceScenes: [
                {
                  label: "Channel settings dialog",
                  scenes: [
                    {
                      label: "ChatPanel.tsx:706,878",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/ChatPanel.tsx:706,878",
                    },
                    {
                      label: "EditChannelDialog.tsx:128",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/channel/EditChannelDialog.tsx:128",
                    },
                  ],
                },
              ],
              ...compositionPanelProps(code, "EditChannel"),
            },
            {
              id: "source-comparison-edit-channel-management",
              label: "Edit channel actions",
              status: "difference",
              note: "Remaining differences: management actions are grouped inside DialogBody with an Actions separator; source places them below the save footer and uses exact brutal utility colors.",
              source: <SourceEditChannelManagement />,
              brutal: <EditChannelManagementDialogComposition />,
              elegant: <EditChannelManagementDialogComposition />,
              elegantDark: <EditChannelManagementDialogComposition />,
              previewClassName: modalComparisonPreviewClassName,
              sourceScenes: [
                {
                  label: "Channel management actions",
                  scenes: [
                    {
                      label: "EditChannelDialog.tsx:210,266",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/channel/EditChannelDialog.tsx:210,266",
                    },
                  ],
                },
              ],
              ...compositionPanelProps(code, "EditChannelManagement"),
            },
            {
              id: "source-comparison-invite-human",
              label: "Invite human",
              status: "difference",
              note: "Remaining differences: current adds an or separator and Invite more action; elegant uses a token gray URL container while source keeps fixed email rows and source-styled URL input.",
              source: <SourceInviteHuman />,
              brutal: <InviteHumanDialogComposition />,
              elegant: <InviteHumanDialogComposition />,
              elegantDark: <InviteHumanDialogComposition />,
              previewClassName: modalComparisonPreviewClassName,
              sourceScenes: [
                {
                  label: "Invite dialog",
                  scenes: [
                    {
                      label: "InviteHumanDialog.tsx:99",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/member/InviteHumanDialog.tsx:99",
                    },
                    {
                      label: "SettingsPanel.tsx:1428",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/settings/SettingsPanel.tsx:1428",
                    },
                  ],
                },
              ],
              ...compositionPanelProps(code, "InviteHuman"),
            },
            {
              id: "source-comparison-add-machine",
              label: "Add computer",
              status: "difference",
              note: "Remaining differences: current extracts the command row to CopyableCode and renders the waiting state with Banner plus pulsing Status; source keeps the inline install command and live computer connection flow.",
              source: <SourceAddMachine />,
              brutal: <AddMachineDialogComposition />,
              elegant: <AddMachineDialogComposition />,
              elegantDark: <AddMachineDialogComposition />,
              previewClassName: modalComparisonPreviewClassName,
              sourceScenes: [
                {
                  label: "Computer setup dialog",
                  scenes: [
                    {
                      label: "AddMachineDialog.tsx:247-277",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/machine/AddMachineDialog.tsx:247-277",
                    },
                    {
                      label: "MachineDetailPanel.tsx:844-873",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/machine/MachineDetailPanel.tsx:844-873",
                    },
                  ],
                },
              ],
              ...compositionPanelProps(code, "AddMachine"),
            },
            {
              id: "source-comparison-attachment-preview",
              label: "Attachment preview",
              status: "difference",
              note: "Remaining differences: source uses the Lightbox overlay for HTML/PDF/document attachment previews, including custom scroll-lock and browser-find behavior; current represents the same content-preview shell with Dialog primitives, themed header actions, and a sandboxed preview frame body.",
              source: <SourceAttachmentPreview />,
              brutal: <AttachmentPreviewDialogComposition />,
              elegant: <AttachmentPreviewDialogComposition />,
              elegantDark: <AttachmentPreviewDialogComposition />,
              previewClassName: modalComparisonPreviewClassName,
              sourceScenes: [
                {
                  label: "Attachment preview lightbox",
                  scenes: [
                    {
                      label: "MessageItem.tsx:885",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/MessageItem.tsx:885",
                    },
                    {
                      label: "MessageItem.tsx:993",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/MessageItem.tsx:993",
                    },
                    {
                      label: "MessageItem.tsx:1167",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/MessageItem.tsx:1167",
                    },
                  ],
                },
              ],
              ...compositionPanelProps(code, "AttachmentPreview"),
            },
            {
              id: "source-comparison-announcement",
              label: "Announcement",
              status: "difference",
              note: "Remaining differences: current adds a header icon and uses themed Dialog chrome/button styling; the docs body is static markdown-shaped content rather than the live announcement markdown renderer.",
              source: <SourceAnnouncement />,
              brutal: <AnnouncementDialogComposition />,
              elegant: <AnnouncementDialogComposition />,
              elegantDark: <AnnouncementDialogComposition />,
              sourceScenes: [
                {
                  label: "Account announcement modal",
                  scenes: [
                    {
                      label: "AnnouncementModal.tsx:119",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/AnnouncementModal.tsx:119",
                    },
                    {
                      label: "MainLayout.tsx:1406",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/layout/MainLayout.tsx:1406",
                    },
                  ],
                },
              ],
              ...compositionPanelProps(code, "Announcement"),
            },
            {
              id: "source-comparison-create-channel",
              label: "Create channel",
              status: "difference",
              note: "Remaining differences: current uses Dialog/Banner/Field/Combobox primitives and themed button variants; source uses inline brutal form controls, a static expanded member list, and source-specific post-submit archive collision wiring.",
              source: <SourceCreateChannel />,
              brutal: <CreateChannelDialogComposition />,
              elegant: <CreateChannelDialogComposition />,
              elegantDark: <CreateChannelDialogComposition />,
              sourceScenes: [
                {
                  label: "Channel creation and member management",
                  scenes: [
                    {
                      label: "CreateChannelDialog.tsx:196",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/channel/CreateChannelDialog.tsx:196",
                    },
                    {
                      label: "CreateJointChannelDialog.tsx:150",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/channel/CreateJointChannelDialog.tsx:150",
                    },
                    {
                      label: "AddMembersDialog.tsx:205",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/channel/AddMembersDialog.tsx:205",
                    },
                    {
                      label: "ChannelMembers.tsx:121,249",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/ChannelMembers.tsx:121,249",
                    },
                  ],
                },
              ],
              ...compositionPanelProps(code, "CreateChannel"),
            },
            {
              id: "source-comparison-create-agent",
              label: "Create agent",
              status: "difference",
              note: "Remaining differences: current uses Dialog/Field/Select/Button primitives and themed primary/outline actions; source uses inline brutal form controls and source-specific conditional warning/limit states.",
              source: <SourceCreateAgent />,
              brutal: <CreateAgentDialogComposition />,
              elegant: <CreateAgentDialogComposition />,
              elegantDark: <CreateAgentDialogComposition />,
              sourceScenes: [
                {
                  label: "Agent creation dialogs",
                  scenes: [
                    {
                      label: "CreateAgentDialog.tsx:294",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/CreateAgentDialog.tsx:294",
                    },
                    {
                      label: "Sidebar.tsx:1914",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/layout/Sidebar.tsx:1914",
                    },
                    {
                      label: "MachineDetailPanel.tsx:492",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/machine/MachineDetailPanel.tsx:492",
                    },
                    {
                      label: "CreateTaskDialog.tsx:56",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/task/CreateTaskDialog.tsx:56",
                    },
                  ],
                },
              ],
              ...compositionPanelProps(code, "CreateAgent"),
            },
            {
              id: "source-comparison-reset-agent",
              label: "Reset agent",
              status: "difference",
              note: "Remaining differences: current uses controlled Dialog/RadioGroup/Banner/Button primitives, dynamic footer action variants, and an elegant radio-card treatment; source uses inline brutal buttons, source-local reset mode state, and only shows the full-reset warning when full reset is selected.",
              source: <SourceResetAgent />,
              brutal: <ResetAgentDialogComposition />,
              elegant: <ResetAgentDialogComposition />,
              elegantDark: <ResetAgentDialogComposition />,
              sourceScenes: [
                {
                  label: "Reset mode dialogs",
                  scenes: [
                    {
                      label: "ResetAgentDialog.tsx:58",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/ResetAgentDialog.tsx:58",
                    },
                    {
                      label: "MachineDetailPanel.tsx:499",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/machine/MachineDetailPanel.tsx:499",
                    },
                    {
                      label: "AgentDetailPanel.tsx:1094",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/AgentDetailPanel.tsx:1094",
                    },
                  ],
                },
              ],
              ...compositionPanelProps(code, "ResetAgent"),
            },
            {
              id: "source-comparison-agreement",
              label: "Agreement",
              status: "difference",
              note: "Remaining differences: current uses Dialog/Text/Button primitives with larger themed actions, separates the intro line from the guideline list, and lets elegant render the list without a container; source uses the card-brutal shell, source pink submit button, rendered markdown body, submitting label, and conditional join-error warning state.",
              source: <SourceAgreement />,
              brutal: <AgreementDialogComposition />,
              elegant: <AgreementDialogComposition />,
              elegantDark: <AgreementDialogComposition />,
              sourceScenes: [
                {
                  label: "Agreement dialogs",
                  scenes: [
                    {
                      label: "CommunityAgreementDialog.tsx:42",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/server/CommunityAgreementDialog.tsx:42",
                    },
                  ],
                },
              ],
              ...compositionPanelProps(code, "Agreement"),
            },
            {
              id: "source-comparison-onboarding",
              label: "Onboarding step",
              status: "difference",
              note: "Remaining differences: current uses Dialog/Checkbox/Button primitives and themed primary/outline actions; source uses a card-brutal shell with caller-supplied footer and optional error banner.",
              source: <SourceOnboarding />,
              brutal: <OnboardingDialogComposition />,
              elegant: <OnboardingDialogComposition />,
              elegantDark: <OnboardingDialogComposition />,
              sourceScenes: [
                {
                  label: "Onboarding wizard dialog",
                  scenes: [
                    {
                      label: "OnboardingStepDialog.tsx:36",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/onboarding/OnboardingStepDialog.tsx:36",
                    },
                  ],
                },
              ],
              ...compositionPanelProps(code, "Onboarding"),
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
