"use client";

import { Collapsible } from "@base-ui/react";
import { Button } from "raft-ui";
import { ChevronDown } from "lucide-react";
import { TextMorph } from "torph/react";

import { docsCodeBlock } from "./docs-code-block.recipe.ts";
import type { DocsCodeBlockCollapseProps } from "./docs-code-block.types.ts";

export function DocsCodeBlockCollapse({ open }: DocsCodeBlockCollapseProps) {
  const styles = docsCodeBlock();

  return (
    <Button
      render={<Collapsible.Trigger />}
      type="button"
      variant="ghost"
      size="xs"
      aria-label={open ? "Collapse code" : "Expand code"}
      className={styles.collapseButton()}
    >
      <ChevronDown aria-hidden className="size-3 shrink-0 transition duration-150 ease-out" />
      <TextMorph duration={200} ease="cubic-bezier(0.19, 1, 0.22, 1)">
        {open ? "Collapse" : "Expand"}
      </TextMorph>
    </Button>
  );
}
