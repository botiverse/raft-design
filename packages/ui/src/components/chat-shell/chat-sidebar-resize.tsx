import {
  Group as ResizablePanelGroup,
  Panel as ResizablePanel,
  Separator as ResizablePanelSeparator,
  type GroupProps as ResizablePanelGroupProps,
  type PanelProps as ResizablePanelProps,
  type SeparatorProps as ResizablePanelSeparatorProps,
} from "react-resizable-panels";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { chatSidebar } from "./chat-sidebar.recipe";

export type ChatSidebarResizeGroupProps = Omit<ResizablePanelGroupProps, "className"> & {
  className?: string;
};

export function ChatSidebarResizeGroup({
  className,
  orientation = "horizontal",
  ...props
}: ChatSidebarResizeGroupProps) {
  const { sidebarResizeGroup } = chatSidebar();

  return (
    <ResizablePanelGroup
      data-slot="chat-sidebar-resize-group"
      orientation={orientation}
      className={sidebarResizeGroup({ className })}
      {...props}
    />
  );
}

export type ChatSidebarResizePanelProps = Omit<ResizablePanelProps, "className"> & {
  className?: string;
};

export function ChatSidebarResizePanel({ className, ...props }: ChatSidebarResizePanelProps) {
  const { sidebarResizePanel } = chatSidebar();

  return (
    <ResizablePanel
      data-slot="chat-sidebar-resize-panel"
      className={sidebarResizePanel({ className })}
      {...props}
    />
  );
}

export type ChatSidebarResizeHandleProps = Omit<ResizablePanelSeparatorProps, "className"> & {
  className?: string;
};

export function ChatSidebarResizeHandle({ className, ...props }: ChatSidebarResizeHandleProps) {
  const theme = useThemeFamily();
  const { sidebarResizeHandle } = chatSidebar({ theme });

  return (
    <ResizablePanelSeparator
      data-slot="chat-sidebar-resize-handle"
      className={sidebarResizeHandle({ className })}
      {...props}
    />
  );
}
