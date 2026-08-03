import {
  createContext,
  use,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import { PLAYGROUND_ACTIVITY, type PlaygroundActivity } from "../mock/index.ts";

type PlaygroundActivityState = {
  items: readonly PlaygroundActivity[];
  setItems: Dispatch<SetStateAction<readonly PlaygroundActivity[]>>;
  unreadCount: number;
};

const PlaygroundActivityStateContext = createContext<PlaygroundActivityState | null>(null);

export function PlaygroundActivityStateProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<readonly PlaygroundActivity[]>(PLAYGROUND_ACTIVITY);
  const unreadCount = useMemo(
    () => items.reduce((count, item) => count + (item.done ? 0 : Number(item.unread)), 0),
    [items],
  );
  const value = useMemo(() => ({ items, setItems, unreadCount }), [items, unreadCount]);

  return <PlaygroundActivityStateContext value={value}>{children}</PlaygroundActivityStateContext>;
}

export function usePlaygroundActivityState() {
  const state = use(PlaygroundActivityStateContext);
  if (!state) {
    throw new Error(
      "usePlaygroundActivityState must be used inside PlaygroundActivityStateProvider",
    );
  }
  return state;
}
