import type { ReactNode } from "react";

type ComponentPreviewProps = {
  label?: string;
  children: ReactNode;
};

export function ComponentPreview({ label, children }: ComponentPreviewProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      {label ? (
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500">
          {label}
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-4 bg-white p-8">{children}</div>
    </div>
  );
}
