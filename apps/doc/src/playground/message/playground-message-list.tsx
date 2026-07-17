import type { ReactNode } from "react";
import { MessageList } from "raft-ui/wip";

import { usePlaygroundDesktop } from "../app-shell/use-playground-desktop.ts";

export function PlaygroundMessageList({ children }: { children: ReactNode }) {
  const isDesktop = usePlaygroundDesktop();

  return isDesktop ? (
    <MessageList>{children}</MessageList>
  ) : (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
      {children}
    </div>
  );
}
