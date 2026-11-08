import { useMemo } from "react";
import type { useRender } from "@base-ui/react/use-render";
import { useMobileViewport } from "../../lib/use-mobile-viewport";
import { PanelNativeScrollViewport } from "../panel/panel";
import { ScrollArea } from "../scroll-area";
import { messageList } from "./message-list.recipe";

export type MessageListProps = useRender.ComponentProps<"div"> & {
  rootClassName?: string;
};

export function MessageList({
  children,
  className,
  render,
  rootClassName,
  style,
  ...props
}: MessageListProps) {
  const isMobile = useMobileViewport();
  const { content, root, viewport } = messageList();
  const viewportStyle = useMemo(() => ({ ...style, overflowX: "hidden" as const }), [style]);

  // Below 768px the list scrolls natively, with the phone's own overlay
  // scrollbar and no drawn one (message-list.md#behavior): an allowed
  // exception to "every scrolling region is a ScrollArea" (scroll-area.md#rules).
  if (isMobile) {
    return (
      <div data-slot="message-list" className={root({ className: rootClassName })}>
        <PanelNativeScrollViewport
          {...props}
          render={render}
          data-slot="message-list-viewport"
          className={viewport({ className })}
          style={viewportStyle}
        >
          <div className={content()}>{children}</div>
        </PanelNativeScrollViewport>
      </div>
    );
  }

  // The ScrollArea is the scrolling element itself, so `ref`, `render`,
  // `onScroll` and the native props land on it as they did on the viewport. Its scrollbar
  // shows only while the list scrolls, and the list stops at its ends
  // without bouncing (overscroll "none", the default).
  return (
    <div data-slot="message-list" className={root({ className: rootClassName })}>
      <ScrollArea
        {...props}
        render={render}
        data-slot="message-list-viewport"
        trigger="scroll"
        className={viewport({ className })}
        contentClassName={content()}
        style={style}
      >
        {children}
      </ScrollArea>
    </div>
  );
}
