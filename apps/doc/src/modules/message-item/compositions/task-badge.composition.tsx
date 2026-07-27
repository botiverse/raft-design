import { useState } from "react";
import { MESSAGE_FIXTURE_AVATAR_SRC } from "../message-item.fixtures.ts";
import { Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
  TaskChip,
  TaskStatusIcon,
  type TaskStatusId,
} from "raft-ui";
import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemFooter,
  MessageItemHeader,
  MessageItemInteractionBoundary,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui/wip";

const TASK_STATUS_OPTIONS = [
  { id: "todo", label: "Todo" },
  { id: "in_progress", label: "In Progress" },
  { id: "in_review", label: "In Review" },
  { id: "done", label: "Done" },
  { id: "closed", label: "Closed" },
] as const satisfies readonly {
  id: TaskStatusId;
  label: string;
}[];

const TASK_ASSIGNEE = "Noah";

export function MessageTaskStatusBadgeComposition({
  portalContainer,
}: {
  portalContainer: HTMLElement | null;
}) {
  const [status, setStatus] = useState<TaskStatusId>("todo");
  const current =
    TASK_STATUS_OPTIONS.find((option) => option.id === status) ?? TASK_STATUS_OPTIONS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <TaskChip
            status={status}
            render={
              <button
                type="button"
                title={`task #1 @${TASK_ASSIGNEE} · ${current.label}`}
                aria-label={`Change status for task #1 @${TASK_ASSIGNEE}, currently ${current.label}`}
              />
            }
          >
            <span className="shrink-0">#1</span>
            <span className="min-w-0 truncate">@{TASK_ASSIGNEE}</span>
          </TaskChip>
        }
      />
      <DropdownMenuContent
        align="start"
        portalProps={portalContainer ? { container: portalContainer } : undefined}
      >
        {TASK_STATUS_OPTIONS.map((option) => (
          <DropdownMenuItem key={option.id} onClick={() => setStatus(option.id)}>
            <TaskStatusIcon status={option.id} />
            <span>{option.label}</span>
            {option.id === status ? <Check className="ml-auto" size={14} /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MessageTaskStatusReadonlyBadges() {
  return TASK_STATUS_OPTIONS.map((option, index) => {
    const taskNumber = index + 11;

    return (
      <TaskChip
        key={option.id}
        status={option.id}
        title={`task #${taskNumber} · ${option.label} · Read only`}
      >
        <span>#{taskNumber}</span>
      </TaskChip>
    );
  });
}

export function MessageTaskBadgeComposition() {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

  return (
    <MessageItemInteractionBoundary ref={setPortalContainer} className="w-full max-w-3xl">
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="agent">
            <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
            <AvatarFallback>AT</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Atlas</MessageItemSender>
            <MessageItemTime>2:22 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            Task badge status stays caller-owned. Open the badge to change #1.
          </MessageItemBody>
          <MessageItemFooter>
            <MessageTaskStatusBadgeComposition portalContainer={portalContainer} />
          </MessageItemFooter>
        </MessageItemContent>
      </MessageItem>
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="agent">
            <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
            <AvatarFallback>AT</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Atlas</MessageItemSender>
            <MessageItemTime>2:23 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            Read-only task badges use the persisted status vocabulary and are not buttons.
          </MessageItemBody>
          <MessageItemFooter className="flex-wrap">
            <MessageTaskStatusReadonlyBadges />
          </MessageItemFooter>
        </MessageItemContent>
      </MessageItem>
    </MessageItemInteractionBoundary>
  );
}
