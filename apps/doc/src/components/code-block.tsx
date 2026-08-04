import type { ReactNode } from "react";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";

type CodeBlockProps = {
  html: ReactNode | AnyRenderableServerComponent;
  variant?: "default" | "embedded" | "docs";
};

/* Shiki tokens carry both palettes as CSS vars; pick per document mode. */
const syntaxPaletteClassName =
  "[&_pre_span]:text-[var(--shiki-light,currentColor)] dark:[&_pre_span]:text-[var(--shiki-dark,currentColor)]";

const defaultClassName = `overflow-hidden rounded-lg bg-[oklch(0.986_0_0)] shadow-[0_1px_1px_-0.5px_oklch(0_0_0_/_0.03),0_2px_5px_-2px_oklch(0_0_0_/_0.04),0_8px_18px_-10px_oklch(0_0_0_/_0.06),0_0_0_0.5px_oklch(0_0_0_/_0.20)] dark:bg-layer-card dark:shadow-[inset_0_1px_0_oklch(1_0_0_/_0.04),0_0_0_1px_oklch(0_0_0_/_0.35)] [&>pre]:overflow-x-auto [&>pre]:!bg-transparent [&>pre]:p-4 [&>pre]:font-mono [&>pre]:text-sm [&>pre]:leading-relaxed ${syntaxPaletteClassName}`;

const embeddedClassName = `overflow-hidden bg-[oklch(0.986_0_0)] dark:bg-layer-card [&>pre]:overflow-x-auto [&>pre]:!bg-transparent [&>pre]:!px-0 [&>pre]:!py-0 [&>pre]:font-mono [&>pre]:text-sm [&>pre]:leading-relaxed ${syntaxPaletteClassName}`;

const docsClassName = `min-w-0 flex-1 overflow-hidden rounded-none bg-white dark:bg-transparent [&>pre]:overflow-x-auto [&>pre]:!bg-transparent [&>pre]:!p-0 [&>pre]:font-mono [&>pre]:text-sm [&>pre]:leading-relaxed [&>pre>code>span]:block ${syntaxPaletteClassName}`;

/**
 * Renders either legacy Shiki HTML or an RSC-rendered code block from
 * lib/highlight.tsx.
 */
export function CodeBlock({ html, variant = "default" }: CodeBlockProps) {
  const className =
    variant === "embedded"
      ? embeddedClassName
      : variant === "docs"
        ? docsClassName
        : defaultClassName;

  if (typeof html !== "string") {
    return <div className={className}>{html as ReactNode}</div>;
  }

  return (
    <div
      className={className}
      // Trusted build-time Shiki output (our own snippet strings, see lib/highlight.ts).
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
