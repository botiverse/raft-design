import type { ReactNode } from "react";
import { PreviewThemeScope } from "#/components/preview-theme.tsx";

type ComponentPreviewProps = {
  label?: string;
  children: ReactNode;
};

export function ComponentPreview({ label, children }: ComponentPreviewProps) {
  return (
    <div className="overflow-clip rounded-lg border border-line">
      {label ? (
        <div className="border-b border-line bg-secondary-100 px-4 py-2 text-xs font-medium text-secondary-950">
          {label}
        </div>
      ) : null}
      <PreviewThemeScope className="flex flex-wrap items-center gap-4 bg-background p-8 text-foreground">
        {children}
      </PreviewThemeScope>
    </div>
  );
}
