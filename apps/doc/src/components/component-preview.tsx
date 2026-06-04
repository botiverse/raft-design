import type { ReactNode } from "react";

type ComponentPreviewProps = {
  label?: string;
  children: ReactNode;
};

export function ComponentPreview({ label, children }: ComponentPreviewProps) {
  return (
    <div className="overflow-clip rounded-lg border border-border">
      {label ? (
        <div className="border-b border-border bg-secondary px-4 py-2 text-xs font-medium text-secondary-foreground">
          {label}
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-4 bg-background p-8 text-foreground">
        {children}
      </div>
    </div>
  );
}
