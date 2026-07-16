import { createContext } from "react";

import type { PlaygroundPanelTab, PlaygroundRailView } from "./playground-navigation.ts";

export type PlaygroundNavigationState = {
  railView: PlaygroundRailView;
  panelTab: PlaygroundPanelTab;
  railDetailId?: string;
  selectRailView: (view: PlaygroundRailView) => void;
  selectPanelTab: (tab: PlaygroundPanelTab) => void;
  selectRailDetail: (id?: string) => void;
};

export const PlaygroundNavigationContext = createContext<PlaygroundNavigationState | null>(null);
