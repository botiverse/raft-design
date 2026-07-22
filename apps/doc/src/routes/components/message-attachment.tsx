import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { MessageAttachmentPreviewSurfacesComposition } from "#/modules/message-attachment/compositions/attachment-preview-surfaces.composition.tsx";
import attachmentPreviewSurfacesSource from "#/modules/message-attachment/compositions/attachment-preview-surfaces.composition.tsx?raw";
import { MessageAttachmentsShowcaseComposition } from "#/modules/message-attachment/compositions/message-attachments-showcase.composition.tsx";
import attachmentsShowcaseSource from "#/modules/message-attachment/compositions/message-attachments-showcase.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const ANATOMY_SOURCE = `<MessageAttachmentGroup>
  <MessageAttachmentCard>
    <MessageAttachmentIcon />
    <MessageAttachmentBody>
      <MessageAttachmentTitle />
      <MessageAttachmentMeta />
    </MessageAttachmentBody>
    <MessageAttachmentActions />
  </MessageAttachmentCard>
</MessageAttachmentGroup>`;

const PROPS: readonly PropRow[] = [
  {
    name: "MessageAttachmentCard / Group",
    type: 'useRender.ComponentProps<"div">',
    description: "File attachment card and grouping shell for message bodies.",
  },
  {
    name: "MessageAttachmentPreviewRoot",
    type: 'useRender.ComponentProps<"div">',
    description: "Preview surface shell for HTML external-link and audio attachment previews.",
  },
];

export const Route = createFileRoute("/components/message-attachment")({
  component: MessageAttachmentDoc,
  loader: () =>
    highlightSnippets({
      data: {
        anatomy: ANATOMY_SOURCE,
        attachmentsShowcase: attachmentsShowcaseSource,
        attachmentPreviewSurfaces: attachmentPreviewSurfacesSource,
      },
    }),
});

function MessageAttachmentDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="MessageAttachment"
      description="File attachment cards and attachment preview surfaces for message bodies."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview previewMode="light" previewClassName="items-stretch">
          <Preview.Canvas>
            <MessageAttachmentsShowcaseComposition />
          </Preview.Canvas>
          <Preview.Code html={code.attachmentsShowcase} />
        </Preview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <DocSubsection parentId="usage" id="preview-surfaces" title="Preview surfaces">
          <Preview previewMode="light" previewClassName="items-stretch">
            <Preview.Canvas>
              <MessageAttachmentPreviewSurfacesComposition />
            </Preview.Canvas>
            <Preview.Code html={code.attachmentPreviewSurfaces} />
          </Preview>
        </DocSubsection>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
