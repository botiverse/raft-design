import type { PropRow } from "#/components/props-table.tsx";

export const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

export const ANATOMY_SOURCE = `<MessageItemAttachments>
  <MessageAttachmentGroup>
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
        <MessageAttachmentAction />
      </MessageAttachmentActions>
      <MessageAttachmentPendingIndicator />
      <MessageAttachmentLoadingBar />
      <MessageAttachmentErrorOverlay />
    </MessageAttachmentCard>
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
</MessageAttachmentAudioPreview>`;

export const CARD_PROPS: readonly PropRow[] = [
  {
    name: "MessageAttachmentGroup",
    type: 'useRender.ComponentProps<"div">',
    description: "Horizontal group of attachment cards inside MessageItemAttachments.",
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

export const API_GROUPS = [
  { id: "api-card", title: "Attachment card", rows: CARD_PROPS },
  { id: "api-preview", title: "Attachment preview surfaces", rows: PREVIEW_PROPS },
] as const satisfies readonly { id: string; title: string; rows: readonly PropRow[] }[];
