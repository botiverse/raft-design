import { docsCodeBlock } from "./docs-code-block.recipe.ts";
import type { DocsCodeBlockPathProps } from "./docs-code-block.types.ts";

export function DocsCodeBlockPath({ children }: DocsCodeBlockPathProps) {
  const styles = docsCodeBlock();

  return <p className={styles.path()}>{children}</p>;
}
