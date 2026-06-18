"use client";

import { Collapsible } from "@base-ui/react";
import { Button } from "@slock/ui";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";
import { useClipboard } from "foxact/use-clipboard";
import { Check, ChevronDown, Copy } from "lucide-react";
import { useCallback, useState, type ReactNode } from "react";
import { tv } from "tailwind-variants";
import { TextMorph } from "torph/react";

import { CodeBlock } from "./code-block.tsx";
import { IconSwap } from "./icon-swap.tsx";

const docsCodeBlock = tv({
  slots: {
    frame: ["overflow-clip rounded-none bg-white", "shadow-[0_0_0_0.5px_oklch(0_0_0_/_0.22)]"],
    inner: "relative",
    rail: ["pointer-events-none absolute inset-y-0 w-0", "border-[oklch(0_0_0_/_0.12)]"],
    section: "flex items-stretch",
    gutter: "flex w-6 shrink-0 justify-end self-stretch bg-[oklch(0.988_0.002_286)]",
    sectionInner: "min-w-0 flex-1",
    headerBar: "flex min-w-0 flex-1 items-center gap-3 bg-white py-2.5",
    bodyRow: "flex min-w-0 flex-1 bg-white pt-3 pb-3",
    bodyContent: "min-w-0 flex-1",
    path: ["min-w-0 flex-1 truncate font-mono text-xs leading-snug", "text-foreground-muted"],
    lineNumbers: [
      "w-full select-none pt-3 pb-3 font-mono text-sm leading-relaxed",
      "text-[oklch(0.72_0.006_286)]",
    ],
    lineNumber: "text-right tabular-nums",
    copyButton: [
      "shrink-0 pr-0 !leading-snug text-foreground-muted",
      "hover:bg-transparent hover:text-foreground-strong hover:before:bg-transparent",
    ],
    collapseButton: [
      "min-w-[4.625rem] shrink-0 gap-1 pr-0 !leading-snug text-foreground-muted",
      "hover:bg-transparent hover:text-foreground-strong hover:before:bg-transparent",
      "[&[data-panel-open]_svg]:rotate-180",
    ],
  },
  variants: {
    railSide: {
      left: { rail: "left-6 border-l border-dashed" },
      right: { rail: "right-6 border-r border-dashed" },
    },
    sectionKind: {
      header: { section: "border-b border-[oklch(0_0_0_/_0.06)]" },
      body: {},
    },
    showLineNumbers: {
      true: { gutter: "w-10", bodyContent: "pr-10 pl-2.5" },
      false: { bodyContent: "pr-6 pl-2.5" },
    },
  },
});

type DocsCodeBlockRootProps = {
  children: ReactNode;
  showLineNumbers?: boolean;
};

type DocsCodeBlockSectionProps = {
  children: ReactNode;
  className?: string;
  leftGutter?: ReactNode;
  sectionKind?: "header" | "body";
  showLineNumbers?: boolean;
};

type DocsCodeBlockHeaderProps = {
  children: ReactNode;
  showLineNumbers?: boolean;
};

type DocsCodeBlockBodyProps = {
  children: ReactNode;
  showLineNumbers?: boolean;
  source?: string;
};

type DocsCodeBlockPathProps = {
  children: ReactNode;
};

type DocsCodeBlockContentProps = {
  html: ReactNode | AnyRenderableServerComponent;
  collapsedHtml?: ReactNode | AnyRenderableServerComponent;
};

type DocsCodeBlockLineNumbersProps = {
  lineCount: number;
};

type DocsCodeBlockCopyProps = {
  source: string;
};

type DocsCodeBlockCollapseProps = {
  open: boolean;
};

type DocsCodeBlockPanelProps = {
  path: string;
  source: string;
  html: ReactNode | AnyRenderableServerComponent;
  collapsedHtml?: ReactNode | AnyRenderableServerComponent;
  showLineNumbers?: boolean;
};

