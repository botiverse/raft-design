import { BrutalSearchPanelComposition } from "./brutal-search-panel.composition.tsx";

export function SearchPopupNoMatchesComposition() {
  return (
    <BrutalSearchPanelComposition
      defaultOpenEmptySenderPopup
      defaultQuery=""
      onBack={() => window.history.back()}
    />
  );
}
