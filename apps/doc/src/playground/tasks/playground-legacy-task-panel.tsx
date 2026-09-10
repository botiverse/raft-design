import { Link } from "@tanstack/react-router";
import { ChevronLeft, X } from "lucide-react";
import { Button, PanelAction } from "raft-ui";

import { TasksLegacyTaskPanelComposition } from "#/modules/tasks/compositions/tasks-legacy-task-panel.composition.tsx";
import { PlaygroundConversationLink } from "../navigation/conversation-link.tsx";
import { getPlaygroundActor } from "../mock/index.ts";
import type { PlaygroundChannelRecord, PlaygroundTask } from "../mock/index.ts";

export function PlaygroundLegacyTaskPanel({
  backToTasks,
  channel,
  task,
}: {
  backToTasks?: boolean;
  channel: PlaygroundChannelRecord;
  task: PlaygroundTask;
}) {
  const conversationLabel = channel.kind === "dm" ? "DM" : "channel";
  const creator = getPlaygroundActor(task.creatorActorId);
  const assignee = task.assigneeActorId ? getPlaygroundActor(task.assigneeActorId) : undefined;

  return (
    <TasksLegacyTaskPanelComposition
      channelName={channel.name}
      taskNumber={task.number}
      status={task.status}
      title={task.title}
      description={task.description}
      createdBy={`@${creator.name}`}
      createdAt={formatLegacyTimestamp(task.createdAt) ?? "Unknown"}
      assignee={assignee ? `@${assignee.name}` : "Unassigned"}
      completed={formatLegacyTimestamp(task.completedAt) ?? "Not done"}
      mobileBack={
        <Button
          className="mr-1 lg:hidden"
          variant="outline"
          size="icon-sm"
          nativeButton={false}
          aria-label={backToTasks ? "Back to Tasks" : `Back to ${conversationLabel}`}
          render={
            backToTasks ? (
              <Link to="/playground/tasks" search={{}} />
            ) : (
              <PlaygroundConversationLink conversation={channel} />
            )
          }
        >
          <ChevronLeft aria-hidden />
        </Button>
      }
      closeAction={
        <PanelAction
          className="max-lg:hidden"
          nativeButton={false}
          aria-label="Close legacy task"
          render={
            backToTasks ? (
              <Link to="/playground/tasks" search={{}} />
            ) : (
              <PlaygroundConversationLink conversation={channel} />
            )
          }
        >
          <X />
        </PanelAction>
      }
    />
  );
}

function formatLegacyTimestamp(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
