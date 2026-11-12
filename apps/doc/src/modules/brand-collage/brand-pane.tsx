import type { ReactNode } from "react";
import { cn } from "@botiverse/raft-ui/cn";

// The brand pane's surface as brand.md describes it: the frame colour with
// 1.5px line-seam dots on a 14px grid. raft-ui doesn't draw the pane; the
// examples put the illustrations on it because it is the only surface they
// may sit on.
export function BrandPaneSurface({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center overflow-hidden bg-layer-frame",
        "bg-[radial-gradient(circle,var(--line-seam)_0.75px,transparent_0.75px)] bg-size-[14px_14px]",
        className,
      )}
    >
      {children}
    </div>
  );
}
