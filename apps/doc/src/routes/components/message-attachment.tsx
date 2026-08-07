import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { InlineCode } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { MessageAttachmentsShowcaseComposition } from "#/modules/message-attachment/compositions/message-attachments-showcase.composition.tsx";
import attachmentsShowcaseSource from "#/modules/message-attachment/compositions/message-attachments-showcase.composition.tsx?raw";
import { MessageAttachmentStatusesUsageComposition } from "#/modules/message-attachment/compositions/attachment-statuses.composition.tsx";
import attachmentStatusesSource from "#/modules/message-attachment/compositions/attachment-statuses.composition.tsx?raw";
import { MessageAttachmentDiffUsageComposition } from "#/modules/message-attachment/compositions/diff-attachment.composition.tsx";
import diffAttachmentSource from "#/modules/message-attachment/compositions/diff-attachment.composition.tsx?raw";
import { MessageAttachmentDocumentSummariesComposition } from "#/modules/message-attachment/compositions/document-summaries.composition.tsx";
import documentSummariesSource from "#/modules/message-attachment/compositions/document-summaries.composition.tsx?raw";
import fileAttachmentsSource from "#/modules/message-attachment/compositions/file-attachments.composition.tsx?raw";
import { MessageAttachmentPreviewUsageComposition } from "#/modules/message-attachment/compositions/preview-attachment.composition.tsx";
import previewAttachmentSource from "#/modules/message-attachment/compositions/preview-attachment.composition.tsx?raw";
import { MessageAttachmentTitleIconUsageComposition } from "#/modules/message-attachment/compositions/title-icon.composition.tsx";
import titleIconSource from "#/modules/message-attachment/compositions/title-icon.composition.tsx?raw";
import {
  FILE_CARD_ANATOMY_SOURCE,
  IMAGE_GALLERY_ANATOMY_SOURCE,
  MESSAGE_ATTACHMENT_ACTION_PROPS,
  MESSAGE_ATTACHMENT_CARD_PROPS,
  MESSAGE_ATTACHMENT_COMMENT_SUMMARY_PROPS,
  MESSAGE_ATTACHMENT_DIFF_ADDITION_PROPS,
  MESSAGE_ATTACHMENT_DIFF_DELETION_PROPS,
  MESSAGE_ATTACHMENT_DIFF_SUMMARY_PROPS,
  MESSAGE_ATTACHMENT_GROUP_PROPS,
  MESSAGE_ATTACHMENT_META_END_PROPS,
  MESSAGE_ATTACHMENT_META_PROPS,
  MESSAGE_ATTACHMENT_META_START_PROPS,
  MESSAGE_ATTACHMENT_SUMMARY_PROPS,
  MESSAGE_ATTACHMENT_TITLE_PROPS,
  MESSAGE_IMAGE_GALLERY_ACTION_PROPS,
  MESSAGE_IMAGE_GALLERY_ITEM_PROPS,
  MESSAGE_IMAGE_GALLERY_MEDIA_PROPS,
  MESSAGE_IMAGE_GALLERY_OVERLAY_PROPS,
  MESSAGE_IMAGE_GALLERY_PREVIEW_PROPS,
  MESSAGE_IMAGE_GALLERY_PROPS,
  MESSAGE_VIDEO_PREVIEW_ACTION_PROPS,
  MESSAGE_VIDEO_PREVIEW_FAILURE_ACTION_PROPS,
  MESSAGE_VIDEO_PREVIEW_FAILURE_CONTENT_PROPS,
  MESSAGE_VIDEO_PREVIEW_FAILURE_ICON_PROPS,
  MESSAGE_VIDEO_PREVIEW_FAILURE_TITLE_PROPS,
  MESSAGE_VIDEO_PREVIEW_FALLBACK_PROPS,
  MESSAGE_VIDEO_PREVIEW_MEDIA_PROPS,
  MESSAGE_VIDEO_PREVIEW_PROPS,
  VIDEO_PREVIEW_ANATOMY_SOURCE,
} from "#/modules/message-attachment/message-attachment.snippets.ts";
import { MessageImageGalleryGeometryComposition } from "#/modules/message-media/compositions/image-gallery-geometry.composition.tsx";
import imageGalleryGeometrySource from "#/modules/message-media/compositions/image-gallery-geometry.composition.tsx?raw";
import { MessageImageGalleryPairComposition } from "#/modules/message-media/compositions/image-gallery-pair.composition.tsx";
import imageGalleryPairSource from "#/modules/message-media/compositions/image-gallery-pair.composition.tsx?raw";
import imageGalleryPendingSource from "#/modules/message-media/compositions/image-gallery-pending.composition.tsx?raw";
import { MessageImageGallerySingleComposition } from "#/modules/message-media/compositions/image-gallery-single.composition.tsx";
import imageGallerySingleSource from "#/modules/message-media/compositions/image-gallery-single.composition.tsx?raw";
import { MessageImageGalleryTripleComposition } from "#/modules/message-media/compositions/image-gallery-triple.composition.tsx";
import imageGalleryTripleSource from "#/modules/message-media/compositions/image-gallery-triple.composition.tsx?raw";
import { MessageVideoPreviewStatesComposition } from "#/modules/message-media/compositions/video-states.composition.tsx";
import videoStatesSource from "#/modules/message-media/compositions/video-states.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const SHOWCASE_COMPOSITION_PATH =
  "apps/doc/src/modules/message-attachment/compositions/message-attachments-showcase.composition.tsx";
