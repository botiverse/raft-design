import type { ReactNode } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";

import { Differences } from "#/components/differences.tsx";
import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { MessageAttachmentsShowcaseComposition } from "#/modules/message-attachment/compositions/message-attachments-showcase.composition.tsx";
import attachmentsShowcaseSource from "#/modules/message-attachment/compositions/message-attachments-showcase.composition.tsx?raw";
import { MessageAttachmentStatusesUsageComposition } from "#/modules/message-attachment/compositions/attachment-statuses.composition.tsx";
import attachmentStatusesSource from "#/modules/message-attachment/compositions/attachment-statuses.composition.tsx?raw";
import { MessageAttachmentDiffUsageComposition } from "#/modules/message-attachment/compositions/diff-attachment.composition.tsx";
import diffAttachmentSource from "#/modules/message-attachment/compositions/diff-attachment.composition.tsx?raw";
import { MessageAttachmentPreviewUsageComposition } from "#/modules/message-attachment/compositions/preview-attachment.composition.tsx";
import previewAttachmentSource from "#/modules/message-attachment/compositions/preview-attachment.composition.tsx?raw";
import {
  ANATOMY_SOURCE,
  API_GROUPS,
} from "#/modules/message-attachment/message-attachment.snippets.ts";
import { MessageAttachmentComparisonComposition } from "#/modules/message-attachment/message-attachment.source-comparison.tsx";
import attachmentComparisonSource from "#/modules/message-attachment/message-attachment.source-comparison.tsx?raw";
import { MessageAttachmentSourcePreview } from "#/modules/message-attachment/message-attachment.source-preview.tsx";
import { MessageImageGalleryGeometryComposition } from "#/modules/message-media/compositions/image-gallery-geometry.composition.tsx";
import imageGalleryGeometrySource from "#/modules/message-media/compositions/image-gallery-geometry.composition.tsx?raw";
import { MessageImageGalleryPairComposition } from "#/modules/message-media/compositions/image-gallery-pair.composition.tsx";
import imageGalleryPairSource from "#/modules/message-media/compositions/image-gallery-pair.composition.tsx?raw";
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
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SOURCE_SCENES = [
  {
    label: "Slock message attachments",
    scenes: [
      {
        label: "MessageItem.tsx",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/MessageItem.tsx",
      },
      {
        label: "attachmentPreview.ts",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/attachmentPreview.ts",
      },
    ],
  },
] as const;

function UsagePreview({ children, code }: { children: ReactNode; code: ReactNode }) {
  return (
    <Preview>
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
        attachmentComparison: attachmentComparisonSource,
        attachmentsShowcase: attachmentsShowcaseSource,
        attachmentStatuses: attachmentStatusesSource,
        diffAttachment: diffAttachmentSource,
        imageGalleryGeometry: imageGalleryGeometrySource,
        imageGalleryPair: imageGalleryPairSource,
        imageGallerySingle: imageGallerySingleSource,
        imageGalleryTriple: imageGalleryTripleSource,
        previewAttachment: previewAttachmentSource,
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
      overview={
        <Differences from="message attachments">
          <li>
            upload lifecycle, download policy, and preview open/close stay outside the UI package
          </li>
          <li>
            media galleries and file cards compose as children of{" "}
            <code>MessageItemAttachments</code>
          </li>
          <li>file title, summary, and meta actions compose into attachment cards</li>
          <li>product copy, icons, and callbacks live in docs compositions</li>
        </Differences>
      }
      toc={TOC}
    >
      <DocNote>
        Row chrome and the <code>MessageItemAttachments</code> slot live on{" "}
        <Link to="/components/message-item">MessageItem</Link>. Full-screen image browsing is{" "}
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
          <DocSubsection parentId="usage" id="downloadable-file" title="Downloadable file">
            <p className="mb-3 text-sm text-foreground-muted">
              Compose a filename, diff summary, file size, and caller-owned download action.
            </p>
            <UsagePreview code={code.diffAttachment}>
              <MessageAttachmentDiffUsageComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="previewable-file" title="Previewable file">
            <p className="mb-3 text-sm text-foreground-muted">
              Keep preview state in the consumer; replace the Eye with a spinner while the preview
              opens.
            </p>
            <UsagePreview code={code.previewAttachment}>
              <MessageAttachmentPreviewUsageComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="attachment-statuses" title="Comments and pending">
            <p className="mb-3 text-sm text-foreground-muted">
              The comment summary and pending indicator remain explicit parts of the attachment card
              rather than card-level variants.
            </p>
            <UsagePreview code={code.attachmentStatuses}>
              <MessageAttachmentStatusesUsageComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="video-states" title="Inline video states">
            <p className="mb-3 text-sm text-foreground-muted">
              Render real media, URL loading, and unavailable-codec fallback as separate video
              states. Preview and download workflows remain caller-owned.
            </p>
            <UsagePreview code={code.videoStates}>
              <div className="space-y-2">
                <MessageVideoPreviewStatesComposition />
              </div>
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="media-layouts" title="Media layouts">
            <p className="mb-3 text-sm text-foreground-muted">
              Choose the row layout from attachment metadata, then compose each image cell directly.
            </p>
            <div className="space-y-8">
              <DocSubsection parentId="media-layouts" id="single-image" title="Single image">
                <UsagePreview code={code.imageGallerySingle}>
                  <MessageImageGallerySingleComposition />
                </UsagePreview>
              </DocSubsection>

              <DocSubsection parentId="media-layouts" id="pair-row" title="Pair row">
                <UsagePreview code={code.imageGalleryPair}>
                  <MessageImageGalleryPairComposition />
                </UsagePreview>
              </DocSubsection>

              <DocSubsection parentId="media-layouts" id="triple-row" title="Triple dense row">
                <UsagePreview code={code.imageGalleryTriple}>
                  <MessageImageGalleryTripleComposition />
                </UsagePreview>
              </DocSubsection>

              <DocSubsection
                parentId="media-layouts"
                id="image-geometry"
                title="Wide and tall geometry"
              >
                <p className="mb-3 text-sm text-foreground-muted">
                  Geometry controls source-faithful fit; attachment metadata still decides the row.
                </p>
                <UsagePreview code={code.imageGalleryGeometry}>
                  <MessageImageGalleryGeometryComposition />
                </UsagePreview>
              </DocSubsection>
            </div>
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

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          items={[
            {
              label: "File attachment in a message row",
              status: "review",
              note: "The Source pane is a static fixture extracted from the real MessageItem attachment DOM; the three Current panes execute the canonical attachment showcase in its MessageItem context.",
              sourceScenes: SOURCE_SCENES,
              source: (
                <SourceThemeScope className="w-full">
                  <MessageAttachmentSourcePreview />
                </SourceThemeScope>
              ),
              brutal: <MessageAttachmentComparisonComposition />,
              elegant: <MessageAttachmentComparisonComposition />,
              elegantDark: <MessageAttachmentComparisonComposition />,
              compositionCode: code.attachmentComparison,
              compositionPath:
                "apps/doc/src/modules/message-attachment/message-attachment.source-comparison.tsx",
              compositionSource: attachmentComparisonSource,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
