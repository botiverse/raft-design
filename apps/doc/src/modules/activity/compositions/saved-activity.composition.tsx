import { ACTIVITY_COMPOSITION_ITEMS } from "../activity.fixtures.ts";
import { ActivityInboxComposition } from "./activity-inbox.composition.tsx";

const savedItems = ACTIVITY_COMPOSITION_ITEMS.map((item, index) => ({
  ...item,
  saved: index < 3,
}));

export function SavedActivityComposition() {
  return <ActivityInboxComposition defaultView="saved" defaultItems={savedItems} />;
}
