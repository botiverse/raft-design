import { useLayoutEffect, useRef } from "react";
import type { PanelImperativeHandle } from "react-resizable-panels";

export function useSidebarPanelLayout({
  active,
  collapsed,
}: {
  active: boolean;
  collapsed: boolean;
}) {
  const sidebarPanelRef = useRef<PanelImperativeHandle | null>(null);
  const wasActiveRef = useRef(false);

  useLayoutEffect(() => {
    const sidebarPanel = sidebarPanelRef.current;
    if (!active || !sidebarPanel) {
      wasActiveRef.current = false;
      return;
    }

    if (!wasActiveRef.current) {
      wasActiveRef.current = true;
      if (collapsed) sidebarPanel.collapse();
      else sidebarPanel.expand();
      return;
    }

    if (collapsed) sidebarPanel.collapse();
    else sidebarPanel.expand();
  }, [active, collapsed]);

  return sidebarPanelRef;
}
