import { SearchPanelComposition } from "./search-panel.composition.tsx";

export function SearchNoIntentComposition() {
  return <SearchPanelComposition defaultQuery="" onBack={() => window.history.back()} />;
}
