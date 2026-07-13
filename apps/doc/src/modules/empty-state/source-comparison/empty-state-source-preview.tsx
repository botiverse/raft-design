import type { ReactNode } from "react";

export function EmptyStateSourcePreview({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={["flex h-full min-h-28 w-full items-center justify-center px-3 py-4", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
