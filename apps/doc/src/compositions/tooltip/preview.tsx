import type { ReactNode, RefObject } from "react";
import { useRef } from "react";

type TooltipComparisonPreviewProps = {
  children: (portalRef: RefObject<HTMLDivElement | null>) => ReactNode;
  className?: string;
};

export function TooltipComparisonPreview({ children, className }: TooltipComparisonPreviewProps) {
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={portalRef}
      className={[
        "relative flex h-full min-h-44 w-full items-center justify-center overflow-hidden px-3 py-10",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children(portalRef)}
    </div>
  );
}
