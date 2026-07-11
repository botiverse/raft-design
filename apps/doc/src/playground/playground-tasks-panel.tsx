import { useNavigate } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "raft-ui";

import {
  TasksPanelComposition,
  type TaskIdentity,
  type TasksPanelCompositionProps,
} from "#/compositions/tasks/tasks-panel-composition.tsx";
import type { TaskFixture } from "#/compositions/tasks/task-fixtures.ts";
import {
  PLAYGROUND_ACTORS,
  type PlaygroundActor,
  type PlaygroundChannel,
  type PlaygroundChannelId,
  type PlaygroundTask,
} from "./mock/index.ts";
import { usePlaygroundTaskState } from "./playground-task-state.tsx";

type Tasks = NonNullable<TasksPanelCompositionProps["tasks"]>;

export function PlaygroundTasksPanel({ channel }: { channel: PlaygroundChannel }) {
  const navigate = useNavigate();
  const { tasks, setTasks } = usePlaygroundTaskState();
  const channelId = channel.id as PlaygroundChannelId;
  const channelTasks = tasks.filter((task) => task.channelId === channelId);
  const compositionTasks = channelTasks.map((task) => toTaskFixture(task));
  const creatorOptions = getCreatorOptions();
  const assigneeOptions = getAssigneeOptions();

  const updateChannelTasks = (nextTasks: Tasks) => {
    const currentTasks = new Map(channelTasks.map((task) => [task.id, task]));
    const nextChannelTasks = nextTasks.map((task) => {
      const current = currentTasks.get(task.id as PlaygroundTask["id"]);
      if (current) {
        return {
          ...current,
          title: task.title,
          description: task.description,
          status: task.status,
          legacy: task.isLegacy,
          movable: !task.dragDisabled,
        } satisfies PlaygroundTask;
      }

      return {
        id: `task:${channelId}:${task.taskNumber}`,
        channelId,
        number: task.taskNumber,
        title: task.title,
        description: task.description,
        status: task.status,
        creatorActorId: "cuvii",
        legacy: task.isLegacy,
        movable: !task.dragDisabled,
      } satisfies PlaygroundTask;
    });

    setTasks([...tasks.filter((task) => task.channelId !== channelId), ...nextChannelTasks]);
  };

  return (
    <TasksPanelComposition
      tasks={compositionTasks}
      creatorOptions={creatorOptions}
      assigneeOptions={assigneeOptions}
      onTasksChange={updateChannelTasks}
      onOpenTask={(task) => {
        const sourceTask = channelTasks.find((item) => item.id === task.id);
        if (!sourceTask) return;
        void navigate({
          to: "/playground/$channelId",
          params: { channelId },
          search: { thread: sourceTask.sourceMessageId ?? sourceTask.id },
        });
      }}
    />
  );
}

function toTaskFixture(task: PlaygroundTask): TaskFixture {
  return {
    id: task.id,
    taskNumber: task.number,
    channelName: task.channelId,
    title: task.title,
    description: task.description,
    status: task.status,
    creatorId: task.creatorActorId,
    assigneeId: task.assigneeActorId ?? "unassigned",
    isLegacy: task.legacy,
    dragDisabled: task.movable === false,
  };
}

function getCreatorOptions(): readonly TaskIdentity[] {
  return getActorOptions({ id: "cuvii", label: "Created by me", isSentinel: true });
}

function getAssigneeOptions(): readonly TaskIdentity[] {
  return [
    { id: "cuvii", label: "Assigned to me", isSentinel: true },
    { id: "unassigned", label: "Unassigned", isSentinel: true },
    ...getActorOptions(),
  ];
}

function getActorOptions(selfOption?: TaskIdentity): readonly TaskIdentity[] {
  const actors = PLAYGROUND_ACTORS.filter((actor) => actor.id !== "cuvii").sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
  return [...(selfOption ? [selfOption] : []), ...actors.map(toTaskIdentity)];
}

function toTaskIdentity(actor: PlaygroundActor): TaskIdentity {
  return {
    id: actor.id,
    label: actor.name,
    searchText: `${actor.id} ${actor.meta}`,
    avatar: (
      <Avatar size="xs" type={actor.type}>
        {actor.avatarSrc ? <AvatarImage src={actor.avatarSrc} alt="" /> : null}
        <AvatarFallback>{actor.fallback}</AvatarFallback>
      </Avatar>
    ),
  };
}
