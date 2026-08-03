import { BrutalSearchPanelComposition } from "./brutal-search-panel.composition.tsx";

export function SearchLoadingComposition() {
  return (
    <BrutalSearchPanelComposition
      defaultQuery="preview"
      onBack={() => window.history.back()}
      view="loading"
    />
  );
}
