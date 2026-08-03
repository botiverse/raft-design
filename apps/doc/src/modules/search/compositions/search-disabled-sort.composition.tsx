import { BrutalSearchPanelComposition } from "./brutal-search-panel.composition.tsx";

export function SearchDisabledSortComposition() {
  return <BrutalSearchPanelComposition defaultQuery="" onBack={() => window.history.back()} />;
}
