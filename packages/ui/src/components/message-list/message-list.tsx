import { useMemo } from "react";
import type { useRender } from "@base-ui/react/use-render";
import { useMobileViewport } from "../../lib/use-mobile-viewport";
import { PanelScrollViewport } from "../panel/panel";
import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "../scroll-area";
import { messageList } from "./message-list.recipe";

// Base UI's ScrollArea.Content sets an inline `min-width: fit-content` for
// horizontal scrolling, which overrides the `min-w-0` class. The viewport never
// scrolls horizontally, so reset it: otherwise wide content (a w-max tab strip,
// a long code line) stretches every message past the viewport.
const contentStyle = { minWidth: 0 };

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

  if (isMobile) {
    return (
      <div data-slot="message-list" className={root({ className: rootClassName })}>
        <PanelScrollViewport
          {...props}
          render={render}
          data-slot="message-list-viewport"
          className={viewport({ className })}
          style={viewportStyle}
        >
          <div className={content()}>{children}</div>
        </PanelScrollViewport>
      </div>
    );
  }

  return (
    <ScrollArea data-slot="message-list" className={root({ className: rootClassName })}>
      <ScrollAreaViewport
        {...props}
        render={render}
        data-slot="message-list-viewport"
        className={viewport({ className })}
        style={viewportStyle}
      >
        <ScrollAreaContent className={content()} style={contentStyle}>
          {children}
        </ScrollAreaContent>
      </ScrollAreaViewport>
      <ScrollAreaScrollbar className="me-1.5 px-0 py-1">
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
    </ScrollArea>
  );
}
