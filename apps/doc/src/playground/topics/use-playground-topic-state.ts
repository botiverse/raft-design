import { use } from "react";

import type { PlaygroundTopicChannelId } from "../mock/index.ts";
import { PlaygroundTopicStateContext } from "./topic-state-context.ts";

export function usePlaygroundTopicState() {
  const state = use(PlaygroundTopicStateContext);
  if (!state) {
    throw new Error("usePlaygroundTopicState must be used inside PlaygroundTopicStateProvider");
  }
  return state;
}

export function usePlaygroundChannelTopics(channelId: PlaygroundTopicChannelId) {
  const { topics } = usePlaygroundTopicState();
  return topics.filter((topic) => topic.channelId === channelId);
}
