import { docsCodeBlock } from "./docs-code-block.recipe.ts";
import type { DocsCodeBlockLineNumbersProps } from "./docs-code-block.types.ts";

export function DocsCodeBlockLineNumbers({ lineCount }: DocsCodeBlockLineNumbersProps) {
  const styles = docsCodeBlock();

  return (
    <div className={styles.lineNumbers()}>
      {Array.from({ length: lineCount }, (_, index) => (
        <div key={index} className={styles.lineNumber()}>
          {index + 1}
        </div>
      ))}
    </div>
  );
}
