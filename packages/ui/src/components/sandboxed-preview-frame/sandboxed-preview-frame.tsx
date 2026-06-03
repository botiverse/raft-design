import type { CSSProperties, HTMLAttributeReferrerPolicy } from "react";
import { tv } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

// Isolation primitive for previewing attacker-controlled content. The iframe is
// the security boundary: with no `allow-same-origin` in `sandbox`, framed content
// runs in an opaque origin. Pure passthrough — no styling of its own.
const sandboxedPreviewFrame = tv({
  slots: {
    frame: "",
  },
  variants: {
    theme: {
      brutal: {},
      // No visual styling to theme; kept as the elegant extension point.
      elegant: {},
    },
  },
});

export type SandboxedPreviewFrameProps = {
  /** External (scoped) URL to frame. Mutually exclusive with `srcDoc`. */
  src?: string;
  /** Inline document to frame. Mutually exclusive with `src`. */
  srcDoc?: string;
  /** iframe `sandbox` token list. Default `""` = maximally locked (no scripts,
   *  no same-origin). Never pass `allow-same-origin` for untrusted content. */
  sandbox?: string;
  title: string;
  className?: string;
  style?: CSSProperties;
  referrerPolicy?: HTMLAttributeReferrerPolicy;
};

export function SandboxedPreviewFrame({
  src,
  srcDoc,
  sandbox = "",
  title,
  className,
  style,
  referrerPolicy = "no-referrer",
}: SandboxedPreviewFrameProps) {
  const theme = useTheme();
  const { frame } = sandboxedPreviewFrame({ theme });

  return (
    <iframe
      data-slot="sandboxed-preview-frame"
      title={title}
      src={src}
      srcDoc={srcDoc}
      sandbox={sandbox}
      referrerPolicy={referrerPolicy}
      className={frame({ className })}
      style={style}
    />
  );
}
