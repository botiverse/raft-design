import type { ReactNode } from "react";
import { MessageList } from "raft-ui/wip";

import { usePlaygroundDesktop } from "../app-shell/use-playground-desktop.ts";

export function PlaygroundMessageList({ children }: { children: ReactNode }) {
  const isDesktop = usePlaygroundDesktop();

  return isDesktop ? (
    <MessageList>{children}</MessageList>
  ) : (
    <div className="flex w-full min-w-0 flex-col">{children}</div>
  );
}
