import { ContextMenuPopup } from "raft-ui";
import type { ReactNode } from "react";
import { cn } from "tailwind-variants";

export function SourceContextMenuPreview({
  children,
  className,
  contentClassName,
  minHeight = "min-h-56",
  triggerLabel,
}: {
  children: ReactNode;
  className?: string;
  contentClassName: string;
  minHeight?: string;
  triggerLabel: string;
}) {
  return (
    <div className={cn("relative h-full w-full", minHeight, className)}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex min-h-14 w-56 items-center justify-center border-2 border-dashed border-black bg-brutal-cream px-4 py-3 text-center font-sans text-xs font-bold text-black">
            {triggerLabel}
          </div>
          <ContextMenuPopup className={contentClassName}>{children}</ContextMenuPopup>
        </div>
      </div>
    </div>
  );
}