function DocsCodeBlockRoot({ children, showLineNumbers = false }: DocsCodeBlockRootProps) {
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

function DocsCodeBlockSection({
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

function DocsCodeBlockHeader({ children, showLineNumbers }: DocsCodeBlockHeaderProps) {
  const styles = docsCodeBlock();

  return (
    <DocsCodeBlockSection sectionKind="header" showLineNumbers={showLineNumbers}>
      <div className={styles.headerBar()}>{children}</div>
    </DocsCodeBlockSection>
  );
}

function DocsCodeBlockLineNumbers({ lineCount }: DocsCodeBlockLineNumbersProps) {
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

function DocsCodeBlockBody({ children, showLineNumbers = false, source }: DocsCodeBlockBodyProps) {
  const styles = docsCodeBlock({ showLineNumbers });
  const lineCount = source?.split("\n").length ?? 0;

  return (
    <DocsCodeBlockSection
      sectionKind="body"
      leftGutter={
        showLineNumbers && source ? <DocsCodeBlockLineNumbers lineCount={lineCount} /> : null
      }
      showLineNumbers={showLineNumbers}
    >
      <div className={styles.bodyRow()}>
        <div className={styles.bodyContent()}>{children}</div>
      </div>
    </DocsCodeBlockSection>
  );
}

function DocsCodeBlockPath({ children }: DocsCodeBlockPathProps) {
  const styles = docsCodeBlock();

  return <p className={styles.path()}>{children}</p>;
}

function CopyIconMorph({ copied }: { copied: boolean }) {
  return (
    <IconSwap
      state={copied ? "b" : "a"}
      iconA={<Copy className="size-3" strokeWidth={1.75} />}
      iconB={<Check className="size-3" strokeWidth={1.75} />}
      className="shrink-0"
      aria-hidden
    />
  );
}

function DocsCodeBlockCopy({ source }: DocsCodeBlockCopyProps) {
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

function DocsCodeBlockCollapse({ open }: DocsCodeBlockCollapseProps) {
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

function DocsCodeBlockContent({ html, collapsedHtml }: DocsCodeBlockContentProps) {
  const [expanded, setExpanded] = useState(!collapsedHtml);

  if (collapsedHtml && !expanded) {
    return (
      <div>
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded(true)}
          className="mb-[1.625em] block w-full cursor-pointer text-left font-mono text-sm leading-relaxed text-[oklch(0.50_0.02_286)] hover:text-foreground-muted"
        >
          {"<-- imports collapsed, click to expand -->"}
        </button>
        <CodeBlock html={collapsedHtml} variant="docs" />
      </div>
    );
  }

  return <CodeBlock html={html} variant="docs" />;
}

function DocsCodeBlockPanel({
  path,
  source,
  html,
  collapsedHtml,
  showLineNumbers = false,
}: DocsCodeBlockPanelProps) {
  const [bodyOpen, setBodyOpen] = useState(true);

  return (
    <DocsCodeBlock showLineNumbers={showLineNumbers}>
      <Collapsible.Root open={bodyOpen} onOpenChange={setBodyOpen} className="contents">
        <DocsCodeBlock.Header showLineNumbers={showLineNumbers}>
          <DocsCodeBlock.Path>{path}</DocsCodeBlock.Path>
          <DocsCodeBlock.Collapse open={bodyOpen} />
          <DocsCodeBlock.Copy source={source} />
        </DocsCodeBlock.Header>
        <Collapsible.Panel className="contents">
          <DocsCodeBlock.Body showLineNumbers={showLineNumbers} source={source}>
            <DocsCodeBlock.Content html={html} collapsedHtml={collapsedHtml} />
          </DocsCodeBlock.Body>
        </Collapsible.Panel>
      </Collapsible.Root>
    </DocsCodeBlock>
  );
}

export const DocsCodeBlock = Object.assign(DocsCodeBlockRoot, {
  Header: DocsCodeBlockHeader,
  Body: DocsCodeBlockBody,
  Path: DocsCodeBlockPath,
  Copy: DocsCodeBlockCopy,
  Collapse: DocsCodeBlockCollapse,
  Content: DocsCodeBlockContent,
  LineNumbers: DocsCodeBlockLineNumbers,
  Panel: DocsCodeBlockPanel,
});
