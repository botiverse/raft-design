import { LayoutPanelLeft } from "lucide-react";
import {
  AppShellMainSlot,
  AppShellPanelSlot,
  AppShellSidebarSlot,
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  ResizableGroup,
  ResizableHandle,
  ResizablePanel,
  useThemeFamily,
} from "raft-ui";
import type { ReactNode } from "react";

import { usePlaygroundDesktop, usePlaygroundLargeDesktop } from "./use-playground-desktop.ts";

export function PlaygroundContentShell({
  content,
  contentEmptyDescription,
  contentEmptyTitle,
  master,
  masterDefaultSize,
  masterLabel,
  context,
}: {
  content?: ReactNode;
  contentEmptyDescription: string;
  contentEmptyTitle: string;
  context?: ReactNode;
  master: ReactNode;
  masterDefaultSize: number;
  masterLabel: string;
}) {
  const isDesktop = usePlaygroundDesktop();
  const hasContextColumn = usePlaygroundLargeDesktop();
  const theme = useThemeFamily();

  if (!isDesktop) {
    return (
      <AppShellMainSlot className="h-full w-full bg-transparent">
        {context ?? content ?? master}
      </AppShellMainSlot>
    );
  }

  return (
    <ResizableGroup orientation="horizontal" className="h-auto min-w-0 flex-1 md:h-full">
      <ResizablePanel
        id={`playground-${masterLabel.toLocaleLowerCase()}-master`}
        defaultSize={masterDefaultSize}
        minSize={240}
        maxSize={480}
        groupResizeBehavior="preserve-pixel-size"
        className="relative min-w-0"
      >
        <AppShellSidebarSlot className="relative flex h-full w-auto min-w-0 flex-1">
          {master}
        </AppShellSidebarSlot>
      </ResizablePanel>
      <ResizableHandle
        className={
          theme === "brutal"
            ? "z-40 ml-0 mr-0 w-0 border-l-2 border-black bg-transparent"
            : "z-40 translate-x-[7px] bg-transparent"
        }
      />
      <ResizablePanel id="playground-content" minSize={320} className="relative min-w-0">
        <AppShellMainSlot className="flex h-full min-w-0 flex-1">
          {content ?? (
            <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center bg-layer-page p-6">
              <EmptyState>
                <EmptyStateIcon>
                  <LayoutPanelLeft />
                </EmptyStateIcon>
                <EmptyStateContent>
                  <EmptyStateTitle>{contentEmptyTitle}</EmptyStateTitle>
                  <EmptyStateDescription>{contentEmptyDescription}</EmptyStateDescription>
                </EmptyStateContent>
              </EmptyState>
            </div>
          )}
          {context && !hasContextColumn ? (
            <div
              className={
                theme === "brutal"
                  ? "absolute inset-0 z-20 flex min-h-0 min-w-0 border-l-2 border-black bg-white"
                  : "absolute inset-0 z-20 flex min-h-0 min-w-0 bg-layer-panel"
              }
            >
              {context}
            </div>
          ) : null}
        </AppShellMainSlot>
      </ResizablePanel>
      {context && hasContextColumn ? (
        <>
          <ResizableHandle
            className={
              theme === "brutal"
                ? "z-50 ml-0 mr-0 w-0 border-l-2 border-black bg-transparent"
                : "z-50 translate-x-[7px] bg-transparent"
            }
          />
          <ResizablePanel
            id="playground-context"
            defaultSize={400}
            minSize={360}
            maxSize="60vw"
            groupResizeBehavior="preserve-pixel-size"
            className="relative z-20 min-w-0 !overflow-visible"
          >
            <AppShellPanelSlot className="flex h-full min-w-0 flex-1">{context}</AppShellPanelSlot>
          </ResizablePanel>
        </>
      ) : null}
    </ResizableGroup>
  );
}
