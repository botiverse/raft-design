import type { ReactNode } from "react";
import {
  AppShellMainSlot,
  AppShellOverlaySlot,
  AppShellPanelSlot,
  AppShellSidebarSlot,
  ResizableGroup,
  ResizableHandle,
  ResizablePanel,
} from "raft-ui";

/** Sidebar, main panel and optional side panel shared by the chat and topic shells. */
export function PlaygroundChatLayout({
  isDesktop,
  isLargeDesktop,
  main,
  mobileListPanel,
  sidebar,
  theme,
  thread,
}: {
  isDesktop: boolean;
  isLargeDesktop: boolean;
  main: ReactNode;
  mobileListPanel: boolean;
  sidebar: ReactNode;
  theme: "brutal" | "elegant";
  thread?: ReactNode;
}) {
  const sidebarDefaultSize = theme === "brutal" ? 240 : 252;

  if (!isDesktop) {
    return (
      <AppShellMainSlot className="size-full ">
        <div className={mobileListPanel ? "flex size-full " : "hidden"}>{sidebar}</div>
        <div className={mobileListPanel ? "hidden" : "flex size-full "}>{thread ?? main}</div>
      </AppShellMainSlot>
    );
  }

  return (
    <ResizableGroup orientation="horizontal" className="h-auto min-w-0 flex-1 md:h-full">
      <ResizablePanel
        id={`playground-sidebar-${theme}`}
        defaultSize={sidebarDefaultSize}
        minSize={180}
        maxSize={368}
        groupResizeBehavior="preserve-pixel-size"
        className="relative min-w-0"
      >
        <AppShellSidebarSlot className="relative flex h-full w-auto min-w-0 flex-1 in-data-[theme=brutal]:border-r-2 in-data-[theme=brutal]:border-black">
          {sidebar}
        </AppShellSidebarSlot>
      </ResizablePanel>
      <ResizableHandle className={theme === "elegant" ? "translate-x-[14px]" : undefined} />
      <ResizablePanel id="playground-main" minSize={360} className="relative z-0 overflow-visible!">
        <AppShellMainSlot overlay className="flex h-full min-w-0 flex-1">
          {main}
          {thread && !isLargeDesktop ? <AppShellOverlaySlot>{thread}</AppShellOverlaySlot> : null}
        </AppShellMainSlot>
      </ResizablePanel>
      {thread && isLargeDesktop ? (
        <>
          <ResizableHandle className={theme === "elegant" ? "z-50 translate-x-[7px]" : "z-50"} />
          <ResizablePanel
            id="playground-thread"
            defaultSize={400}
            minSize={360}
            maxSize="60vw"
            groupResizeBehavior="preserve-pixel-size"
            className="relative z-20 min-w-0 overflow-visible!"
          >
            <AppShellPanelSlot className="flex h-full min-w-0 flex-1">{thread}</AppShellPanelSlot>
          </ResizablePanel>
        </>
      ) : null}
    </ResizableGroup>
  );
}
