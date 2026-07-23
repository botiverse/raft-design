import { useNavigate } from "@tanstack/react-router";
import { CheckSquare } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  BrutalOnly,
  ConversationPanelHeaderContent,
  ConversationPanelHeaderIcon,
  ConversationPanelMeta,
  ConversationPanelSectionHeader,
  ConversationPanelTitle,
  ElegantOnly,
} from "raft-ui";

import {
  TasksPanelComposition,
  type TasksPanelCompositionProps,
} from "#/modules/tasks/compositions/tasks-panel.composition.tsx";
import { TasksIdentityFiltersComposition } from "#/modules/tasks/compositions/tasks-identity-filters.composition.tsx";
import type { TasksIdentity } from "#/modules/tasks/tasks-identity-filter.fixtures.ts";
import type { TaskFixture } from "#/modules/task-card/task-card.fixtures.ts";
import {
  DEFAULT_CHANNEL_ID,
  PLAYGROUND_ACTORS,
  PLAYGROUND_SERVER_SLUG,
  getPlaygroundChannel,
  type PlaygroundActor,
  type PlaygroundChannelRecord,
  type PlaygroundTask,
} from "../mock/index.ts";
import { usePlaygroundTaskState } from "./use-playground-task-state.ts";

type Tasks = NonNullable<TasksPanelCompositionProps["tasks"]>;
type TaskView = NonNullable<TasksPanelCompositionProps["view"]>;

const TASK_VIEW_MODE_STORAGE_KEY = "slock.tasks.viewMode";
const CURRENT_ACTOR_ID = "cuvii";
const TASK_FILTER_IDENTITIES: readonly TasksIdentity[] = PLAYGROUND_ACTORS.map(
  (actor: PlaygroundActor) => ({
    id: actor.id,
    label: actor.name,
    type: actor.type,
    avatarSrc: actor.avatarSrc,
    fallback: actor.fallback,
  }),
);

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

function subscribeInitialTaskView() {
  return () => undefined;
}

export function PlaygroundTasksPanel({ channel }: { channel?: PlaygroundChannelRecord }) {
  const navigate = useNavigate();
  const initialView = useSyncExternalStore(
    subscribeInitialTaskView,
    readInitialTaskView,
    (): TaskView => "board",
  );
  const [viewOverride, setViewOverride] = useState<TaskView>();
  const [creatorFilter, setCreatorFilter] = useState<string[]>([]);
  const [assigneeFilter, setAssigneeFilter] = useState<string[]>([]);
  const view = viewOverride ?? initialView;
  const { tasks, setTasks } = usePlaygroundTaskState();
  const fallbackChannelId = channel?.id ?? DEFAULT_CHANNEL_ID;
  const visibleTasks = channel ? tasks.filter((task) => task.channelId === channel.id) : tasks;
  const compositionTasks = visibleTasks.map((task) =>
    toTaskFixture(task, getPlaygroundChannel(task.channelId).name),
  );

  useEffect(() => {
    if (viewOverride !== undefined) persistTaskView(viewOverride);
  }, [viewOverride]);

  const updateChannelTasks = (nextTasks: Tasks) => {
    const currentTasks = new Map(visibleTasks.map((task) => [task.id, task]));
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
        id: `task:${fallbackChannelId}:${task.taskNumber}`,
        channelId: fallbackChannelId,
        number: task.taskNumber,
        title: task.title,
        description: task.description,
        status: task.status,
        creatorActorId: "cuvii",
        legacy: task.isLegacy,
        movable: !task.dragDisabled,
      } satisfies PlaygroundTask;
    });

    setTasks(
      channel
        ? [...tasks.filter((task) => task.channelId !== channel.id), ...nextChannelTasks]
        : nextChannelTasks,
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {channel ? null : (
        <ConversationPanelSectionHeader>
          <BrutalOnly>
            <ConversationPanelHeaderIcon className="max-md:hidden">
              <CheckSquare aria-hidden />
            </ConversationPanelHeaderIcon>
          </BrutalOnly>
          <ElegantOnly>
            <ConversationPanelHeaderIcon>
              <CheckSquare aria-hidden />
            </ConversationPanelHeaderIcon>
          </ElegantOnly>
          <ConversationPanelHeaderContent>
            <ConversationPanelTitle render={<h2 aria-label="Tasks" />}>
              Tasks
            </ConversationPanelTitle>
            <ConversationPanelMeta render={<p />}>
              {compositionTasks.length} channel tasks
            </ConversationPanelMeta>
          </ConversationPanelHeaderContent>
        </ConversationPanelSectionHeader>
      )}
      <TasksPanelComposition
        tasks={compositionTasks}
        toolbarFilters={
          <TasksIdentityFiltersComposition
            identities={TASK_FILTER_IDENTITIES}
            creatorValue={creatorFilter}
            onCreatorValueChange={setCreatorFilter}
            assigneeValue={assigneeFilter}
            onAssigneeValueChange={setAssigneeFilter}
          />
        }
        filterTask={(task) => {
          const creatorMatches =
            creatorFilter.length === 0 ||
            creatorFilter.some((creatorId) =>
              creatorId === "me"
                ? task.creatorId === CURRENT_ACTOR_ID
                : task.creatorId === creatorId,
            );
          const assigneeMatches =
            assigneeFilter.length === 0 ||
            assigneeFilter.some((assigneeId) =>
              assigneeId === "me"
                ? task.assigneeId === CURRENT_ACTOR_ID
                : (task.assigneeId ?? "unassigned") === assigneeId,
            );
          return creatorMatches && assigneeMatches;
        }}
        view={view}
        onTasksChange={updateChannelTasks}
        onViewChange={setViewOverride}
        onOpenTask={(task) => {
          const sourceTask = visibleTasks.find((item) => item.id === task.id);
          if (!sourceTask || sourceTask.legacy) return;
          const conversation = getPlaygroundChannel(sourceTask.channelId);
          if (conversation.kind === "dm") {
            void navigate({
              to: "/playground/s/$serverSlug/dm/$dmId",
              params: { dmId: conversation.id, serverSlug: PLAYGROUND_SERVER_SLUG },
              search: { from: "tasks", thread: sourceTask.sourceMessageId ?? sourceTask.id },
            });
            return;
          }

          void navigate({
            to: "/playground/s/$serverSlug/channel/$channelId",
            params: { channelId: conversation.id, serverSlug: PLAYGROUND_SERVER_SLUG },
            search: { from: "tasks", thread: sourceTask.sourceMessageId ?? sourceTask.id },
          });
        }}
      />
    </div>
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
    dragDisabled: task.movable === false,
  };
}
