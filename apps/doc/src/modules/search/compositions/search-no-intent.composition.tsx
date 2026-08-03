import { BrutalSearchPanelComposition } from "./brutal-search-panel.composition.tsx";

export function SearchNoIntentComposition() {
  return <BrutalSearchPanelComposition defaultQuery="" onBack={() => window.history.back()} />;
}
