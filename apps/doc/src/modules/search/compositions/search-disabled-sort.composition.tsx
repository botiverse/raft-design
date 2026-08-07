import { SearchPanelComposition } from "./search-panel.composition.tsx";

export function SearchDisabledSortComposition() {
  return <SearchPanelComposition defaultQuery="" onBack={() => window.history.back()} />;
}
