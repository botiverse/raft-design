import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { createElement } from "react";
import { extractCodeBlockText } from "../src/components/markdown/CopyableCodeBlock";

const repoRoot = resolve(import.meta.dirname, "..");

test("extractCodeBlockText preserves nested code text for clipboard copy", () => {
  const block = createElement("code", { className: "language-ts" }, [
    "const value = 1;",
    createElement("span", { key: "newline" }, "\n"),
    "console.log(value);",
  ]);

  assert.equal(extractCodeBlockText(block), "const value = 1;\nconsole.log(value);");
});

test("message markdown code blocks render through the copyable wrapper", () => {
  // Chat body and markdown attachment preview both route their code blocks
  // through `BASE_MARKDOWN_COMPONENTS` → `<CopyableCodeBlock>` in
  // `markdown/MarkdownContent.tsx`. MessageItem renders its body via the
  // shared `<MarkdownContent>` component instead of importing
  // CopyableCodeBlock directly. Pinning the path here keeps the chat-body
  // → CopyableCodeBlock contract from regressing if someone re-inlines a
  // ReactMarkdown call without the copyable wrapper.
  // Refactor anchor: stdrc 2026-05-08 #proj-uiux:6110c1ce (task #137).
  const messageItemSource = readFileSync(
    resolve(repoRoot, "src/components/message/MessageItem.tsx"),
    "utf8",
  );
  const markdownContentSource = readFileSync(
    resolve(repoRoot, "src/components/markdown/MarkdownContent.tsx"),
    "utf8",
  );
  const copyableCodeBlockSource = readFileSync(
    resolve(repoRoot, "src/components/markdown/CopyableCodeBlock.tsx"),
    "utf8",
  );

  assert.match(messageItemSource, /import MarkdownContent from "\.\.\/markdown\/MarkdownContent";/);
  assert.match(messageItemSource, /<MarkdownContent\b/);
  assert.match(markdownContentSource, /import CopyableCodeBlock from "\.\/CopyableCodeBlock";/);
  // The fenced-block wrapper was extracted to a shared `BaseCodePre` so the
  // mermaid-aware preview `pre` reuses it verbatim for non-mermaid blocks
  // (task #268). Contract unchanged: BASE `pre` → BaseCodePre → CopyableCodeBlock.
  assert.match(markdownContentSource, /pre: \(\{ children \}\) => <BaseCodePre>\{children\}<\/BaseCodePre>/);
  assert.match(markdownContentSource, /function BaseCodePre\([\s\S]*?<CopyableCodeBlock/);
  assert.match(copyableCodeBlockSource, /aria-label=\{copied \? "Copied code" : "Copy code"\}/);
});
