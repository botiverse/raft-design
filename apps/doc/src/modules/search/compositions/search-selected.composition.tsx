import { BrutalSearchPanelComposition } from "./brutal-search-panel.composition.tsx";

export function SearchSelectedComposition() {
  return (
    <BrutalSearchPanelComposition defaultQuery="preview" onBack={() => window.history.back()} />
  );
}
