import { useMemo } from "react";
import type { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
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
  const theme = useThemeFamily();
  const isMobile = useMobileViewport();
  const { content, root, viewport } = messageList({ theme });
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
        <ScrollAreaContent className={content()}>{children}</ScrollAreaContent>
      </ScrollAreaViewport>
      <ScrollAreaScrollbar className="me-1.5 px-0 py-1">
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
    </ScrollArea>
  );
}
