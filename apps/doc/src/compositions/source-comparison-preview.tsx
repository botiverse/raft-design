import type { ReactNode, RefObject } from "react";
import { useRef } from "react";

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

type SourceComparisonModalPreviewProps = {
  children: (props: {
    portalProps: { container: RefObject<HTMLElement | null> };
    contentClassName: string;
  }) => ReactNode;
  className?: string;
  contentClassName?: string;
  placement?: "center" | "bottom";
  minHeightClassName?: string;
};

const modalContentClassName =
  "!relative !top-auto !left-auto !z-0 !w-full !translate-x-0 !translate-y-0";

export function SourceComparisonModalPreview({
  children,
  className,
  contentClassName,
  placement = "center",
  minHeightClassName = "min-h-80",
}: SourceComparisonModalPreviewProps) {
  const portalRef = useRef<HTMLDivElement>(null);
  const placementClassName =
    placement === "bottom" ? "items-end px-4 pt-12 pb-6" : "items-center p-6";
  const resolvedContentClassName = [modalContentClassName, contentClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <SourceComparisonPreview className={["px-0 py-0", className].filter(Boolean).join(" ")}>
      <div
        className={[
          "relative grid w-full min-w-0 overflow-hidden bg-background",
          minHeightClassName,
        ].join(" ")}
      >
        <div
          className="absolute inset-0 z-0 [[data-theme=elegant]_&]:backdrop-blur-[1.5px]"
          style={{ backgroundColor: "var(--layer-backdrop)" }}
        />
        <div
          ref={portalRef}
          className={[
            "relative z-10 flex min-h-0 w-full min-w-0 justify-center",
            placementClassName,
          ].join(" ")}
        />
        {children({
          portalProps: { container: portalRef as RefObject<HTMLElement | null> },
          contentClassName: resolvedContentClassName,
        })}
      </div>
    </SourceComparisonPreview>
  );
}
