import { use } from "react";

import { PlaygroundNavigationContext } from "./playground-navigation-context.ts";

export function usePlaygroundNavigation() {
  const state = use(PlaygroundNavigationContext);
  if (!state) {
    throw new Error("usePlaygroundNavigation must be used inside PlaygroundNavigationProvider");
  }
  return state;
}
