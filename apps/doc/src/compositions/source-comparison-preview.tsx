import type { ReactNode } from "react";

type SourceComparisonPreviewProps = {
  children: ReactNode;
  className?: string;
  gap?: "default" | "loose";
  layout?: "wrap" | "grid";
};

export function SourceComparisonPreview({
  children,
  className,
  gap = "default",
  layout = "wrap",
}: SourceComparisonPreviewProps) {
  const gapClassName = gap === "loose" ? "gap-4" : "gap-2.5";
  const layoutClassName =
    layout === "grid"
      ? `grid min-w-0 w-full max-w-full grid-cols-[max-content_max-content] grid-rows-[max-content_max-content] place-items-center justify-center ${gapClassName}`
      : `flex min-w-0 w-full max-w-full flex-wrap items-center justify-center ${gapClassName}`;

  return (
    <div
      className={[
        "flex h-full min-h-28 w-full min-w-0 items-center justify-center px-3 py-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={layoutClassName}>{children}</div>
    </div>
  );
}
