import type { CSSProperties } from "react";

/**
 * Shared isolation primitive for previewing attacker-controlled content
 * (anyone — human or agent — can upload a hostile attachment, or author a
 * markdown ```mermaid block).
 *
 * The iframe is the real security boundary: with no `allow-same-origin` in
 * `sandbox`, the framed content runs in an opaque origin and cannot touch
 * Raft's DOM / cookies / localStorage. This is strictly stronger than
 * sanitizing a string and hoping the sanitizer has no gaps.
 *
 * Two callsites share this one implementation so the isolation config can't
 * drift between them:
 *  - HTML attachment preview: `src` (scoped backend URL) + `sandbox="allow-scripts"`
 *    (interactive HTML/diagrams need scripts; still no same-origin).
 *  - Mermaid diagram: `srcDoc` (front-end-generated SVG doc) + empty `sandbox`
 *    (static SVG needs zero scripts — the most locked-down setting).
 *
 * @Bugen security review 2026-05-18 #proj-uiux:df4d393b.
 */
export interface SandboxedPreviewFrameProps {
  /** External (scoped) URL to frame. Mutually exclusive with `srcDoc`. */
  src?: string;
  /** Inline document to frame. Mutually exclusive with `src`. */
  srcDoc?: string;
  /**
   * iframe `sandbox` token list. Default `""` = maximally locked (no scripts,
   * no same-origin). Never pass `allow-same-origin` for untrusted content —
   * it dissolves the origin boundary.
   */
  sandbox?: string;
  title: string;
  className?: string;
  style?: CSSProperties;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
}

export default function SandboxedPreviewFrame({
  src,
  srcDoc,
  sandbox = "",
  title,
  className,
  style,
  referrerPolicy = "no-referrer",
}: SandboxedPreviewFrameProps) {
  return (
    <iframe
      title={title}
      src={src}
      srcDoc={srcDoc}
      sandbox={sandbox}
      referrerPolicy={referrerPolicy}
      className={className}
      style={style}
    />
  );
}
