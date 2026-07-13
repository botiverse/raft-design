import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "raft-ui";

import {
  TasksPanelComposition,
  type TaskIdentity,
  type TasksPanelCompositionProps,
} from "#/modules/tasks/compositions/tasks-panel.composition.tsx";
import type { TaskFixture } from "#/modules/task-card/task-card.fixtures.ts";
import {
  PLAYGROUND_ACTORS,
  type PlaygroundActor,
  type PlaygroundChannelRecord,
  type PlaygroundTask,
} from "./mock/index.ts";
import { usePlaygroundTaskState } from "./playground-task-state.tsx";

type Tasks = NonNullable<TasksPanelCompositionProps["tasks"]>;
type TaskView = NonNullable<TasksPanelCompositionProps["view"]>;

const TASK_VIEW_MODE_STORAGE_KEY = "slock.tasks.viewMode";

function readInitialTaskView(): TaskView {
  if (typeof window === "undefined") return "board";
  try {
    const stored = window.localStorage.getItem(TASK_VIEW_MODE_STORAGE_KEY);
    if (stored === "board" || stored === "list") return stored;
  } catch {
    // Storage can be unavailable in privacy-restricted contexts.
  }
  return window.matchMedia("(min-width: 768px)").matches ? "board" : "list";
}

function persistTaskView(view: TaskView) {
  try {
    window.localStorage.setItem(TASK_VIEW_MODE_STORAGE_KEY, view);
  } catch {
    // The in-memory selection still works when persistence is unavailable.
  }
}

export function PlaygroundTasksPanel({ channel }: { channel: PlaygroundChannelRecord }) {
  const navigate = useNavigate();
  const [view, setView] = useState<TaskView>(readInitialTaskView);
  const { tasks, setTasks } = usePlaygroundTaskState();
  const channelId = channel.id;
  const channelTasks = tasks.filter((task) => task.channelId === channelId);
  const compositionTasks = channelTasks.map((task) => toTaskFixture(task, channel.name));
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
      view={view}
      creatorOptions={creatorOptions}
      assigneeOptions={assigneeOptions}
      onTasksChange={updateChannelTasks}
      onViewChange={(nextView) => {
        setView(nextView);
        persistTaskView(nextView);
      }}
      onOpenTask={(task) => {
        const sourceTask = channelTasks.find((item) => item.id === task.id);
        if (!sourceTask || sourceTask.legacy) return;
        void navigate({
          to: "/playground/$channelId",
          params: { channelId },
          search: { thread: sourceTask.sourceMessageId ?? sourceTask.id },
        });
      }}
    />
  );
}

function toTaskFixture(task: PlaygroundTask, channelName: string): TaskFixture {
  return {
    id: task.id,
    taskNumber: task.number,
    channelName,
    title: task.title,
    description: task.description,
    status: task.status,
    creatorId: task.creatorActorId,
    assigneeId: task.assigneeActorId ?? "unassigned",
    isLegacy: task.legacy,
    disabled: task.legacy,
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
