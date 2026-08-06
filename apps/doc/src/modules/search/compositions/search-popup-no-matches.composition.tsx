import { SearchPanelComposition } from "./search-panel.composition.tsx";

export function SearchPopupNoMatchesComposition() {
  return (
    <SearchPanelComposition
      defaultOpenEmptySenderPopup
      defaultQuery=""
      onBack={() => window.history.back()}
    />
  );
}
