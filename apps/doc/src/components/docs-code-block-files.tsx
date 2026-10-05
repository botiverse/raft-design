"use client";

import { Collapsible } from "@base-ui/react";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";
import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { Tabs, TabsList, TabsTab } from "raft-ui";
import { tv } from "tailwind-variants/lite";

import { claimMarkdownFile, isMarkdownMode } from "#/lib/markdown-mode.ts";
import { DocsCodeBlockBody } from "./docs-code-block-body.tsx";
import { DocsCodeBlockCollapse } from "./docs-code-block-collapse.tsx";
import { DocsCodeBlockContent } from "./docs-code-block-content.tsx";
import { DocsCodeBlockCopy } from "./docs-code-block-copy.tsx";
import { DocsCodeBlockHeader } from "./docs-code-block-header.tsx";
import { DocsCodeBlockRoot } from "./docs-code-block-root.tsx";

const docsCodeBlockFiles = tv({
  slots: {
    root: "min-w-0 flex-1",
    list: [
      "flex min-w-0 overflow-x-auto overscroll-contain",
      "scrollbar-none [&::-webkit-scrollbar]:hidden",
    ],
    tab: [
      "relative shrink-0 px-2 py-1 font-mono text-xs leading-snug outline-none",
      "text-foreground-placeholder transition-colors duration-150",
      "hover:text-foreground-muted data-active:text-foreground",
      "focus-visible:outline-1 focus-visible:outline-line-strong",
      "[&+&]:before:absolute [&+&]:before:inset-y-[-0.375rem]  [&+&]:before:left-0",
      "[&+&]:before:w-px [&+&]:before:bg-[oklch(0_0_0/0.12)] [&+&]:before:content-[''] dark:[&+&]:before:bg-ink-10",
    ],
  },
});

type DocsCodeBlockFile = {
  path: string;
  source: string;
  html: ReactNode | AnyRenderableServerComponent;
  collapsedHtml?: ReactNode | AnyRenderableServerComponent;
};

type DocsCodeBlockFilesProps = {
  files: readonly DocsCodeBlockFile[];
  defaultPath?: string;
  collapsible?: boolean;
  showLineNumbers?: boolean;
};

export function DocsCodeBlockFiles({
  files,
  defaultPath,
  collapsible = true,
  showLineNumbers = false,
}: DocsCodeBlockFilesProps) {
  const [activePath, setActivePath] = useState(defaultPath ?? files[0]?.path ?? "");
  const [bodyOpen, setBodyOpen] = useState(true);
  const activeFile = files.find((file) => file.path === activePath) ?? files[0];
  const styles = docsCodeBlockFiles();
  const handleActivePathChange = useCallback((path: string) => {
    if (path) setActivePath(path);
  }, []);

  if (!activeFile) return null;

  // Markdown has no tabs to switch: list every file under its path.
  if (isMarkdownMode()) {
    return files.map((file) => {
      const firstTime = claimMarkdownFile(file.path);
      return (
        <section key={file.path}>
          <p>
            <code>{file.path}</code>
            {firstTime ? null : " (shown above)"}
          </p>
          {firstTime ? <DocsCodeBlockContent html={file.html} /> : null}
        </section>
      );
    });
  }

  const header = (
    <DocsCodeBlockHeader showLineNumbers={showLineNumbers}>
      <Tabs
        value={activeFile.path}
        onValueChange={handleActivePathChange}
        className={styles.root()}
      >
        <TabsList aria-label="Source files" className={styles.list()}>
          {files.map((file) => (
            <TabsTab key={file.path} value={file.path} className={styles.tab()}>
              {file.path.split("/").at(-1)}
            </TabsTab>
          ))}
        </TabsList>
      </Tabs>
      {collapsible ? <DocsCodeBlockCollapse open={bodyOpen} /> : null}
      <DocsCodeBlockCopy key={activeFile.path} source={activeFile.source} />
    </DocsCodeBlockHeader>
  );

  const body = (
    <DocsCodeBlockBody showLineNumbers={showLineNumbers} source={activeFile.source}>
      <DocsCodeBlockContent
        key={activeFile.path}
        html={activeFile.html}
        collapsedHtml={activeFile.collapsedHtml}
      />
    </DocsCodeBlockBody>
  );

  if (!collapsible) {
    return (
      <DocsCodeBlockRoot showLineNumbers={showLineNumbers}>
        {header}
        {body}
      </DocsCodeBlockRoot>
    );
  }

  return (
    <DocsCodeBlockRoot showLineNumbers={showLineNumbers}>
      <Collapsible.Root open={bodyOpen} onOpenChange={setBodyOpen} className="contents">
        {header}
        <Collapsible.Panel className="contents">{body}</Collapsible.Panel>
      </Collapsible.Root>
    </DocsCodeBlockRoot>
  );
}
