import { useCallback, useMemo, useState } from "react";
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
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemFooter,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
} from "@botiverse/raft-ui";
import type { TaskStatusId } from "@botiverse/raft-ui";

const TASK_STATUS_OPTIONS = [
  { id: "todo", label: "Todo" },
  { id: "in-progress", label: "In Progress" },
  { id: "in-review", label: "In Review" },
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
  const portalProps = useMemo(
    () => (portalContainer ? { container: portalContainer } : undefined),
    [portalContainer],
  );

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
            <TaskStatusIcon status={status} />
            <span className="shrink-0">#1</span>
            <span className="min-w-0 truncate">@{TASK_ASSIGNEE}</span>
          </TaskChip>
        }
      />
      <DropdownMenuContent align="start" portalProps={portalProps}>
        {TASK_STATUS_OPTIONS.map((option) => (
          <TaskStatusMenuItem
            key={option.id}
            option={option}
            selected={option.id === status}
            onSelect={setStatus}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TaskStatusMenuItem({
  option,
  selected,
  onSelect,
}: {
  option: (typeof TASK_STATUS_OPTIONS)[number];
  selected: boolean;
  onSelect: (status: TaskStatusId) => void;
}) {
  const handleClick = useCallback(() => onSelect(option.id), [onSelect, option.id]);

  return (
    <DropdownMenuItem onClick={handleClick}>
      <TaskStatusIcon status={option.id} />
      <span>{option.label}</span>
      {selected ? <Check className="ml-auto" size={14} /> : null}
    </DropdownMenuItem>
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
        <TaskStatusIcon status={option.id} />
        <span>#{taskNumber}</span>
      </TaskChip>
    );
  });
}

export function MessageTaskBadgeComposition() {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div ref={setPortalContainer} className="w-full max-w-3xl">
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
          <MessageItemFooter>
            <MessageTaskStatusReadonlyBadges />
          </MessageItemFooter>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
