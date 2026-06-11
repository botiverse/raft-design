import type { ReactNode } from "react";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";
import { CodeBlock } from "./code-block.tsx";

type CodeContent = ReactNode | AnyRenderableServerComponent;

type SourceComparisonItem = {
  label: string;
  source: ReactNode;
  current: ReactNode;
  sourceCode?: CodeContent;
  currentCode?: CodeContent;
  status?: "match" | "difference" | "review";
  note?: ReactNode;
};

type SourceComparisonProps = {
  items: readonly SourceComparisonItem[];
};

const STATUS = {
  match: "Match",
  difference: "Intentional difference",
  review: "Review",
} as const;

const STATUS_CLASS = {
  match: "border-emerald-200 bg-emerald-50 text-emerald-700",
  difference: "border-sky-200 bg-sky-50 text-sky-700",
  review: "border-amber-200 bg-amber-50 text-amber-700",
} as const;

function ComparisonPreview({
  label,
  children,
  code,
}: {
  label: string;
  children: ReactNode;
  code?: CodeContent;
}) {
  return (
    <div
      data-source-comparison-pane={label.toLowerCase()}
      className="min-w-0 rounded-md border border-gray-200 bg-white"
    >
      <div className="border-b border-gray-100 px-3 py-1.5 text-[11px] font-medium uppercase text-gray-400">
        {label}
      </div>
      <div className="flex min-h-24 flex-wrap items-center gap-3 p-4">{children}</div>
      {code ? (
        <div className="border-t border-gray-100 [&>div]:rounded-none [&>div]:border-0">
          <CodeBlock html={code} />
        </div>
      ) : null}
    </div>
  );
}

export function SourceComparison({ items }: SourceComparisonProps) {
  return (
    <div data-source-comparison className="space-y-4">
      {items.map((item) => {
        const status = item.status ?? "review";
        return (
          <section
            key={item.label}
            data-source-comparison-item={item.label}
            data-source-comparison-status={status}
            className="rounded-md border border-gray-200 bg-gray-50 p-3"
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">{item.label}</h3>
              <span
                className={`inline-flex h-5 items-center border px-1.5 text-[10px] font-bold uppercase leading-none ${STATUS_CLASS[status]}`}
              >
                {STATUS[status]}
              </span>
              {item.note ? <p className="w-full text-xs text-gray-500">{item.note}</p> : null}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <ComparisonPreview label="Source" code={item.sourceCode}>
                {item.source}
              </ComparisonPreview>
              <ComparisonPreview label="Current" code={item.currentCode}>
                {item.current}
              </ComparisonPreview>
            </div>
          </section>
        );
      })}
    </div>
  );
}
