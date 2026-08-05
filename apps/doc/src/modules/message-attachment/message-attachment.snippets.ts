import type { PropRow } from "#/components/props-table.tsx";

export const FILE_CARD_ANATOMY_SOURCE = `import {
  MessageAttachmentAction,
  MessageAttachmentCard,
  MessageAttachmentCommentSummary,
  MessageAttachmentDiffAddition,
  MessageAttachmentDiffDeletion,
  MessageAttachmentDiffSummary,
  MessageAttachmentGroup,
  MessageAttachmentMeta,
  MessageAttachmentMetaEnd,
  MessageAttachmentMetaStart,
  MessageAttachmentSummary,
  MessageAttachmentTitle,
  MessageItemAttachments,
} from "raft-ui";

<MessageItemAttachments>
  <MessageAttachmentGroup>
    <MessageAttachmentCard>
      <MessageAttachmentTitle />
      <MessageAttachmentSummary render={<MessageAttachmentCommentSummary />} />
      <MessageAttachmentMeta>
        <MessageAttachmentMetaStart />
        <MessageAttachmentMetaEnd>
          <MessageAttachmentAction />
        </MessageAttachmentMetaEnd>
      </MessageAttachmentMeta>
    </MessageAttachmentCard>
  </MessageAttachmentGroup>
</MessageItemAttachments>

<MessageAttachmentSummary render={<MessageAttachmentDiffSummary />}>
  <MessageAttachmentDiffAddition />
  <MessageAttachmentDiffDeletion />
</MessageAttachmentSummary>`;

export const IMAGE_GALLERY_ANATOMY_SOURCE = `import {
  MessageImageGallery,
  MessageImageGalleryAction,
  MessageImageGalleryItem,
  MessageImageGalleryMedia,
  MessageImageGalleryOverlay,
  MessageImageGalleryPreview,
} from "raft-ui";

<MessageImageGallery>
  <div className="grid grid-cols-2 gap-2">
    <MessageImageGalleryItem>
      <MessageImageGalleryMedia>
        <img src="/image.jpg" className="h-full w-full object-cover" alt="" />
      </MessageImageGalleryMedia>
      <MessageImageGalleryPreview />
      <MessageImageGalleryAction />
    </MessageImageGalleryItem>
  </div>
</MessageImageGallery>

<MessageImageGallery>
  <div className="grid grid-cols-1 gap-2">
    <MessageImageGalleryItem aria-busy>
      <MessageImageGalleryMedia>
        <img src="/image.jpg" className="h-full w-full object-contain" alt="" />
      </MessageImageGalleryMedia>
      <MessageImageGalleryOverlay />
    </MessageImageGalleryItem>
  </div>
</MessageImageGallery>`;

export const VIDEO_PREVIEW_ANATOMY_SOURCE = `import {
  MessageVideoPreview,
  MessageVideoPreviewAction,
  MessageVideoPreviewFailureAction,
  MessageVideoPreviewFailureContent,
  MessageVideoPreviewFailureIcon,
  MessageVideoPreviewFailureTitle,
  MessageVideoPreviewFallback,
  MessageVideoPreviewMedia,
  Spinner,
} from "raft-ui";

<MessageVideoPreview>
  <MessageVideoPreviewMedia />
  <MessageVideoPreviewAction />
</MessageVideoPreview>

<MessageVideoPreview aria-busy>
  <MessageVideoPreviewFallback>
    <Spinner />
  </MessageVideoPreviewFallback>
</MessageVideoPreview>

<MessageVideoPreview>
  <MessageVideoPreviewFallback>
    <MessageVideoPreviewFailureContent>
      <MessageVideoPreviewFailureIcon />
      <MessageVideoPreviewFailureTitle />
      <MessageVideoPreviewFailureAction />
    </MessageVideoPreviewFailureContent>
  </MessageVideoPreviewFallback>
</MessageVideoPreview>`;

