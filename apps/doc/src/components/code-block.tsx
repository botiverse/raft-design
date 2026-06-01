type CodeBlockProps = {
  html: string;
};

/**
 * Renders Shiki-highlighted code. `html` is generated at build time from our own
 * snippet strings (see lib/highlight.ts), so it is trusted markup.
 */
export function CodeBlock({ html }: CodeBlockProps) {
  return (
    <div
      className="overflow-hidden rounded-lg border border-gray-200 [&>pre]:overflow-x-auto [&>pre]:!bg-gray-50 [&>pre]:p-4 [&>pre]:font-mono [&>pre]:text-sm [&>pre]:leading-relaxed"
      // Trusted build-time Shiki output (our own snippet strings, see lib/highlight.ts).
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
