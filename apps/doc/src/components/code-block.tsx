import type { ReactNode } from "react";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";

type CodeBlockProps = {
  html: ReactNode | AnyRenderableServerComponent;
};

/**
 * Renders either legacy Shiki HTML or an RSC-rendered code block from
 * lib/highlight.tsx.
 */
export function CodeBlock({ html }: CodeBlockProps) {
  if (typeof html !== "string") {
    return html as ReactNode;
  }

  return (
    <div
      className="overflow-hidden rounded-lg border border-gray-200 [&>pre]:overflow-x-auto [&>pre]:!bg-gray-50 [&>pre]:p-4 [&>pre]:font-mono [&>pre]:text-sm [&>pre]:leading-relaxed"
      // Trusted build-time Shiki output (our own snippet strings, see lib/highlight.ts).
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
