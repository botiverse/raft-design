"use client";

import { Collapsible, Tabs as BaseTabs } from "@base-ui/react";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";
import { useState, type ReactNode } from "react";
import { tv } from "tailwind-variants/lite";

import { DocsCodeBlock } from "./docs-code-block.tsx";

const docsCodeBlockFiles = tv({
  slots: {
    root: "min-w-0 flex-1",
    list: [
      "flex min-w-0 overflow-x-auto overscroll-contain",
      "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    ],
    tab: [
      "relative shrink-0 px-2 py-1 font-mono text-xs leading-snug outline-none",
      "text-foreground-placeholder transition-colors duration-150",
      "hover:text-foreground-muted data-[active]:text-foreground-strong",
      "focus-visible:outline-1 focus-visible:outline-line-strong",
      "[&+&]:before:absolute [&+&]:before:top-[-0.375rem] [&+&]:before:bottom-[-0.375rem] [&+&]:before:left-0",
      "[&+&]:before:w-px [&+&]:before:bg-[oklch(0_0_0_/_0.12)] [&+&]:before:content-['']",
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

  if (!activeFile) return null;

  const header = (
    <DocsCodeBlock.Header showLineNumbers={showLineNumbers}>
      <BaseTabs.Root
        value={activeFile.path}
        onValueChange={(path) => {
          if (path) setActivePath(String(path));
        }}
        className={styles.root()}
      >
        <BaseTabs.List aria-label="Source files" className={styles.list()}>
          {files.map((file) => (
            <BaseTabs.Tab key={file.path} value={file.path} className={styles.tab()}>
              {file.path.split("/").at(-1)}
            </BaseTabs.Tab>
          ))}
        </BaseTabs.List>
      </BaseTabs.Root>
      {collapsible ? <DocsCodeBlock.Collapse open={bodyOpen} /> : null}
      <DocsCodeBlock.Copy key={activeFile.path} source={activeFile.source} />
    </DocsCodeBlock.Header>
  );

  const body = (
    <DocsCodeBlock.Body showLineNumbers={showLineNumbers} source={activeFile.source}>
      <DocsCodeBlock.Content
        key={activeFile.path}
        html={activeFile.html}
        collapsedHtml={activeFile.collapsedHtml}
      />
    </DocsCodeBlock.Body>
  );

  if (!collapsible) {
    return (
      <DocsCodeBlock showLineNumbers={showLineNumbers}>
        {header}
        {body}
      </DocsCodeBlock>
    );
  }

  return (
    <DocsCodeBlock showLineNumbers={showLineNumbers}>
      <Collapsible.Root open={bodyOpen} onOpenChange={setBodyOpen} className="contents">
        {header}
        <Collapsible.Panel className="contents">{body}</Collapsible.Panel>
      </Collapsible.Root>
    </DocsCodeBlock>
  );
}
