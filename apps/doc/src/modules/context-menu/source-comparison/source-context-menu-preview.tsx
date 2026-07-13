import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "raft-ui";
import type { ReactNode, RefObject } from "react";
import { useRef, useState } from "react";
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
  const portalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [hasCursorAnchor, setHasCursorAnchor] = useState(false);
  const anchor = {
    getBoundingClientRect() {
      const rect = triggerRef.current?.getBoundingClientRect();
      return DOMRect.fromRect({
        x: rect?.right ?? 0,
        y: rect?.bottom ?? 0,
        width: 0,
        height: 0,
      });
    },
  };

  return (
    <div ref={portalRef} className={cn("relative h-full w-full", minHeight, className)}>
      <div className="absolute inset-0 flex items-center justify-center">
        <ContextMenu defaultOpen>
          <div ref={triggerRef} onContextMenuCapture={() => setHasCursorAnchor(true)}>
            <ContextMenuTrigger className="flex min-h-14 w-56 items-center justify-center border-2 border-dashed border-black bg-brutal-cream px-4 py-3 text-center font-sans text-xs font-bold text-black">
              {triggerLabel}
            </ContextMenuTrigger>
          </div>
          <ContextMenuContent
            anchor={hasCursorAnchor ? undefined : anchor}
            portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
            className={contentClassName}
          >
            {children}
          </ContextMenuContent>
        </ContextMenu>
      </div>
    </div>
  );
}
