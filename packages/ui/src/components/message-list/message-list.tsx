import { useRender } from "@base-ui/react/use-render";
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
  ...props
}: MessageListProps) {
  const theme = useThemeFamily();
  const isMobile = useMobileViewport();
  const { content, root, viewport } = messageList({ theme });

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
        style={{ ...props.style, overflowX: "hidden" }}
      >
        <ScrollAreaContent className={content()}>{children}</ScrollAreaContent>
      </ScrollAreaViewport>
      <ScrollAreaScrollbar className="me-1.5 px-0 py-1">
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
    </ScrollArea>
  );
}
