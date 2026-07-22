import type { PropRow } from "#/components/props-table.tsx";

export const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

export const ANATOMY_SOURCE = `<MessageItemAttachments>
  <MessageAttachmentGroup>
    <MessageAttachmentFrame>
      <MessageAttachmentCard>
        <MessageAttachmentBody>
          <MessageAttachmentTitle />
          <MessageAttachmentMeta>
            <MessageAttachmentMetaDetail>
              <MessageAttachmentMetaSeparator />
            </MessageAttachmentMetaDetail>
          </MessageAttachmentMeta>
        </MessageAttachmentBody>
        <MessageAttachmentSummary />
        <MessageAttachmentActions>
          <MessageAttachmentAction render={<span />} />
        </MessageAttachmentActions>
        <MessageAttachmentPendingIndicator />
        <MessageAttachmentLoadingBar />
        <MessageAttachmentErrorOverlay />
      </MessageAttachmentCard>
      <MessageAttachmentAction />
    </MessageAttachmentFrame>
  </MessageAttachmentGroup>
</MessageItemAttachments>

<MessageAttachmentPreviewRoot>
  <MessageAttachmentPreviewExternalLinksLoading>
    <MessageAttachmentPreviewExternalLinksLoadingPanel />
  </MessageAttachmentPreviewExternalLinksLoading>
  <MessageAttachmentPreviewExternalLinkHotspots>
    <MessageAttachmentPreviewExternalLinkHotspot />
  </MessageAttachmentPreviewExternalLinkHotspots>
  <MessageAttachmentPreviewExternalLinkFallback>
    <MessageAttachmentPreviewExternalLinkFallbackDismiss />
  </MessageAttachmentPreviewExternalLinkFallback>
</MessageAttachmentPreviewRoot>

<MessageAttachmentAudioPreview>
  <MessageAttachmentAudioPreviewCard>
    <MessageAttachmentAudioPreviewHeader>
      <MessageAttachmentAudioPreviewIcon />
      <MessageAttachmentAudioPreviewMeta>
        <MessageAttachmentAudioPreviewTitle />
        <MessageAttachmentAudioPreviewLabel />
      </MessageAttachmentAudioPreviewMeta>
    </MessageAttachmentAudioPreviewHeader>
    <MessageAttachmentAudioPreviewMedia />
  </MessageAttachmentAudioPreviewCard>
</MessageAttachmentAudioPreview>

<MessageImageGallery>
  <MessageImageGalleryRow layout="single | pair | triple">
    <MessageImageGalleryItem size="single | regular | dense">
      <MessageImageGalleryMedia geometry="single | normal | wide | tall" />
      <MessageImageGalleryPreview />
      <MessageImageGalleryAction />
      <MessageImageGalleryOverlay />
    </MessageImageGalleryItem>
  </MessageImageGalleryRow>
</MessageImageGallery>

<MessageVideoPreview>
  <MessageVideoPreviewFrame>
    <MessageVideoPreviewMedia />
    <MessageVideoPreviewFallback />
    <MessageVideoPreviewAction />
  </MessageVideoPreviewFrame>
</MessageVideoPreview>`;

export const CARD_PROPS: readonly PropRow[] = [
  {
    name: "MessageAttachmentGroup",
    type: 'useRender.ComponentProps<"div">',
    description: "Horizontal group of attachment cards inside MessageItemAttachments.",
  },
  {
    name: "MessageAttachmentFrame",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Optional layout frame for a primary card plus a sibling secondary action. It owns shared dimensions and action positioning.",
  },
  {
    name: "MessageAttachmentCard",
    type: 'useRender.ComponentProps<"div">',
    description:
      'Attachment card root. Use render={<button type="button" />} when the card itself is the primary action.',
  },
  {
    name: "MessageAttachmentBody / Title / Meta",
    type: 'useRender.ComponentProps<"span">',
    description: "Filename, secondary meta line, and optional MetaDetail / MetaSeparator slots.",
  },
  {
    name: "MessageAttachmentSummary",
    type: 'useRender.ComponentProps<"span">',
    description: "Optional trailing summary chip such as a diff tally.",
  },
  {
    name: "MessageAttachmentActions / Action",
    type: 'useRender.ComponentProps<"span"> / useRender.ComponentProps<"button">',
    description:
      "Hover affordances for preview or download. Icons and callbacks stay caller-owned.",
  },
  {
    name: "MessageAttachmentPendingIndicator / LoadingBar / ErrorOverlay",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Explicit pending, opening, and failed overlays. Upload lifecycle stays product-owned.",
  },
];

export const PREVIEW_PROPS: readonly PropRow[] = [
  {
    name: "MessageAttachmentPreviewRoot",
    type: 'useRender.ComponentProps<"div">',
    description: "Host for sandboxed HTML preview surfaces and overlay chrome.",
  },
  {
    name: "MessageAttachmentPreviewExternalLinksLoading*",
    type: 'useRender.ComponentProps<"div">',
    description: "Loading overlay and panel while interactive external-link preview prepares.",
  },
  {
    name: "MessageAttachmentPreviewExternalLinkHotspot*",
    type: 'useRender.ComponentProps<"div"> / useRender.ComponentProps<"button">',
    description:
      "Parent-owned hotspot layer over reported link rects. Click policy stays caller-owned.",
  },
  {
    name: "MessageAttachmentPreviewExternalLinkFallback*",
    type: 'useRender.ComponentProps<"div"> / useRender.ComponentProps<"button">',
    description: "Blocked-popup fallback banner and dismiss control.",
  },
  {
    name: "MessageAttachmentAudioPreview*",
    type: "compound slots",
    description:
      "Audio preview shell: card, header, icon, meta, title, label, and media. Playback source stays caller-owned.",
  },
];

export const MEDIA_PROPS: readonly PropRow[] = [
  {
    name: "MessageImageGallery / MessageImageGalleryRow",
    type: 'div props; Row adds layout?: "single" | "pair" | "triple"',
    description:
      "Image-gallery root and explicit row grid. Attachment metadata decides row grouping outside the UI package.",
  },
  {
    name: "MessageImageGalleryItem",
    type: 'div props & { size?: "single" | "regular" | "dense" }',
    description:
      "Image cell sizing. Single-image reserved dimensions remain consumer-owned because they derive from attachment metadata.",
  },
  {
    name: "MessageImageGalleryMedia",
    type: 'img props & { fit?: "contain" | "cover"; geometry?: "single" | "normal" | "wide" | "tall" }',
    description: "Image media and source-faithful aspect fit treatment.",
  },
  {
    name: "MessageImageGalleryPreview / Action / Overlay",
    type: "button, button, and div props",
    description:
      "Preview hit area, secondary image action, and pending overlay. Lightbox and download workflows stay caller-owned.",
  },
  {
    name: "MessageVideoPreview / Frame / Media / Fallback / Action",
    type: "compound div, video, and button props",
    description:
      "Inline video shell with real media, explicit fallback, and caller-owned action. Loading and failure state stay outside the UI package.",
  },
];

export const API_GROUPS = [
  { id: "api-card", title: "Attachment card", rows: CARD_PROPS },
  { id: "api-preview", title: "Attachment preview surfaces", rows: PREVIEW_PROPS },
  { id: "api-media", title: "Message media", rows: MEDIA_PROPS },
] as const satisfies readonly { id: string; title: string; rows: readonly PropRow[] }[];
