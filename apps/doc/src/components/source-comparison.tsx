import type { ReactNode } from "react";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";
import { Badge, type BadgeProps } from "@slock/ui";
import { CodeBlock } from "./code-block.tsx";
import { PreviewThemeScope } from "./preview-theme.tsx";

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

const STATUS_VARIANT = {
  match: "success",
  difference: "information",
  review: "primary",
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
      className="min-w-0 rounded-md border border-line-subtle bg-layer-panel"
    >
      <div className="border-b border-line-subtle bg-layer-muted px-3 py-1.5 text-[11px] font-medium uppercase text-foreground-muted">
        {label}
      </div>
      <PreviewThemeScope className="flex min-h-24 flex-wrap items-center gap-3 bg-background p-4 text-foreground">
        {children}
      </PreviewThemeScope>
      {code ? (
        <div className="border-t border-line-subtle [&>div]:rounded-none [&>div]:border-0">
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
            className="rounded-md border border-line-subtle bg-layer-muted p-3"
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground-strong">{item.label}</h3>
              <Badge
                appearance="soft"
                variant={STATUS_VARIANT[status] as BadgeProps["variant"]}
                uppercase
              >
                {STATUS[status]}
              </Badge>
              {item.note ? (
                <p className="w-full text-xs text-foreground-muted">{item.note}</p>
              ) : null}
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
