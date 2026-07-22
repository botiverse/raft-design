import type { ReactNode } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";

import { Differences } from "#/components/differences.tsx";
import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { MessageAttachmentPreviewSurfacesComposition } from "#/modules/message-attachment/compositions/attachment-preview-surfaces.composition.tsx";
import attachmentPreviewSurfacesSource from "#/modules/message-attachment/compositions/attachment-preview-surfaces.composition.tsx?raw";
import { MessageAttachmentsShowcaseComposition } from "#/modules/message-attachment/compositions/message-attachments-showcase.composition.tsx";
import attachmentsShowcaseSource from "#/modules/message-attachment/compositions/message-attachments-showcase.composition.tsx?raw";
import {
  ANATOMY_SOURCE,
  API_GROUPS,
  TOC,
} from "#/modules/message-attachment/message-attachment.snippets.ts";

function UsagePreview({ children, code }: { children: ReactNode; code: ReactNode }) {
  return (
    <Preview previewMode="light" previewClassName="items-stretch">
      <Preview.Canvas>{children}</Preview.Canvas>
      <Preview.Code html={code} />
    </Preview>
  );
}

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
      description="Message-row attachment cards, pending/failed overlays, and HTML/audio preview surfaces — including media galleries composed as attachment children."
      overview={
        <Differences from="message attachments">
          <li>
            upload lifecycle, download policy, and preview open/close stay outside the UI package
          </li>
          <li>
            media galleries and file cards compose as children of{" "}
            <code>MessageItemAttachments</code>
          </li>
          <li>
            file thumbnails belong to <Link to="/components/file-preview">FilePreview</Link>; this
            page owns the message attachment chrome around them
          </li>
          <li>product copy, icons, and callbacks live in docs compositions</li>
        </Differences>
      }
      toc={TOC}
    >
      <DocNote>
        Row chrome and the <code>MessageItemAttachments</code> slot live on{" "}
        <Link to="/components/message-item">MessageItem</Link>. Compact file thumbnails are{" "}
        <Link to="/components/file-preview">FilePreview</Link>; full-screen image browsing is{" "}
        <Link to="/components/lightbox">Lightbox</Link>.
      </DocNote>

      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <UsagePreview code={code.attachmentsShowcase}>
          <MessageAttachmentsShowcaseComposition />
        </UsagePreview>
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
          <DocSubsection parentId="usage" id="attachments" title="Attachments">
            <UsagePreview code={code.attachmentsShowcase}>
              <MessageAttachmentsShowcaseComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection
            parentId="usage"
            id="attachment-preview-surfaces"
            title="Attachment preview surfaces"
          >
            <UsagePreview code={code.attachmentPreviewSurfaces}>
              <MessageAttachmentPreviewSurfacesComposition />
            </UsagePreview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="grid gap-8">
          {API_GROUPS.map((group) => (
            <DocSubsection key={group.id} parentId="api" id={group.id} title={group.title}>
              <PropsTable rows={group.rows} />
            </DocSubsection>
          ))}
        </div>
      </DocSection>
    </DocPage>
  );
}
