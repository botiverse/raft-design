import { docsCodeBlock } from "./docs-code-block.recipe.ts";
import type { DocsCodeBlockSectionProps } from "./docs-code-block.types.ts";

export function DocsCodeBlockSection({
  children,
  className,
  leftGutter,
  sectionKind,
  showLineNumbers,
}: DocsCodeBlockSectionProps) {
  const styles = docsCodeBlock({ sectionKind, showLineNumbers });

  return (
    <div className={styles.section({ className })}>
      <div aria-hidden className={styles.gutter()}>
        {leftGutter}
      </div>
      <div className={styles.sectionInner()}>{children}</div>
      <div aria-hidden className={styles.gutter()} />
    </div>
  );
}
