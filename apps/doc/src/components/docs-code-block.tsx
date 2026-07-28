"use client";

import { DocsCodeBlockBody } from "./docs-code-block-body.tsx";
import { DocsCodeBlockCollapse } from "./docs-code-block-collapse.tsx";
import { DocsCodeBlockContent } from "./docs-code-block-content.tsx";
import { DocsCodeBlockCopy } from "./docs-code-block-copy.tsx";
import { DocsCodeBlockFiles } from "./docs-code-block-files.tsx";
import { DocsCodeBlockHeader } from "./docs-code-block-header.tsx";
import { DocsCodeBlockLineNumbers } from "./docs-code-block-line-numbers.tsx";
import { DocsCodeBlockPanel } from "./docs-code-block-panel.tsx";
import { DocsCodeBlockPath } from "./docs-code-block-path.tsx";
import { DocsCodeBlockRoot } from "./docs-code-block-root.tsx";

export const DocsCodeBlock = Object.assign(DocsCodeBlockRoot, {
  Header: DocsCodeBlockHeader,
  Body: DocsCodeBlockBody,
  Path: DocsCodeBlockPath,
  Copy: DocsCodeBlockCopy,
  Collapse: DocsCodeBlockCollapse,
  Content: DocsCodeBlockContent,
  LineNumbers: DocsCodeBlockLineNumbers,
  Panel: DocsCodeBlockPanel,
  Files: DocsCodeBlockFiles,
});
