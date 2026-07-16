import { ScrollArea } from "@base-ui/react/scroll-area";
import { useRender } from "@base-ui/react/use-render";
import {
  PanelScrollContent,
  PanelScrollbar,
  PanelScrollbarThumb,
  PanelScrollViewport,
} from "../panel/panel";
import { messageList } from "./message-list.recipe";

export type MessageListProps = useRender.ComponentProps<"div">;

export function MessageList({ children, className, render, ...props }: MessageListProps) {
  const { content, root, viewport } = messageList();

  return (
    <ScrollArea.Root data-slot="message-list" className={root()}>
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
