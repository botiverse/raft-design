import { ACTIVITY_COMPOSITION_ITEMS } from "../activity.fixtures.ts";
import { ActivityInboxComposition } from "./activity-inbox.composition.tsx";

const doneItems = ACTIVITY_COMPOSITION_ITEMS.map((item, index) => ({
  ...item,
  done: index < 2,
}));

export function DoneActivityComposition() {
  return <ActivityInboxComposition defaultView="done" defaultItems={doneItems} layout="wide" />;
}
