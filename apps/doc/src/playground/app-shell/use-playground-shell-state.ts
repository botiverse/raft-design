import { use } from "react";

import { PlaygroundShellContext } from "./playground-shell-state-context.ts";

export function usePlaygroundShellState() {
  const state = use(PlaygroundShellContext);
  if (!state) {
    throw new Error("usePlaygroundShellState must be used inside PlaygroundShellStateProvider");
  }
  return state;
}
