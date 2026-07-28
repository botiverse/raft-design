import { DocsCodeBlockSection } from "./docs-code-block-section.tsx";
import { docsCodeBlock } from "./docs-code-block.recipe.ts";
import type { DocsCodeBlockHeaderProps } from "./docs-code-block.types.ts";

export function DocsCodeBlockHeader({ children, showLineNumbers }: DocsCodeBlockHeaderProps) {
  const styles = docsCodeBlock();

  return (
    <DocsCodeBlockSection sectionKind="header" showLineNumbers={showLineNumbers}>
      <div className={styles.headerBar()}>{children}</div>
    </DocsCodeBlockSection>
  );
}
