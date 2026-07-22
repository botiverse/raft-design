import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { MessageMediaShowcaseComposition } from "#/modules/message-media/compositions/media-showcase.composition.tsx";
import mediaSource from "#/modules/message-media/compositions/media-showcase.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
] as const;

const ANATOMY_SOURCE = `<MessageImageGallery>
  <MessageImageGalleryRow>
    <MessageImageGalleryItem>
      <MessageImageGalleryMedia />
      <MessageImageGalleryPreview />
      <MessageImageGalleryAction />
      <MessageImageGalleryOverlay />
    </MessageImageGalleryItem>
  </MessageImageGalleryRow>
</MessageImageGallery>

<MessageVideoPreview>
  <MessageVideoPreviewFrame>
    <MessageVideoPreviewFallback />
    <MessageVideoPreviewAction />
  </MessageVideoPreviewFrame>
</MessageVideoPreview>`;

const PROPS: readonly PropRow[] = [
  {
    name: "MessageImageGallery / MessageImageGalleryRow",
    type: 'useRender.ComponentProps<"div">',
    description: "Gallery container and per-row grid for grouped image attachments.",
  },
  {
    name: "MessageImageGalleryItem",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Single image slot. `single` widens the item for one-image rows; `aria-busy` shows the uploading overlay.",
  },
  {
    name: "MessageImageGalleryMedia",
    type: 'useRender.ComponentProps<"img">',
    description: "The rendered image. `fit` toggles between cover and contain.",
  },
  {
    name: "MessageImageGalleryPreview / MessageImageGalleryAction",
    type: 'useRender.ComponentProps<"button">',
    description: "Hover-revealed lightbox trigger and secondary actions such as download.",
  },
  {
    name: "MessageImageGalleryOverlay",
    type: 'useRender.ComponentProps<"div">',
    description: "Uploading-state overlay shown while an image item is pending.",
  },
  {
    name: "MessageVideoPreview / MessageVideoPreviewFrame",
    type: 'useRender.ComponentProps<"div">',
    description: "Video preview shell and frame. `aria-busy` shows the pending overlay treatment.",
  },
  {
    name: "MessageVideoPreviewFallback / MessageVideoPreviewAction",
    type: 'useRender.ComponentProps<"div"> / <"button">',
    description: "Poster-frame fallback content and the play/open action.",
  },
];

export const Route = createFileRoute("/components/message-media")({
  component: MessageMediaDoc,
  loader: () => highlightSnippets({ data: { anatomy: ANATOMY_SOURCE, media: mediaSource } }),
});

function MessageMediaDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="MessageMedia"
      description="Image galleries and video previews for message attachments, including uploading states."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview previewMode="light" previewClassName="items-stretch">
          <Preview.Canvas>
            <MessageMediaShowcaseComposition />
          </Preview.Canvas>
          <Preview.Code html={code.media} />
        </Preview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
