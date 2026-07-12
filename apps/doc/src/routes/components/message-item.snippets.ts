import type { PropRow } from "#/components/props-table.tsx";

export const TOC = [
  { id: "preview", title: "Preview" },
  { id: "state-matrix", title: "State matrix" },
  { id: "fixtures", title: "Fixtures" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

export const PROPS: readonly PropRow[] = [
  {
    name: "MessageItem",
    type: 'useRender.ComponentProps<"div"> & { compact?: boolean }',
    description:
      "Root row. Compose MessageItemActive, MessageItemSearchMatch, or MessageItemSelection for explicit row chrome.",
  },
  {
    name: "MessageItemHeader",
    type: 'useRender.ComponentProps<"div">',
    description: "Sender, sender state, metadata, timestamp, and inline delivery state row.",
  },
  {
    name: "MessageMultiSelect / MessageMultiSelectCheckbox",
    type: "controlled or uncontrolled selection root + Checkbox props with a required value",
    description:
      "Multi-message selection behavior and semantic checkbox. The root owns active and selected state.",
  },
  {
    name: "MessageItemSenderState",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Sender status badge for removed, deactivated, or similarly caller-owned sender states.",
  },
  {
    name: "MessageItemBody",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Message content slot. Markdown, mentions, links, and translation output are caller-owned.",
  },
  {
    name: "MessageItemToolbar",
    type: 'useRender.ComponentProps<"div"> & { visible?: boolean }',
    description: "Hover toolbar slot matching the source brutal pill treatment.",
  },
  {
    name: "MessageItemToolbarButton",
    type: 'useRender.ComponentProps<"button"> & { tone?: "default" | "accent" }',
    description:
      'Toolbar action button. Use native aria-pressed for toggled actions; tone="accent" tints the pressed state (e.g. saved).',
  },
  {
    name: "MessageItemSavedIndicator",
    type: 'useRender.ComponentProps<"span">',
    description: "Pinned saved marker shown on the row until the hover toolbar takes over.",
  },
  {
    name: "MessageItemBadge",
    type: 'useRender.ComponentProps<"span"> & { status?: "read" | "unread" }',
    description:
      "Footer badge slot with read and unread treatments. Business labels and icons remain caller-owned.",
  },
  {
    name: "MessageImageGallery",
    type: "compound slots",
    description:
      "Image grid, overlay-driven pending treatment, and media fit slots for source image attachment variants.",
  },
  {
    name: "MessageImageGalleryItem",
    type: 'useRender.ComponentProps<"div"> & { single?: boolean }',
    description:
      "Image item shell. Rendering MessageImageGalleryOverlay derives pending dimming; single controls layout only.",
  },
  {
    name: "MessageImageGalleryMedia",
    type: 'useRender.ComponentProps<"img"> & { fit?: "contain" | "cover" }',
    description: "Image media fit mode used by preview thumbnails and contain-style attachments.",
  },
  {
    name: "MessageAttachmentCard",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Attachment card shell. Loading, pending, error, and action visuals are caller-composed parts.",
  },
  {
    name: "MessageVideoPreview",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Inline video preview shell. Consumers compose media, fallback, action, and pending content as children.",
  },
  {
    name: "MessageVideoPreviewFallback",
    type: 'useRender.ComponentProps<"div"> & { interactive?: boolean }',
    description: "Fallback/play surface. Interactive changes cursor and hover treatment only.",
  },
  {
    name: "MessageReactionChip",
    type: 'useRender.ComponentProps<"button">',
    description:
      "Reaction chip styled through native aria-pressed. Mutation failure is composed as an explicit indicator child.",
  },
  {
    name: "MessageReactionErrorIndicator",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Screen-reader status and stable styling slot for caller-owned reaction failure copy.",
  },
  {
    name: "MessageReactionGlyph",
    type: 'useRender.ComponentProps<"span"> & { emoji?: string; size?: number }',
    description: "Native emoji or caller-provided icon slot for reaction affordances.",
  },
  {
    name: "MessageReactionQuickRow",
    type: "compound slots",
    description: "Quick reaction row, picker, and reactors list. Open state stays caller-owned.",
  },
  {
    name: "MessageReactionPicker",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Standalone quick reaction picker shell. Positioning and open state are caller-owned.",
  },
  {
    name: "MessageReactionTooltip",
    type: "Tooltip compound parts",
    description:
      "Reactors tooltip with Base UI trigger, positioning, names, and +N overflow anatomy.",
  },
  {
    name: "SystemMessageItem",
    type: 'useRender.ComponentProps<"div">',
    description: "Centered compact system row for join, leave, archive, and similar system events.",
  },
];
