import { createContext, use, useMemo, useState, type ReactNode } from "react";

export type PlaygroundRailView =
  | "search"
  | "chat"
  | "activity"
  | "saved"
  | "tasks"
  | "members"
  | "computers"
  | "settings";

export type PlaygroundPanelTab = "chat" | "tasks" | "files";

const playgroundRailViews = new Set<PlaygroundRailView>([
  "search",
  "chat",
  "activity",
  "saved",
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
  selectRailDetail: (id?: string) => void;
};

const PlaygroundNavigationContext = createContext<PlaygroundNavigationState | null>(null);

export function PlaygroundNavigationProvider({
  children,
  railDetailId,
  railView,
  onRailDetailChange,
  onRailViewChange,
}: {
  children: ReactNode;
  railDetailId?: string;
  railView: PlaygroundRailView;
  onRailDetailChange: (id?: string) => void;
  onRailViewChange: (view: PlaygroundRailView) => void;
}) {
  const [panelTab, setPanelTab] = useState<PlaygroundPanelTab>("chat");

  const value = useMemo<PlaygroundNavigationState>(
    () => ({
      railView,
      panelTab,
      railDetailId,
      selectRailView: onRailViewChange,
      selectPanelTab: setPanelTab,
      selectRailDetail: onRailDetailChange,
    }),
    [onRailDetailChange, onRailViewChange, panelTab, railDetailId, railView],
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
