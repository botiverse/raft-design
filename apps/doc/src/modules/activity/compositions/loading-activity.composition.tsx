import { ActivityInboxComposition } from "./activity-inbox.composition.tsx";

export function LoadingActivityComposition() {
  return <ActivityInboxComposition defaultItems={[]} layout="wide" loading />;
}
