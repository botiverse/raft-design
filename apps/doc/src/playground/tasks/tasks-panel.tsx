import { useNavigate } from "@tanstack/react-router";
import { CheckSquare, ListTodo, SquareKanban } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  PanelActions,
  ConversationPanelContent,
  PanelHeaderContent,
  PanelHeaderIcon,
  PanelHeading,
  PanelMeta,
  ConversationPanelRoot,
  PanelSectionHeader,
  PanelTitle,
  Tabs,
  TabsBackground,
  TabsList,
  TabsTab,
} from "raft-ui";

import {
  TasksPanelComposition,
  type TasksPanelCompositionProps,
} from "#/modules/tasks/compositions/tasks-panel.composition.tsx";
import { TasksIdentityFiltersComposition } from "#/modules/tasks/compositions/tasks-identity-filters.composition.tsx";
import type { TasksIdentity } from "#/modules/tasks/tasks-identity-filter.fixtures.ts";
import type { TaskFixture } from "#/modules/task-card/task-card.fixtures.ts";
import { usePlaygroundDesktop } from "../app-shell/use-playground-desktop.ts";
import {
  DEFAULT_CHANNEL_ID,
  PLAYGROUND_ACTORS,
  PLAYGROUND_ROOM_CHANNELS,
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
const TASK_FILTER_CHANNELS = PLAYGROUND_ROOM_CHANNELS.map((room) => ({
  id: room.id,
  label: `#${room.name}`,
}));
const CHANNEL_NAME_BY_ID = new Map<string, string>(
  PLAYGROUND_ROOM_CHANNELS.map((room) => [room.id, room.name]),
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
  const isDesktop = usePlaygroundDesktop();
  const initialView = useSyncExternalStore(
    subscribeInitialTaskView,
    readInitialTaskView,
    (): TaskView => "board",
  );
  const [viewOverride, setViewOverride] = useState<TaskView>();
  const [channelFilter, setChannelFilter] = useState<string[]>([]);
  const [creatorFilter, setCreatorFilter] = useState<string[]>([]);
  const [assigneeFilter, setAssigneeFilter] = useState<string[]>([]);
  const view = viewOverride ?? initialView;
  const showToolbarChrome = Boolean(channel) || isDesktop;
  const { tasks, setTasks } = usePlaygroundTaskState();
  const fallbackChannelId = channel?.id ?? DEFAULT_CHANNEL_ID;
  const visibleTasks = channel ? tasks.filter((task) => task.channelId === channel.id) : tasks;
  const compositionTasks = visibleTasks.map((task) =>
    toTaskFixture(task, getPlaygroundChannel(task.channelId).name),
  );
  const selectedChannelNames = new Set(
    channelFilter.flatMap((channelId) => {
      const name = CHANNEL_NAME_BY_ID.get(channelId);
      return name ? [name] : [];
    }),
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

  const panel = (
    <TasksPanelComposition
      tasks={compositionTasks}
      showChannelName={!channel}
      showToolbarView={showToolbarChrome}
      toolbarFilters={
        <TasksIdentityFiltersComposition
          identities={TASK_FILTER_IDENTITIES}
          channels={channel ? undefined : TASK_FILTER_CHANNELS}
          channelValue={channelFilter}
          onChannelValueChange={setChannelFilter}
          creatorValue={creatorFilter}
          onCreatorValueChange={setCreatorFilter}
          assigneeValue={assigneeFilter}
          onAssigneeValueChange={setAssigneeFilter}
        />
      }
      filterTask={(task) => {
        const channelMatches =
          selectedChannelNames.size === 0 || selectedChannelNames.has(task.channelName);
        const creatorMatches =
          creatorFilter.length === 0 ||
          creatorFilter.some((creatorId) =>
            creatorId === "me" ? task.creatorId === CURRENT_ACTOR_ID : task.creatorId === creatorId,
          );
        const assigneeMatches =
          assigneeFilter.length === 0 ||
          assigneeFilter.some((assigneeId) =>
            assigneeId === "me"
              ? task.assigneeId === CURRENT_ACTOR_ID
              : (task.assigneeId ?? "unassigned") === assigneeId,
          );
        return channelMatches && creatorMatches && assigneeMatches;
      }}
      view={view}
      onTasksChange={updateChannelTasks}
      onViewChange={setViewOverride}
      onOpenTask={(task) => {
        const sourceTask = visibleTasks.find((item) => item.id === task.id);
        if (!sourceTask) return;
        const conversation = getPlaygroundChannel(sourceTask.channelId);
        const fromTasks = channel ? undefined : ("tasks" as const);
        const search = sourceTask.legacy
          ? {
              ...(fromTasks ? { from: fromTasks } : {}),
              legacyTask: sourceTask.id,
            }
          : {
              ...(fromTasks ? { from: fromTasks } : {}),
              thread: sourceTask.sourceMessageId ?? sourceTask.id,
            };

        if (conversation.kind === "dm") {
          void navigate({
            to: "/playground/s/$serverSlug/dm/$dmId",
            params: { dmId: conversation.id, serverSlug: PLAYGROUND_SERVER_SLUG },
            search,
          });
          return;
        }

        void navigate({
          to: "/playground/s/$serverSlug/channel/$channelId",
          params: { channelId: conversation.id, serverSlug: PLAYGROUND_SERVER_SLUG },
          search,
        });
      }}
    />
  );

  if (channel) {
    return <div className="flex min-h-0 flex-1 flex-col">{panel}</div>;
  }

  return (
    <ConversationPanelRoot>
      <PanelSectionHeader>
        <PanelHeaderContent>
          {isDesktop ? (
            <PanelHeaderIcon>
              <CheckSquare
                aria-hidden
                className="size-4.5 in-data-[theme=elegant]:size-3.5 in-data-[theme=elegant]:stroke-[2.5]"
              />
            </PanelHeaderIcon>
          ) : null}
          <PanelHeading>
            <PanelTitle render={<h2 aria-label="Tasks" />}>Tasks</PanelTitle>
          </PanelHeading>
          <PanelMeta render={<p />}>{compositionTasks.length} channel tasks</PanelMeta>
        </PanelHeaderContent>
        <PanelActions className="md:hidden">
          <Tabs
            value={view}
            onValueChange={(nextView) => {
              if (nextView === "board" || nextView === "list") setViewOverride(nextView);
            }}
            aria-label="Task view"
          >
            <TabsList>
              <TabsBackground />
              <TabsTab value="board" aria-label="Board" className="px-2.5">
                <SquareKanban aria-hidden />
              </TabsTab>
              <TabsTab value="list" aria-label="List" className="px-2.5">
                <ListTodo aria-hidden />
              </TabsTab>
            </TabsList>
          </Tabs>
        </PanelActions>
      </PanelSectionHeader>
      <ConversationPanelContent className="max-md:[&_[data-slot=tasks-panel-viewport]]:pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))]">
        {panel}
      </ConversationPanelContent>
    </ConversationPanelRoot>
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
