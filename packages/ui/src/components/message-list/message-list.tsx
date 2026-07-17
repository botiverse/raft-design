import { ScrollArea } from "@base-ui/react/scroll-area";
import { useRender } from "@base-ui/react/use-render";
import { useMobileViewport } from "../../lib/use-mobile-viewport";
import {
  PanelScrollContent,
  PanelScrollbar,
  PanelScrollbarThumb,
  PanelScrollViewport,
} from "../panel/panel";
import { messageList } from "./message-list.recipe";

export type MessageListProps = useRender.ComponentProps<"div"> & {
  rootClassName?: string;
};

export function MessageList({
  children,
  className,
  render,
  rootClassName,
  ...props
}: MessageListProps) {
  const isMobile = useMobileViewport();
  const { content, root, viewport } = messageList();

  if (isMobile) {
    return (
      <div data-slot="message-list" className={root({ className: rootClassName })}>
        <PanelScrollViewport
          {...props}
          render={render}
          data-slot="message-list-viewport"
          className={viewport({ className })}
          style={{ ...props.style, overflowX: "hidden" }}
        >
          <PanelScrollContent className={content()}>{children}</PanelScrollContent>
        </PanelScrollViewport>
      </div>
    );
  }

  return (
    <ScrollArea.Root data-slot="message-list" className={root({ className: rootClassName })}>
      <PanelScrollViewport
        {...props}
        render={<ScrollArea.Viewport render={render} />}
        data-slot="message-list-viewport"
        className={viewport({ className })}
        style={{ ...props.style, overflowX: "hidden" }}
      >
        <PanelScrollContent render={<ScrollArea.Content />} className={content()}>
          {children}
        </PanelScrollContent>
      </PanelScrollViewport>
      <PanelScrollbar render={<ScrollArea.Scrollbar />}>
        <PanelScrollbarThumb render={<ScrollArea.Thumb />} />
      </PanelScrollbar>
    </ScrollArea.Root>
  );
}
