import { use, type CSSProperties } from "react";
import { ScrollArea } from "@base-ui/react/scroll-area";
import { useRender } from "@base-ui/react/use-render";
import {
  PanelScrollContent,
  PanelScrollbar,
  PanelScrollbarThumb,
  PanelScrollViewport,
} from "../panel/panel";
import { PanelMobileScrollContext } from "../panel/panel-mobile-scroll-context";
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
  const mobileScroll = use(PanelMobileScrollContext);
  const { content, root, viewport } = messageList({ mobileScroll });

  return (
    <ScrollArea.Root data-slot="message-list" className={root({ className: rootClassName })}>
      <PanelScrollViewport
        {...props}
        render={<ScrollArea.Viewport render={render} />}
        data-slot="message-list-viewport"
        className={viewport({ className })}
        style={{
          ...props.style,
          // Base UI ScrollArea.Viewport forces inline `overflow: scroll`, which no
          // class can override. Routing both axes through CSS variables lets the
          // page mobileScroll mode release scroll ownership from the recipe.
          // csstype cannot express var() indirection, hence the assertions.
          overflowX: "var(--message-list-overflow-x, hidden)" as CSSProperties["overflowX"],
          overflowY: "var(--message-list-overflow-y, scroll)" as CSSProperties["overflowY"],
        }}
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
