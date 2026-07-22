import { useState } from "react";
import { MESSAGE_FIXTURE_AVATAR_SRC } from "../message-item.fixtures.ts";
import { Ban, Check, CheckCircle, Circle, Eye, Play } from "lucide-react";
import {
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useThemeFamily,
  Avatar,
  AvatarFallback,
  AvatarImage,
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

type MessageTaskStatus = "todo" | "in_progress" | "in_review" | "done" | "closed";

const TASK_STATUS_OPTIONS = [
  { id: "todo", icon: Circle, label: "Todo", variant: "warning" },
  { id: "in_progress", icon: Play, label: "In Progress", variant: "information" },
  { id: "in_review", icon: Eye, label: "In Review", variant: "accent" },
  { id: "done", icon: CheckCircle, label: "Done", variant: "success" },
  { id: "closed", icon: Ban, label: "Closed", variant: "muted" },
] as const satisfies readonly {
  id: MessageTaskStatus;
  icon: typeof Circle;
  label: string;
  variant: "accent" | "information" | "muted" | "success" | "warning";
}[];

function MessageTaskStatusBadge({ portalContainer }: { portalContainer: HTMLElement | null }) {
  const [status, setStatus] = useState<MessageTaskStatus>("todo");
  const theme = useThemeFamily();
  const current =
    TASK_STATUS_OPTIONS.find((option) => option.id === status) ?? TASK_STATUS_OPTIONS[0];
  const Icon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Badge
            appearance={theme === "brutal" ? "solid" : "soft"}
            variant={current.variant}
            render={
              <button
                type="button"
                title={`Task #1 · ${current.label}`}
                aria-label={`Change status for task #1, currently ${current.label}`}
              />
            }
          />
        }
      >
        <Icon size={10} />
        <span>#1</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        portalProps={portalContainer ? { container: portalContainer } : undefined}
      >
        {TASK_STATUS_OPTIONS.map((option) => (
          <DropdownMenuItem key={option.id} onClick={() => setStatus(option.id)}>
            <option.icon size={14} />
            <span>{option.label}</span>
            {option.id === status ? <Check className="ml-auto" size={14} /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MessageTaskStatusReadonlyBadges() {
  const theme = useThemeFamily();

  return TASK_STATUS_OPTIONS.map((option, index) => {
    const Icon = option.icon;
    const taskNumber = index + 11;

    return (
      <Badge
        key={option.id}
        appearance={theme === "brutal" ? "solid" : "soft"}
        data-task-status={option.id}
        title={`task #${taskNumber} · ${option.label} · Read only`}
        variant={option.variant}
      >
        <Icon size={10} />
        <span>#{taskNumber}</span>
      </Badge>
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
            <MessageTaskStatusBadge portalContainer={portalContainer} />
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
