import type { ReactNode } from "react";
import { ChatIcon, DirectMessageIcon, MessageIcon, TaskStatusIcon, ThreadIcon } from "raft-ui";

function IconGridItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="relative grid min-h-44 place-items-center border-r border-b border-line-hairline bg-layer-canvas px-6 py-10">
      {children}
      <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-medium text-foreground-hint">
        {label}
      </span>
    </div>
  );
}

export function IconsComposition() {
  return (
    <div className="grid grid-cols-2 border-t border-l border-line-hairline sm:grid-cols-3">
      <IconGridItem label="Message">
        <MessageIcon className="size-[18px] text-foreground" />
      </IconGridItem>
      <IconGridItem label="Chat">
        <ChatIcon className="size-[18px] text-foreground" />
      </IconGridItem>
      <IconGridItem label="DM">
        <DirectMessageIcon className="size-[18px] text-foreground" />
      </IconGridItem>
      <IconGridItem label="Thread">
        <ThreadIcon className="size-[18px] text-foreground" />
      </IconGridItem>
      <IconGridItem label="Todo">
        <TaskStatusIcon status="todo" className="size-[18px] text-foreground" />
      </IconGridItem>
      <IconGridItem label="In progress">
        <TaskStatusIcon status="in-progress" className="size-[18px] text-foreground" />
      </IconGridItem>
      <IconGridItem label="In review">
        <TaskStatusIcon status="in-review" className="size-[18px] text-foreground" />
      </IconGridItem>
      <IconGridItem label="Done">
        <TaskStatusIcon status="done" className="size-[18px] text-foreground" />
      </IconGridItem>
      <IconGridItem label="Closed">
        <TaskStatusIcon status="closed" className="size-[18px] text-foreground" />
      </IconGridItem>
    </div>
  );
}
