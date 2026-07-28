import { DocsCodeBlockLineNumbers } from "./docs-code-block-line-numbers.tsx";
import { DocsCodeBlockSection } from "./docs-code-block-section.tsx";
import { docsCodeBlock } from "./docs-code-block.recipe.ts";
import type { DocsCodeBlockBodyProps } from "./docs-code-block.types.ts";

export function DocsCodeBlockBody({
  children,
  showLineNumbers = false,
  source,
}: DocsCodeBlockBodyProps) {
  const styles = docsCodeBlock({ showLineNumbers });
  const lineCount = source?.split("\n").length ?? 0;

  return (
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
  );
}
