import type { CSSProperties } from "react";

/**
 * Isolation primitive for previewing untrusted attachments and generated diagrams.
 * Omitting `allow-same-origin` keeps framed content in an opaque origin.
 */
export interface SandboxedPreviewFrameProps {
  src?: string;
  srcDoc?: string;
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