export const CARD_STRUCTURE_PROPS: readonly PropRow[] = [
  {
    name: "MessageAttachmentGroup",
    type: "MessageAttachmentGroupProps",
    description: "Horizontal group of attachment cards inside MessageItemAttachments.",
  },
  {
    name: "MessageAttachmentCard",
    type: "MessageAttachmentCardProps",
    description: "Attachment card root.",
  },
  {
    name: "MessageAttachmentTitle",
    type: "MessageAttachmentTitleProps",
    description: "Filename slot at the start of MessageAttachmentCard.",
  },
];

export const CARD_SUMMARY_PROPS: readonly PropRow[] = [
  {
    name: "MessageAttachmentSummary",
    type: "MessageAttachmentSummaryProps",
    description:
      "Shared summary row. Owns layout, icon sizing, placement, and typography; compose a semantic summary through render.",
  },
  {
    name: "MessageAttachmentCommentSummary",
    type: "MessageAttachmentCommentSummaryProps",
    description:
      "Comment-summary semantics composed onto MessageAttachmentSummary. Owns only its compact gap and muted color.",
  },
  {
    name: "MessageAttachmentDiffSummary",
    type: "MessageAttachmentDiffSummaryProps",
    description:
      "Diff-summary semantics composed onto MessageAttachmentSummary. Owns only its internal gap.",
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
    description: "Two-sided metadata row inside MessageAttachmentCard.",
  },
  {
    name: "MessageAttachmentMetaStart",
    type: "MessageAttachmentMetaStartProps",
    description: "Start-side metadata region, typically file size.",
  },
  {
    name: "MessageAttachmentMetaEnd",
    type: "MessageAttachmentMetaEndProps",
    description: "End-side metadata region for actions or a pending spinner.",
  },
  {
    name: "MessageAttachmentAction",
    type: "MessageAttachmentActionProps",
    description: "Caller-owned preview or download action inside MessageAttachmentMetaEnd.",
  },
];

export const IMAGE_GALLERY_PROPS: readonly PropRow[] = [
  {
    name: "MessageImageGallery",
    type: "MessageImageGalleryProps",
    description:
      "Image-gallery root. Consumers compose each attachment row as a native grid child.",
  },
  {
    name: "MessageImageGalleryItem",
    type: "MessageImageGalleryItemProps",
    description: "Image cell with consumer-owned geometry and layout classes.",
  },
  {
    name: "MessageImageGalleryMedia",
    type: "MessageImageGalleryMediaProps",
    description:
      "Media container. Render the source element as children and let it choose cover or contain.",
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
    description: "Overlay region for consumer-owned pending content such as Spinner.",
  },
];

export const VIDEO_PREVIEW_PROPS: readonly PropRow[] = [
  {
    name: "MessageVideoPreview",
    type: "MessageVideoPreviewProps",
    description: "Inline video attachment root.",
  },
  {
    name: "MessageVideoPreviewMedia",
    type: "MessageVideoPreviewMediaProps",
    description: "Native video media element for a resolved URL.",
  },
  {
    name: "MessageVideoPreviewFallback",
    type: "MessageVideoPreviewFallbackProps",
    description:
      "Fallback region for consumer-owned URL loading or unavailable-media content. Render instead of MessageVideoPreviewMedia.",
  },
  {
    name: "MessageVideoPreviewAction",
    type: "MessageVideoPreviewActionProps",
    description: "Top-right caller-owned preview action inside MessageVideoPreview.",
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
    description:
      "Download button inside failure content; callers provide its icon, copy, and workflow.",
  },
];

export const API_GROUPS = [
  { id: "api-card-structure", title: "Card structure", rows: CARD_STRUCTURE_PROPS },
  { id: "api-card-summary", title: "Card summaries", rows: CARD_SUMMARY_PROPS },
  { id: "api-card-meta", title: "Card metadata", rows: CARD_META_PROPS },
  { id: "api-image-gallery", title: "Image gallery", rows: IMAGE_GALLERY_PROPS },
  { id: "api-video-preview", title: "Video preview", rows: VIDEO_PREVIEW_PROPS },
] as const satisfies readonly { id: string; title: string; rows: readonly PropRow[] }[];
