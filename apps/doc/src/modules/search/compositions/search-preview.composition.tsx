import {
  SEARCH_CHANNEL_FIXTURES,
  SEARCH_ENTITY_FIXTURES,
  SEARCH_MESSAGE_FIXTURES,
  SEARCH_SENDER_FIXTURES,
} from "../search.fixtures.ts";
import { SearchPanelComposition } from "./search-panel.composition.tsx";

/** Search shell preview as the playground composes it. */
export function SearchPreviewComposition() {
  return (
    <SearchPanelComposition
      entities={SEARCH_ENTITY_FIXTURES}
      messages={SEARCH_MESSAGE_FIXTURES}
      senders={SEARCH_SENDER_FIXTURES}
      channels={SEARCH_CHANNEL_FIXTURES}
      defaultQuery="design"
      defaultOpenEmptySenderPopup={false}
      onBack={() => undefined}
    />
  );
}
