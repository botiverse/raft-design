import type { PropRow } from "#/components/props-table.tsx";

export const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

export const ANATOMY_SOURCE = `<MessageItemAttachments>
  <MessageAttachmentGroup>
    <MessageAttachmentContent>
      <MessageAttachmentTitle />
      <MessageAttachmentSummary />
      <MessageAttachmentCommentSummary />
      <MessageAttachmentDiffSummary>
        <MessageAttachmentDiffAddition />
        <MessageAttachmentDiffDeletion />
      </MessageAttachmentDiffSummary>
      <MessageAttachmentMeta>
        <MessageAttachmentMetaLabel />
        <MessageAttachmentMetaDetail>
          <MessageAttachmentAction />
        </MessageAttachmentMetaDetail>
      </MessageAttachmentMeta>
    </MessageAttachmentContent>
  </MessageAttachmentGroup>
</MessageItemAttachments>

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
    <MessageVideoPreviewFailureContent>
      <MessageVideoPreviewFailureIcon />
      <MessageVideoPreviewFailureTitle />
      <MessageVideoPreviewFailureAction />
    </MessageVideoPreviewFailureContent>
    <MessageVideoPreviewAction />
  </MessageVideoPreviewFrame>
</MessageVideoPreview>`;

export const CARD_STRUCTURE_PROPS: readonly PropRow[] = [
  {
    name: "MessageAttachmentGroup",
    type: "MessageAttachmentGroupProps",
    description: "Horizontal group of attachment cards inside MessageItemAttachments.",
  },
  {
    name: "MessageAttachmentContent",
    type: "MessageAttachmentContentProps",
    description: "Attachment card root.",
  },
  {
    name: "MessageAttachmentTitle",
    type: "MessageAttachmentTitleProps",
    description: "Filename slot at the start of MessageAttachmentContent.",
  },
];

export const CARD_SUMMARY_PROPS: readonly PropRow[] = [
  {
    name: "MessageAttachmentSummary",
    type: "MessageAttachmentSummaryProps",
    description: "Generic compact summary slot inside an attachment card.",
  },
  {
    name: "MessageAttachmentCommentSummary",
    type: "MessageAttachmentCommentSummaryProps",
    description: "Muted attachment-comment count summary.",
  },
  {
    name: "MessageAttachmentDiffSummary",
    type: "MessageAttachmentDiffSummaryProps",
    description: "Diff-stat container for addition and deletion slots.",
  },
  {
    name: "MessageAttachmentDiffAddition",
    type: "MessageAttachmentDiffAdditionProps",
    description: "Semantic positive-diff value inside MessageAttachmentDiffSummary.",
  },
  {
    name: "MessageAttachmentDiffDeletion",
    type: "MessageAttachmentDiffDeletionProps",
    description: "Semantic negative-diff value inside MessageAttachmentDiffSummary.",
  },
];

export const CARD_META_PROPS: readonly PropRow[] = [
  {
    name: "MessageAttachmentMeta",
    type: "MessageAttachmentMetaProps",
    description: "Two-sided metadata row inside MessageAttachmentContent.",
  },
  {
    name: "MessageAttachmentMetaLabel",
    type: "MessageAttachmentMetaLabelProps",
    description: "Left-side metadata label, typically file size.",
  },
  {
    name: "MessageAttachmentMetaDetail",
    type: "MessageAttachmentMetaDetailProps",
    description: "Right-side metadata region for actions or a pending spinner.",
  },
  {
    name: "MessageAttachmentMetaSeparator",
    type: "MessageAttachmentMetaSeparatorProps",
    description: "Decorative separator for metadata fragments.",
  },
  {
    name: "MessageAttachmentAction",
    type: "MessageAttachmentActionProps",
    description: "Caller-owned preview or download action inside MessageAttachmentMetaDetail.",
  },
];

export const IMAGE_GALLERY_PROPS: readonly PropRow[] = [
  {
    name: "MessageImageGallery",
    type: "MessageImageGalleryProps",
    description: "Image-gallery root.",
  },
  {
    name: "MessageImageGalleryRow",
    type: "MessageImageGalleryRowProps",
    description:
      "Explicit image-row grid. Attachment metadata chooses the layout outside the UI package.",
  },
  {
    name: "MessageImageGalleryItem",
    type: "MessageImageGalleryItemProps",
    description:
      "Image cell sizing. Single-image reserved dimensions remain consumer-owned because they derive from attachment metadata.",
  },
  {
    name: "MessageImageGalleryMedia",
    type: "MessageImageGalleryMediaProps",
    description: "Image media and source-faithful aspect fit treatment.",
  },
  {
    name: "MessageImageGalleryPreview",
    type: "MessageImageGalleryPreviewProps",
    description: "Preview hit area; Lightbox behavior remains caller-owned.",
  },
  {
    name: "MessageImageGalleryAction",
    type: "MessageImageGalleryActionProps",
    description: "Secondary image action, such as caller-owned download.",
  },
  {
    name: "MessageImageGalleryOverlay",
    type: "MessageImageGalleryOverlayProps",
    description: "Overlay region for a consumer-owned pending indicator.",
  },
];

export const VIDEO_PREVIEW_PROPS: readonly PropRow[] = [
  {
    name: "MessageVideoPreview",
    type: "MessageVideoPreviewProps",
    description: "Inline video attachment root.",
  },
  {
    name: "MessageVideoPreviewFrame",
    type: "MessageVideoPreviewFrameProps",
    description: "Video frame that contains media or fallback plus the top-right action.",
  },
  {
    name: "MessageVideoPreviewMedia",
    type: "MessageVideoPreviewMediaProps",
    description: "Native video media element for a resolved URL.",
  },
  {
    name: "MessageVideoPreviewFallback",
    type: "MessageVideoPreviewFallbackProps",
    description: "Fallback region for URL loading or unavailable media.",
  },
  {
    name: "MessageVideoPreviewAction",
    type: "MessageVideoPreviewActionProps",
    description: "Top-right caller-owned preview action inside MessageVideoPreviewFrame.",
  },
  {
    name: "MessageVideoPreviewFailureContent",
    type: "MessageVideoPreviewFailureContentProps",
    description: "Structured unavailable-codec fallback content.",
  },
  {
    name: "MessageVideoPreviewFailureIcon",
    type: "MessageVideoPreviewFailureIconProps",
    description: "Warning-icon slot inside failure content.",
  },
  {
    name: "MessageVideoPreviewFailureTitle",
    type: "MessageVideoPreviewFailureTitleProps",
    description: "Failure copy slot inside failure content.",
  },
  {
    name: "MessageVideoPreviewFailureAction",
    type: "MessageVideoPreviewFailureActionProps",
    description: "Download affordance slot; callers provide its icon, copy, and workflow.",
  },
];

export const API_GROUPS = [
  { id: "api-card-structure", title: "Card structure", rows: CARD_STRUCTURE_PROPS },
  { id: "api-card-summary", title: "Card summaries", rows: CARD_SUMMARY_PROPS },
  { id: "api-card-meta", title: "Card metadata", rows: CARD_META_PROPS },
  { id: "api-image-gallery", title: "Image gallery", rows: IMAGE_GALLERY_PROPS },
  { id: "api-video-preview", title: "Video preview", rows: VIDEO_PREVIEW_PROPS },
] as const satisfies readonly { id: string; title: string; rows: readonly PropRow[] }[];
