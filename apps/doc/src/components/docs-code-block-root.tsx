import { docsCodeBlock } from "./docs-code-block.recipe.ts";
import type { DocsCodeBlockRootProps } from "./docs-code-block.types.ts";

export function DocsCodeBlockRoot({ children, showLineNumbers = false }: DocsCodeBlockRootProps) {
  const styles = docsCodeBlock();

  return (
    <div className={styles.frame()}>
      <div className={styles.inner()}>
        <div
          aria-hidden
          className={docsCodeBlock({ railSide: "left" }).rail({
            className: showLineNumbers ? "left-10" : undefined,
          })}
        />
        <div
          aria-hidden
          className={docsCodeBlock({ railSide: "right" }).rail({
            className: showLineNumbers ? "right-10" : undefined,
          })}
        />
        {children}
      </div>
    </div>
  );
}
