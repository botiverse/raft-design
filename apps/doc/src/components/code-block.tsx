import type { ReactNode } from "react";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";

type CodeBlockProps = {
  html: ReactNode | AnyRenderableServerComponent;
  variant?: "default" | "embedded";
};

/**
 * Renders either legacy Shiki HTML or an RSC-rendered code block from
 * lib/highlight.tsx.
 */
export function CodeBlock({ html, variant = "default" }: CodeBlockProps) {
  const className =
    variant === "embedded"
      ? "overflow-hidden bg-[oklch(0.986_0_0)] [&>pre]:overflow-x-auto [&>pre]:!bg-[oklch(0.986_0_0)] [&>pre]:!px-0 [&>pre]:!py-0 [&>pre]:font-mono [&>pre]:text-sm [&>pre]:leading-relaxed"
      : "overflow-hidden rounded-lg bg-[oklch(0.986_0_0)] shadow-[0_1px_1px_-0.5px_oklch(0_0_0_/_0.03),0_2px_5px_-2px_oklch(0_0_0_/_0.04),0_8px_18px_-10px_oklch(0_0_0_/_0.06),0_0_0_0.5px_oklch(0_0_0_/_0.20)] [&>pre]:overflow-x-auto [&>pre]:!bg-[oklch(0.986_0_0)] [&>pre]:p-4 [&>pre]:font-mono [&>pre]:text-sm [&>pre]:leading-relaxed";

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
