import { createFileRoute } from "@tanstack/react-router";
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
  Button,
  Field,
  FieldDescription,
  FieldLabel,
  InlineCode,
  Input,
  Text,
  Textarea,
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
  <DialogTrigger render={<Button variant="accent" />}>
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
      <Button variant="accent">Save Changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`,
  anatomy: `import {
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

<Dialog>
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
    name: "...props",
    type: "Base UI Dialog.Root.Props",
    description: "Owns open state, focus trap, Escape close, outside press, and modal behavior.",
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
    description: "Portals the dialog to the body or a custom container.",
  },
];

const OVERLAY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Dialog.Backdrop.Props",
    description: "Backdrop behind the dialog panel while it is open.",
  },
];

const TRIGGER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Dialog.Trigger.Props",
    description: "Opens the dialog. Compose a Button through render when the trigger is visible.",
  },
];

const CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "overlay",
    type: "false | DialogOverlayProps",
    description: "Pass false for framed previews; otherwise renders the themed backdrop.",
  },
  {
    name: "...props",
    type: "Base UI Dialog.Popup.Props",
    description: "Portaled centered dialog surface. Use className for width and one-off layouts.",
  },
];

const HEADER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"div">',
    description: "Header region. Defaults to title/action columns.",
  },
];

const BODY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"div">',
    description: "Main content region between header and footer.",
  },
];

const FOOTER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"div">',
    description: "Footer region. Defaults to an aligned action row.",
  },
];

const TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Dialog.Title.Props",
    description: "Accessible dialog title.",
  },
];

const DESCRIPTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Dialog.Description.Props",
    description: "Accessible supporting description.",
  },
];

const CLOSE_PROPS: readonly PropRow[] = [
  {
    name: "variant",
    type: "Button variant",
    description: "Button styling when using the default themed icon button.",
  },
  {
    name: "size",
    type: "Button size",
    description: "Button size when using the default themed icon button.",
  },
  {
    name: "...props",
    type: "Base UI Dialog.Close.Props",
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
              <DialogTrigger render={<Button variant="accent" />}>Edit channel</DialogTrigger>
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
                  <Button variant="accent">Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Preview.Canvas>
          <Preview.Code html={code.preview} collapsedHtml={code.previewBody} />
        </Preview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <div className="grid gap-4">
          <Text.Sans size="body" variant="placeholder" className="max-w-3xl">
            Use <InlineCode>Dialog</InlineCode> for content surfaces that need focus trapping and a
            centered modal frame. Use <InlineCode>AlertDialog</InlineCode> for irreversible confirms
            and destructive confirmation flows.
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
          {DIALOG_USAGE_ITEMS.map((item) => (
            <DocSubsection key={item.id} parentId="usage" id={item.id} title={item.title}>
              <Preview previewClassName="items-stretch p-0">
                <Preview.Canvas>{item.preview}</Preview.Canvas>
                <Preview.Code
                  html={code[item.codeKey]}
                  collapsedHtml={code[`${item.codeKey}Body`]}
                />
              </Preview>
            </DocSubsection>
          ))}
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-root" title="Dialog">
            <PropsTable rows={ROOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-trigger" title="DialogTrigger">
            <PropsTable rows={TRIGGER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-portal" title="DialogPortal">
            <PropsTable rows={PORTAL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-overlay" title="DialogOverlay">
            <PropsTable rows={OVERLAY_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-content" title="DialogContent">
            <PropsTable rows={CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-header" title="DialogHeader">
            <PropsTable rows={HEADER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-body" title="DialogBody">
            <PropsTable rows={BODY_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-footer" title="DialogFooter">
            <PropsTable rows={FOOTER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-title" title="DialogTitle">
            <PropsTable rows={TITLE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-description" title="DialogDescription">
            <PropsTable rows={DESCRIPTION_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-close" title="DialogClose">
            <PropsTable rows={CLOSE_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
