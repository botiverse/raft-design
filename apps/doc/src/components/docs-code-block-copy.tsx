"use client";

import { Button } from "raft-ui";
import { useClipboard } from "foxact/use-clipboard";
import { useCallback } from "react";
import { TextMorph } from "torph/react";

import { CopyIconMorph } from "./docs-code-block-copy-icon.tsx";
import { docsCodeBlock } from "./docs-code-block.recipe.ts";
import type { DocsCodeBlockCopyProps } from "./docs-code-block.types.ts";

export function DocsCodeBlockCopy({ source }: DocsCodeBlockCopyProps) {
  const styles = docsCodeBlock();
  const { copied, copy } = useClipboard();

  const handleCopy = useCallback(() => {
    void copy(source);
  }, [copy, source]);

  return (
    <Button
      type="button"
      variant="ghost"
      size="xs"
      onClick={handleCopy}
      aria-live="polite"
      className={styles.copyButton()}
    >
      <CopyIconMorph copied={copied} />
      <TextMorph duration={200} ease="cubic-bezier(0.19, 1, 0.22, 1)">
        {copied ? "Copied" : "Copy"}
      </TextMorph>
    </Button>
  );
}
