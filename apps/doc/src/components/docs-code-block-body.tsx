import { Children, isValidElement } from "react";
import type { ReactNode } from "react";

import { DocsCodeBlockCopy } from "./docs-code-block-copy.tsx";
import { DocsCodeBlockHeader } from "./docs-code-block-header.tsx";
import { DocsCodeBlockLineNumbers } from "./docs-code-block-line-numbers.tsx";
import { DocsCodeBlockSection } from "./docs-code-block-section.tsx";
import { docsCodeBlock } from "./docs-code-block.recipe.ts";
import type { DocsCodeBlockBodyProps, DocsCodeBlockContentProps } from "./docs-code-block.types.ts";

function highlightedHtmlToSource(html: string) {
  return html
    .replace(/<[^>]*>/g, "")
    .replaceAll("&quot;", '"')
    .replaceAll("&gt;", ">")
    .replaceAll("&lt;", "<")
    .replaceAll("&amp;", "&");
}

function findAnatomySource(children: ReactNode) {
  for (const child of Children.toArray(children)) {
    if (!isValidElement<DocsCodeBlockContentProps>(child)) continue;
    if (
      typeof child.props.html === "string" &&
      child.props.html.includes('data-doc-snippet="anatomy"')
    ) {
      return highlightedHtmlToSource(child.props.html);
    }
  }
}

export function DocsCodeBlockBody({
  children,
  showLineNumbers = false,
  source,
}: DocsCodeBlockBodyProps) {
  const styles = docsCodeBlock({ showLineNumbers });
  const lineCount = source?.split("\n").length ?? 0;
  const autoCopySource = source === undefined ? findAnatomySource(children) : undefined;

  return (
    <>
      {autoCopySource ? (
        <DocsCodeBlockHeader showLineNumbers={showLineNumbers}>
          <span aria-hidden className="min-w-0 flex-1" />
          <DocsCodeBlockCopy source={autoCopySource} />
        </DocsCodeBlockHeader>
      ) : null}
      <DocsCodeBlockSection
        sectionKind="body"
        leftGutter={
          showLineNumbers && source ? <DocsCodeBlockLineNumbers lineCount={lineCount} /> : null
        }
        showLineNumbers={showLineNumbers}
      >
        <div className={styles.bodyRow()}>
          <div className={styles.bodyContent()}>{children}</div>
        </div>
      </DocsCodeBlockSection>
    </>
  );
}
