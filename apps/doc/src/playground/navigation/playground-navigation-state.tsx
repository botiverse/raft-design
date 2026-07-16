import { useMemo, useState, type ReactNode } from "react";

import {
  PlaygroundNavigationContext,
  type PlaygroundNavigationState,
} from "./playground-navigation-context.ts";
import type { PlaygroundPanelTab, PlaygroundRailView } from "./playground-navigation.ts";

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
