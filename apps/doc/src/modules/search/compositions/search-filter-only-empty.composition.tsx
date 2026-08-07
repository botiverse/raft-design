import { SearchPanelComposition } from "./search-panel.composition.tsx";

export function SearchFilterOnlyEmptyComposition() {
  return (
    <SearchPanelComposition
      defaultQuery=""
      defaultSenderId="agent-atlas"
      entities={[]}
      messages={[]}
      onBack={() => window.history.back()}
    />
  );
}
