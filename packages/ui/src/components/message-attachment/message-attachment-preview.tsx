import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { messageAttachmentPreview } from "./message-attachment-preview.recipe";

export type MessageAttachmentPreviewRootProps = useRender.ComponentProps<"div">;

export function MessageAttachmentPreviewRoot({
  className,
  render,
  ...props
}: MessageAttachmentPreviewRootProps) {
  const { root } = messageAttachmentPreview();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-attachment-preview-root",
    },
  });
}

export type MessageAttachmentPreviewExternalLinksLoadingProps = useRender.ComponentProps<"div">;

export function MessageAttachmentPreviewExternalLinksLoading({
  className,
  render,
  ...props
}: MessageAttachmentPreviewExternalLinksLoadingProps) {
  const theme = useThemeFamily();
  const { externalLinksLoading } = messageAttachmentPreview({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    role: "status",
    "data-message-affordance": "attachment-preview-external-links-loading",
    className: externalLinksLoading({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-attachment-preview-external-links-loading",
    },
  });
}

export type MessageAttachmentPreviewExternalLinksLoadingPanelProps =
  useRender.ComponentProps<"div">;

export function MessageAttachmentPreviewExternalLinksLoadingPanel({
  className,
  render,
  ...props
}: MessageAttachmentPreviewExternalLinksLoadingPanelProps) {
  const theme = useThemeFamily();
  const { externalLinksLoadingPanel } = messageAttachmentPreview({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: externalLinksLoadingPanel({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-attachment-preview-external-links-loading-panel",
    },
  });
}

export type MessageAttachmentPreviewExternalLinkHotspotsProps = useRender.ComponentProps<"div">;

export function MessageAttachmentPreviewExternalLinkHotspots({
  className,
  render,
  ...props
}: MessageAttachmentPreviewExternalLinkHotspotsProps) {
  const { externalLinkHotspots } = messageAttachmentPreview();
  const defaultProps: SlotElementProps<"div"> = {
    "data-message-affordance": "attachment-preview-external-link-hotspots",
    className: externalLinkHotspots({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-attachment-preview-external-link-hotspots",
    },
  });
}

export type MessageAttachmentPreviewExternalLinkHotspotProps = useRender.ComponentProps<"button">;

export function MessageAttachmentPreviewExternalLinkHotspot({
  className,
  render,
  type = "button",
  ...props
}: MessageAttachmentPreviewExternalLinkHotspotProps) {
  const theme = useThemeFamily();
  const { externalLinkHotspot } = messageAttachmentPreview({ theme });
  const defaultProps: useRender.ElementProps<"button"> = {
    type,
    className: externalLinkHotspot({ className }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
    state: {
      slot: "message-attachment-preview-external-link-hotspot",
    },
  });
}

export type MessageAttachmentPreviewExternalLinkFallbackProps = useRender.ComponentProps<"div">;

export function MessageAttachmentPreviewExternalLinkFallback({
  className,
  render,
  ...props
}: MessageAttachmentPreviewExternalLinkFallbackProps) {
  const theme = useThemeFamily();
  const { externalLinkFallback } = messageAttachmentPreview({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    role: "status",
    "aria-live": "polite",
    "data-message-affordance": "attachment-preview-external-link-fallback",
    className: externalLinkFallback({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-attachment-preview-external-link-fallback",
    },
  });
}

export type MessageAttachmentPreviewExternalLinkFallbackDismissProps =
  useRender.ComponentProps<"button">;

export function MessageAttachmentPreviewExternalLinkFallbackDismiss({
  className,
  render,
  type = "button",
  ...props
}: MessageAttachmentPreviewExternalLinkFallbackDismissProps) {
  const theme = useThemeFamily();
  const { externalLinkFallbackDismiss } = messageAttachmentPreview({ theme });
  const defaultProps: useRender.ElementProps<"button"> = {
    type,
    className: externalLinkFallbackDismiss({ className }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
    state: {
      slot: "message-attachment-preview-external-link-fallback-dismiss",
    },
  });
}

export type MessageAttachmentAudioPreviewProps = useRender.ComponentProps<"div">;

export function MessageAttachmentAudioPreview({
  className,
  render,
  ...props
}: MessageAttachmentAudioPreviewProps) {
  const theme = useThemeFamily();
  const { audioPreview } = messageAttachmentPreview({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: audioPreview({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-attachment-audio-preview",
    },
  });
}

export type MessageAttachmentAudioPreviewCardProps = useRender.ComponentProps<"div">;

export function MessageAttachmentAudioPreviewCard({
  className,
  render,
  ...props
}: MessageAttachmentAudioPreviewCardProps) {
  const theme = useThemeFamily();
  const { audioPreviewCard } = messageAttachmentPreview({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: audioPreviewCard({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-attachment-audio-preview-card",
    },
  });
}

export type MessageAttachmentAudioPreviewHeaderProps = useRender.ComponentProps<"div">;

export function MessageAttachmentAudioPreviewHeader({
  className,
  render,
  ...props
}: MessageAttachmentAudioPreviewHeaderProps) {
  const theme = useThemeFamily();
  const { audioPreviewHeader } = messageAttachmentPreview({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: audioPreviewHeader({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-attachment-audio-preview-header",
    },
  });
}

export type MessageAttachmentAudioPreviewIconProps = useRender.ComponentProps<"div">;

export function MessageAttachmentAudioPreviewIcon({
  className,
  render,
  ...props
}: MessageAttachmentAudioPreviewIconProps) {
  const theme = useThemeFamily();
  const { audioPreviewIcon } = messageAttachmentPreview({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: audioPreviewIcon({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-attachment-audio-preview-icon",
    },
  });
}

export type MessageAttachmentAudioPreviewMetaProps = useRender.ComponentProps<"div">;

export function MessageAttachmentAudioPreviewMeta({
  className,
  render,
  ...props
}: MessageAttachmentAudioPreviewMetaProps) {
  const { audioPreviewMeta } = messageAttachmentPreview();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: audioPreviewMeta({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-attachment-audio-preview-meta",
    },
  });
}

export type MessageAttachmentAudioPreviewTitleProps = useRender.ComponentProps<"div">;

export function MessageAttachmentAudioPreviewTitle({
  className,
  render,
  ...props
}: MessageAttachmentAudioPreviewTitleProps) {
  const theme = useThemeFamily();
  const { audioPreviewTitle } = messageAttachmentPreview({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: audioPreviewTitle({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-attachment-audio-preview-title",
    },
  });
}

export type MessageAttachmentAudioPreviewLabelProps = useRender.ComponentProps<"div">;

export function MessageAttachmentAudioPreviewLabel({
  className,
  render,
  ...props
}: MessageAttachmentAudioPreviewLabelProps) {
  const theme = useThemeFamily();
  const { audioPreviewLabel } = messageAttachmentPreview({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: audioPreviewLabel({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-attachment-audio-preview-label",
    },
  });
}

export type MessageAttachmentAudioPreviewMediaProps = useRender.ComponentProps<"audio">;

export function MessageAttachmentAudioPreviewMedia({
  className,
  render,
  controls = true,
  preload = "metadata",
  ...props
}: MessageAttachmentAudioPreviewMediaProps) {
  const { audioPreviewMedia } = messageAttachmentPreview();
  const defaultProps: useRender.ElementProps<"audio"> = {
    controls,
    preload,
    className: audioPreviewMedia({ className }),
  };

  return useRender({
    defaultTagName: "audio",
    render,
    props: mergeProps<"audio">(defaultProps, props),
    state: {
      slot: "message-attachment-audio-preview-media",
    },
  });
}
