import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { ScrollArea } from "../components/scroll-area/scroll-area";
import { useOverflowFade } from "./use-overflow-fade";

/**
 * The element a menu's pinned footer is drawn into, after the items' scroller:
 * `null` inside a menu's content before it has mounted, `undefined` outside one
 * (a static `…Popup`), where the footer is drawn in place.
 */
const PinnedFooterHostContext = createContext<HTMLElement | null | undefined>(undefined);

type MenuScrollProps = {
  children?: ReactNode;
  /** The menu's `data-slot` prefix: `dropdown-menu` or `context-menu`. */
  slot: string;
};

/**
 * A menu's items, scrolling inside the popup's height cap (`--available-height`):
 * a ScrollArea that may shrink, with the popup's 4px padding on its content, so
 * a separator still meets the popup's edge and the overlay scrollbar takes no
 * room from the items. While they overflow, its edges fade toward the items
 * past them (24px, the fade's edge length; `useOverflowFade`), and a highlighted item scrolls clear of the fade
 * (`scroll-py-6`: Base UI scrolls the item into view, and the scroll padding
 * keeps it out of the faded strip). The items take focus themselves, so the
 * scroller is no tab stop. After it, the host a `…PinnedFooter` portals into:
 * an empty block, no height, until a footer is drawn there.
 */
export function MenuScroll({ children, slot }: MenuScrollProps) {
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const overflowFade = useOverflowFade();
  return (
    <>
      <ScrollArea
        data-slot={`${slot}-scroll`}
        tabIndex={-1}
        {...overflowFade}
        overscroll="contain"
        className="min-h-0 scroll-py-6"
        contentClassName="flex flex-col p-1"
      >
        <PinnedFooterHostContext.Provider value={host}>{children}</PinnedFooterHostContext.Provider>
      </ScrollArea>
      <div
        data-slot={`${slot}-pinned-footer-host`}
        className="flex shrink-0 flex-col"
        ref={setHost}
      />
    </>
  );
}

/**
 * Draws a pinned footer below the menu's scroller: through a portal into the
 * host `MenuScroll` renders after it, so it can be written anywhere among the
 * items and still never scrolls. Base UI orders a menu's items by their place
 * in the document, so the footer's items come last for the arrow keys too.
 * Outside a menu's content (a static popup) it is drawn where it is written.
 */
export function MenuPinnedFooterPortal({ children }: { children: ReactNode }) {
  const host = useContext(PinnedFooterHostContext);
  if (host === undefined) return children;
  if (host === null) return null;
  return createPortal(children, host);
}
