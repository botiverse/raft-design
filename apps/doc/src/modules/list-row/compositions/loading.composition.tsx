import { ListRowGroup } from "@botiverse/raft-ui";
import { ListRowSkeleton } from "@botiverse/raft-ui/wip";

/** Agents on a detail page while they load: skeleton rows in the group the loaded rows fill. */
export function ListRowLoadingComposition() {
  return (
    <div className="w-full max-w-sm">
      <ListRowGroup aria-busy="true">
        <ListRowSkeleton />
        <ListRowSkeleton />
        <ListRowSkeleton />
      </ListRowGroup>
    </div>
  );
}