const FILE_ATTACHMENTS_COMPOSITION_PATH =
  "apps/doc/src/modules/message-attachment/compositions/file-attachments.composition.tsx";
const IMAGE_GALLERY_PENDING_COMPOSITION_PATH =
  "apps/doc/src/modules/message-media/compositions/image-gallery-pending.composition.tsx";

function UsagePreview({
  children,
  code,
  collapsedCode,
}: {
  children: ReactNode;
  code: ReactNode;
  collapsedCode?: ReactNode;
}) {
  return (
    <Preview>
      <Preview.Canvas>{children}</Preview.Canvas>
      <Preview.Code html={code} collapsedHtml={collapsedCode} />
    </Preview>
  );
}

export const Route = createFileRoute("/components/message-attachment")({
  component: MessageAttachmentDoc,
  loader: () =>
    highlightSnippets({
      data: {
        fileCardAnatomy: FILE_CARD_ANATOMY_SOURCE,
        imageGalleryAnatomy: IMAGE_GALLERY_ANATOMY_SOURCE,
        videoPreviewAnatomy: VIDEO_PREVIEW_ANATOMY_SOURCE,
        attachmentsShowcase: attachmentsShowcaseSource,
        attachmentStatuses: attachmentStatusesSource,
        diffAttachment: diffAttachmentSource,
        documentSummaries: documentSummariesSource,
        fileAttachments: fileAttachmentsSource,
        imageGalleryGeometry: imageGalleryGeometrySource,
        imageGalleryPair: imageGalleryPairSource,
        imageGalleryPending: imageGalleryPendingSource,
        imageGallerySingle: imageGallerySingleSource,
        imageGalleryTriple: imageGalleryTripleSource,
        previewAttachment: previewAttachmentSource,
        titleIcon: titleIconSource,
        videoStates: videoStatesSource,
      },
    }),
});

function MessageAttachmentDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="MessageAttachment"
      description="Message-row attachment cards, media galleries, and pending/failed states composed as attachment children."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview>
          <Preview.Canvas>
            <MessageAttachmentsShowcaseComposition />
          </Preview.Canvas>
          <Preview.Code codeBlock={<MessageAttachmentShowcaseFiles code={code} />} />
        </Preview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <div className="space-y-8">
          <DocSubsection parentId="anatomy" id="anatomy-file-card" title="File card and summaries">
            <p className="text-sm text-foreground-muted">
              The card owns the shared title, summary, and two-sided metadata structure. Comment and
              diff content are alternative children of the same summary slot.
            </p>
            <DocsCodeBlock>
              <DocsCodeBlock.Body>
                <DocsCodeBlock.Content html={code.fileCardAnatomy} />
              </DocsCodeBlock.Body>
            </DocsCodeBlock>
          </DocSubsection>

          <DocSubsection parentId="anatomy" id="anatomy-image-gallery" title="Image gallery">
            <p className="text-sm text-foreground-muted">
              Consumers own native grid rows and image fit. Gallery parts provide cell chrome,
              preview actions, and an optional pending overlay.
            </p>
            <DocsCodeBlock>
              <DocsCodeBlock.Body>
                <DocsCodeBlock.Content html={code.imageGalleryAnatomy} />
              </DocsCodeBlock.Body>
            </DocsCodeBlock>
          </DocSubsection>

          <DocSubsection parentId="anatomy" id="anatomy-video-preview" title="Video preview">
            <p className="text-sm text-foreground-muted">
              Resolved media, loading fallback, and failure fallback are separate compositions.
            </p>
            <DocsCodeBlock>
              <DocsCodeBlock.Body>
                <DocsCodeBlock.Content html={code.videoPreviewAnatomy} />
              </DocsCodeBlock.Body>
            </DocsCodeBlock>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-10">
          <DocSubsection parentId="usage" id="downloadable-file" title="Downloadable file">
            <p className="mb-3 text-sm text-foreground-muted">
              Put attachment-specific diff content inside the shared summary slot. Keep file size
              and the caller-owned download action on opposite sides of the metadata row.
            </p>
            <UsagePreview code={code.diffAttachment} collapsedCode={code.diffAttachmentBody}>
              <MessageAttachmentDiffUsageComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="previewable-file" title="Previewable file">
            <p className="mb-3 text-sm text-foreground-muted">
              Keep preview state in the consumer; replace the <InlineCode>Eye</InlineCode> with the
              shared <InlineCode>Spinner</InlineCode> inside{" "}
              <InlineCode>MessageAttachmentMetaEnd</InlineCode> while the preview opens.
            </p>
            <UsagePreview code={code.previewAttachment} collapsedCode={code.previewAttachmentBody}>
              <MessageAttachmentPreviewUsageComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="document-summaries" title="Document summaries">
            <p className="mb-3 text-sm text-foreground-muted">
              Use the summary only when a document has compact status information, such as CSV row
              and column counts. Metadata stays reserved for the file size.
            </p>
            <UsagePreview code={code.documentSummaries} collapsedCode={code.documentSummariesBody}>
              <MessageAttachmentDocumentSummariesComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="title-icon" title="Title icon">
            <p className="mb-3 text-sm text-foreground-muted">
              Render an SVG directly beside the filename inside the title slot; the attachment UI
              does not need a file-type prop or an icon slot.
              <span className="mt-1 block">
                File-type icons are available from{" "}
                <a
                  href="https://icones.js.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline underline-offset-4"
                >
                  Icônes
                </a>
                .
              </span>
            </p>
            <UsagePreview code={code.titleIcon} collapsedCode={code.titleIconBody}>
              <MessageAttachmentTitleIconUsageComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="attachment-statuses" title="Comments and pending">
            <p className="mb-3 text-sm text-foreground-muted">
              Put comment content inside <InlineCode>MessageAttachmentSummary</InlineCode>. For
              pending state, place the shared <InlineCode>Spinner</InlineCode> in{" "}
              <InlineCode>MessageAttachmentMetaEnd</InlineCode> instead of introducing a card-level
              variant.
            </p>
            <UsagePreview
              code={code.attachmentStatuses}
              collapsedCode={code.attachmentStatusesBody}
            >
              <MessageAttachmentStatusesUsageComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="video-states" title="Inline video states">
            <p className="mb-3 text-sm text-foreground-muted">
              Render real media, URL loading, and unavailable-codec fallback as separate video
              states. Preview and download workflows remain caller-owned.
            </p>
            <UsagePreview code={code.videoStates} collapsedCode={code.videoStatesBody}>
              <MessageVideoPreviewStatesComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="media-layouts" title="Media layouts">
            <p className="mb-3 text-sm text-foreground-muted">
              Compose native grid rows in the consumer.{" "}
              <InlineCode>MessageImageGalleryItem</InlineCode> owns cell chrome;{" "}
              <InlineCode>MessageImageGalleryMedia</InlineCode> only provides the media container.
            </p>
            <div className="space-y-8">
              <DocSubsection parentId="media-layouts" id="single-image" title="Single image">
                <UsagePreview
                  code={code.imageGallerySingle}
                  collapsedCode={code.imageGallerySingleBody}
                >
                  <MessageImageGallerySingleComposition />
                </UsagePreview>
              </DocSubsection>

              <DocSubsection parentId="media-layouts" id="pair-row" title="Pair row">
                <UsagePreview
                  code={code.imageGalleryPair}
                  collapsedCode={code.imageGalleryPairBody}
                >
                  <MessageImageGalleryPairComposition />
                </UsagePreview>
              </DocSubsection>

              <DocSubsection parentId="media-layouts" id="triple-row" title="Triple dense row">
                <UsagePreview
                  code={code.imageGalleryTriple}
                  collapsedCode={code.imageGalleryTripleBody}
                >
                  <MessageImageGalleryTripleComposition />
                </UsagePreview>
              </DocSubsection>

              <DocSubsection
                parentId="media-layouts"
                id="image-geometry"
                title="Wide and tall geometry"
              >
                <p className="mb-3 text-sm text-foreground-muted">
                  Consumer layout classes set cell geometry, while the media child chooses{" "}
                  <InlineCode>object-cover</InlineCode> or <InlineCode>object-contain</InlineCode>.
                </p>
                <UsagePreview
                  code={code.imageGalleryGeometry}
                  collapsedCode={code.imageGalleryGeometryBody}
                >
                  <MessageImageGalleryGeometryComposition />
                </UsagePreview>
              </DocSubsection>
            </div>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection
            parentId="api"
            id="api-message-attachment-group"
            title="MessageAttachmentGroup"
          >
            <PropsTable rows={MESSAGE_ATTACHMENT_GROUP_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-attachment-card"
            title="MessageAttachmentCard"
          >
            <PropsTable rows={MESSAGE_ATTACHMENT_CARD_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-attachment-title"
            title="MessageAttachmentTitle"
          >
            <PropsTable rows={MESSAGE_ATTACHMENT_TITLE_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-attachment-summary"
            title="MessageAttachmentSummary"
          >
            <PropsTable rows={MESSAGE_ATTACHMENT_SUMMARY_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-attachment-comment-summary"
            title="MessageAttachmentCommentSummary"
          >
            <PropsTable rows={MESSAGE_ATTACHMENT_COMMENT_SUMMARY_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-attachment-diff-summary"
            title="MessageAttachmentDiffSummary"
          >
            <PropsTable rows={MESSAGE_ATTACHMENT_DIFF_SUMMARY_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-attachment-diff-addition"
            title="MessageAttachmentDiffAddition"
          >
            <PropsTable rows={MESSAGE_ATTACHMENT_DIFF_ADDITION_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-attachment-diff-deletion"
            title="MessageAttachmentDiffDeletion"
          >
            <PropsTable rows={MESSAGE_ATTACHMENT_DIFF_DELETION_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-attachment-meta"
            title="MessageAttachmentMeta"
          >
            <PropsTable rows={MESSAGE_ATTACHMENT_META_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-attachment-meta-start"
            title="MessageAttachmentMetaStart"
          >
            <PropsTable rows={MESSAGE_ATTACHMENT_META_START_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-attachment-meta-end"
            title="MessageAttachmentMetaEnd"
          >
            <PropsTable rows={MESSAGE_ATTACHMENT_META_END_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-attachment-action"
            title="MessageAttachmentAction"
          >
            <PropsTable rows={MESSAGE_ATTACHMENT_ACTION_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-message-image-gallery" title="MessageImageGallery">
            <PropsTable rows={MESSAGE_IMAGE_GALLERY_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-image-gallery-item"
            title="MessageImageGalleryItem"
          >
            <PropsTable rows={MESSAGE_IMAGE_GALLERY_ITEM_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-image-gallery-media"
            title="MessageImageGalleryMedia"
          >
            <PropsTable rows={MESSAGE_IMAGE_GALLERY_MEDIA_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-image-gallery-preview"
            title="MessageImageGalleryPreview"
          >
            <PropsTable rows={MESSAGE_IMAGE_GALLERY_PREVIEW_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-image-gallery-action"
            title="MessageImageGalleryAction"
          >
            <PropsTable rows={MESSAGE_IMAGE_GALLERY_ACTION_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-image-gallery-overlay"
            title="MessageImageGalleryOverlay"
          >
            <PropsTable rows={MESSAGE_IMAGE_GALLERY_OVERLAY_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-message-video-preview" title="MessageVideoPreview">
            <PropsTable rows={MESSAGE_VIDEO_PREVIEW_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-video-preview-media"
            title="MessageVideoPreviewMedia"
          >
            <PropsTable rows={MESSAGE_VIDEO_PREVIEW_MEDIA_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-video-preview-fallback"
            title="MessageVideoPreviewFallback"
          >
            <PropsTable rows={MESSAGE_VIDEO_PREVIEW_FALLBACK_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-video-preview-action"
            title="MessageVideoPreviewAction"
          >
            <PropsTable rows={MESSAGE_VIDEO_PREVIEW_ACTION_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-video-preview-failure-content"
            title="MessageVideoPreviewFailureContent"
          >
            <PropsTable rows={MESSAGE_VIDEO_PREVIEW_FAILURE_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-video-preview-failure-icon"
            title="MessageVideoPreviewFailureIcon"
          >
            <PropsTable rows={MESSAGE_VIDEO_PREVIEW_FAILURE_ICON_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-video-preview-failure-title"
            title="MessageVideoPreviewFailureTitle"
          >
            <PropsTable rows={MESSAGE_VIDEO_PREVIEW_FAILURE_TITLE_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-video-preview-failure-action"
            title="MessageVideoPreviewFailureAction"
          >
            <PropsTable rows={MESSAGE_VIDEO_PREVIEW_FAILURE_ACTION_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}

/** Showcase row plus the attachment compositions it renders inside that row. */
function MessageAttachmentShowcaseFiles({
  code,
}: {
  code: ReturnType<typeof Route.useLoaderData>;
}) {
  return (
    <DocsCodeBlock.Files
      collapsible={false}
      showLineNumbers={false}
      files={[
        {
          path: SHOWCASE_COMPOSITION_PATH,
          source: attachmentsShowcaseSource,
          html: code.attachmentsShowcase,
          collapsedHtml: code.attachmentsShowcaseBody,
        },
        {
          path: FILE_ATTACHMENTS_COMPOSITION_PATH,
          source: fileAttachmentsSource,
          html: code.fileAttachments,
          collapsedHtml: code.fileAttachmentsBody,
        },
        {
          path: IMAGE_GALLERY_PENDING_COMPOSITION_PATH,
          source: imageGalleryPendingSource,
          html: code.imageGalleryPending,
          collapsedHtml: code.imageGalleryPendingBody,
        },
      ]}
    />
  );
}
