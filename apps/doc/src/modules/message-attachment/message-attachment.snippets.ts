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

export const MESSAGE_ATTACHMENT_GROUP_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "MessageAttachmentGroupProps",
    description: "Horizontal group of attachment cards inside MessageItemAttachments.",
  },
];

export const MESSAGE_ATTACHMENT_CARD_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "MessageAttachmentCardProps",
    description: "Attachment card root.",
  },
];

export const MESSAGE_ATTACHMENT_TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "MessageAttachmentTitleProps",
    description: "Filename slot at the start of MessageAttachmentCard.",
  },
];

export const MESSAGE_ATTACHMENT_SUMMARY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "MessageAttachmentSummaryProps",
    description:
      "Shared summary row. Owns layout, icon sizing, placement, and typography; compose a semantic summary through render.",
  },
];

export const MESSAGE_ATTACHMENT_COMMENT_SUMMARY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "MessageAttachmentCommentSummaryProps",
    description:
      "Comment-summary semantics composed onto MessageAttachmentSummary. Owns only its compact gap and muted color.",
  },
];

export const MESSAGE_ATTACHMENT_DIFF_SUMMARY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "MessageAttachmentDiffSummaryProps",
    description:
      "Diff-summary semantics composed onto MessageAttachmentSummary. Owns only its internal gap.",
  },
];

export const MESSAGE_ATTACHMENT_DIFF_ADDITION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "MessageAttachmentDiffAdditionProps",
    description: "Semantic positive-diff value inside MessageAttachmentDiffSummary.",
  },
];

export const MESSAGE_ATTACHMENT_DIFF_DELETION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "MessageAttachmentDiffDeletionProps",
    description: "Semantic negative-diff value inside MessageAttachmentDiffSummary.",
  },
];

export const MESSAGE_ATTACHMENT_META_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "MessageAttachmentMetaProps",
    description: "Two-sided metadata row inside MessageAttachmentCard.",
  },
];

export const MESSAGE_ATTACHMENT_META_START_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "MessageAttachmentMetaStartProps",
    description: "Start-side metadata region, typically file size.",
  },
];

export const MESSAGE_ATTACHMENT_META_END_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "MessageAttachmentMetaEndProps",
    description: "End-side metadata region for actions or a pending spinner.",
  },
];

export const MESSAGE_ATTACHMENT_ACTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "MessageAttachmentActionProps",
    description: "Caller-owned preview or download action inside MessageAttachmentMetaEnd.",
  },
];

export const MESSAGE_IMAGE_GALLERY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "MessageImageGalleryProps",
    description:
      "Image-gallery root. Consumers compose each attachment row as a native grid child.",
  },
];

export const MESSAGE_IMAGE_GALLERY_ITEM_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "MessageImageGalleryItemProps",
    description: "Image cell with consumer-owned geometry and layout classes.",
  },
];

export const MESSAGE_IMAGE_GALLERY_MEDIA_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "MessageImageGalleryMediaProps",
    description:
      "Media container. Render the source element as children and let it choose cover or contain.",
  },
];

export const MESSAGE_IMAGE_GALLERY_PREVIEW_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "MessageImageGalleryPreviewProps",
    description: "Preview hit area; Lightbox behavior remains caller-owned.",
  },
];

export const MESSAGE_IMAGE_GALLERY_ACTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "MessageImageGalleryActionProps",
    description: "Secondary image action, such as caller-owned download.",
  },
];

export const MESSAGE_IMAGE_GALLERY_OVERLAY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "MessageImageGalleryOverlayProps",
    description: "Overlay region for consumer-owned pending content such as Spinner.",
  },
];

export const MESSAGE_VIDEO_PREVIEW_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "MessageVideoPreviewProps",
    description: "Inline video attachment root.",
  },
];

export const MESSAGE_VIDEO_PREVIEW_MEDIA_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "MessageVideoPreviewMediaProps",
    description: "Native video media element for a resolved URL.",
  },
];

export const MESSAGE_VIDEO_PREVIEW_FALLBACK_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "MessageVideoPreviewFallbackProps",
    description:
      "Fallback region for consumer-owned URL loading or unavailable-media content. Render instead of MessageVideoPreviewMedia.",
  },
];

export const MESSAGE_VIDEO_PREVIEW_ACTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "MessageVideoPreviewActionProps",
    description: "Top-right caller-owned preview action inside MessageVideoPreview.",
  },
];

export const MESSAGE_VIDEO_PREVIEW_FAILURE_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "MessageVideoPreviewFailureContentProps",
    description: "Structured unavailable-codec fallback content.",
  },
];

export const MESSAGE_VIDEO_PREVIEW_FAILURE_ICON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "MessageVideoPreviewFailureIconProps",
    description: "Warning-icon slot inside failure content.",
  },
];

export const MESSAGE_VIDEO_PREVIEW_FAILURE_TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "MessageVideoPreviewFailureTitleProps",
    description: "Failure copy slot inside failure content.",
  },
];

export const MESSAGE_VIDEO_PREVIEW_FAILURE_ACTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "MessageVideoPreviewFailureActionProps",
    description:
      "Download button inside failure content; callers provide its icon, copy, and workflow.",
  },
];
