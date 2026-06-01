import type { ReactNode } from "react";
import { CodeBlock } from "#/components/code-block.tsx";
import { ComponentPreview } from "#/components/component-preview.tsx";

type ExampleProps = {
  html: string;
  children: ReactNode;
};

/** A rendered demo above its Shiki-highlighted source. */
export function Example({ html, children }: ExampleProps) {
  return (
    <div className="space-y-3">
      <ComponentPreview>{children}</ComponentPreview>
      <CodeBlock html={html} />
    </div>
  );
}
