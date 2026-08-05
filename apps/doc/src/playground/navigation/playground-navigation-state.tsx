import { useMemo, useState, type ReactNode } from "react";

import {
  PlaygroundNavigationContext,
  type PlaygroundNavigationState,
} from "./playground-navigation-context.ts";
import type { PlaygroundPanelTab, PlaygroundRailView } from "./playground-navigation.ts";

export function PlaygroundNavigationProvider({
  children,
  contentId,
  contextId,
  searchQuery,
  railDetailId,
  railView,
  onRailDetailChange,
  onContentChange,
  onContextChange,
  onSearchQueryChange,
  onRailViewChange,
}: {
  children: ReactNode;
  contentId?: string;
  contextId?: string;
  searchQuery: string;
  railDetailId?: string;
  railView: PlaygroundRailView;
  onRailDetailChange: (id?: string) => void;
  onContentChange: (id?: string) => void;
  onContextChange: (id?: string) => void;
  onSearchQueryChange: (query: string) => void;
  onRailViewChange: (view: PlaygroundRailView) => void;
}) {
  const [panelTab, setPanelTab] = useState<PlaygroundPanelTab>("chat");

  const value = useMemo<PlaygroundNavigationState>(
    () => ({
      contentId,
      contextId,
      searchQuery,
      railView,
      panelTab,
      railDetailId,
      selectContent: onContentChange,
      selectContext: onContextChange,
      setSearchQuery: onSearchQueryChange,
      selectRailView: onRailViewChange,
      selectPanelTab: setPanelTab,
      selectRailDetail: onRailDetailChange,
    }),
    [
      contentId,
      contextId,
      onContentChange,
      onContextChange,
      onSearchQueryChange,
      onRailDetailChange,
      onRailViewChange,
      panelTab,
      railDetailId,
      railView,
      searchQuery,
    ],
  );

  return <PlaygroundNavigationContext value={value}>{children}</PlaygroundNavigationContext>;
}
