import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";
import type { ReactNode } from "react";

import type { PreviewMode } from "./preview-theme.tsx";

export type CodeContent = ReactNode | AnyRenderableServerComponent;

export type PreviewProps = {
  children: ReactNode;
  previewClassName?: string;
  previewInset?: "default" | "flush";
  previewMode?: PreviewMode;
};

export type PreviewCanvasProps = {
  children: ReactNode;
};

export type PreviewControlsProps = {
  children: ReactNode;
  title?: string;
};

export type PreviewControlGroupProps = {
  children: ReactNode;
  label?: string;
};

export type PreviewControlProps = {
  children: ReactNode;
  label: string;
  htmlFor?: string;
};

export type PreviewCodeProps = {
  html?: CodeContent;
  collapsedHtml?: CodeContent;
  codeBlock?: ReactNode;
};

export type PreviewSelectProps = {
  id: string;
  label: string;
  options: readonly string[];
  value: string;
  onValueChange: (value: string) => void;
};

export type PreviewRadioProps = {
  label: string;
  options: readonly string[];
  value: string;
  onValueChange: (value: string) => void;
};

export type PreviewSegmentedProps = {
  label: string;
  options: readonly string[];
  value: string;
  onValueChange: (value: string) => void;
};

export type PreviewCheckboxProps = {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export type PreviewTextProps = {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
};
