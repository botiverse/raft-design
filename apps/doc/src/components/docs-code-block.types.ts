import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";
import type { ReactNode } from "react";

export type DocsCodeBlockRootProps = {
  children: ReactNode;
  showLineNumbers?: boolean;
};

export type DocsCodeBlockSectionProps = {
  children: ReactNode;
  className?: string;
  leftGutter?: ReactNode;
  sectionKind?: "header" | "body";
  showLineNumbers?: boolean;
};

export type DocsCodeBlockHeaderProps = {
  children: ReactNode;
  showLineNumbers?: boolean;
};

export type DocsCodeBlockBodyProps = {
  children: ReactNode;
  showLineNumbers?: boolean;
  source?: string;
};

export type DocsCodeBlockPathProps = {
  children: ReactNode;
};

export type DocsCodeBlockContentProps = {
  html: ReactNode | AnyRenderableServerComponent;
  collapsedHtml?: ReactNode | AnyRenderableServerComponent;
};

export type DocsCodeBlockLineNumbersProps = {
  lineCount: number;
};

export type DocsCodeBlockCopyProps = {
  source: string;
};

export type DocsCodeBlockCollapseProps = {
  open: boolean;
};

export type DocsCodeBlockPanelProps = {
  path: string;
  source: string;
  html: ReactNode | AnyRenderableServerComponent;
  collapsedHtml?: ReactNode | AnyRenderableServerComponent;
  collapsible?: boolean;
  showLineNumbers?: boolean;
};
