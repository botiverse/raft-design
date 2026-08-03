import { BrutalSearchPanelComposition } from "./brutal-search-panel.composition.tsx";

export function SearchErrorComposition() {
  return (
    <BrutalSearchPanelComposition
      defaultQuery="preview"
      entities={[]}
      messages={[]}
      onBack={() => window.history.back()}
      view="error"
    />
  );
}
