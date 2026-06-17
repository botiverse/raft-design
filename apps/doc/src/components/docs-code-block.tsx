"use client";

import { Button } from "@slock/ui";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";
import { useClipboard } from "foxact/use-clipboard";
import { Check, Copy } from "lucide-react";
import { useCallback, type ReactNode } from "react";
import { tv } from "tailwind-variants";
import { TextMorph } from "torph/react";

import { CodeBlock } from "./code-block.tsx";

const docsCodeBlock = tv({
  slots: {
    frame: ["overflow-clip rounded-none bg-white", "shadow-[0_0_0_0.5px_oklch(0_0_0_/_0.22)]"],
    inner: "relative",
    rail: ["pointer-events-none absolute inset-y-0 w-0", "border-[oklch(0_0_0_/_0.12)]"],
    section: "flex items-stretch",
    gutter: "w-6 shrink-0 self-stretch bg-[oklch(0.988_0.002_286)]",
    sectionInner: "min-w-0 flex-1",
    headerBar: "flex min-w-0 flex-1 items-center gap-3 bg-white py-2",
    bodyRow: "flex min-w-0 flex-1 bg-white pt-3",
    bodyContent: "min-w-0 flex-1",
    path: ["min-w-0 flex-1 truncate font-mono text-xs leading-none", "text-foreground-muted"],
    lineNumbers: [
      "shrink-0 select-none font-mono text-sm leading-relaxed",
      "text-[oklch(0.72_0.006_286)]",
    ],
    lineNumber: "text-left tabular-nums",
    copyButton: [
      "shrink-0 pr-0 text-foreground-muted",
      "hover:bg-transparent hover:text-foreground-strong hover:before:bg-transparent",
    ],
    copyIconSlot: "relative size-3 shrink-0",
  },
  variants: {
    railSide: {
      left: { rail: "left-6 border-l border-dashed" },
      right: { rail: "right-6 border-r border-dashed" },
    },
    sectionKind: {
      header: { section: "border-b border-[oklch(0_0_0_/_0.06)]" },
      body: { section: "pb-3" },
    },
    showLineNumbers: {
      true: { bodyRow: "gap-3", bodyContent: "pr-6" },
      false: { bodyContent: "px-6" },
    },
  },
});

const copyIcon = tv({
  base: [
    "absolute inset-0 size-3",
    "transition-[opacity,transform] duration-200 ease-out",
    "motion-reduce:transition-none motion-reduce:duration-0",
  ],
  variants: {
    visible: {
      true: "scale-100 opacity-100",
      false: "scale-[0.92] opacity-0",
    },
  },
});

type DocsCodeBlockRootProps = {
  children: ReactNode;
};

type DocsCodeBlockSectionProps = {
  children: ReactNode;
  className?: string;
  sectionKind?: "header" | "body";
};

type DocsCodeBlockHeaderProps = {
  children: ReactNode;
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
};

type DocsCodeBlockLineNumbersProps = {
  lineCount: number;
};

type DocsCodeBlockCopyProps = {
  source: string;
};

function DocsCodeBlockRoot({ children }: DocsCodeBlockRootProps) {
  const styles = docsCodeBlock();

  return (
    <div className={styles.frame()}>
      <div className={styles.inner()}>
        <div aria-hidden className={docsCodeBlock({ railSide: "left" }).rail()} />
        <div aria-hidden className={docsCodeBlock({ railSide: "right" }).rail()} />
        {children}
      </div>
    </div>
  );
}

function DocsCodeBlockSection({ children, className, sectionKind }: DocsCodeBlockSectionProps) {
  const styles = docsCodeBlock({ sectionKind });

  return (
    <div className={styles.section({ className })}>
      <div aria-hidden className={styles.gutter()} />
      <div className={styles.sectionInner()}>{children}</div>
      <div aria-hidden className={styles.gutter()} />
    </div>
  );
}

function DocsCodeBlockHeader({ children }: DocsCodeBlockHeaderProps) {
  const styles = docsCodeBlock();

  return (
    <DocsCodeBlockSection sectionKind="header">
      <div className={styles.headerBar()}>{children}</div>
    </DocsCodeBlockSection>
  );
}

function DocsCodeBlockLineNumbers({ lineCount }: DocsCodeBlockLineNumbersProps) {
  const styles = docsCodeBlock();
  const gutterWidth = `${Math.max(2, String(lineCount).length)}ch`;

  return (
    <div aria-hidden className={styles.lineNumbers()} style={{ minWidth: gutterWidth }}>
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
    <DocsCodeBlockSection sectionKind="body">
      <div className={styles.bodyRow()}>
        {showLineNumbers && source ? <DocsCodeBlockLineNumbers lineCount={lineCount} /> : null}
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
  const styles = docsCodeBlock();

  return (
    <span aria-hidden className={styles.copyIconSlot()}>
      <Copy className={copyIcon({ visible: !copied })} strokeWidth={1.75} />
      <Check className={copyIcon({ visible: copied })} strokeWidth={1.75} />
    </span>
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

function DocsCodeBlockContent({ html }: DocsCodeBlockContentProps) {
  return <CodeBlock html={html} variant="docs" />;
}

export const DocsCodeBlock = Object.assign(DocsCodeBlockRoot, {
  Header: DocsCodeBlockHeader,
  Body: DocsCodeBlockBody,
  Path: DocsCodeBlockPath,
  Copy: DocsCodeBlockCopy,
  Content: DocsCodeBlockContent,
  LineNumbers: DocsCodeBlockLineNumbers,
});
