import { createContext } from "react";

import type { PlaygroundPanelTab, PlaygroundRailView } from "./playground-navigation.ts";

export type PlaygroundNavigationState = {
  contentId?: string;
  contextId?: string;
  searchQuery: string;
  railView: PlaygroundRailView;
  panelTab: PlaygroundPanelTab;
  railDetailId?: string;
  selectContent: (id?: string, options?: { hash?: string; surface?: string }) => void;
  selectContext: (id?: string) => void;
  setSearchQuery: (query: string) => void;
  selectRailView: (view: PlaygroundRailView) => void;
  selectPanelTab: (tab: PlaygroundPanelTab) => void;
  selectRailDetail: (id?: string) => void;
};

export const PlaygroundNavigationContext = createContext<PlaygroundNavigationState | null>(null);
