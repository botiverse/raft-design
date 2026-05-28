import { Children, isValidElement, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";

export function extractCodeBlockText(node: ReactNode): string {
  let text = "";

  Children.forEach(node, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      text += child;
      return;
    }

    if (Array.isArray(child)) {
      text += extractCodeBlockText(child);
      return;
    }

    if (isValidElement<{ children?: ReactNode }>(child)) {
      text += extractCodeBlockText(child.props.children);
    }
  });

  return text;
}

function copyTextWithFallback(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand?.("copy") ?? false;
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

interface CopyableCodeBlockProps {
  children: ReactNode;
  className: string;
  wrapperClassName?: string;
}

export default function CopyableCodeBlock({
  children,
  className,
  wrapperClassName = "group relative my-2",
}: CopyableCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const codeText = useMemo(() => extractCodeBlockText(children), [children]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleCopy = useCallback(async () => {
    if (!codeText) return;
    let didCopy = false;
    try {
      await navigator.clipboard.writeText(codeText);
      didCopy = true;
    } catch {
      didCopy = copyTextWithFallback(codeText);
    }
    setCopied(didCopy);
  }, [codeText]);

  // Hover-revealed minimal copy affordance (no card / no border / no
  // shadow). Mirrors the bookmark button at the top-right of every
  // message row — both are "appear on hover, no chrome of their own"
  // affordances. Code blocks live on a dark `bg-gray-900` surface, so
  // the icon uses light tones; the wrapper carries `group` so the
  // child reveals via `group-hover` when the user hovers anywhere on
  // the code block.
  // stdrc 2026-05-08 #proj-uiux:6110c1ce (task #137):
  //   "code block 复制按钮风格感觉跟其他按钮不搭，要么就不要卡片/边框，
  //    类似 msg row 右上角那个，要么就像 copy join link 那个按钮"
  //
  // stdrc 2026-05-09 #proj-uiux:6110c1ce msg=0358ff62 — follow-up: drop
  // the focus ring too. The ring was the only "outer frame" left after
  // a click; with it gone, click is purely "icon swaps to ✓ in lime",
  // matching the rest of the no-chrome interactive surfaces.
  //
  // cindyz 2026-05-09 #proj-uiux msg=80210a5b — follow-up: touch
  // devices have no hover state, so the `text-white/0` default kept
  // the icon permanently invisible on mobile (Joy review msg=b92a5575
  // had flagged this as a known tradeoff). Fix is the
  // `[@media(hover:none)]:text-white/45` opt-in: on touch devices the
  // icon stays softly visible (white/45) so the user can see + tap it.
  // Desktop hover-reveal pattern is preserved untouched: the
  // `[@media(hover:none)]:` selector only fires when the device's
  // primary input lacks hover (touch).
  return (
    <div className={wrapperClassName}>
      <button
        type="button"
        onClick={handleCopy}
        className={`absolute right-2 top-2 z-10 flex size-6 items-center justify-center transition-colors focus:outline-none ${
          copied
            ? "text-brutal-lime"
            : "text-white/0 group-hover:text-white/45 hover:!text-white/90 [@media(hover:none)]:text-white/45"
        }`}
        title={copied ? "Copied" : "Copy code"}
        aria-label={copied ? "Copied code" : "Copy code"}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      <pre className={className}>{children}</pre>
    </div>
  );
}
