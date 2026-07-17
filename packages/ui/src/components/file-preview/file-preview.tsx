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
        <>
          <FileText />
          {children}
        </>
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

export type FilePreviewFileProps = useRender.ComponentProps<"span">;

export function FilePreviewFile({ children, className, render, ...props }: FilePreviewFileProps) {
  const theme = useThemeFamily();
  const {
    file,
    fileZip,
    fileZipDark,
    fileZipLight,
    fileZipPull,
    fileZipRow,
    fileZipStack,
    fileZipTeeth,
  } = filePreview({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "aria-hidden": true,
    "data-slot": "file-preview-file",
    className: file({ className }),
    children: (
      <>
        <span className={fileZip()}>
          <span className={fileZipStack()}>
            <span className={fileZipTeeth()}>
              <span className={fileZipRow()}>
                <span className={fileZipDark()} />
                <span className={fileZipLight()} />
              </span>
              <span className={fileZipRow()}>
                <span className={fileZipLight()} />
                <span className={fileZipDark()} />
              </span>
              <span className={fileZipRow()}>
                <span className={fileZipDark()} />
                <span className={fileZipLight()} />
              </span>
              <span className={fileZipRow()}>
                <span className={fileZipLight()} />
                <span className={fileZipDark()} />
              </span>
              <span className={fileZipRow()}>
                <span className={fileZipDark()} />
                <span className={fileZipLight()} />
              </span>
            </span>
            <span className={fileZipPull()} />
          </span>
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

export type FilePreviewCodeProps = useRender.ComponentProps<"span">;

export function FilePreviewCode({ children, className, render, ...props }: FilePreviewCodeProps) {
  const theme = useThemeFamily();
  const {
    code,
    codeAttributeLine,
    codeGlyph,
    codeRow,
    codeRowIndent,
    codeSelfClosingLine,
    codeStack,
    codeTagLine,
    codeTextLine,
    codeTextRow,
  } = filePreview({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "aria-hidden": true,
    "data-slot": "file-preview-code",
    className: code({ className }),
    children: (
      <>
        <span className={codeStack()}>
          <span className={codeRow()}>
            <span className={codeGlyph()}>&lt;</span>
            <span className={codeTagLine()} />
            <span className={codeGlyph()}>&gt;</span>
          </span>
          <span className={codeRowIndent()}>
            <span className={codeGlyph()}>&lt;</span>
            <span className={codeAttributeLine()} />
            <span className={codeGlyph()}>&gt;</span>
          </span>
          <span className={codeTextRow()}>
            <span className={codeTextLine()} />
          </span>
          <span className={codeRowIndent()}>
            <span className={codeGlyph()}>&lt;/</span>
            <span className={codeAttributeLine()} />
            <span className={codeGlyph()}>&gt;</span>
          </span>
          <span className={codeRowIndent()}>
            <span className={codeGlyph()}>&lt;</span>
            <span className={codeSelfClosingLine()} />
            <span className={codeGlyph()}>/&gt;</span>
          </span>
          <span className={codeRow()}>
            <span className={codeGlyph()}>&lt;/</span>
            <span className={codeTagLine()} />
            <span className={codeGlyph()}>&gt;</span>
          </span>
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

export type FilePreviewBadgeColor = "rose" | "blue" | "amber" | "emerald" | "violet" | "neutral";

export function FilePreviewBadge({
  className,
  render,
  color = "rose",
  ...props
}: FilePreviewBadgeProps & { color?: FilePreviewBadgeColor }) {
  const { badge } = filePreview({ badgeColor: color });
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

export function FilePreviewMedia({ children, className, render, ...props }: FilePreviewMediaProps) {
  const { media } = filePreview();
  const defaultProps: SlotElementProps<"span"> = {
    "aria-hidden": true,
    "data-slot": "file-preview-media",
    className: media({ className }),
    children,
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
