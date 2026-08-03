import { BrutalSearchPanelComposition } from "./brutal-search-panel.composition.tsx";

export function SearchNoResultsComposition() {
  return (
    <BrutalSearchPanelComposition
      defaultQuery="no-such-result"
      onBack={() => window.history.back()}
    />
  );
}
