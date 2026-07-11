import { createContext, use, useMemo, useState, type ReactNode } from "react";

export type PlaygroundRailView =
  | "search"
  | "chat"
  | "activity"
  | "tasks"
  | "members"
  | "computers"
  | "settings";

export type PlaygroundPanelTab = "chat" | "tasks" | "files";

const playgroundRailViews = new Set<PlaygroundRailView>([
  "search",
  "chat",
  "activity",
  "tasks",
  "members",
  "computers",
  "settings",
]);

export function isPlaygroundRailView(value: string): value is PlaygroundRailView {
  return playgroundRailViews.has(value as PlaygroundRailView);
}

type PlaygroundNavigationState = {
  railView: PlaygroundRailView;
  panelTab: PlaygroundPanelTab;
  railDetailId?: string;
  selectRailView: (view: PlaygroundRailView) => void;
  selectPanelTab: (tab: PlaygroundPanelTab) => void;
  selectRailDetail: (id: string) => void;
};

const PlaygroundNavigationContext = createContext<PlaygroundNavigationState | null>(null);

export function PlaygroundNavigationProvider({ children }: { children: ReactNode }) {
  const [railView, setRailView] = useState<PlaygroundRailView>("chat");
  const [panelTab, setPanelTab] = useState<PlaygroundPanelTab>("chat");
  const [railDetailId, setRailDetailId] = useState<string>();

  const value = useMemo<PlaygroundNavigationState>(
    () => ({
      railView,
      panelTab,
      railDetailId,
      selectRailView: (view) => {
        setRailView(view);
        setRailDetailId(undefined);
        if (view === "chat" || view === "tasks") setPanelTab(view);
      },
      selectPanelTab: (tab) => {
        setPanelTab(tab);
        setRailView(tab === "tasks" ? "tasks" : "chat");
        setRailDetailId(undefined);
      },
      selectRailDetail: setRailDetailId,
    }),
    [panelTab, railDetailId, railView],
  );

  return <PlaygroundNavigationContext value={value}>{children}</PlaygroundNavigationContext>;
}

export function usePlaygroundNavigation() {
  const state = use(PlaygroundNavigationContext);
  if (!state) {
    throw new Error("usePlaygroundNavigation must be used inside PlaygroundNavigationProvider");
  }
  return state;
}
