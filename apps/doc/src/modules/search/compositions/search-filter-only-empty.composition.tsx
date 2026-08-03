import { BrutalSearchPanelComposition } from "./brutal-search-panel.composition.tsx";

export function SearchFilterOnlyEmptyComposition() {
  return (
    <BrutalSearchPanelComposition
      defaultQuery=""
      defaultSenderId="agent-atlas"
      entities={[]}
      messages={[]}
      onBack={() => window.history.back()}
    />
  );
}
