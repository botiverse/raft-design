import type { ReactNode, RefObject } from "react";
import { useRef } from "react";
import { cn } from "raft-ui/cn";

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
      ? cn(
          "grid min-w-0 w-full max-w-full grid-cols-[max-content_max-content] grid-rows-[max-content_max-content] place-items-center justify-center",
          gapClassName,
        )
      : cn("flex min-w-0 w-full max-w-full flex-wrap items-center justify-center", gapClassName);

  return (
    <div
      className={cn(
        "flex h-full min-h-28 w-full min-w-0 items-center justify-center px-3 py-4",
        className,
      )}
    >
      <div className={layoutClassName}>{children}</div>
    </div>
  );
}

type SourceComparisonModalPreviewProps = {
  children: (props: {
    portalProps: { container: RefObject<HTMLElement | null>; className: string };
    contentClassName: string;
  }) => ReactNode;
  className?: string;
  contentClassName?: string;
  placement?: "center" | "bottom";
  placementPaddingClassName?: string;
  minHeightClassName?: string;
  portalClassName?: string;
  backdrop?: boolean;
};

const modalContentClassName = "relative top-auto left-auto z-0 w-full translate-x-0 translate-y-0";

export function SourceComparisonModalPreview({
  children,
  className,
  contentClassName,
  placement = "center",
  placementPaddingClassName,
  minHeightClassName = "min-h-80",
  portalClassName,
  backdrop = true,
}: SourceComparisonModalPreviewProps) {
  const portalRef = useRef<HTMLDivElement>(null);
  const placementClassName = placement === "bottom" ? "items-end" : "items-center";
  const resolvedPlacementPaddingClassName =
    placementPaddingClassName ?? (placement === "bottom" ? "px-4 pt-12 pb-6" : "p-6");
  const resolvedContentClassName = cn(modalContentClassName, contentClassName);

  return (
    <SourceComparisonPreview className={cn("px-0 py-0", className)}>
      <div
        className={cn(
          "relative grid w-full min-w-0 overflow-visible bg-layer-panel",
          minHeightClassName,
        )}
      >
        {backdrop ? (
          <div
            className="absolute inset-0 z-0 [[data-theme=elegant]_&]:backdrop-blur-[1.5px]"
            style={{ backgroundColor: "var(--layer-backdrop)" }}
          />
        ) : null}
        <div
          ref={portalRef}
          className={cn(
            "relative z-10 flex min-h-0 w-full min-w-0 justify-center",
            placementClassName,
            resolvedPlacementPaddingClassName,
            portalClassName,
          )}
        />
        {children({
          portalProps: {
            container: portalRef as RefObject<HTMLElement | null>,
            className: "flex w-full min-w-0 justify-center",
          },
          contentClassName: resolvedContentClassName,
        })}
      </div>
    </SourceComparisonPreview>
  );
}
