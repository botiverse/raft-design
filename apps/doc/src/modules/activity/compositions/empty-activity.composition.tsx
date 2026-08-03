import { ActivityInboxComposition } from "./activity-inbox.composition.tsx";

export function EmptyActivityComposition() {
  return <ActivityInboxComposition defaultItems={[]} layout="wide" />;
}
