import type { ReactNode } from "react";

type ButtonComparisonPreviewProps = {
  children: ReactNode;
  className?: string;
  gap?: "default" | "loose";
  layout?: "wrap" | "grid";
};

export function ButtonComparisonPreview({
  children,
  className,
  gap = "default",
  layout = "wrap",
}: ButtonComparisonPreviewProps) {
  const gapClassName = gap === "loose" ? "gap-4" : "gap-2.5";
  const layoutClassName =
    layout === "grid"
      ? `grid grid-cols-[max-content_max-content] grid-rows-[max-content_max-content] place-items-center justify-center ${gapClassName}`
      : `flex flex-wrap items-center justify-center ${gapClassName}`;

  return (
    <div
      className={["flex h-full min-h-28 w-full items-center justify-center px-3 py-4", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={layoutClassName}>{children}</div>
    </div>
  );
}
