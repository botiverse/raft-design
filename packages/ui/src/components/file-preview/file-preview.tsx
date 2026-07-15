import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { FileText } from "lucide-react";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { SlotElementProps } from "../../lib/data-attributes";
import { filePreview } from "./file-preview.recipe";

export type FilePreviewProps = useRender.ComponentProps<"span">;

export function FilePreview({ className, render, ...props }: FilePreviewProps) {
  const { root } = filePreview();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "file-preview",
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type FilePreviewDocumentProps = useRender.ComponentProps<"span">;

export function FilePreviewDocument({
  children,
  className,
  render,
  ...props
}: FilePreviewDocumentProps) {
  const theme = useThemeFamily();
  const { document } = filePreview({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "aria-hidden": true,
    "data-slot": "file-preview-document",
    className: document({ className }),
    children:
      theme === "brutal" ? (
        <FileText />
      ) : (
        <>
          <span className="block h-0.5 w-full rounded-full bg-ink-10" />
          <span className="flex gap-0.5">
            <span className="h-0.5 w-1/3 rounded-full bg-ink-10" />
            <span className="h-0.5 w-2/3 rounded-full bg-ink-10" />
          </span>
          <span className="flex gap-0.5">
            <span className="h-0.5 w-1/2 rounded-full bg-ink-10" />
            <span className="h-0.5 w-1/2 rounded-full bg-ink-10" />
          </span>
          <span className="flex gap-0.5">
            <span className="h-0.5 w-1/3 rounded-full bg-ink-10" />
            <span className="h-0.5 w-2/3 rounded-full bg-ink-10" />
          </span>
          {children}
        </>
      ),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type FilePreviewBadgeProps = useRender.ComponentProps<"span">;

export type FilePreviewBadgeTone = "rose" | "blue" | "amber" | "emerald" | "violet" | "neutral";

export function FilePreviewBadge({
  className,
  render,
  tone = "rose",
  ...props
}: FilePreviewBadgeProps & { tone?: FilePreviewBadgeTone }) {
  const { badge } = filePreview({ badgeTone: tone });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "file-preview-badge",
    className: badge({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type FilePreviewMediaProps = useRender.ComponentProps<"span">;

export function FilePreviewMedia({ className, render, ...props }: FilePreviewMediaProps) {
  const { media } = filePreview();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "file-preview-media",
    className: media({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type FilePreviewImageProps = useRender.ComponentProps<"img">;

export function FilePreviewImage({ className, render, ...props }: FilePreviewImageProps) {
  const { image } = filePreview();
  const defaultProps: SlotElementProps<"img"> = {
    "data-slot": "file-preview-image",
    className: image({ className }),
  };

  return useRender({
    defaultTagName: "img",
    render,
    props: mergeProps<"img">(defaultProps, props),
  });
}

export type FilePreviewVideoProps = useRender.ComponentProps<"video">;

export function FilePreviewVideo({ className, render, ...props }: FilePreviewVideoProps) {
  const { video } = filePreview();
  const defaultProps: SlotElementProps<"video"> = {
    "data-slot": "file-preview-video",
    className: video({ className }),
    muted: true,
    playsInline: true,
    preload: "metadata",
  };

  return useRender({
    defaultTagName: "video",
    render,
    props: mergeProps<"video">(defaultProps, props),
  });
}
